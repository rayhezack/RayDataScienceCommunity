export const toolModules = [
  {
    id: 'sample-size',
    eyebrow: 'Design before launch',
    title: '样本量计算',
    shortTitle: '样本量',
    phase: '实验前设计',
    description: '实验上线前判断需要多少用户、跑几天，避免样本太小看不出效果，或周期过长拖慢产品迭代。',
    outcome: '输出：样本量、实验周期、MDE 敏感性判断',
    input: '基准值、方差、MDE、流量与实验比例',
    scenario: '产品策略上线前，需要判断实验是否有足够灵敏度支持决策。',
    decision: '是否能开实验、实验跑多久、MDE 是否符合业务预期'
  },
  {
    id: 'significance-test',
    eyebrow: 'Decision after experiment',
    title: '显著性检验',
    shortTitle: '显著性',
    phase: '实验后判断',
    description: '实验结束后判断指标提升是否可信，并结合业务收益解释“统计显著”和“值得上线”是否一致。',
    outcome: '输出：p-value、置信区间、上线判断依据',
    input: '实验分组、用户ID、指标列与指标类型',
    scenario: '实验结束后，需要把统计结果翻译成产品是否上线的业务结论。',
    decision: '是否上线、是否继续放量、是否需要补充异质性分析'
  },
  {
    id: 'rerandomization',
    eyebrow: 'Balance before split',
    title: '重随机优化',
    shortTitle: '重随机',
    phase: '分组优化',
    description: '实验开始前优化分组平衡，降低核心协变量不均衡导致的实验偏差，适合小样本或高价值用户实验。',
    outcome: '输出：最优 seed、协变量平衡结果、分组质量',
    input: '用户样本、协变量、分组比例与迭代次数',
    scenario: '小流量、高价值或高波动实验前，需要降低分组不均衡带来的解释风险。',
    decision: '采用哪个 seed、分组是否健康、是否需要调整实验设计'
  },
  {
    id: 'offline-aa-backtrack',
    eyebrow: 'Risk check before launch',
    title: '离线 AA 回溯',
    shortTitle: '离线 AA',
    phase: '上线前体检',
    description: '用历史数据模拟随机分流，提前检查分流算法、指标口径和样本结构，减少上线后 SRM 或口径异常风险。',
    outcome: '输出：AA 检验结果、异常指标、分流健康度',
    input: '历史样本、随机种子、分组比例与待检指标',
    scenario: '真实上线前，用历史数据提前发现分流、口径和样本结构风险。',
    decision: '分流是否可信、指标口径是否稳定、上线前还要排查什么'
  }
]

export const toolUseCases = toolModules.map((tool, index) => ({
  ...tool,
  number: `0${index + 1}`
}))

export const experimentMarqueeItems = [
  'MDE',
  'SRM',
  'AA Backtest',
  'CUPED',
  'Trigger Analysis',
  'Guardrail Metrics',
  'DID',
  'PSM',
  'Causal Impact',
  'Business Uplift',
  'Confidence Interval',
  'Decision Memo'
]

export const learningPath = [
  {
    step: '01',
    title: '会归因分析',
    description: '先拆业务链路和关键变量，判断指标变化到底可能由什么驱动。'
  },
  {
    step: '02',
    title: '会设计实验',
    description: '明确实验人群、指标体系、分流节点和样本量，减少上线后的解释风险。'
  },
  {
    step: '03',
    title: '会分析结果',
    description: '把统计结果翻译成业务结论，区分随机波动、真实收益和潜在副作用。'
  },
  {
    step: '04',
    title: '会汇报/求职',
    description: '用金字塔结构组织分析报告、项目经历和面试表达，让结论被业务方听懂。'
  }
]

export const proofMetrics = [
  { value: '19', label: '二期学员反馈', detail: '匿名问卷样本' },
  { value: '9.21/10', label: '整体满意度', detail: '课程综合评分' },
  { value: '9.53/10', label: '工具箱满意度', detail: 'A/B 实验工具箱' },
  { value: '8.89/10', label: '推荐意愿', detail: '推荐给同事或朋友' }
]

export const testimonialQuotes = [
  '产品思维和指标体系搭建这两个部分很好，很贴近实战。',
  '很系统讲解了整个数据流程，每个环节的企业案例都值得思考指标体系。',
  '例子很实际，贴近业务，好理解。',
  '帮助了解到大厂的一些分析流程，弥补认知。',
  '实验设计方法，结构化表达。'
]

export const futureModules = [
  {
    id: 'causal-tools',
    title: '因果推断工具',
    status: '规划中',
    memberOnly: false,
    description: '提供 DID、IV、PSM 和 Causal Impact 等常见方法，用于无法做 A/B 实验的营销、运营和策略评估场景。'
  },
  {
    id: 'course-qa',
    title: '课程答疑工作台',
    status: '会员',
    memberOnly: true,
    description: '把课程作业、工具使用问题和项目报告反馈集中管理，让已购学员形成持续练习闭环。'
  },
  {
    id: 'resume-optimizer',
    title: '简历优化模块',
    status: '会员',
    memberOnly: true,
    description: '围绕学员项目经历做结构化梳理，输出符合金字塔表达的简历项目描述和面试讲法。'
  },
  {
    id: 'course-materials',
    title: '课程资料获取',
    status: '会员',
    memberOnly: true,
    description: '集中获取课程讲义、练习数据、项目模板和工具说明，让付费学员有稳定的资料入口。'
  }
]

export const futureRoadmap = [
  {
    id: 'causal-tools',
    title: '因果推断工具',
    description: 'DID、IV、PSM、Causal Impact，覆盖无法直接 A/B 的业务评估场景。',
    items: ['DID', 'IV', 'PSM', 'Causal Impact'],
    status: 'Next',
    memberOnly: false
  },
  {
    id: 'course-qa',
    title: '课程答疑工作台',
    description: '沉淀课程作业、工具使用和项目报告反馈，形成持续训练闭环。',
    items: ['作业反馈', '项目诊断', '工具答疑'],
    status: 'Member',
    memberOnly: true
  },
  {
    id: 'resume-optimizer',
    title: '简历优化模块',
    description: '把项目经历拆成业务背景、分析动作、策略收益和面试表达。',
    items: ['项目梳理', '金字塔简历', '面试讲法'],
    status: 'Member',
    memberOnly: true
  }
]

export const trustSignals = [
  {
    title: '一线业务经验',
    description: '来自产品分析、策略评估、A/B 实验和因果推断的一线工作方法。'
  },
  {
    title: '真实课程反馈',
    description: '二期 19 份匿名反馈，整体满意度 9.21/10，工具箱满意度 9.53/10。'
  },
  {
    title: '可复用工作流',
    description: '从实验设计、结果判断到业务汇报，目标是让学员能在真实场景复用。'
  }
]

export const rayProfile = {
  name: 'Ray',
  title: '一线大厂在职数据科学家',
  description:
    '3 年+ 数据分析工作经验，曾在滴滴和字节参与数据科学相关工作，长期专注产品分析、策略玩法评估、A/B 实验和因果推断在业务场景中的落地。',
  tags: ['A/B 实验', '因果推断', '产品分析', '策略评估']
}
