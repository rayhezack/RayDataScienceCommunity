import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Play, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import config from '@/config.js'

const OfflineAABacktrack = () => {
  const [uploadedData, setUploadedData] = useState(null)
  const [randomSeed, setRandomSeed] = useState('')
  const [groupProportions, setGroupProportions] = useState({ control: 50, treatment: 50 })
  const [groups, setGroups] = useState([
    { id: 'control', name: '对照组', proportion: 50 },
    { id: 'treatment', name: '实验组', proportion: 50 }
  ])
  const [selectedMetrics, setSelectedMetrics] = useState([])
  const [metricTypes, setMetricTypes] = useState({})
  const [ratioMetrics, setRatioMetrics] = useState({}) // 存储比率指标的分子分母配置
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [availableColumns, setAvailableColumns] = useState([])
  const [showSplitConfirmDialog, setShowSplitConfirmDialog] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('请上传CSV格式的文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target.result
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map(h => h.trim())
        
        // 解析CSV数据
        const data = []
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim())
            const row = {}
            headers.forEach((header, index) => {
              row[header] = values[index] || ''
            })
            data.push(row)
          }
        }

        setUploadedData(data)
        setAvailableColumns(headers)
        setError('')
        
        // 自动选择数值型列作为指标
        const numericColumns = headers.filter(header => {
          if (header.toLowerCase().includes('id') || header.toLowerCase().includes('user')) return false
          // 更宽松的数值检测：只要有一行数据是有效数字就认为是数值列
          return data.some(row => {
            const value = row[header]
            if (value === '' || value === null || value === undefined) return false
            const num = parseFloat(value)
            return !isNaN(num) && isFinite(num)
          })
        })
        
        // 如果没有检测到数值型列，选择前几列作为备选
        const selectedColumns = numericColumns.length > 0 
          ? numericColumns.slice(0, 3)
          : headers.filter(h => !h.toLowerCase().includes('id') && !h.toLowerCase().includes('user')).slice(0, 3)
        
        setSelectedMetrics(selectedColumns)
        const initialMetricTypes = {}
        selectedColumns.forEach(col => {
          initialMetricTypes[col] = 'mean'
        })
        setMetricTypes(initialMetricTypes)
        
      } catch (err) {
        setError('文件解析失败，请检查CSV格式')
      }
    }
    reader.readAsText(file)
  }

  const handleMetricTypeChange = (metric, type) => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }))
  }

  const addGroup = () => {
    const newGroupId = `treatment_${Date.now()}`
    const newGroup = {
      id: newGroupId,
      name: `实验组${groups.length}`,
      proportion: 0
    }
    setGroups(prev => [...prev, newGroup])
  }

  const removeGroup = (groupId) => {
    if (groups.length <= 2) return // 至少保留2个组
    setGroups(prev => prev.filter(group => group.id !== groupId))
  }

  const updateGroupName = (groupId, name) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, name } : group
    ))
  }

  const updateGroupProportion = (groupId, proportion) => {
    const newProportion = Math.max(0, Math.min(100, parseInt(proportion) || 0))
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, proportion: newProportion } : group
    ))
  }

  const updateGroupProportions = () => {
    const newProportions = {}
    groups.forEach(group => {
      newProportions[group.id] = group.proportion
    })
    setGroupProportions(newProportions)
    
    // 显示分流配置确认反馈
    const totalUsers = uploadedData ? uploadedData.length : 0
    setSuccessMessage(`分流配置已确认！将处理 ${totalUsers} 个用户，分组比例：${Object.entries(newProportions).map(([key, value]) => `${key}: ${value}%`).join(', ')}`)
    setError('') // 清除之前的错误信息
    
    // 显示Toast提示
    setShowSplitConfirmDialog(true)
    
    // 3秒后自动关闭Toast
    setTimeout(() => {
      setShowSplitConfirmDialog(false)
    }, 3000)
  }

  const addMetric = () => {
    // 从可用列中选择一个未使用的列
    const numericColumns = availableColumns.filter(header => {
      if (header.toLowerCase().includes('id') || header.toLowerCase().includes('user')) return false
      return true // 暂时选择所有非ID列
    })
    
    // 找到第一个未使用的列
    const unusedColumn = numericColumns.find(col => !selectedMetrics.includes(col))
    
    if (unusedColumn) {
      setSelectedMetrics(prev => [...prev, unusedColumn])
      setMetricTypes(prev => ({
        ...prev,
        [unusedColumn]: 'mean'
      }))
    } else {
      // 如果没有可用列，创建一个自定义指标
      const newMetricId = `metric_${Date.now()}`
      setSelectedMetrics(prev => [...prev, newMetricId])
      setMetricTypes(prev => ({
        ...prev,
        [newMetricId]: 'mean'
      }))
    }
  }

  const getRatioMetricName = (numerator, denominator) => {
    return `${numerator}/${denominator}`
  }

  const removeMetric = (metricId) => {
    setSelectedMetrics(prev => prev.filter(id => id !== metricId))
    setMetricTypes(prev => {
      const newTypes = { ...prev }
      delete newTypes[metricId]
      return newTypes
    })
    setRatioMetrics(prev => {
      const newRatios = { ...prev }
      delete newRatios[metricId]
      return newRatios
    })
  }

  const updateRatioMetric = (metricId, numerator, denominator) => {
    setRatioMetrics(prev => ({
      ...prev,
      [metricId]: { numerator, denominator }
    }))
  }

  const handleRunAnalysis = async () => {
    if (!uploadedData || !randomSeed) {
      setError('请上传数据文件并输入随机种子')
      return
    }

    if (selectedMetrics.length === 0) {
      setError('请至少选择一个指标进行分析')
      return
    }

    setIsProcessing(true)
    setError('')
    setSuccessMessage('')

    try {
      // 处理比率指标，将分子分母配置转换为数组格式
      const processedMetrics = selectedMetrics.map(metric => {
        if (metricTypes[metric] === 'ratio' && ratioMetrics[metric] && ratioMetrics[metric].numerator && ratioMetrics[metric].denominator) {
          return [ratioMetrics[metric].numerator, ratioMetrics[metric].denominator]
        }
        return metric
      })

      // 处理metricTypes，为比率指标创建正确的键
      const processedMetricTypes = {}
      selectedMetrics.forEach(metric => {
        if (metricTypes[metric] === 'ratio' && ratioMetrics[metric] && ratioMetrics[metric].numerator && ratioMetrics[metric].denominator) {
          const ratioKey = `${ratioMetrics[metric].numerator}/${ratioMetrics[metric].denominator}`
          processedMetricTypes[ratioKey] = 'ratio'
        } else {
          processedMetricTypes[metric] = metricTypes[metric]
        }
      })

      const response = await fetch(`${config.apiBaseUrl}/offline-aa-backtrack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: uploadedData,
          randomSeed: randomSeed,
          groupProportions: groupProportions,
          selectedMetrics: processedMetrics,
          metricTypes: processedMetricTypes
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '分析失败')
      }

      setResults(result)
      setSuccessMessage(`分析完成！使用种子：${result.randomSeed}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadResults = () => {
    if (!results) return

    const csvContent = convertResultsToCSV(results)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `offline_aa_backtrack_results_${randomSeed}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const convertResultsToCSV = (results) => {
    let csv = '指标,指标类型,对照组,实验组,对照组均值,实验组均值,绝对差值,相对差值,T统计量,P值,显著性,置信区间\n'
    
    results.statisticalTests.forEach(test => {
      test.tests.forEach(t => {
        csv += `${test.metric},${test.metric_type},${t.group1},${t.group2},${t.group1_mean || ''},${t.group2_mean || ''},${t.absolute_diff || ''},${t.relative_diff || ''},${t.statistic || ''},${t.p_value || ''},${t.significant ? '显著' : '不显著'},${t.confidence_interval ? `[${t.confidence_interval[0]}, ${t.confidence_interval[1]}]` : ''}\n`
      })
    })
    
    return csv
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-foreground mb-4">离线AA回溯分析</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            上传未随机分流的数据集，使用指定随机种子进行分流，然后进行统计检验分析
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：配置区域 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6 h-fit"
        >
          {/* 文件上传 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>数据上传</span>
              </CardTitle>
              <CardDescription>
                上传包含用户ID和指标的CSV文件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">选择CSV文件</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="mt-2"
                  />
                </div>
                {uploadedData && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>已上传 {uploadedData.length} 条数据</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 随机种子配置 */}
          <Card>
            <CardHeader>
              <CardTitle>随机种子配置</CardTitle>
              <CardDescription>
                输入用于随机分流的种子值
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="random-seed">随机种子</Label>
                  <Input
                    id="random-seed"
                    value={randomSeed}
                    onChange={(e) => setRandomSeed(e.target.value)}
                    placeholder="例如: rr123456"
                    className="mt-2"
                  />
                </div>
                
                {/* 组别配置 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>组别配置</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addGroup}
                      disabled={groups.length >= 10}
                    >
                      添加组别
                    </Button>
                  </div>
                  
                  {groups.map((group, index) => (
                    <div key={group.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <div className="flex-1">
                        <Input
                          value={group.name}
                          onChange={(e) => updateGroupName(group.id, e.target.value)}
                          placeholder="组别名称"
                          className="mb-2"
                        />
                        <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                            min="0"
                            max="100"
                            value={group.proportion}
                            onChange={(e) => updateGroupProportion(group.id, e.target.value)}
                            placeholder="比例"
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                      {groups.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeGroup(group.id)}
                          className="text-foreground hover:text-foreground"
                        >
                          删除
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <div className="text-sm text-muted-foreground">
                    总比例: {groups.reduce((sum, group) => sum + group.proportion, 0)}%
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={updateGroupProportions}
                    className="w-full"
                  >
                    确认分流
                  </Button>
                  
                  {/* 分流配置确认反馈 */}
                  {successMessage && successMessage.includes('分流配置已确认') && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center text-sm text-green-800">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {successMessage}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 指标配置 */}
            <Card>
              <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                <CardTitle>指标配置</CardTitle>
                <CardDescription>
                    配置要分析的指标和指标类型
                </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMetric}
                >
                  添加指标
                </Button>
              </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                
                {/* 指标配置列表 */}
                <div className="space-y-3">
                  {selectedMetrics.map((metricId, index) => {
                    const metricType = metricTypes[metricId] || 'mean'
                    const ratioConfig = ratioMetrics[metricId]

                    return (
                      <div key={metricId} className="border border-border rounded-lg p-4 bg-card">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                          <div className="space-y-1">
                            <Label className="text-xs">指标类型</Label>
                        <select
                              value={metricType}
                              onChange={(e) => handleMetricTypeChange(metricId, e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm h-9"
                        >
                          <option value="mean">均值</option>
                          <option value="proportion">比例</option>
                          <option value="ratio">比率</option>
                        </select>
                          </div>
                          
                          {/* 根据指标类型显示不同的选择界面 */}
                          {metricType === 'ratio' ? (
                            // 比率类型：显示分子和分母选择
                            <div className="md:col-span-2 grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">分子 (X)</Label>
                                <select
                                  value={ratioConfig?.numerator || ''}
                                  onChange={(e) => updateRatioMetric(metricId, e.target.value, ratioConfig?.denominator || '')}
                                  className="w-full px-2 py-1 border rounded text-sm h-9"
                                >
                                  <option value="">选择分子列</option>
                                  {availableColumns
                                    .filter(col => !col.toLowerCase().includes('id') && !col.toLowerCase().includes('user'))
                                    .map(col => (
                                      <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">分母 (Y)</Label>
                                <select
                                  value={ratioConfig?.denominator || ''}
                                  onChange={(e) => updateRatioMetric(metricId, ratioConfig?.numerator || '', e.target.value)}
                                  className="w-full px-2 py-1 border rounded text-sm h-9"
                                >
                                  <option value="">选择分母列</option>
                                  {availableColumns
                                    .filter(col => !col.toLowerCase().includes('id') && !col.toLowerCase().includes('user'))
                                    .map(col => (
                                      <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                              </div>
                            </div>
                          ) : (
                            // 均值/比例类型：显示列选择
                            <div className="md:col-span-2 space-y-1">
                              <Label className="text-xs">指标列</Label>
                              <select
                                value={metricId}
                                onChange={(e) => {
                                  const oldMetricId = metricId
                                  const newMetricId = e.target.value
                                  
                                  // 更新selectedMetrics
                                  setSelectedMetrics(prev => prev.map(m => m === oldMetricId ? newMetricId : m))
                                  
                                  // 更新metricTypes
                                  setMetricTypes(prev => {
                                    const newTypes = { ...prev }
                                    newTypes[newMetricId] = prev[oldMetricId] || 'mean'
                                    delete newTypes[oldMetricId]
                                    return newTypes
                                  })
                                  
                                  // 更新ratioMetrics
                                  if (metricType === 'ratio') {
                                    setRatioMetrics(prev => {
                                      const newRatio = { ...prev }
                                      newRatio[newMetricId] = prev[oldMetricId]
                                      delete newRatio[oldMetricId]
                                      return newRatio
                                    })
                                  }
                                }}
                                className="w-full px-2 py-1 border rounded text-sm h-9"
                              >
                                <option value="">选择指标列</option>
                                {availableColumns
                                  .filter(col => !col.toLowerCase().includes('id') && !col.toLowerCase().includes('user'))
                                  .map(col => (
                                    <option key={col} value={col}>{col}</option>
                                  ))}
                              </select>
                            </div>
                          )}
                          
                          {/* 删除按钮 */}
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeMetric(metricId)}
                              className="h-9 w-9 p-0"
                            >
                              <span className="sr-only">删除指标</span>
                              ×
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {selectedMetrics.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>请添加至少一个指标进行分析</p>
                    </div>
                  )}
                </div>
                </div>
              </CardContent>
            </Card>

          {/* 运行分析按钮 */}
          <Button
            onClick={handleRunAnalysis}
            disabled={isProcessing || !uploadedData || !randomSeed}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                开始分析
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && successMessage.includes('分析完成') && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* 右侧：结果展示 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6 h-fit"
        >
          {results && (
            <>
              {/* 分析结果概览 */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>分析结果</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadResults}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载结果
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{results.totalUsers}</div>
                      <div className="text-sm text-muted-foreground">总用户数</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{results.randomSeed}</div>
                      <div className="text-sm text-muted-foreground">使用种子</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(results.groupSizes).map(([groupName, userCount], index) => {
                      let displayName;
                      if (groupName === 'control') {
                        displayName = '对照组';
                      } else if (groupName.startsWith('treatment')) {
                        // 提取treatment后面的数字，如果没有数字则使用索引
                        const match = groupName.match(/treatment(\d+)/);
                        if (match) {
                          displayName = `实验组${match[1]}`;
                        } else {
                          // 如果没有数字，按顺序分配
                          const treatmentIndex = Object.keys(results.groupSizes)
                            .filter(key => key.startsWith('treatment'))
                            .indexOf(groupName) + 1;
                          displayName = `实验组${treatmentIndex}`;
                        }
                      } else {
                        displayName = groupName;
                      }
                      return (
                        <div key={groupName} className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{displayName}用户数:</span>
                          <span className="font-medium">{userCount}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 统计检验结果 */}
              <Card className="mt-0">
                <CardHeader>
                  <CardTitle>统计检验结果</CardTitle>
                  <CardDescription>
                    基于随机分流后的数据进行假设检验
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                        {results.statisticalTests.flatMap((test, testIndex) => 
                          test.tests.map((t, tIndex) => (
                            <TableRow key={`${testIndex}-${tIndex}`}>
                              <TableCell className="font-medium">{test.metric}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {test.metric_type}
                                </span>
                              </TableCell>
                                    <TableCell>{t.group1}</TableCell>
                                    <TableCell>{t.group2}</TableCell>
                                <TableCell>{t.group1_mean ? t.group1_mean.toFixed(4) : '-'}</TableCell>
                                <TableCell>{t.group2_mean ? t.group2_mean.toFixed(4) : '-'}</TableCell>
                                    <TableCell>{t.statistic ? t.statistic.toFixed(4) : '-'}</TableCell>
                                    <TableCell>{t.p_value ? t.p_value.toFixed(6) : '-'}</TableCell>
                                    <TableCell>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        t.significant 
                                          ? 'bg-red-100 text-red-800' 
                                          : 'bg-green-100 text-green-800'
                                      }`}>
                                        {t.significant ? '显著' : '不显著'}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                          ))
                        )}
                              </TableBody>
                            </Table>
                          </div>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      </div>
      
      {/* 分流完成确认Toast提示 */}
      {showSplitConfirmDialog && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm"
        >
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">分流配置已确认！</h4>
              <p className="text-xs text-gray-600 mt-1">
                已成功配置用户分流比例，可以继续进行离线AA回溯分析。
              </p>
            </div>
            <button
              onClick={() => setShowSplitConfirmDialog(false)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default OfflineAABacktrack
