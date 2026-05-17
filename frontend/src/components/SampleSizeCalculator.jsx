import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Info, Download, Upload, Sparkles, TrendingUp, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx'
import config from '../config.js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'

const SampleSizeCalculator = () => {
  const [formData, setFormData] = useState({
    metricType: 'mean',
    baselineValue: '',
    variance: '',
    mdeStart: '',
    mdeEnd: '',
    mdeStep: '',
    kValue: 1,
    groupNum: 2, // 新增：实验组数量
    dailyTraffic: 10000,
    experimentRatio: 0.5,
    alpha: 0.05,
    power: 0.8
  })

  const [results, setResults] = useState([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [uploadedData, setUploadedData] = useState(null)
  const [selectedMetric, setSelectedMetric] = useState('')
  const [calculatedStats, setCalculatedStats] = useState(null)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }


  const handleMetricTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      metricType: value,
      // 当切换到比例类型时，将基准值转换为百分比格式
      baselineValue: value === 'proportion' && prev.baselineValue 
        ? (parseFloat(prev.baselineValue) * 100).toString()
        : value === 'mean' && prev.baselineValue
        ? (parseFloat(prev.baselineValue) / 100).toString()
        : prev.baselineValue
    }))
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target.result
          const lines = text.split('\n').filter(line => line.trim())
          const headers = lines[0].split(',').map(h => h.trim())
          
          const data = lines.slice(1).map(line => {
            const values = line.split(',')
            const row = {}
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim()
            })
            return row
          })
          
          setUploadedData(data)
          
          // 自动选择第一个数值列作为默认指标（排除ID列）
          const numericColumns = headers.filter(header => {
            const sampleValue = data[0]?.[header]
            const isNumeric = !isNaN(parseFloat(sampleValue))
            const isNotId = !header.toLowerCase().includes('id') && 
                           !header.toLowerCase().includes('user') && 
                           !header.toLowerCase().includes('uuid')
            return isNumeric && isNotId
          })
          
          if (numericColumns.length > 0) {
            setSelectedMetric(numericColumns[0])
            calculateStatsFromData(data, numericColumns[0])
          }
          
        } catch (error) {
          console.error('文件解析错误:', error)
          alert('文件格式错误，请上传有效的CSV文件')
        }
      }
      reader.readAsText(file)
    }
  }

  const calculateStatsFromData = (data, metric) => {
    if (!data || !metric) return
    
    // 确保基于所选指标列计算，而不是unit_id
    const values = data.map(row => parseFloat(row[metric])).filter(v => !isNaN(v) && isFinite(v))
    
    if (values.length === 0) {
      alert('所选指标列没有有效的数值数据')
      return
    }
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1)
    
    const stats = {
      baseline: mean,
      variance: variance,
      sampleSize: values.length
    }
    
    setCalculatedStats(stats)
    
    // 自动更新表单数据
    setFormData(prev => ({
      ...prev,
      baselineValue: mean.toString(),
      variance: variance.toString()
    }))
  }

  const handleMetricChange = (metric) => {
    setSelectedMetric(metric)
    if (uploadedData) {
      calculateStatsFromData(uploadedData, metric)
    }
  }

  const validateInputs = () => {
    const mdeStart = parseFloat(formData.mdeStart)
    const mdeEnd = parseFloat(formData.mdeEnd)
    const mdeStep = parseFloat(formData.mdeStep)
    const baselineValue = parseFloat(formData.baselineValue)
    const variance = parseFloat(formData.variance)
    const alpha = parseFloat(formData.alpha)
    const power = parseFloat(formData.power)
    const kValue = parseFloat(formData.kValue)
    const groupNum = parseInt(formData.groupNum) // 新增：实验组数量
    const dailyTraffic = parseInt(formData.dailyTraffic)
    const experimentRatio = parseFloat(formData.experimentRatio)

    // 检查是否有NaN值
    if (isNaN(mdeStart) || isNaN(mdeEnd) || isNaN(mdeStep) || 
        isNaN(baselineValue) || isNaN(alpha) || isNaN(power) || 
        isNaN(kValue) || isNaN(groupNum) || isNaN(dailyTraffic) || isNaN(experimentRatio) ||
        (formData.metricType === 'mean' && isNaN(variance))) {
      throw new Error('请确保所有必填字段都已正确填写，且为有效数字');
    }

    // 对于均值类型，检查方差
    if (formData.metricType === 'mean' && isNaN(variance)) {
      throw new Error('均值类型指标需要填写方差值')
    }

    // 检查范围合理性
    if (mdeStart >= mdeEnd) {
      throw new Error('MDE开始值必须小于结束值')
    }

    if (mdeStep <= 0) {
      throw new Error('MDE步长必须大于0')
    }

    if (baselineValue <= 0) {
      throw new Error('基准值必须大于0')
    }

    if (formData.metricType === 'mean' && variance <= 0) {
      throw new Error('方差必须大于0')
    }

    if (groupNum < 1) {
      throw new Error('实验组数量必须至少为1（1个对照组+1个实验组）')
    }

    return {
      mdeStart, mdeEnd, mdeStep, baselineValue, variance,
      alpha, power, kValue, groupNum, dailyTraffic, experimentRatio
    }
  }

  const calculateSampleSize = async () => {
    setIsCalculating(true)
    setResults([]) // 清空之前的结果
    
    try {
      const validatedInputs = validateInputs()
      const {
        mdeStart, mdeEnd, mdeStep, baselineValue, variance,
        alpha, power, kValue, groupNum, dailyTraffic, experimentRatio
      } = validatedInputs

      console.log('开始计算样本量，参数:', validatedInputs)
      const newResults = [];

      // 修复MDE尾长逻辑，确保能遍历到终点
      const steps = Math.round((mdeEnd - mdeStart) / mdeStep) + 1
      console.log(`将计算 ${steps} 个MDE值`)
      
      for (let i = 0; i < steps; i++) {
        let mde
        if (i === steps - 1) {
          // 最后一个值使用精确的终点值
          mde = mdeEnd
          console.log(`使用精确终点值: ${mde}`)
        } else {
          mde = mdeStart + i * mdeStep
        }
        // 对于比例类型，需要将百分比转换为小数
        const actualBaseline = formData.metricType === 'proportion' ? baselineValue / 100 : baselineValue
        const actualMde = formData.metricType === 'proportion' ? mde / 100 : mde
        
        const requestBody = {
          metric_name: formData.metricType === 'proportion' ? '比例指标' : '均值指标',
          metric_type: formData.metricType,
          baseline: actualBaseline,
          variance: formData.metricType === 'mean' ? variance : actualBaseline * (1 - actualBaseline), // 比例类型使用p(1-p)
          mde: actualMde,
          daily_traffic: dailyTraffic,
          sample_ratio: experimentRatio,
          k: kValue,
          group_num: groupNum + 1 // 总组数 = 实验组数量 + 1个对照组
        }

        console.log(`计算MDE ${mde}，请求体:`, requestBody)
        
        const response = await fetch(`${config.apiBaseUrl}${config.endpoints.sampleSize}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP错误 ${response.status}:`, errorText)
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }

        const data = await response.json()
        console.log(`MDE ${mde} 的响应:`, data)
        
        const sampleSize = data.control_sample_size

        if (isNaN(sampleSize) || !isFinite(sampleSize)) {
          console.error('无效的样本量结果:', sampleSize)
          throw new Error('后端返回的样本量计算结果无效')
        }

        const treatmentSampleSize = Math.round(sampleSize * kValue)
        // 正确计算总样本量：对照组样本量 + 实验组数量 × 每组实验组样本量
        const totalSample = Math.round(sampleSize + treatmentSampleSize * groupNum)
        const experimentDays = Math.ceil(totalSample / (dailyTraffic * experimentRatio))

        newResults.push({
          metric_name: formData.metricType === 'proportion' ? '比例指标' : '均值指标',
          mde: parseFloat(mde.toFixed(6)),
          control_sample_size: Math.round(sampleSize),
          treatment_sample_size: treatmentSampleSize,
          total_sample_size: totalSample,
          experiment_days: experimentDays
        })
      }
      
      console.log('计算完成，结果数量:', newResults.length)
      setResults(newResults)
      
    } catch (error) {
      console.error('计算错误:', error)
      alert(`计算过程中出现错误: ${error.message}`)
      setResults([]) // 确保在错误时清空结果
    } finally {
      setIsCalculating(false)
    }
  }

  const chartData = results.map(result => ({
    mde: result.mde,
    totalSampleSize: result.total_sample_size
  }))

  const exportResults = () => {
    const csvContent = [
      ['指标名称', 'MDE', '对照组样本量', '每组实验组样本量', '总样本量', '实验天数', '实验组数量'],
      ...results.map(r => [
        r.metric_name, 
        r.mde, 
        r.control_sample_size, 
        r.treatment_sample_size, 
        r.total_sample_size, 
        r.experiment_days,
        formData.groupNum
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'sample_size_results.csv'
    link.click()
  }

  const getAvailableMetrics = () => {
    if (!uploadedData || uploadedData.length === 0) return []
    
    const headers = Object.keys(uploadedData[0])
    return headers.filter(header => {
      const sampleValue = uploadedData[0]?.[header]
      const isNumeric = !isNaN(parseFloat(sampleValue))
      const isNotId = !header.toLowerCase().includes('id') && 
                     !header.toLowerCase().includes('user') && 
                     !header.toLowerCase().includes('uuid')
      return isNumeric && isNotId
    })
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="flex items-center space-x-3"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div
          className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Calculator className="w-6 h-6 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">样本量计算器</h2>
          <p className="text-muted-foreground">精确计算A/B测试所需的样本量</p>
        </div>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {/* 输入表单 */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="toolbox-card hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>参数设置</span>
              </CardTitle>
              <CardDescription>配置实验参数以计算所需样本量</CardDescription>
            </CardHeader>
          <CardContent className="space-y-4">
            <TooltipProvider>
              {/* 数据上传区域 */}
              <div className="space-y-2">
                <Label htmlFor="dataFile">数据文件 (可选)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">上传CSV文件自动计算基准值和方差</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="dataFile"
                  />
                  <Button variant="outline" onClick={() => document.getElementById('dataFile').click()}>
                    选择文件
                  </Button>
                </div>
              </div>

              {/* 数据预览 */}
              {uploadedData && (
                <div className="space-y-2">
                  <Label>数据预览</Label>
                  <div className="border rounded-lg p-3 bg-gray-50 max-h-32 overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          {Object.keys(uploadedData[0] || {}).map(header => (
                            <th key={header} className="text-left p-1 border-b">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedData.slice(0, 3).map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="p-1">{value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 指标选择 */}
              {uploadedData && getAvailableMetrics().length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="metricSelect">选择指标</Label>
                  <Select value={selectedMetric} onValueChange={handleMetricChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择要分析的指标" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableMetrics().map(metric => (
                        <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 计算出的统计信息 */}
              {calculatedStats && (
                <div className="space-y-2">
                  <Label>计算出的统计信息</Label>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-muted/50 p-3 rounded-lg border">
                      <div className="font-medium text-foreground">基准值</div>
                      <div className="text-muted-foreground">{calculatedStats.baseline.toFixed(4)}</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg border">
                      <div className="font-medium text-foreground">方差</div>
                      <div className="text-muted-foreground">{calculatedStats.variance.toFixed(4)}</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg border">
                      <div className="font-medium text-foreground">样本数</div>
                      <div className="text-muted-foreground">{calculatedStats.sampleSize}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="metricType">指标类型</Label>
                <Select value={formData.metricType} onValueChange={handleMetricTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proportion">比例</SelectItem>
                    <SelectItem value="mean">均值</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="baselineValue">基准值 *</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{formData.metricType === 'proportion' ? '对照组的预期比例值（百分比）' : '对照组的预期指标值'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    id="baselineValue"
                    type="number"
                    step={formData.metricType === 'proportion' ? "0.01" : "0.001"}
                    min={formData.metricType === 'proportion' ? "0" : undefined}
                    max={formData.metricType === 'proportion' ? "100" : undefined}
                    value={formData.baselineValue}
                    onChange={(e) => handleInputChange('baselineValue', e.target.value)}
                    className="toolbox-input"
                    placeholder={formData.metricType === 'proportion' ? '请输入基准比例，如：10.5' : '请输入基准值'}
                  />
                  {formData.metricType === 'proportion' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </div>
                  )}
                </div>
              </div>

              {formData.metricType === 'mean' && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="variance">方差 *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>指标的方差值</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="variance"
                    type="number"
                    step="0.001"
                    value={formData.variance}
                    onChange={(e) => handleInputChange('variance', e.target.value)}
                    className="toolbox-input"
                    placeholder="请输入方差值"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="mdeStart">MDE开始值 *</Label>
                  <div className="relative">
                    <Input
                      id="mdeStart"
                      type="number"
                      step={formData.metricType === 'proportion' ? "0.01" : "0.001"}
                      min={formData.metricType === 'proportion' ? "0" : undefined}
                      max={formData.metricType === 'proportion' ? "100" : undefined}
                      value={formData.mdeStart}
                      onChange={(e) => handleInputChange('mdeStart', e.target.value)}
                      className="toolbox-input"
                      placeholder={formData.metricType === 'proportion' ? '如: 1.0' : '如: 0.001'}
                    />
                    {formData.metricType === 'proportion' && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mdeEnd">MDE结束值 *</Label>
                  <div className="relative">
                    <Input
                      id="mdeEnd"
                      type="number"
                      step={formData.metricType === 'proportion' ? "0.01" : "0.001"}
                      min={formData.metricType === 'proportion' ? "0" : undefined}
                      max={formData.metricType === 'proportion' ? "100" : undefined}
                      value={formData.mdeEnd}
                      onChange={(e) => handleInputChange('mdeEnd', e.target.value)}
                      className="toolbox-input"
                      placeholder={formData.metricType === 'proportion' ? '如: 10.0' : '如: 0.01'}
                    />
                    {formData.metricType === 'proportion' && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mdeStep">MDE步长 *</Label>
                  <div className="relative">
                    <Input
                      id="mdeStep"
                      type="number"
                      step={formData.metricType === 'proportion' ? "0.01" : "0.000001"}
                      min={formData.metricType === 'proportion' ? "0.01" : "0.000001"}
                      value={formData.mdeStep}
                      onChange={(e) => handleInputChange('mdeStep', e.target.value)}
                      className="toolbox-input"
                      placeholder={formData.metricType === 'proportion' ? '如: 0.5' : '如: 0.001'}
                    />
                    {formData.metricType === 'proportion' && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="kValue">K值</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>实验组与对照组的流量比例</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="kValue"
                    type="number"
                    step="0.1"
                    value={formData.kValue}
                    onChange={(e) => handleInputChange('kValue', e.target.value)}
                    className="toolbox-input"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="groupNum">实验组数量</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>实验组数量（不包括对照组），例如填写1表示1个对照组+1个实验组</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="groupNum"
                    type="number"
                    min="1"
                    value={formData.groupNum}
                    onChange={(e) => handleInputChange('groupNum', e.target.value)}
                    className="toolbox-input"
                    placeholder="例如：1"
                  />
                  <div className="text-xs text-muted-foreground">
                    将创建 1 个对照组 + {formData.groupNum} 个实验组 = {parseInt(formData.groupNum) + 1} 个组别
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyTraffic">日活流量</Label>
                  <Input
                    id="dailyTraffic"
                    type="number"
                    value={formData.dailyTraffic}
                    onChange={(e) => handleInputChange('dailyTraffic', e.target.value)}
                    className="toolbox-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experimentRatio">实验流量比例</Label>
                  <Input
                    id="experimentRatio"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.experimentRatio}
                    onChange={(e) => handleInputChange('experimentRatio', e.target.value)}
                    className="toolbox-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alpha">显著性水平 (α)</Label>
                  <Input
                    id="alpha"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.alpha}
                    onChange={(e) => handleInputChange('alpha', e.target.value)}
                    className="toolbox-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="power">统计功效 (1-β)</Label>
                  <Input
                    id="power"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.power}
                    onChange={(e) => handleInputChange('power', e.target.value)}
                    className="toolbox-input"
                  />
                </div>
              </div>

              <Button 
                onClick={calculateSampleSize} 
                disabled={isCalculating}
                className="w-full toolbox-button"
              >
                {isCalculating ? '计算中...' : '计算样本量'}
              </Button>
            </TooltipProvider>
          </CardContent>
          </Card>
        </motion.div>

        {/* 结果展示 */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Card className="toolbox-card hover:shadow-xl transition-all duration-300">
            <CardContent className="space-y-4 pt-6">
            <AnimatePresence mode="wait">
              {results.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="w-5 h-5 text-primary" />
                          <Label className="text-base font-semibold">计算结果表</Label>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          实验组数量: {formData.groupNum} (1个对照组 + {formData.groupNum}个实验组 = {parseInt(formData.groupNum) + 1}个组别)
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button onClick={exportResults} variant="outline" size="sm" className="toolbox-button-secondary">
                          <Download className="w-4 h-4 mr-2" />
                          导出结果
                        </Button>
                      </motion.div>
                    </div>
                  <div className="max-h-64 overflow-auto border border-border rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-secondary">
                          <th className="px-2 py-1 text-left">MDE</th>
                          <th className="px-2 py-1 text-left">对照组</th>
                          <th className="px-2 py-1 text-left">每组实验组</th>
                          <th className="px-2 py-1 text-left">总样本</th>
                          <th className="px-2 py-1 text-left">实验天数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result, index) => (
                          <tr key={index} className="border-t border-border hover:bg-muted/50 transition-colors">
                            <td className="px-2 py-1 font-medium text-primary">
                              {formData.metricType === 'proportion' 
                                ? `${result.mde.toFixed(2)}%`
                                : `${(result.mde * 100).toFixed(2)}%`
                              }
                            </td>
                            <td className="px-2 py-1">{result.control_sample_size.toLocaleString()}</td>
                            <td className="px-2 py-1">{result.treatment_sample_size.toLocaleString()}</td>
                            <td className="px-2 py-1 font-semibold">{result.total_sample_size.toLocaleString()}</td>
                            <td className="px-2 py-1">{result.experiment_days}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {chartData.length > 1 && (
                  <>
                    {/* 分隔线 */}
                    <div className="my-6 border-t border-border/50"></div>
                    
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <Label className="text-base font-semibold">样本量趋势图</Label>
                      </div>
                    <motion.div 
                      className="chart-container w-full h-80 p-4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={chartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="mde" 
                            tickFormatter={(value) => formData.metricType === 'proportion' ? value.toFixed(1) + '%' : (value * 100).toFixed(2) + '%'}
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#6b7280' }}
                            tickLine={{ stroke: '#6b7280' }}
                          />
                          <YAxis 
                            tickFormatter={(value) => value.toLocaleString()}
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#6b7280' }}
                            tickLine={{ stroke: '#6b7280' }}
                          />
                          <RechartsTooltip 
                            formatter={(value, name) => [value.toLocaleString(), '总样本量']}
                            labelFormatter={(label) => `MDE: ${formData.metricType === 'proportion' ? label.toFixed(2) + '%' : (label * 100).toFixed(2) + '%'}`}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="totalSampleSize" 
                            stroke="#2d5a27" 
                            strokeWidth={3}
                            connectNulls={false}
                            dot={{ 
                              fill: '#2d5a27', 
                              strokeWidth: 2, 
                              r: 4,
                              stroke: '#ffffff'
                            }}
                            activeDot={{ 
                              r: 6, 
                              fill: '#2d5a27',
                              stroke: '#ffffff',
                              strokeWidth: 2
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </motion.div>
                  </>
                )}
              </motion.div>
            ) : (
                <motion.div 
                  className="text-center py-8 text-muted-foreground"
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Calculator className="w-8 h-8 text-primary" />
                  </motion.div>
                  <p className="text-lg font-medium">点击"计算样本量"按钮开始计算</p>
                  <p className="text-sm mt-2">输入参数后即可获得精确的样本量计算结果</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default SampleSizeCalculator

