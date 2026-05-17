import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, Upload, Download, FileText, Target, Sparkles, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts'
import config from '../config.js'

const Rerandomization = () => {
  const [uploadedData, setUploadedData] = useState(null)
  const [dataPreview, setDataPreview] = useState([])
  const [columns, setColumns] = useState([])
  const [formData, setFormData] = useState({
    groupColumn: '',
    userIdColumn: '',
    metricConfigs: [], // 改为配置数组，每个指标可以有自己的类型
    iterations: 1000,
    groups: [
      { name: 'control', proportion: 50, label: '对照组' },
      { name: 'treatment1', proportion: 50, label: '实验组1' }
    ]
  })
  const [results, setResults] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target.result
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length === 0) {
          setError('文件为空或格式不正确')
          return
        }
        
        const headers = lines[0].split(',').map(h => h.trim())
        
        // 解析前几行数据作为预览
        const preview = lines.slice(1, 6).map(line => {
          const values = line.split(',')
          const row = {}
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || ''
          })
          return row
        })

        setColumns(headers)
        setDataPreview(preview)
        setUploadedData(text)

        // 智能列名识别
        const smartMapping = smartColumnMapping(headers)
        setFormData(prev => ({
          ...prev,
          ...smartMapping
        }))

      } catch (error) {
        console.error('文件解析错误:', error)
      }
    }
    reader.readAsText(file)
  }

  const smartColumnMapping = (headers) => {
    const mapping = {}
    
    // 分组列识别
    const groupKeywords = ['group', 'test', 'control', 'exp', 'treatment', '分组', '组别']
    const groupCol = headers.find(h => 
      groupKeywords.some(keyword => h.toLowerCase().includes(keyword.toLowerCase()))
    )
    if (groupCol) mapping.groupColumn = groupCol

    // 用户ID列识别
    const idKeywords = ['id', 'user', 'uuid', 'userid', '用户', '用户id']
    const idCol = headers.find(h => 
      idKeywords.some(keyword => h.toLowerCase().includes(keyword.toLowerCase()))
    )
    if (idCol) mapping.userIdColumn = idCol

    // 指标列识别（数值型列，排除分组和ID列）
    const metricCols = headers.filter(h => 
      !groupKeywords.some(keyword => h.toLowerCase().includes(keyword.toLowerCase())) &&
      !idKeywords.some(keyword => h.toLowerCase().includes(keyword.toLowerCase()))
    )
    if (metricCols.length > 0) {
      mapping.metricConfigs = metricCols.slice(0, 3).map(col => ({
        column: col,
        type: 'mean', // 默认为均值类型
        numerator: '',
        denominator: ''
      }))
    }

    return mapping
  }

  // 指标类型配置和说明
  const metricTypeConfigs = {
    mean: {
      label: '均值',
      description: '连续型指标，如GMV、订单金额等',
      examples: 'GMV、订单金额、用户时长'
    },
    proportion: {
      label: '比例',
      description: '二值型指标，如转化率、留存率等',
      examples: '转化率、留存率、点击率'
    },
    ratio: {
      label: '比率',
      description: '需要选择分子和分母的比率指标',
      examples: 'ARPU、客单价、人均订单数'
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addMetricConfig = () => {
    const availableColumns = getNumericColumns()
    
    if (availableColumns.length > 0) {
      setFormData(prev => ({
        ...prev,
        metricConfigs: [...prev.metricConfigs, {
          column: availableColumns[0],
          type: 'mean',
          numerator: '',
          denominator: ''
        }]
      }))
    }
  }

  const removeMetricConfig = (index) => {
    setFormData(prev => ({
      ...prev,
      metricConfigs: prev.metricConfigs.filter((_, i) => i !== index)
    }))
  }

  const updateMetricConfig = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      metricConfigs: prev.metricConfigs.map((config, i) => 
        i === index ? { ...config, [field]: value } : config
      )
    }))
  }

  const getNumericColumns = () => {
    if (!columns.length) return []
    
    const groupKeywords = ['group', 'test', 'control', 'exp', 'treatment', '分组', '组别']
    const idKeywords = ['id', 'user', 'uuid', 'userid', '用户', '用户id']
    
    return columns.filter(col => 
      !groupKeywords.some(keyword => col.toLowerCase().includes(keyword.toLowerCase())) &&
      !idKeywords.some(keyword => col.toLowerCase().includes(keyword.toLowerCase()))
    )
  }

  const handleGroupProportionChange = (group, value) => {
    const numValue = parseInt(value) || 0
    const otherGroup = group === 'control' ? 'treatment' : 'control'
    const otherValue = 100 - numValue
    
    setFormData(prev => ({
      ...prev,
      groupProportions: {
        ...prev.groupProportions,
        [group]: numValue,
        [otherGroup]: otherValue
      }
    }))
  }

  const addGroup = () => {
    const newGroupIndex = formData.groups.length
    const newGroup = {
      name: `treatment${newGroupIndex}`,
      proportion: 0,
      label: `实验组${newGroupIndex}`
    }
    
    setFormData(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup]
    }))
  }

  const removeGroup = (index) => {
    if (formData.groups.length <= 2) {
      alert('至少需要保留对照组和一个实验组')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index)
    }))
  }

  const updateGroupProportion = (index, proportion) => {
    const numValue = parseInt(proportion) || 0
    
    setFormData(prev => {
      const newGroups = [...prev.groups]
      newGroups[index].proportion = numValue
      
      return {
        ...prev,
        groups: newGroups
      }
    })
  }

  const updateGroupLabel = (index, label) => {
    setFormData(prev => {
      const newGroups = [...prev.groups]
      newGroups[index].label = label
      return {
        ...prev,
        groups: newGroups
      }
    })
  }

  const runRerandomization = async () => {
    if (!uploadedData || !formData.userIdColumn || formData.metricConfigs.length === 0) {
      alert('请确保已上传数据并选择了必要的列')
      return
    }

    // 验证指标配置
    for (const config of formData.metricConfigs) {
      if (config.type === 'ratio') {
        if (!config.numerator || !config.denominator) {
          alert('比率类型指标必须选择分子和分母列')
          return
        }
      } else {
        if (!config.column) {
          alert('请为所有指标选择指标列')
          return
        }
      }
    }

    // 验证组别比例总和是否为100%
    const totalProportion = formData.groups.reduce((sum, group) => sum + group.proportion, 0)
    if (totalProportion !== 100) {
      alert(`组别比例总和必须为100%，当前为${totalProportion}%`)
      return
    }

    setIsProcessing(true)
    setProgress(0)
    
    try {
      // 解析数据
      const lines = uploadedData.split('\n').filter(line => line.trim())
      
      if (lines.length === 0) {
        throw new Error('数据文件为空')
      }
      
      const headers = lines[0].split(',').map(h => h.trim())
      const data = lines.slice(1).map(line => {
        const values = line.split(',')
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || ''
        })
        return row
      }).filter(row => row[formData.userIdColumn])

      // 转换组别配置为后端期望的格式
      const groupProportions = {}
      formData.groups.forEach(group => {
        groupProportions[group.name] = group.proportion
      })

      // 转换指标配置为后端期望的格式
      const selectedMetrics = formData.metricConfigs.map(config => {
        if (config.type === 'ratio') {
          // 使用数组格式：[numerator, denominator]
          return [config.numerator, config.denominator]
        }
        return config.column
      })
      const metricTypes = {}
      formData.metricConfigs.forEach(config => {
        if (config.type === 'ratio') {
          // 使用JSON字符串作为键，避免转义字符问题
          const key = JSON.stringify([config.numerator, config.denominator])
          metricTypes[key] = config.type
        } else {
          metricTypes[config.column] = config.type
        }
      })

      const requestBody = {
        data: data,
        selectedMetrics: selectedMetrics,
        metricTypes: metricTypes,
        userIdColumn: formData.userIdColumn,
        iterations: formData.iterations,
        groupProportions: groupProportions
      }

      // 调试信息
      console.log('DEBUG: selectedMetrics =', selectedMetrics)
      console.log('DEBUG: metricTypes =', metricTypes)
      console.log('DEBUG: requestBody =', requestBody)

      // 创建AbortController用于超时控制
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 300000) // 5分钟超时

      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.rerandomization}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      
      // 调试信息
      console.log('API响应数据:', result);
      console.log('最佳种子:', result.bestSeed);
      console.log('最佳种子最大T统计量:', result.bestSeedMaxTStat);
      console.log('最佳种子检验结果:', result.bestSeedResults);

      // 生成直方图数据（简化版本，只显示最佳种子）
      const histogramData = generateHistogramData([], result.bestSeedMaxTStat || 0)

      setResults({
        bestSeed: result.bestSeed,
        bestSeedMaxTStat: result.bestSeedMaxTStat || 0,
        histogram: histogramData,
        totalIterations: result.totalIterations || formData.iterations,
        bestSeedResults: result.bestSeedResults // 存储显著性检验结果
      })

    } catch (error) {
      console.error('重随机错误:', error)
      
      let errorMessage = '重随机过程中出现错误'
      if (error.name === 'AbortError') {
        errorMessage = '请求超时，请检查网络连接或减少迭代次数'
      } else if (error.message.includes('Broken pipe')) {
        errorMessage = '连接中断，请重试'
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '无法连接到服务器，请检查后端服务是否运行'
      } else {
        errorMessage = `${error.message}，请检查数据格式或后端服务是否运行`
      }
      
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const generateHistogramData = (allTStats, bestScore) => {
    if (!allTStats || allTStats.length === 0) return []
    
    const bins = 20
    const min = Math.min(...allTStats)
    const max = Math.max(...allTStats)
    const binWidth = (max - min) / bins
    
    const histogram = Array(bins).fill(0).map((_, i) => ({
      bin: (min + i * binWidth).toFixed(2),
      count: 0,
      isBest: false
    }))
    
    allTStats.forEach(tStat => {
      const binIndex = Math.min(Math.floor((tStat - min) / binWidth), bins - 1)
      histogram[binIndex].count++
    })
    
    // 标记最佳种子所在的区间
    if (bestScore) {
      const bestBinIndex = Math.min(Math.floor((bestScore - min) / binWidth), bins - 1)
      histogram[bestBinIndex].isBest = true
    }
    
    return histogram
  }

  const exportResults = () => {
    if (!results) return
    
    const csvContent = [
      ['最佳种子', '最大T统计量'],
      [results.bestSeed, results.bestSeedMaxTStat.toFixed(4)]
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'rerandomization_results.csv'
    link.click()
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
          <Shuffle className="w-6 h-6 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">重随机 (SeedFinder)</h2>
          <p className="text-muted-foreground">寻找最优随机种子以平衡实验组</p>
        </div>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {/* 数据上传和配置 */}
        <motion.div
          className="flex flex-col"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="toolbox-card hover:shadow-xl transition-all duration-300 flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>数据上传与配置</span>
              </CardTitle>
              <CardDescription>上传数据并配置重随机参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
            {/* 文件上传 */}
            <div className="space-y-2">
              <Label>数据文件</Label>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  点击上传CSV文件或拖拽文件到此处
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* 数据预览 */}
            {dataPreview.length > 0 && (
              <div className="space-y-2">
                <Label>数据预览</Label>
                <div className="max-h-32 overflow-auto border border-border rounded">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-secondary">
                        {columns.map(col => (
                          <th key={col} className="px-2 py-1 text-left">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataPreview.map((row, index) => (
                        <tr key={index} className="border-t border-border">
                          {columns.map(col => (
                            <td key={col} className="px-2 py-1">{row[col]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 列选择 */}
            {columns.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label>用户ID列</Label>
                  <Select value={formData.userIdColumn} onValueChange={(value) => handleInputChange('userIdColumn', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择用户ID列" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 指标配置 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>指标配置</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        为每个指标选择合适的类型，系统将使用相应的统计检验方法
                      </p>
                    </div>
                    <Button 
                      onClick={addMetricConfig} 
                      variant="outline" 
                      size="sm"
                    >
                      添加指标
                    </Button>
                  </div>
                  
                  
                  <div className="space-y-3">
                    {formData.metricConfigs.map((config, index) => (
                      <div key={index} className="border border-border rounded-lg p-4 bg-card">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                          <div className="space-y-1">
                            <Label className="text-xs">指标类型</Label>
                            <Select 
                              value={config.type} 
                              onValueChange={(value) => updateMetricConfig(index, 'type', value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(metricTypeConfigs).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    {config.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* 根据指标类型显示不同的选择界面 */}
                          {config.type === 'ratio' ? (
                            // 比率类型：显示分子和分母选择
                            <div className="md:col-span-2 grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">分子 (X)</Label>
                                <Select 
                                  value={config.numerator || ''} 
                                  onValueChange={(value) => updateMetricConfig(index, 'numerator', value)}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="选择分子列" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getNumericColumns().map(col => (
                                      <SelectItem key={col} value={col}>{col}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">分母 (Y)</Label>
                                <Select 
                                  value={config.denominator || ''} 
                                  onValueChange={(value) => updateMetricConfig(index, 'denominator', value)}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="选择分母列" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getNumericColumns().map(col => (
                                      <SelectItem key={col} value={col}>{col}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ) : (
                            // 其他类型：显示指标列选择
                            <div className="md:col-span-2 space-y-1">
                              <Label className="text-xs">指标列</Label>
                              <Select 
                                value={config.column} 
                                onValueChange={(value) => updateMetricConfig(index, 'column', value)}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getNumericColumns().map(col => (
                                    <SelectItem key={col} value={col}>{col}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMetricConfig(index)}
                              className="h-9 w-9 p-0"
                            >
                              <span className="sr-only">删除指标</span>
                              ×
                            </Button>
                          </div>
                        </div>
                        
                      </div>
                    ))}
                  </div>
                  
                  {formData.metricConfigs.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>请添加至少一个指标进行重随机</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>迭代次数</Label>
                  <Input
                    type="number"
                    value={formData.iterations}
                    onChange={(e) => handleInputChange('iterations', parseInt(e.target.value) || 1000)}
                    className="toolbox-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>分组配置</Label>
                  <div className="space-y-3">
                    {formData.groups.map((group, index) => (
                      <div key={group.name} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <div className="flex-1">
                          <Label className="text-xs">组别名称</Label>
                          <Input
                            type="text"
                            value={group.label}
                            onChange={(e) => updateGroupLabel(index, e.target.value)}
                            className="toolbox-input"
                            placeholder="输入组别名称"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs">流量比例 (%)</Label>
                          <Input
                            type="number"
                            value={group.proportion}
                            onChange={(e) => updateGroupProportion(index, e.target.value)}
                            className="toolbox-input"
                            min="0"
                            max="100"
                          />
                        </div>
                        {formData.groups.length > 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeGroup(index)}
                            className="h-9 w-9 p-0"
                          >
                            <span className="sr-only">删除分组</span>
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button onClick={addGroup} variant="outline" size="sm" className="w-full">
                      + 添加实验组
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      比例总和: {formData.groups.reduce((sum, group) => sum + group.proportion, 0)}%
                      {formData.groups.reduce((sum, group) => sum + group.proportion, 0) !== 100 && (
                        <span className="text-red-500 ml-2">(必须等于100%)</span>
                      )}
                    </div>
                  </div>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <Label>进度</Label>
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                      正在运行重随机算法... {progress.toFixed(1)}%
                    </p>
                  </div>
                )}

                <Button 
                  onClick={runRerandomization} 
                  disabled={isProcessing}
                  className="w-full toolbox-button"
                >
                  {isProcessing ? '运行中...' : '开始重随机'}
                </Button>
              </>
            )}
          </CardContent>
          </Card>
        </motion.div>

        {/* 结果展示 */}
        <motion.div
          className="flex flex-col"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Card className="toolbox-card hover:shadow-xl transition-all duration-300 flex-1 flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>重随机结果</span>
                  </CardTitle>
                  <CardDescription>最佳种子和统计检验结果</CardDescription>
                </div>
                {results && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button onClick={exportResults} variant="outline" size="sm" className="toolbox-button-secondary">
                      <Download className="w-4 h-4 mr-2" />
                      导出
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
            {results ? (
              <div className="space-y-6">
                {/* 最佳种子 */}
                <motion.div 
                  className="text-center p-6 bg-primary/10 rounded-lg border border-primary/20"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6,
                    ease: "easeOut",
                    delay: 0.2
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.div
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ 
                      duration: 0.8,
                      delay: 0.4,
                      ease: "easeOut"
                    }}
                  >
                    <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                  </motion.div>
                  <motion.h3 
                    className="text-xl font-bold text-primary mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    最佳随机种子
                  </motion.h3>
                  <motion.p 
                    className="text-2xl font-mono font-bold text-foreground"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 0.8, 
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                  >
                    {results.bestSeed}
                  </motion.p>
                  <motion.p 
                    className="text-sm text-muted-foreground mt-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.4 }}
                  >
                    最大T统计量: {results.bestSeedMaxTStat.toFixed(4)}
                  </motion.p>
                </motion.div>



                {/* 统计检验结果 */}
                {results.bestSeedResults && (
                  <div className="space-y-2">
                    <h4 className="font-medium">统计检验结果</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>指标</TableHead>
                            <TableHead>指标类型</TableHead>
                            <TableHead>对照组</TableHead>
                            <TableHead>实验组</TableHead>
                            <TableHead>对照组均值</TableHead>
                            <TableHead>实验组均值</TableHead>
                            <TableHead>T统计量</TableHead>
                            <TableHead>P值</TableHead>
                            <TableHead>显著性</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(results.bestSeedResults).flatMap(([metric, metricResults]) => 
                            metricResults.tests.map((test, index) => (
                              <TableRow key={`${metric}-${index}`}>
                                <TableCell className="font-medium">{metric}</TableCell>
                                <TableCell>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    {metricResults.metric_type}
                                  </span>
                                </TableCell>
                                <TableCell>{test.group1}</TableCell>
                                <TableCell>{test.group2}</TableCell>
                                <TableCell>{test.group1_mean ? test.group1_mean.toFixed(4) : '-'}</TableCell>
                                <TableCell>{test.group2_mean ? test.group2_mean.toFixed(4) : '-'}</TableCell>
                                <TableCell>{test.statistic ? test.statistic.toFixed(4) : '-'}</TableCell>
                                <TableCell>{test.p_value ? test.p_value.toFixed(6) : '-'}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    test.significant 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {test.significant ? '显著' : '不显著'}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <motion.div 
                className="text-center py-8 text-muted-foreground"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
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
                  <Shuffle className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="text-lg font-medium">上传数据并运行重随机后，结果将在此处显示</p>
                <p className="text-sm mt-2">配置参数后即可获得最优的随机种子</p>
              </motion.div>
            )}
          </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default Rerandomization
