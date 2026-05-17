import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, Users, BookOpen, Award, CheckCircle, ChevronDown, ChevronUp, ShoppingCart, MessageCircle, Mail, Target, UserCheck, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { useState } from 'react'

const CourseIntroduction = ({ onNavigate }) => {
  const [expandedChapter, setExpandedChapter] = useState(null)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const highlights = [
    {
      title: '全流程覆盖，从0到1系统掌握AB实验',
      description: '从产品思维、产品策略、业务梳理、指标设计到样本量计算、分流机制、上线监控与实验报告，全流程讲解，不再碎片化学习，真正"打通产品实验任督二脉"。'
    },
    {
      title: '强业务导向，强调产品与数据联动逻辑',
      description: '每讲都有真实打车App改版案例，用我开发好的APP现场演示"产品链路"以及"为什么这么分析"，帮你从业务视角深刻理解数据策略，提升产品sense。'
    },
    {
      title: '丰富真实案例，提升实验实战体感',
      description: '聚焦真实企业场景，本课程精选5个互联网公司数据科学案例，还原工作流程，帮助学员提升实战能力，摆脱枯燥理论和重复项目。'
    },
    {
      title: '现成的实验工具，帮你聚焦分析',
      description: '不会编程也没关系！我们提供现成的实验分析工具，样本量计算、分流配置、假设检验等。你只需要照着课程进入网站点一点、跑一下，几秒就能看到实验结果。'
    },
    {
      title: '掌握商务沟通原则以及标准分析框架',
      description: '本课程将带你深入理解结构化思维和结论先行的职场沟通精髓，彻底解决"分析做得很完整，但老板抓不住重点"的痛点。你将学会像高管一样思考和汇报，助力你职场高效沟通。'
    },
    {
      title: '课程终身更新，紧跟行业前沿',
      description: '报名后，即可享受课程内容的终身免费更新。我们将持续跟进行业最新发展与技术应用，及时新增优质项目与课程内容，确保你始终获得最新、最实用的职业技能。'
    },
    {
      title: '理论+实践结合，每一讲都能落地',
      description: '配备易懂的讲解文章 + 练习题 + 实操代码 + demo数据，用通俗方式教会你样本量计算、假设检验等实验原理，一边学理论一边掌握实战方法。'
    }
  ]

  const targetAudience = [
    {
      title: '数据科学或产品分析转型的新人/学生',
      description: '计算机、统计、数学、经管等专业背景，需要A/B实验实操技能以进入互联网大厂。'
    },
    {
      title: '分析能力较强但缺乏A/B实验经验的商业/准数据分析师',
      description: '希望补全从策略到实验落地的关键能力，提升职业竞争力。'
    },
    {
      title: '产品经理',
      description: '想系统掌握A/B实验应用、指标设计和评估，提高科学决策能力。'
    },
    {
      title: '运营或增长团队成员',
      description: '需通过A/B实验验证策略效果，提高执行的科学性与成功率。'
    }
  ]

  const chapters = [
    {
      number: '第一课',
      title: '认识AB实验——互联网公司如何用实验驱动决策？',
      description: '帮你建立整体认知框架，了解AB实验的背景、逻辑与应用场景。',
      topics: [
        '什么是A/B实验？',
        '为什么大厂做决策前都要做实验？',
        '在线实验核心假设：稳定个体处理值假设',
        '业务常见的三种实验类型：AB实验 / 时间片轮转 / 全量评估'
      ]
    },
    {
      number: '第二课',
      title: '实验从哪来？产品需求到实验方案的全过程',
      description: '拆解产品提出实验需求的全过程，帮助你提升产品思维并搞懂A/B实验背后的业务逻辑。',
      topics: [
        '介绍基本的产品思维',
        '介绍一项产品改动从诞生到上线的全流程',
        '互联网产品常见的改动策略',
        '如何绘制"产品链路图"？让策略转化成指标',
        '案例讲解：多功能区改版实验的产品链路'
      ]
    },
    {
      number: '第三课',
      title: '搭建指标体系——别再用错核心指标了！',
      description: '系统掌握北极星、过程、策略和护栏四类指标设计方法，拆解指标与业务的内在逻辑。',
      topics: [
        '四类指标全解析：北极星、过程、策略、护栏',
        '怎么从产品链路图中推导出指标？',
        '多功能实验指标体系搭建案例',
        'Bonus：业务指标解读的原则和误区'
      ]
    },
    {
      number: '第四课',
      title: '设计实验分流方案',
      description: '全面介绍随机分流原理以及分流方案设计要点',
      topics: [
        '随机分流机制详解：哈希算法两级分流的具体含义以及核心作用',
        '随机分流演示：用配套实验工具揭露分流黑盒',
        '实验层讲解：如何避免不同实验之间相互干扰？',
        '分流设计核心要素：分流对象和分流节点',
        '实验分析口径选择：不同实验策略特性决定了分析口径'
      ]
    },
    {
      number: '第五课',
      title: 'A/B实验的样本量设计',
      description: '实验能不能得出可靠结论，第一步就是搞懂"样本量"的科学计算方式。',
      topics: [
        '如何定位实验的"影响人群"？',
        '一篇OnePager学会样本量计算方法',
        '样本量 vs 实验周期：理解检验灵敏度与统计功效'
      ]
    },
    {
      number: '第六课',
      title: '假设检验和结果沟通艺术',
      description: '覆盖假设检验所有内容，包括原理和丰富的实战；不仅教会你进行指标检验，更教会你如何有效跨团队沟通',
      topics: [
        '假设检验方法：一篇OnePager学会假设检验所需的所有统计学理论和计算代码',
        '假设检验实战：手把手带你过一遍不同类型的指标如何进行假设检验',
        '实验结果沟通：不堆积统计术语，从实验前、实验中和实验后三个场景介绍实际工作中跨团队沟通'
      ]
    },
    {
      number: '第七课',
      title: '实验执行全流程——从配置到分析的每一步',
      description: '覆盖AA实验与AB实验的完整运行机制，帮你解决实验上线遇到的真实问题',
      topics: [
        '实验类型介绍：你做的是什么实验？',
        'AA实验是"体检"：如何科学运行AA实验',
        'Bonus1：如何运用AA Simulator和Seed Finder',
        'AB实验是"实战"：如何设置放量、实验运行遇到问题怎么解决',
        'Bonus2：全面介绍反转实验、新奇效应 & 首因效应、CUPED缩减方差'
      ]
    },
    {
      number: '第八课',
      title: '高效沟通与汇报',
      description: '优秀的汇报能够帮助不同群体从同一个报告中得出一致结论；结构化思维是实现高效沟通与汇报的核心法则。',
      topics: [
        '日常业务沟通的本质和误区',
        '如何设计沟通故事线',
        '数据呈现方式：让图表自己开口说话',
        '结构化写作练习'
      ]
    },
    {
      number: '第九课',
      title: '如何撰写产品分析报告',
      description: '让数据"说人话"，写出能让产品、业务、管理层都能看懂的实验报告。',
      topics: [
        '优秀报告解析：全面剖析一份高质量报告应具备的结构、语言与亮点。',
        '分析框架揭秘：深入讲解产品分析报告的核心写作逻辑与结构框架。',
        '金字塔思维运用：指导如何将结构化思维高效应用于分析报告撰写中。'
      ]
    }
  ]

  const projects = [
    {
      title: '录音协议授权优化',
      description: '聚焦网约车平台行程录音授权弹窗的用户体验改进，探索不同交互方式对下单转化的影响，设计实验并提供数据支持的产品建议。'
    },
    {
      title: '信用分支付场景',
      description: '以信用分支付产品为例，模拟如何通过调整信用分策略提升支付完成率，要求学员自主制定实验方案，深入分析行为转化效果。'
    },
    {
      title: '短视频直播回放样式调整',
      description: '选取短视频平台直播回放模块，围绕界面样式和交互设计优化实验，评估新方案的策略效果以及置换效应，助力产品上线决策。'
    },
    {
      title: '视频自动裁剪功能探索',
      description: '关注短视频编辑环节，引入自动裁剪功能，通过实验验证新功能对内容创作与发布的促进效果，并据实验结果提出迭代方向。'
    }
  ]

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header Navigation */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <img 
                src="/logo.png" 
                alt="Data Science Community Logo" 
                className="w-12 h-12 object-contain"
              />
              <div className="ml-1">
                <h1 className="text-lg font-light text-foreground tracking-wider leading-tight">
                  Data Science
                </h1>
                <h2 className="text-sm font-extralight text-muted-foreground tracking-widest uppercase">
                  Community
                </h2>
                <div className="mt-2 h-px w-20 bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <motion.button
                onClick={() => onNavigate('home')}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回首页</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" style={{ minHeight: '40vh' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-light text-foreground mb-8 tracking-tight">
              数据科学A/B实验课程
            </h1>
            {/* 更新标识：2025-10-16 23:40 */}
            
            <div className="flex justify-center gap-8 text-sm text-muted-foreground mb-8">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>16小时</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>9章 + 5个实训项目</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>配备一线大厂助教辅导</span>
              </div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-center gap-4"
            >
              <Button 
                variant="outline"
                size="lg" 
                className="px-8 py-3 text-base font-normal bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsPurchaseModalOpen(true)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                购买课程
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Course Highlights */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-light text-foreground mb-4">课程亮点</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              从大厂数据科学家的真实岗位视角出发，带你看懂互联网公司到底是怎么用 A/B 实验做决策。
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white border border-border/50 rounded-lg p-6 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h3 className="text-base font-medium text-foreground mb-2">
                        {highlight.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-light text-foreground mb-4">课程适合谁</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              本课程适合以下四类人群：
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {targetAudience.map((audience, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white border border-border/50 rounded-lg p-6 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-foreground mb-2">
                        {audience.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {audience.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-light text-foreground mb-4">教学团队</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              由一线互联网大厂数据科学家和商业分析师组成的专业团队，具备丰富的A/B实验设计和统计分析实战经验
            </p>
          </motion.div>

          {/* 团队成员数据 */}
          {(() => {
            const teamMembers = [
              {
                name: "Ray",
                role: "主讲老师",
                education: "美国Top30商分硕士",
                experience: "一线互联网大厂数据科学家",
                skills: "产品分析、A/B实验、因果推断、Tableau认证专家",
                motto: "从数据中提炼洞察，用实验驱动增长",
                avatar: "/assets/ray头像.jpeg"
              },
              {
                name: "Vicky",
                role: "助教",
                education: "美国藤校商分硕士",
                experience: "一线互联网大厂商业分析师",
                skills: "3年跨境电商商分经验，擅长成本效益分析，具备丰富面试经验",
                motto: "非不能也，是不为也",
                avatar: "/assets/vicky头像.jpeg"
              },
                {
                  name: "Estelle",
                  role: "助教",
                  education: "QS前20数据科学硕士",
                  experience: "一线互联网大厂数据科学家",
                  skills: "A/B实验平台开发、随机化算法、统计功效分析、实验设计优化",
                  motto: "",
                  avatar: "/assets/rosy头像.jpg"
                }
            ];

            // 判断是否需要滚动动画（当成员数量超过3个时启用）
            const shouldAnimate = teamMembers.length > 3;
            
            if (shouldAnimate) {
              // 需要滚动的情况
              const cardWidth = 280;
              const gap = 24;
              const totalWidth = teamMembers.length * cardWidth + (teamMembers.length - 1) * gap;
              const containerWidth = 1000;
              const scrollDistance = Math.max(0, totalWidth - containerWidth);

              return (
                <div className="relative overflow-hidden max-w-6xl mx-auto">
                  <motion.div
                    className="flex gap-6 pb-4"
                    initial={{ x: 0 }}
                    animate={{ x: [0, -scrollDistance, 0] }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{ width: "max-content" }}
                  >
                    {teamMembers.map((member, index) => (
                      <motion.div
                        key={member.name}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        viewport={{ once: true }}
                        className="flex-shrink-0 w-70"
                      >
                        <Card className="bg-white border border-border hover:border-primary/20 transition-all duration-300 p-6 text-center h-full">
                          <div className="flex flex-col items-center h-full">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                              <div className="w-full h-full bg-primary/20 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                                <Users className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-1">{member.name}</h3>
                            <p className="text-xs text-primary font-medium mb-3">{member.role}</p>
                            <div className="space-y-1.5 text-xs text-muted-foreground text-left flex-grow">
                              <p><span className="font-medium">教育背景：</span>{member.education}</p>
                              <p><span className="font-medium">工作经历：</span>{member.experience}</p>
                              <p><span className="font-medium">擅长技能：</span>{member.skills}</p>
                              {member.motto && <p className="italic text-xs mt-2">"{member.motto}"</p>}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  {/* 渐变遮罩效果 */}
                  <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-background to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-background to-transparent pointer-events-none z-10"></div>
                </div>
              );
            } else {
              // 不需要滚动的情况 - 居中显示
              return (
                <div className="flex justify-center">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl">
                    {teamMembers.map((member, index) => (
                      <motion.div
                        key={member.name}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        viewport={{ once: true }}
                      >
                        <Card className="bg-white border border-border hover:border-primary/20 transition-all duration-300 p-6 text-center h-full">
                          <div className="flex flex-col items-center h-full">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                              <div className="w-full h-full bg-primary/20 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                                <Users className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-1">{member.name}</h3>
                            <p className="text-xs text-primary font-medium mb-3">{member.role}</p>
                            <div className="space-y-1.5 text-xs text-muted-foreground text-left flex-grow">
                              <p><span className="font-medium">教育背景：</span>{member.education}</p>
                              <p><span className="font-medium">工作经历：</span>{member.experience}</p>
                              <p><span className="font-medium">擅长技能：</span>{member.skills}</p>
                              {member.motto && <p className="italic text-xs mt-2">"{member.motto}"</p>}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            }
          })()}
        </div>
      </section>

      {/* Course Chapters */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-light text-foreground mb-4">课程章节</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              系统化的课程结构，从基础概念到实战应用，循序渐进掌握A/B实验全流程
            </p>
          </motion.div>

          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border border-border hover:border-primary/20 transition-all duration-300 overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => setExpandedChapter(expandedChapter === index ? null : index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-grow">
                        <CardTitle className="text-lg font-medium text-foreground mb-2">
                          {chapter.number}：{chapter.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                          {chapter.description}
                        </CardDescription>
                      </div>
                      <div className="flex-shrink-0">
                        {expandedChapter === index ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <AnimatePresence>
                    {expandedChapter === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <CardContent className="pt-0">
                          <div className="border-t border-border/50 pt-4">
                            <h4 className="text-sm font-medium text-foreground mb-3">课程要点</h4>
                            <ul className="space-y-2">
                              {chapter.topics.map((topic, topicIndex) => (
                                <li key={topicIndex} className="flex items-start space-x-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-sm text-muted-foreground">{topic}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Training */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-light text-foreground mb-4">项目实训</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              除了课程自带的多功能样式案例外，课程以四个真实行业案例，引导同学体验产品优化全流程，包括需求分析、实验设计、数据分析及建议输出。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="bg-white border border-border/50 rounded-lg p-5 hover:border-primary/20 transition-all duration-300 h-full">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <Award className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-foreground mb-2">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Offer Sprint Service */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-light text-foreground mb-4">大厂Offer冲刺服务</h2>
            <p className="text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              课程最后阶段，将根据每位学员在学习过程中的表现，由主讲老师和助教团队为大家提供一对一简历修改与深度优化服务。此外，我们还将为学员安排多轮模拟面试，全程采用大厂真实面试题目，帮助你提前熟悉面试流程和题型，查漏补缺，提升应对能力。力求助力每一位学员用更完善的简历和更充分的准备，顺利斩获大厂数据科学岗位Offer。
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white border border-border/50 rounded-lg p-6 hover:border-primary/20 transition-all duration-300 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-3">一对一简历优化</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  根据学员学习表现，提供个性化简历修改与深度优化服务，突出数据科学技能亮点
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white border border-border/50 rounded-lg p-6 hover:border-primary/20 transition-all duration-300 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-3">模拟面试训练</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  多轮模拟面试，采用大厂真实面试题目，提前熟悉面试流程和题型
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white border border-border/50 rounded-lg p-6 hover:border-primary/20 transition-all duration-300 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-3">Offer冲刺指导</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  查漏补缺，提升应对能力，助力学员顺利斩获大厂数据科学岗位Offer
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="bg-background border-t border-border py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            由 Ray (数据科学家) 设计与开发，专注于A/B测试和实验设计领域
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Data Science Community
          </p>
        </div>
      </motion.footer>

      {/* Purchase Modal */}
      <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span>联系购买课程</span>
            </DialogTitle>
            <DialogDescription>
              欢迎联系主讲老师了解课程详情和购买方式
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="font-medium mb-4">微信二维码</p>
              <img 
                src="/qrcode.jpg" 
                alt="微信二维码" 
                className="w-40 h-40 object-contain rounded-lg mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
              <div className="w-40 h-40 bg-muted rounded-lg mx-auto flex items-center justify-center" style={{display: 'none'}}>
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsPurchaseModalOpen(false)}>
                关闭
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default CourseIntroduction
