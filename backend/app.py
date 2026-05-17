import os
from functools import wraps

from flask import Flask, request, jsonify, make_response
try:
    from flask_cors import CORS
except ImportError:
    def CORS(app, **kwargs):
        return app
import pandas as pd
import numpy as np
from scipy import stats
import json
import hashlib
from typing import Dict, List, Union, Tuple
import random
import signal
import sys

from SampleCalculator import SampleSizeCalculator
from experiment_analysis_with_seedfinder import ExperimentAnalysisWithSeedFinder
from auth_service import (
    AuthError,
    SESSION_COOKIE_NAME,
    create_invite_code,
    create_session,
    get_user_for_session,
    login_user,
    register_user,
    redeem_invite_for_user,
    revoke_session,
    user_payload,
)
from database import init_db

app = Flask(__name__)
CORS(app, supports_credentials=True)
init_db()

# 处理Broken pipe错误
def handle_broken_pipe(signum, frame):
    print("Client disconnected, handling broken pipe gracefully")
    pass

signal.signal(signal.SIGPIPE, handle_broken_pipe)

# 初始化计算器
sample_calculator = SampleSizeCalculator()
experiment_analyzer = ExperimentAnalysisWithSeedFinder()


def is_cookie_secure():
    configured = os.environ.get("SESSION_COOKIE_SECURE")
    if configured is not None:
        return configured == "1"
    return os.environ.get("FLASK_ENV") == "production"


def attach_session_cookie(response, token):
    response.set_cookie(
        SESSION_COOKIE_NAME,
        token,
        httponly=True,
        secure=is_cookie_secure(),
        samesite="Lax",
        path="/",
        max_age=30 * 24 * 60 * 60,
    )
    return response


def clear_session_cookie(response):
    response.set_cookie(
        SESSION_COOKIE_NAME,
        "",
        httponly=True,
        secure=is_cookie_secure(),
        samesite="Lax",
        path="/",
        expires=0,
    )
    return response


def get_current_user():
    token = request.cookies.get(SESSION_COOKIE_NAME)
    return get_user_for_session(token)


def require_login(handler):
    @wraps(handler)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        return handler(user, *args, **kwargs)

    return wrapper


def require_member(handler):
    @wraps(handler)
    @require_login
    def wrapper(user, *args, **kwargs):
        if user["role"] != "admin" and user["membership_status"] != "member":
            return jsonify({"error": "Membership required"}), 403
        return handler(user, *args, **kwargs)

    return wrapper


@app.errorhandler(AuthError)
def handle_auth_error(error):
    return jsonify({"error": error.message}), error.status_code


@app.route('/api/auth/register', methods=['POST'])
@app.route('/auth/register', methods=['POST'])
def auth_register():
    data = request.get_json() or {}
    user = register_user(
        email=data.get("email"),
        password=data.get("password"),
        invite_code=data.get("inviteCode") or data.get("invite_code"),
    )
    token, _ = create_session(user["id"])
    response = make_response(jsonify({
        "authenticated": True,
        "user": user_payload(user),
    }), 201)
    return attach_session_cookie(response, token)


@app.route('/api/auth/login', methods=['POST'])
@app.route('/auth/login', methods=['POST'])
def auth_login():
    data = request.get_json() or {}
    user = login_user(data.get("email"), data.get("password"))
    token, _ = create_session(user["id"])
    response = make_response(jsonify({
        "authenticated": True,
        "user": user_payload(user),
    }))
    return attach_session_cookie(response, token)


@app.route('/api/auth/logout', methods=['POST'])
@app.route('/auth/logout', methods=['POST'])
def auth_logout():
    revoke_session(request.cookies.get(SESSION_COOKIE_NAME))
    response = make_response(jsonify({"authenticated": False}))
    return clear_session_cookie(response)


@app.route('/api/auth/me', methods=['GET'])
@app.route('/auth/me', methods=['GET'])
def auth_me():
    user = get_current_user()
    if not user:
        return jsonify({"authenticated": False, "user": None})
    return jsonify({"authenticated": True, "user": user_payload(user)})


@app.route('/api/auth/redeem-invite', methods=['POST'])
@app.route('/auth/redeem-invite', methods=['POST'])
@require_login
def auth_redeem_invite(user):
    data = request.get_json() or {}
    redeem_invite_for_user(user["id"], data.get("inviteCode") or data.get("invite_code"))
    refreshed_user = get_current_user()
    return jsonify({
        "authenticated": True,
        "user": user_payload(refreshed_user),
    })


@app.route('/api/member/resources', methods=['GET'])
@app.route('/member/resources', methods=['GET'])
@require_member
def member_resources(user):
    return jsonify({
        "features": [
            {"id": "course-qa", "title": "课程答疑", "enabled": True},
            {"id": "resume-optimizer", "title": "简历优化", "enabled": True},
            {"id": "course-materials", "title": "课程资料", "enabled": True},
        ]
    })


@app.route('/api/sample-size', methods=['POST'])
@app.route('/sample-size', methods=['POST'])
def calculate_sample_size():
    try:
        data = request.get_json()
        
        # 提取参数
        metric_name = data.get('metric_name', 'metric')
        metric_type = data.get('metric_type', 'mean')
        baseline = data.get('baseline', 0)
        variance = data.get('variance', 1)
        mde = data.get('mde', 0.1)
        daily_traffic = data.get('daily_traffic', 1000)
        sample_ratio = data.get('sample_ratio', 0.1)
        k = data.get('k', 1)
        group_num = data.get('group_num', 2)
        
        # 根据指标类型计算样本量
        if metric_type == 'mean':
            control_sample_size = sample_calculator.calculate_continuous_metric_sample_size(
                baseline=baseline,
                variance=variance,
                mde=mde,
                k=k
            )
        elif metric_type == 'proportion':
            control_sample_size = sample_calculator.calculate_binary_metric_sample_size(
                baseline_rate=baseline,
                mde=mde,
                k=k
            )
        else:  # ratio
            # 比率类型指标暂不支持样本量计算
            return jsonify({'error': 'Ratio metric type does not support sample size calculation'}), 400
        
        treatment_sample_size = int(control_sample_size * k)
        total_sample_size = control_sample_size + treatment_sample_size * (group_num - 1)
        experiment_days = max(1, int(total_sample_size / (daily_traffic * sample_ratio)))
        
        result = {
            'metric_name': metric_name,
            'metric_type': metric_type,
            'control_sample_size': control_sample_size,
            'treatment_sample_size': treatment_sample_size,
            'total_sample_size': total_sample_size,
            'experiment_days': experiment_days,
            'mde': mde,
            'baseline': baseline,
            'group_num': group_num
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/experiment-analysis', methods=['POST'])
@app.route('/experiment-analysis', methods=['POST'])
def experiment_analysis():
    try:
        data = request.get_json()
        
        group1 = data.get('group1', [])
        group2 = data.get('group2', [])
        test_type = data.get('test_type', 'welch')
        
        if not group1 or not group2:
            return jsonify({'error': 'Both groups must contain data'}), 400
        
        # 创建DataFrame格式的数据，以便使用experiment_analyzer的方法
        if test_type == 'ratio':
            # 比率检验：处理X/Y格式
            if isinstance(group1, dict) and isinstance(group2, dict):
                # 如果输入是字典格式 {X: [...], Y: [...]}
                x1, y1 = group1['X'], group1['Y']
                x2, y2 = group2['X'], group2['Y']
                
                # 创建DataFrame
                df_data = []
                for i in range(len(x1)):
                    df_data.append({
                        'group_name': 'control',
                        'x_var': x1[i],
                        'y_var': y1[i]
                    })
                for i in range(len(x2)):
                    df_data.append({
                        'group_name': 'treatment',
                        'x_var': x2[i],
                        'y_var': y2[i]
                    })
                
                df = pd.DataFrame(df_data)
                
                # 使用test_ratio方法
                result = experiment_analyzer.test_ratio(
                    data=df,
                    groupname='group_name',
                    treated_label='treatment',
                    control_label='control',
                    x_var='x_var',
                    y_var='y_var'
                )
                
                t_stat = result[4]  # T统计量
                p_value = result[5]  # P值
                ci = result[7]  # 置信区间
                
            else:
                return jsonify({'error': 'Ratio test requires X and Y data in dictionary format'}), 400
                
        else:
            # 均值和比例检验：处理简单数组格式
            # 创建DataFrame
            df_data = []
            for value in group1:
                df_data.append({
                    'group_name': 'control',
                    'metric': value
                })
            for value in group2:
                df_data.append({
                    'group_name': 'treatment',
                    'metric': value
                })
            
            df = pd.DataFrame(df_data)
            
            if test_type == 'welch' or test_type == 'mean':
                # 使用test_mean方法
                result = experiment_analyzer.test_mean(
                    data=df,
                    groupname='group_name',
                    treated_label='treatment',
                    control_label='control',
                    test_metric='metric'
                )
                
                t_stat = result[4]  # T统计量
                p_value = result[5]  # P值
                ci = result[7]  # 置信区间
                
            elif test_type == 'proportion':
                # 使用test_proportion方法
                result = experiment_analyzer.test_proportion(
                    data=df,
                    groupname='group_name',
                    treated_label='treatment',
                    control_label='control',
                    metric='metric'
                )
                
                t_stat = result[4]  # T统计量
                p_value = result[5]  # P值
                ci = result[7]  # 置信区间
                
            else:
                return jsonify({'error': f'Unsupported test type: {test_type}'}), 400
        
        result = {
            't_stat': float(t_stat),
            'p_value': float(p_value),
            'confidence_interval': ci
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/rerandomization', methods=['POST'])
@app.route('/rerandomization', methods=['POST'])
def rerandomization():
    try:
        data = request.get_json()
        
        # 提取参数
        input_data = data.get('data', [])
        selected_metrics = data.get('selectedMetrics', [])  # 用户选择的指标
        metric_types = data.get('metricTypes', {})  # 指标类型映射
        userIdColumn = data.get('userIdColumn', 'user_id')
        iterations = data.get('iterations', 1000)
        groupProportions = data.get('groupProportions', {'control': 50, 'treatment': 50})
        
        # 调试信息
        print(f"DEBUG: selected_metrics = {selected_metrics}")
        print(f"DEBUG: metric_types = {metric_types}")
        print(f"DEBUG: input_data columns = {list(input_data[0].keys()) if input_data else 'No data'}")
        
        # 处理可能的JSON转义字符问题
        selected_metrics_clean = []
        for metric in selected_metrics:
            if isinstance(metric, list) and len(metric) == 2:
                # 数组格式的比率指标，直接保留
                selected_metrics_clean.append(metric)
                print(f"DEBUG: Array metric: {metric}")
            else:
                # 字符串格式，移除可能的转义字符
                metric_clean = metric.replace('\\', '').replace('"', '')
                selected_metrics_clean.append(metric_clean)
                print(f"DEBUG: Original metric: '{metric}' -> Cleaned: '{metric_clean}'")
        
        selected_metrics = selected_metrics_clean
        
        # 清理metric_types中的键
        metric_types_clean = {}
        for key, value in metric_types.items():
            key_clean = key.replace('\\', '').replace('"', '')
            metric_types_clean[key_clean] = value
            print(f"DEBUG: Original key: '{key}' -> Cleaned: '{key_clean}'")
        
        metric_types = metric_types_clean
        
        if not input_data:
            return jsonify({'error': 'No valid data provided'}), 400
        
        # 转换为DataFrame
        df = pd.DataFrame(input_data)
        
        if df.empty:
            return jsonify({'error': 'Empty dataset'}), 400
        
        # 调试信息
        print(f"DEBUG: DataFrame shape = {df.shape}")
        print(f"DEBUG: DataFrame columns = {list(df.columns)}")
        print(f"DEBUG: DataFrame dtypes = {df.dtypes.to_dict()}")
        print(f"DEBUG: First few rows:")
        print(df.head())
        
        # 检查必要的列是否存在
        if userIdColumn not in df.columns:
            return jsonify({'error': f'User ID column "{userIdColumn}" not found'}), 400
        
        # 获取所有数值型列作为可用指标
        numeric_columns = []
        for col in df.columns:
            if col != userIdColumn and col not in ['group', 'group_name', 'treatment']:
                try:
                    pd.to_numeric(df[col], errors='raise')
                    numeric_columns.append(col)
                except:
                    continue
        
        if not numeric_columns:
            return jsonify({'error': 'No numeric columns found for metrics'}), 400
        
        # 如果用户没有选择指标，使用所有数值列
        if not selected_metrics:
            selected_metrics = numeric_columns[:3]  # 默认选择前3个指标
        
        # 验证选择的指标是否存在
        for metric in selected_metrics:
            # 对于比率指标，需要从metricTypes中找到对应的类型
            metric_type = None
            if isinstance(metric, list) and len(metric) == 2:
                # 数组格式的比率指标，需要在metricTypes中查找对应的JSON字符串键
                metric_key = json.dumps(metric)
                metric_type = metric_types.get(metric_key, 'ratio')
            else:
                metric_type = metric_types.get(metric, 'mean')
            
            print(f"DEBUG: Processing metric '{metric}' with type '{metric_type}'")
            print(f"DEBUG: Available columns: {list(df.columns)}")
            
            if metric_type == 'ratio':
                # 比率类型：检查分子和分母列是否存在
                if isinstance(metric, list) and len(metric) == 2:
                    # 新的数组格式：[numerator, denominator]
                    x_var, y_var = metric[0], metric[1]
                    print(f"DEBUG: Ratio metric (array format) - x_var: '{x_var}', y_var: '{y_var}'")
                else:
                    # 旧的字符串格式：处理可能的转义字符
                    metric_clean = metric.replace('\\', '').replace('"', '')
                    x_var, y_var = metric_clean.split('/')
                    print(f"DEBUG: Ratio metric (string format) - x_var: '{x_var}', y_var: '{y_var}'")
                
                if x_var not in df.columns:
                    print(f"DEBUG: x_var '{x_var}' not found in columns")
                    return jsonify({'error': f'Numerator column "{x_var}" not found for ratio metric "{metric}"'}), 400
                if y_var not in df.columns:
                    print(f"DEBUG: y_var '{y_var}' not found in columns")
                    return jsonify({'error': f'Denominator column "{y_var}" not found for ratio metric "{metric}"'}), 400
            else:
                # 其他类型：检查指标列是否存在
                if metric not in df.columns:
                    print(f"DEBUG: metric '{metric}' not found in columns")
                    return jsonify({'error': f'Metric column "{metric}" not found'}), 400
        
        # 验证指标类型
        valid_types = ['mean', 'proportion', 'ratio']
        for metric, metric_type in metric_types.items():
            if metric_type not in valid_types:
                return jsonify({'error': f'Invalid metric type for {metric}: {metric_type}. Must be one of {valid_types}'}), 400
        
        # 验证组别比例总和
        total_proportion = sum(groupProportions.values())
        if total_proportion != 100:
            return jsonify({'error': f'Group proportions must sum to 100%, current sum: {total_proportion}%'}), 400
        
        # 确保用户ID列是字符串类型
        df[userIdColumn] = df[userIdColumn].astype(str)
        
        # 确保指标列是数值类型
        for metric in selected_metrics:
            # 获取指标类型
            if isinstance(metric, list) and len(metric) == 2:
                metric_key = json.dumps(metric)
                metric_type = metric_types.get(metric_key, 'ratio')
            else:
                metric_type = metric_types.get(metric, 'mean')
            
            if metric_type == 'ratio':
                # 比率类型：确保分子和分母列是数值类型
                if isinstance(metric, list):
                    x_var, y_var = metric[0], metric[1]
                else:
                    metric_clean = metric.replace('\\', '')
                    x_var, y_var = metric_clean.split('/')
                df[x_var] = pd.to_numeric(df[x_var], errors='coerce')
                df[y_var] = pd.to_numeric(df[y_var], errors='coerce')
            else:
                # 其他类型：确保指标列是数值类型
                df[metric] = pd.to_numeric(df[metric], errors='coerce')
        
        # 移除包含NaN的行
        columns_to_check = [userIdColumn]
        for metric in selected_metrics:
            # 获取指标类型
            if isinstance(metric, list) and len(metric) == 2:
                metric_key = json.dumps(metric)
                metric_type = metric_types.get(metric_key, 'ratio')
            else:
                metric_type = metric_types.get(metric, 'mean')
            
            if metric_type == 'ratio':
                # 比率类型：检查分子和分母列
                if isinstance(metric, list):
                    x_var, y_var = metric[0], metric[1]
                else:
                    metric_clean = metric.replace('\\', '')
                    x_var, y_var = metric_clean.split('/')
                columns_to_check.extend([x_var, y_var])
            else:
                # 其他类型：检查指标列
                columns_to_check.append(metric)
        
        df = df.dropna(subset=columns_to_check)
        
        if df.empty:
            return jsonify({'error': 'No valid data after cleaning'}), 400
        
        # 生成实验名称
        experiment_name = f"rerandomization_{hashlib.md5(str(df[userIdColumn].tolist()).encode()).hexdigest()[:8]}"
        
        # 获取对照组名称（通常是第一个组）
        control_group = list(groupProportions.keys())[0]
        
        # 构建指标类型列表
        metric_types_list = []
        for metric in selected_metrics:
            if isinstance(metric, list) and len(metric) == 2:
                # 数组格式的比率指标，需要在metricTypes中查找对应的JSON字符串键
                metric_key = json.dumps(metric)
                metric_type = metric_types.get(metric_key, 'ratio')
            else:
                metric_type = metric_types.get(metric, 'mean')
            metric_types_list.append(metric_type)
        
        # 执行重随机
        best_seed, best_seed_max_t_stat = experiment_analyzer.generate_best_seed(
            df=df,
            metrics=selected_metrics,
            metric_types=metric_types_list,
            group_name='group_name',
            unit_id=userIdColumn,
            iterations=min(iterations, 100),  # 限制迭代次数以避免性能问题
            group_proportions=groupProportions,
            control_label=control_group
        )
        
        # 使用最佳种子分配组别
        df_with_groups = experiment_analyzer.assign_groups_with_seed(
            df=df,
            seed=best_seed,
            unit_id=userIdColumn,
            group_name='group_name',
            group_proportions=groupProportions
        )
        
        # 计算最佳种子的显著性检验结果
        best_seed_results = calculate_significance_tests(df_with_groups, selected_metrics, metric_types, groupProportions)
        
        print(f"DEBUG: 最佳种子 = {best_seed}")
        print(f"DEBUG: 最佳种子最大T统计量 = {best_seed_max_t_stat}")
        print(f"DEBUG: 最佳种子检验结果 = {best_seed_results}")
        
        
        result = {
            'bestSeed': best_seed,
            'bestSeedMaxTStat': best_seed_max_t_stat,  # 最佳种子的最大T统计量
            'bestSeedResults': best_seed_results,  # 最佳种子的显著性检验结果
            'totalIterations': iterations,
            'groupProportions': groupProportions,
            'selectedMetrics': selected_metrics,
            'availableMetrics': numeric_columns,  # 所有可用指标
            'metricTypes': metric_types
        }
        
        return jsonify(result)
        
    except BrokenPipeError as e:
        print(f"Broken pipe error in rerandomization: {e}")
        return jsonify({'error': 'Client disconnected during processing'}), 400
    except Exception as e:
        print(f"Error in rerandomization: {e}")
        return jsonify({'error': str(e)}), 400

def calculate_significance_tests(df, metrics, metric_types, group_proportions):
    """
    计算显著性检验结果，直接使用run_statistical_tests函数
    """
    group_names = list(group_proportions.keys())
    
    # 识别对照组和实验组
    control_groups = [k for k in group_names if "control" in k.lower()]
    treatment_groups = [k for k in group_names if "control" not in k.lower()]
    
    if not control_groups:
        raise ValueError("No control group found. Please ensure one group has 'control' in its name.")
    
    control_group = control_groups[0]
    
    # 准备指标类型列表
    metric_types_list = []
    for metric in metrics:
        if isinstance(metric, list) and len(metric) == 2:
            # 数组格式的比率指标
            metric_key_json = json.dumps(metric)
            metric_key_str = f"{metric[0]}/{metric[1]}"
            metric_type = metric_types.get(metric_key_json, metric_types.get(metric_key_str, 'ratio'))
        else:
            # 字符串格式的指标
            metric_type = metric_types.get(metric, 'mean')
        metric_types_list.append(metric_type)
    
    # 使用run_statistical_tests函数进行统计检验
    results_df = experiment_analyzer.run_statistical_tests(
        data=df,
        metrics=metrics,
        metric_types=metric_types_list,
        groupname='group_name',
        treated_labels=treatment_groups,
        control_label=control_group,
        is_two_sided=True
    )
    
    # 转换结果为前端需要的格式
    results = {}
    
    # 标准化组别名称映射
    group_name_mapping = {control_group: "V0"}
    for i, group in enumerate(treatment_groups, 1):
        group_name_mapping[group] = f"V{i}"
    
    # 按指标分组结果
    for _, row in results_df.iterrows():
        treatment_group = row['Treatment_Group']
        metric = row['Metric']
        
        # 为结果创建一个键
        if isinstance(metric, list) and len(metric) == 2:
            result_key = f"{metric[0]}/{metric[1]}"
        else:
            result_key = metric
        
        if result_key not in results:
            # 获取指标类型
            if isinstance(metric, list) and len(metric) == 2:
                metric_key_json = json.dumps(metric)
                metric_key_str = f"{metric[0]}/{metric[1]}"
                metric_type = metric_types.get(metric_key_json, metric_types.get(metric_key_str, 'ratio'))
            else:
                metric_type = metric_types.get(metric, 'mean')
            
            results[result_key] = {
                'metric_type': metric_type,
                'tests': []
            }
        
        # 添加检验结果 - 只进行对照组与实验组的对比
        test_result = {
            'group1': group_name_mapping[control_group],  # V0
            'group2': group_name_mapping[treatment_group],  # V1, V2, etc.
            'statistic': float(row['T_Statistic']) if not pd.isna(row['T_Statistic']) else None,
            'p_value': float(row['P_Value']) if not pd.isna(row['P_Value']) else None,
            'significant': row['Significance'] == "显著",
            'group1_mean': float(row['Control_Value']) if not pd.isna(row['Control_Value']) else None,
            'group2_mean': float(row['Treatment_Value']) if not pd.isna(row['Treatment_Value']) else None,
            'group1_size': int(len(df[df['group_name'] == control_group])),
            'group2_size': int(len(df[df['group_name'] == treatment_group]))
        }
        
        results[result_key]['tests'].append(test_result)
    
    return results
    
@app.route('/api/offline-aa-backtrack', methods=['POST'])
@app.route('/offline-aa-backtrack', methods=['POST'])
def offline_aa_backtrack():
    """
    离线AA回溯分析接口
    1. 接收未随机分流的数据集
    2. 使用指定随机种子进行分流
    3. 调用与假设检验功能完全一致的统计检验逻辑
    """
    try:
        data = request.get_json()
        
        # 提取参数
        input_data = data.get('data', [])
        random_seed = data.get('randomSeed', '')
        group_proportions_raw = data.get('groupProportions', {'control': 50, 'treatment': 50})
        selected_metrics = data.get('selectedMetrics', [])
        metric_types = data.get('metricTypes', {})
        
        # 处理group_proportions格式问题
        if isinstance(group_proportions_raw, list):
            # 如果是列表格式，转换为字典格式
            group_proportions = {}
            for i, prop in enumerate(group_proportions_raw):
                if i == 0:
                    group_proportions['control'] = prop
                else:
                    group_proportions[f'treatment{i}'] = prop
        else:
            group_proportions = group_proportions_raw
        
        if not input_data:
            return jsonify({'error': 'No data provided'}), 400
        
        if not random_seed:
            return jsonify({'error': 'Random seed is required'}), 400
        
        # 转换为DataFrame
        df = pd.DataFrame(input_data)
        
        if df.empty:
            return jsonify({'error': 'Empty dataset'}), 400
        
        # 检查是否有用户ID列
        user_id_columns = [col for col in df.columns if 'id' in col.lower() or 'user' in col.lower()]
        if not user_id_columns:
            return jsonify({'error': 'No user ID column found. Please ensure your data has a column containing user identifiers.'}), 400
        
        user_id_column = user_id_columns[0]  # 使用第一个找到的ID列
        
        # 确保用户ID列是字符串类型
        df[user_id_column] = df[user_id_column].astype(str)
        
        # 验证组别比例总和
        try:
            total_proportion = sum(group_proportions.values())
            if total_proportion != 100:
                return jsonify({'error': f'Group proportions must sum to 100%, current sum: {total_proportion}%'}), 400
        except (AttributeError, TypeError) as e:
            return jsonify({'error': f'Invalid group_proportions format: {e}. Expected dict or list.'}), 400
        
        # 确保指标列是数值类型
        for metric in selected_metrics:
            if isinstance(metric, list) and len(metric) == 2:
                # 比率指标：处理分子和分母列
                x_var, y_var = metric[0], metric[1]
                if x_var in df.columns and y_var in df.columns:
                    df[x_var] = pd.to_numeric(df[x_var], errors='coerce')
                    df[y_var] = pd.to_numeric(df[y_var], errors='coerce')
            elif metric in df.columns:
                df[metric] = pd.to_numeric(df[metric], errors='coerce')
        
        # 移除包含NaN的行
        columns_to_check = [user_id_column]
        for metric in selected_metrics:
            if isinstance(metric, list) and len(metric) == 2:
                # 比率指标：检查分子和分母列
                x_var, y_var = metric[0], metric[1]
                columns_to_check.extend([x_var, y_var])
            else:
                columns_to_check.append(metric)
        
        df = df.dropna(subset=columns_to_check)
        
        if df.empty:
            return jsonify({'error': 'No valid data after cleaning'}), 400
        
        # 使用指定的随机种子进行分流
        df_with_groups = experiment_analyzer.assign_groups_with_seed(
            df=df,
            seed=random_seed,
            unit_id=user_id_column,
            group_name='group_name',
            group_proportions=group_proportions
        )
        
        # 计算各组用户数
        group_sizes = {}
        for group in group_proportions.keys():
            group_sizes[group] = int(len(df_with_groups[df_with_groups['group_name'] == group]))
        
        # 调用与假设检验功能完全一致的统计检验逻辑
        statistical_tests = calculate_significance_tests(
            df_with_groups, 
            selected_metrics, 
            metric_types, 
            group_proportions
        )
        
        result = {
            'randomSeed': random_seed,
            'totalUsers': len(df_with_groups),
            'groupSizes': group_sizes,
            'groupProportions': group_proportions,
            'statisticalTests': []
        }
        
        # 转换统计检验结果为前端需要的格式
        for metric, test_data in statistical_tests.items():
            result['statisticalTests'].append({
                'metric': metric,
                'metric_type': test_data['metric_type'],
                'tests': test_data['tests']
            })
        
        return jsonify(result)
        
    except Exception as e:
        import traceback
        print(f"DEBUG: Error in offline_aa_backtrack: {e}")
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/health', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'healthy',
        'message': 'AB Testing Toolbox Backend is running',
        'version': '2.0.0'
    })

if __name__ == '__main__':
    print("Starting AB Testing Toolbox Backend Server...")
    print("Server will be available at: http://0.0.0.0:8000")
    print("Health check: http://0.0.0.0:8000/health")
    
    app.run(
        host='0.0.0.0',
        port=8000,
        debug=False,
        threaded=True
    ) 
