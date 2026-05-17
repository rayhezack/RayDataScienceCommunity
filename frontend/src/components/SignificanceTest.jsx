import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Upload, Download, FileText, X, Sparkles, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import config from '../config.js'
import * as XLSX from 'xlsx'

const SignificanceTest = () => {
  const [uploadedData, setUploadedData] = useState(null)
  const [dataPreview, setDataPreview] = useState([])
  const [columns, setColumns] = useState([])
  const [formData, setFormData] = useState({
    groupColumn: '',
    userIdColumn: '',
    metricConfigs: [], // 改为配置数组，每个指标可以有自己的类型
    multipleComparison: false,
    alpha: 0.05
  })
  const [results, setResults] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)

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

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target.result
        const lines = text.split('\n').filter(line => line.trim())
          const headers = lines[0].split(",").map(h => h.trim()).filter(h => h !== "");
          
          // 解析前几行数据作为预览
          const preview = lines.slice(1, 6).map(line => {
            const values = line.split(",");
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim() || '';
            });
            return row;
          }).filter(row => Object.keys(row).length > 0); // Filter out empty rows

          setColumns(headers);
          setDataPreview(preview);
          setUploadedData(text);
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

  const runSignificanceTest = async () => {
    if (!uploadedData || !formData.groupColumn || formData.metricConfigs.length === 0) {
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

    setIsProcessing(true)
    
    try {
      const lines = uploadedData.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      const data = lines.slice(1).map(line => {
        const values = line.split(',')
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || ''
        })
        return row
      }).filter(row => row[formData.groupColumn])

      const uniqueGroups = [...new Set(data.map(row => row[formData.groupColumn]))]
      
      const controlKeywords = ['control', 'baseline', '对照', '基准']
      const controlGroup = uniqueGroups.find(group => 
        controlKeywords.some(keyword => group.toLowerCase().includes(keyword.toLowerCase()))
      ) || uniqueGroups[0]

      const treatmentGroups = uniqueGroups.filter(group => group !== controlGroup)

      if (treatmentGroups.length === 0) {
        alert('未找到实验组，请检查数据')
        return
      }

      const allResults = []

      for (const metricConfig of formData.metricConfigs) {
        const { type: metricType } = metricConfig
        const controlData = data.filter(row => row[formData.groupColumn] === controlGroup)
        const treatmentData = data.filter(row => row[formData.groupColumn] === treatmentGroups[0])

        for (const treatmentGroup of treatmentGroups) {
          const currentTreatmentData = data.filter(row => row[formData.groupColumn] === treatmentGroup)

          let testType = '';
          let requestBody = {};

          if (metricType === 'mean') {
            const controlValues = controlData.map(row => parseFloat(row[metricConfig.column])).filter(v => !isNaN(v))
            const treatmentValues = currentTreatmentData.map(row => parseFloat(row[metricConfig.column])).filter(v => !isNaN(v))

            if (controlValues.length === 0 || treatmentValues.length === 0) {
              continue
            }

            testType = 'welch';
            requestBody = {
              group1: controlValues,
              group2: treatmentValues,
              test_type: testType
            };
          } else if (metricType === 'proportion') {
            const controlValues = controlData.map(row => parseFloat(row[metricConfig.column])).filter(v => !isNaN(v))
            const treatmentValues = currentTreatmentData.map(row => parseFloat(row[metricConfig.column])).filter(v => !isNaN(v))

            if (controlValues.length === 0 || treatmentValues.length === 0) {
              continue
            }

            testType = 'proportion';
            requestBody = {
              group1: controlValues,
              group2: treatmentValues,
              test_type: testType
            };
          } else if (metricType === 'ratio') {
            // 比率类型：需要分子和分母数据
            const controlX = controlData.map(row => parseFloat(row[metricConfig.numerator])).filter(v => !isNaN(v))
            const controlY = controlData.map(row => parseFloat(row[metricConfig.denominator])).filter(v => !isNaN(v))
            const treatmentX = currentTreatmentData.map(row => parseFloat(row[metricConfig.numerator])).filter(v => !isNaN(v))
            const treatmentY = currentTreatmentData.map(row => parseFloat(row[metricConfig.denominator])).filter(v => !isNaN(v))

            if (controlX.length === 0 || controlY.length === 0 || treatmentX.length === 0 || treatmentY.length === 0) {
              continue
            }

            testType = 'ratio';
            requestBody = {
              group1: { X: controlX, Y: controlY },
              group2: { X: treatmentX, Y: treatmentY },
              test_type: testType
            };
          }

          const response = await fetch(`${config.apiBaseUrl}${config.endpoints.experimentAnalysis}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }

          const result = await response.json();

          // 计算统计信息
          let controlMean, treatmentMean, difference, relativeDifference;
          
          if (metricType === 'ratio') {
            const controlX = controlData.map(row => parseFloat(row[metricConfig.numerator])).filter(v => !isNaN(v))
            const controlY = controlData.map(row => parseFloat(row[metricConfig.denominator])).filter(v => !isNaN(v))
            const treatmentX = currentTreatmentData.map(row => parseFloat(row[metricConfig.numerator])).filter(v => !isNaN(v))
            const treatmentY = currentTreatmentData.map(row => parseFloat(row[metricConfig.denominator])).filter(v => !isNaN(v))
            
            // 计算比率平均值：X的总和 / Y的总和
            controlMean = controlX.reduce((a, b) => a + b, 0) / controlY.reduce((a, b) => a + b, 0);
            treatmentMean = treatmentX.reduce((a, b) => a + b, 0) / treatmentY.reduce((a, b) => a + b, 0);
          } else {
            const controlValues = controlData.map(row => parseFloat(row[metricConfig.column])).filter(v => !isNaN(v))
            const treatmentValues = currentTreatmentData.map(row => parseFloat(row[metricConfig.column])).filter(v => !isNaN(v))
            
            controlMean = controlValues.reduce((a, b) => a + b, 0) / controlValues.length;
            treatmentMean = treatmentValues.reduce((a, b) => a + b, 0) / treatmentValues.length;
          }
          
          difference = treatmentMean - controlMean;
          relativeDifference = controlMean !== 0 ? difference / controlMean : 0;

          allResults.push({
            metric: metricType === 'ratio' ? `${metricConfig.numerator}/${metricConfig.denominator}` : metricConfig.column,
            metricType: metricType,
            controlGroup: controlGroup,
            treatmentGroup: treatmentGroup,
            control_mean: controlMean,
            treatment_mean: treatmentMean,
            difference: difference,
            relative_difference: relativeDifference,
            t_statistic: result.t_stat,
            p_value: result.p_value,
            significance: result.p_value < formData.alpha ? '显著' : '不显著',
            confidence_interval: result.confidence_interval || [0, 0]
          });
        }
      }

      // 按实验组排序
      allResults.sort((a, b) => {
        if (a.treatmentGroup !== b.treatmentGroup) {
          return a.treatmentGroup.localeCompare(b.treatmentGroup)
        }
        return a.metric.localeCompare(b.metric)
      })

      setResults(allResults)

    } catch (error) {
      console.error('统计检验错误:', error)
      alert(`统计检验过程中出现错误: ${error.message}，请检查数据格式或后端服务是否运行`)
    } finally {
      setIsProcessing(false)
    }
  }

  const exportResults = () => {
    const dataToExport = results.map(r => ({
      '指标': r.metric,
      '指标类型': r.metricType,
      '对照组': r.controlGroup,
      '实验组': r.treatmentGroup,
      '对照组均值': r.control_mean.toFixed(4),
      '实验组均值': r.treatment_mean.toFixed(4),
      '差异': r.difference.toFixed(4),
      '相对差异': (r.relative_difference * 100).toFixed(2) + '%',
      'T统计量': r.t_statistic.toFixed(4),
      'P值': r.p_value.toFixed(4),
      '显著性': r.significance,
      '置信区间下限': r.confidence_interval[0].toFixed(4),
      '置信区间上限': r.confidence_interval[1].toFixed(4)
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '检验结果')
    XLSX.writeFile(wb, 'significance_test_results.xlsx')
  }

  const getNumericColumns = () => {
    if (!dataPreview.length) return []
    
    return columns.filter(col => {
      const sampleValue = dataPreview[0]?.[col]
      return !isNaN(parseFloat(sampleValue)) && col !== formData.groupColumn && col !== formData.userIdColumn
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
          <BarChart3 className="w-6 h-6 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">显著性检验</h2>
          <p className="text-muted-foreground">统计分析A/B测试结果的显著性</p>
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
              <CardDescription>上传CSV文件并配置检验参数</CardDescription>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>分组列</Label>
                    <Select value={formData.groupColumn} onValueChange={(value) => handleInputChange('groupColumn', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择分组列" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                      <p>请添加至少一个指标进行显著性检验</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alpha">显著性水平 (α)</Label>
                  <Input
                    id="alpha"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.alpha}
                    onChange={(e) => handleInputChange('alpha', parseFloat(e.target.value))}
                    className="toolbox-input"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multipleComparison"
                    checked={formData.multipleComparison}
                    onCheckedChange={(checked) => handleInputChange('multipleComparison', checked)}
                  />
                  <label
                    htmlFor="multipleComparison"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    多重比较校正
                  </label>
                </div>

                <Button 
                  onClick={runSignificanceTest} 
                  disabled={isProcessing || !uploadedData || !formData.groupColumn || formData.metricConfigs.length === 0}
                  className="w-full toolbox-button"
                >
                  {isProcessing ? '运行检验中...' : '运行显著性检验'}
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
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>检验结果</span>
              </CardTitle>
              <CardDescription>统计检验结果表格</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
            {results.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <Label>结果表格</Label>
                  <Button onClick={exportResults} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    导出结果
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>指标</TableHead>
                        <TableHead>指标类型</TableHead>
                        <TableHead>对照组</TableHead>
                        <TableHead>实验组</TableHead>
                        <TableHead>对照值</TableHead>
                        <TableHead>实验值</TableHead>
                        <TableHead>差异</TableHead>
                        <TableHead>相对差异</TableHead>
                        <TableHead>T统计量</TableHead>
                        <TableHead>P值</TableHead>
                        <TableHead>显著性</TableHead>
                        <TableHead>置信区间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((r, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{r.metric}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {r.metricType}
                            </span>
                          </TableCell>
                          <TableCell>{r.controlGroup}</TableCell>
                          <TableCell>{r.treatmentGroup}</TableCell>
                          <TableCell>{r.control_mean.toFixed(4)}</TableCell>
                          <TableCell>{r.treatment_mean.toFixed(4)}</TableCell>
                          <TableCell>{r.difference.toFixed(4)}</TableCell>
                          <TableCell>{(r.relative_difference * 100).toFixed(2)}%</TableCell>
                          <TableCell>{r.t_statistic ? r.t_statistic.toFixed(4) : 'N/A'}</TableCell>
                          <TableCell>{r.p_value ? r.p_value.toFixed(4) : 'N/A'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              r.significance === '显著' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {r.significance}
                            </span>
                          </TableCell>
                          <TableCell>
                            [{r.confidence_interval[0].toFixed(4)}, {r.confidence_interval[1].toFixed(4)}]
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
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
                  <BarChart3 className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="text-lg font-medium">上传数据并运行检验后，结果将在此处显示</p>
                <p className="text-sm mt-2">配置参数后即可获得详细的统计检验结果</p>
              </motion.div>
            )}
          </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default SignificanceTest


