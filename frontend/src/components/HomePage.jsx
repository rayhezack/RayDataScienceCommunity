import { useEffect, useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  ChevronDown,
  Database,
  Mail,
  MessageCircle,
  Quote,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Users,
  Video
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { useAuth } from '../context/useAuth'
import {
  experimentMarqueeItems,
  futureRoadmap,
  learningPath,
  proofMetrics,
  rayProfile,
  testimonialQuotes,
  toolUseCases,
  trustSignals
} from '../homepageContent'

const iconMap = {
  'sample-size': Calculator,
  'significance-test': BarChart3,
  rerandomization: Shuffle,
  'offline-aa-backtrack': Database
}

const fadeUp = {
  hidden: { opacity: 0, y: 34, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' }
}

const revealTransition = { duration: 0.85, ease: [0.22, 1, 0.36, 1] }

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const Reveal = ({ children, delay = 0, className = '', amount = 0.25 }) => (
  <Motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount }}
    transition={{ ...revealTransition, delay }}
    className={className}
  >
    {children}
  </Motion.div>
)

const SectionKicker = ({ children, tone = 'light' }) => (
  <p
    className={`mb-5 flex items-center gap-3 text-xs font-light uppercase tracking-[0.32em] ${
      tone === 'dark' ? 'text-[#b8dfbd]' : 'text-[#879f98]'
    }`}
  >
    <span className={`h-px w-10 ${tone === 'dark' ? 'bg-[#b8dfbd]/45' : 'bg-[#879f98]/50'}`} />
    {children}
  </p>
)

const PremiumButton = ({ children, variant = 'dark', className = '', ...props }) => {
  const styles =
    variant === 'light'
      ? 'bg-white text-[#08271f] hover:bg-[#dff0e2]'
      : variant === 'ghost'
        ? 'border border-white/30 bg-white/5 text-white hover:border-white/55 hover:bg-white/10'
        : 'bg-[#132a24] text-white hover:bg-[#1b3b33]'

  return (
    <Button
      type="button"
      className={`group h-auto rounded-full px-7 py-4 text-base font-light shadow-none transition-all duration-300 hover:-translate-y-0.5 sm:px-8 ${styles} ${className}`}
      {...props}
    >
      {children}
      <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
    </Button>
  )
}

const DataMotionBackground = () => {
  return (
    <>
      <img src="/background_image.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/background_image.jpg"
        aria-hidden="true"
      >
        <source src="/bg_video.mp4" type="video/mp4" />
      </video>
    </>
  )
}

const MetricStrip = () => (
  <div className="grid overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.08] backdrop-blur-md sm:grid-cols-2 lg:grid-cols-4">
    {proofMetrics.map((metric) => (
      <div key={metric.label} className="border-white/10 p-5 sm:border-r last:border-r-0">
        <p className="text-3xl font-light tracking-tight text-white sm:text-4xl">{metric.value}</p>
        <p className="mt-2 text-sm font-medium text-[#b8dfbd]">{metric.label}</p>
        <p className="mt-1 text-xs font-light text-white/58">{metric.detail}</p>
      </div>
    ))}
  </div>
)

const DataSketch = ({ id }) => {
  const isBalance = id === 'rerandomization'
  const isAA = id === 'offline-aa-backtrack'
  const isTest = id === 'significance-test'

  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label="数据实验示意图">
      <defs>
        <linearGradient id={`line-${id}`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#b8dfbd" />
          <stop offset="1" stopColor="#78A184" />
        </linearGradient>
        <filter id={`soft-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#132a24" floodOpacity="0.16" />
        </filter>
      </defs>
      <rect width="320" height="180" rx="28" fill="#eef5f1" />
      <g opacity="0.38" stroke="#879f98" strokeWidth="1">
        {[34, 70, 106, 142].map((y) => (
          <line key={y} x1="28" x2="292" y1={y} y2={y} />
        ))}
        {[64, 128, 192, 256].map((x) => (
          <line key={x} x1={x} x2={x} y1="24" y2="156" />
        ))}
      </g>
      {isBalance ? (
        <g filter={`url(#soft-${id})`}>
          {[62, 118, 174, 230].map((x, index) => (
            <g key={x}>
              <circle cx={x} cy={58 + index * 14} r="18" fill="#132a24" opacity="0.92" />
              <circle cx={x + 36} cy={120 - index * 12} r="18" fill="#78A184" opacity="0.86" />
              <line x1={x} x2={x + 36} y1={58 + index * 14} y2={120 - index * 12} stroke="#274f44" strokeWidth="2" strokeDasharray="5 6" />
            </g>
          ))}
        </g>
      ) : isAA ? (
        <g filter={`url(#soft-${id})`}>
          <path d="M42 92 C86 46 126 46 170 92 S252 138 286 88" fill="none" stroke="#132a24" strokeWidth="4" />
          <path d="M42 100 C86 54 126 54 170 100 S252 146 286 96" fill="none" stroke="#78A184" strokeWidth="4" strokeDasharray="9 9" />
          {[72, 142, 212, 274].map((x, index) => (
            <circle key={x} cx={x} cy={index % 2 ? 70 : 116} r="10" fill={index % 2 ? '#132a24' : '#78A184'} />
          ))}
        </g>
      ) : isTest ? (
        <g filter={`url(#soft-${id})`}>
          <path d="M40 136 C78 40 124 40 160 136 C198 40 244 40 282 136" fill="none" stroke={`url(#line-${id})`} strokeWidth="5" />
          <rect x="128" y="34" width="64" height="112" rx="18" fill="#132a24" opacity="0.1" />
          <line x1="160" x2="160" y1="30" y2="150" stroke="#132a24" strokeWidth="2" strokeDasharray="6 7" />
        </g>
      ) : (
        <g filter={`url(#soft-${id})`}>
          {[60, 112, 164, 216].map((x, index) => (
            <rect key={x} x={x} y={118 - index * 20} width="34" height={38 + index * 20} rx="10" fill={index % 2 ? '#78A184' : '#132a24'} opacity={index % 2 ? 0.82 : 0.92} />
          ))}
          <path d="M50 118 C98 102 126 76 166 82 C206 88 232 50 274 42" fill="none" stroke={`url(#line-${id})`} strokeWidth="4" />
          {[50, 126, 166, 232, 274].map((x, index) => (
            <circle key={x} cx={x} cy={[118, 84, 82, 54, 42][index]} r="7" fill="#b8dfbd" stroke="#132a24" strokeWidth="2" />
          ))}
        </g>
      )}
    </svg>
  )
}

const ToolStoryCard = ({ tool, onNavigate, index }) => {
  const Icon = iconMap[tool.id]

  return (
    <Reveal delay={index * 0.08} amount={0.18}>
      <button
        type="button"
        onClick={() => onNavigate(tool.id)}
        className="group grid min-h-[420px] w-full overflow-hidden rounded-[2rem] border border-black/5 bg-white text-left shadow-[0_14px_45px_-26px_rgba(19,42,36,0.45)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_80px_-32px_rgba(19,42,36,0.55)] lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="relative min-h-[240px] border-b border-black/5 bg-[#eef5f1] p-5 lg:border-b-0 lg:border-r">
          <DataSketch id={tool.id} />
          <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-light uppercase tracking-[0.18em] text-[#274f44] backdrop-blur">
            <Icon className="h-4 w-4" />
            {tool.phase}
          </div>
        </div>
        <div className="flex flex-col justify-between p-7 sm:p-8">
          <div>
            <p className="text-sm font-light uppercase tracking-[0.28em] text-[#879f98]">{tool.number} / 04</p>
            <h3 className="mt-5 text-3xl font-light tracking-tight text-[#132a24] transition-colors group-hover:text-[#274f44] sm:text-4xl">
              {tool.title}
            </h3>
            <p className="mt-5 text-base font-light leading-relaxed text-[#4b615a]">{tool.scenario}</p>
          </div>
          <div className="mt-8 space-y-4">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f5f7f6] p-4">
                <p className="text-xs font-light uppercase tracking-[0.2em] text-[#879f98]">Input</p>
                <p className="mt-2 leading-relaxed text-[#132a24]">{tool.input}</p>
              </div>
              <div className="rounded-2xl bg-[#f5f7f6] p-4">
                <p className="text-xs font-light uppercase tracking-[0.2em] text-[#879f98]">Decision</p>
                <p className="mt-2 leading-relaxed text-[#132a24]">{tool.decision}</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-black/5 pt-5">
              <span className="max-w-[78%] text-sm font-light text-[#879f98]">{tool.outcome}</span>
              <ArrowRight className="h-5 w-5 text-[#274f44] transition-transform group-hover:translate-x-1.5" />
            </div>
          </div>
        </div>
      </button>
    </Reveal>
  )
}

const MarqueeBand = () => {
  const items = [...experimentMarqueeItems, ...experimentMarqueeItems]

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-[#0b1713] py-5 text-[#b8dfbd]">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0b1713] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0b1713] to-transparent" />
      <div className="ds-marquee flex w-max items-center gap-4 pr-4">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-light uppercase tracking-[0.26em] text-white/72"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

const LearningTimeline = () => (
  <div className="relative grid gap-4 lg:grid-cols-4">
    <div className="absolute left-6 top-0 hidden h-px w-[calc(100%-3rem)] bg-[#132a24]/12 lg:block" />
    {learningPath.map((item, index) => (
      <Reveal key={item.step} delay={index * 0.08}>
        <div className="relative rounded-[2rem] border border-black/5 bg-[#f5f7f6] p-7">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#132a24] text-sm font-light text-white">{item.step}</span>
          <h3 className="mt-10 text-2xl font-light tracking-tight text-[#132a24]">{item.title}</h3>
          <p className="mt-4 text-sm font-light leading-relaxed text-[#4b615a]">{item.description}</p>
        </div>
      </Reveal>
    ))}
  </div>
)

const TrustSection = () => (
  <section id="proof" className="bg-[#f5f7f6] px-4 py-16 sm:px-8 sm:py-28 lg:px-16">
    <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.92fr_1.08fr]">
      <Reveal>
        <div className="flex min-h-full flex-col justify-between rounded-[2rem] bg-[#132a24] p-8 text-white sm:p-10">
          <div>
            <SectionKicker tone="dark">Trust signal</SectionKicker>
            <h2 className="text-[36px] font-light leading-tight tracking-tight sm:text-6xl">
              一线业务经验，转化成可复用的训练系统。
            </h2>
            <p className="mt-6 text-base font-light leading-relaxed text-white/72">{rayProfile.description}</p>
          </div>
          <div className="mt-10 grid gap-3">
            {trustSignals.map((signal) => (
              <div key={signal.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <p className="font-medium text-[#b8dfbd]">{signal.title}</p>
                <p className="mt-2 text-sm font-light leading-relaxed text-white/68">{signal.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {rayProfile.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-light text-white/78">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2">
        {testimonialQuotes.map((quote, index) => (
          <Reveal key={quote} delay={index * 0.05} amount={0.16} className={index === 0 ? 'md:col-span-2' : ''}>
            <figure
              className={`min-h-full rounded-[1.5rem] border border-black/5 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(19,42,36,0.18)] ${
                index === 0 ? 'sm:p-8' : ''
              }`}
            >
              <Quote className="mb-4 h-5 w-5 text-[#78A184]" />
              <blockquote
                className={`font-light leading-relaxed tracking-tight text-[#132a24] ${
                  index === 0 ? 'text-2xl sm:text-3xl' : 'text-base sm:text-lg'
                }`}
              >
                {quote}
              </blockquote>
              <figcaption className="mt-4 text-xs font-light uppercase tracking-[0.22em] text-[#879f98]">二期学员匿名反馈</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
)

const RoadmapSection = ({ isAuthenticated, isMember, handleMemberModuleClick }) => (
  <section id="future" className="border-t border-black/5 bg-[#0b1713] px-4 py-16 text-white sm:px-8 sm:py-28 lg:px-16">
    <div className="mx-auto max-w-[1440px]">
      <Reveal className="mb-12 max-w-5xl">
        <SectionKicker tone="dark">Roadmap</SectionKicker>
        <h2 className="text-[38px] font-light leading-tight tracking-tight sm:text-6xl">
          下一阶段，围绕无法直接 A/B 的业务评估继续扩展。
        </h2>
      </Reveal>
      <div className="grid gap-5 lg:grid-cols-3">
        {futureRoadmap.map((module, index) => (
          <Reveal key={module.title} delay={index * 0.08}>
            <div className="flex min-h-[360px] flex-col rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 backdrop-blur">
              <div className="mb-12 flex items-center justify-between">
                <span className="text-sm font-light uppercase tracking-[0.28em] text-[#b8dfbd]">{module.status}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b8dfbd] text-[#08271f]">{index + 1}</span>
              </div>
              <h3 className="text-3xl font-light tracking-tight">{module.title}</h3>
              <p className="mt-5 flex-1 text-base font-light leading-relaxed text-white/68">{module.description}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {module.items.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs font-light text-white/70">
                    {item}
                  </span>
                ))}
              </div>
              {module.memberOnly ? (
                <Button
                  type="button"
                  onClick={() => handleMemberModuleClick(module)}
                  className="mt-8 w-fit rounded-full bg-white px-6 text-[#08271f] hover:bg-[#dff0e2]"
                >
                  {isMember ? '进入功能' : isAuthenticated ? '兑换后进入' : '登录后进入'}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-8 w-fit rounded-full border-white/15 bg-transparent px-6 text-white/70 hover:bg-white/10"
                  disabled
                >
                  继续规划中
                </Button>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
)

const HomePage = ({ onNavigate }) => {
  const { isAuthenticated, isMember, isLoading, openAuthDialog, logout } = useAuth()
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isWechatModalOpen, setIsWechatModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isHeaderCompact, setIsHeaderCompact] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsHeaderCompact(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleMemberModuleClick = (module) => {
    if (!module.memberOnly) return
    if (!isAuthenticated) {
      openAuthDialog('login', '请先登录或注册学生账户，再使用付费会员功能。')
      return
    }
    if (!isMember) {
      openAuthDialog('redeem', '请输入课程邀请码，开通会员后即可访问该功能。')
      return
    }
    onNavigate(module.id)
  }

  return (
    <Motion.div
      className="min-h-screen overflow-x-clip bg-[#f5f7f6] text-[#132a24] selection:bg-[#132a24] selection:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f5f7f6]/90 backdrop-blur-md transition-all duration-500">
        <div
          className={`mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 transition-all duration-500 sm:px-8 lg:px-16 ${
            isHeaderCompact ? 'h-20 shadow-sm' : 'h-24'
          }`}
        >
          <button type="button" onClick={() => scrollToSection('top')} className="group flex items-center gap-3 text-left" aria-label="返回首页顶部">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-16px_rgba(19,42,36,0.35)] ring-1 ring-[#132a24]/10 transition-all duration-500 group-hover:rotate-3 group-hover:scale-105">
              <img src="/logo.png" alt="Ray Data Science Lab Logo" className="h-full w-full object-cover" />
            </span>
            <span>
              <span className="block text-xl font-light tracking-tight text-[#132a24] sm:text-2xl">Ray Data Science Lab</span>
              <span className="block text-xs font-light uppercase tracking-[0.28em] text-[#879f98]">Toolbox · Course · Career</span>
            </span>
          </button>

          <nav className="hidden items-center gap-8 text-sm font-light text-[#546b64] md:flex lg:text-base">
            <button type="button" onClick={() => scrollToSection('toolbox')} className="nav-link-deep">工具箱</button>
            <button type="button" onClick={() => scrollToSection('course-path')} className="nav-link-deep">学习路径</button>
            <button type="button" onClick={() => scrollToSection('proof')} className="nav-link-deep">学员反馈</button>
            <button type="button" onClick={() => scrollToSection('future')} className="nav-link-deep">未来模块</button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
              <Button type="button" className="rounded-full border border-[#132a24]/15 bg-white/60 px-5 py-2 text-[#132a24] shadow-none hover:border-[#132a24]/30 hover:bg-white" variant="outline">
                开始使用
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <Motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-black/5 bg-white p-2 shadow-[0_20px_50px_-20px_rgba(19,42,36,0.28)]"
                  >
                    {toolUseCases.map((tool) => {
                      const Icon = iconMap[tool.id]
                      return (
                        <button key={tool.id} type="button" onClick={() => onNavigate(tool.id)} className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#eef5f1]">
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#274f44]" />
                          <span>
                            <span className="block text-sm font-medium text-[#132a24]">{tool.title}</span>
                            <span className="block text-xs leading-relaxed text-[#4b615a]">{tool.phase} · {tool.decision}</span>
                          </span>
                        </button>
                      )
                    })}
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                if (!isAuthenticated) openAuthDialog('login')
                else if (!isMember) openAuthDialog('redeem', '你已登录，兑换课程邀请码后即可解锁会员功能。')
                else logout()
              }}
              className="hidden rounded-full border-[#132a24]/15 bg-white/60 px-5 py-2 text-[#132a24] shadow-none hover:border-[#132a24]/30 hover:bg-white md:inline-flex"
            >
              {isAuthenticated ? (isMember ? '会员 · 退出' : '兑换会员') : '登录'}
            </Button>
            <Button type="button" onClick={() => setIsWechatModalOpen(true)} className="group rounded-full bg-[#132a24] px-5 py-2 text-white hover:bg-[#1b3b33] sm:px-6">
              联系 Ray
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-[#08271f] px-4 py-16 text-white sm:px-8 sm:py-24 lg:px-16">
          <DataMotionBackground />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,39,31,0.86),rgba(7,39,31,0.52)_48%,rgba(7,39,31,0.22))]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,rgba(11,23,19,1),rgba(11,23,19,0))]" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-13rem)] w-full max-w-[1440px] flex-col justify-between gap-12">
            <Motion.div variants={fadeUp} initial="hidden" animate="visible" transition={revealTransition} className="max-w-6xl pt-6">
              <p className="mb-8 text-xs font-light uppercase tracking-[0.36em] text-[#b8dfbd] sm:text-sm">Data Science Toolbox · Course Workspace · Career Growth</p>
              <h1 className="max-w-5xl text-[44px] font-light leading-[1.02] tracking-tight text-white sm:text-7xl lg:text-[88px]">
                实验分析与因果评估的
                <span className="block text-[#b8dfbd]">实战工作台</span>
              </h1>
            </Motion.div>

            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <Motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ ...revealTransition, delay: 0.15 }} className="max-w-2xl">
                <p className="text-lg font-light leading-relaxed tracking-tight text-white/82 sm:text-2xl">
                  从业务归因、实验设计到结果汇报，把数据判断变成可落地的产品决策。
                </p>
              </Motion.div>

              <Motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ ...revealTransition, delay: 0.28 }} className="flex flex-col gap-5 lg:items-end">
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                  <PremiumButton variant="light" onClick={() => scrollToSection('toolbox')}>进入工具箱</PremiumButton>
                  <PremiumButton variant="ghost" onClick={() => onNavigate('course-introduction')}>查看学习路径</PremiumButton>
                </div>
                <p className="text-xs font-light uppercase tracking-[0.28em] text-[#b8dfbd]">Tool-first, decision-oriented, business-ready.</p>
              </Motion.div>
            </div>

            <Motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ ...revealTransition, delay: 0.42 }}>
              <MetricStrip />
            </Motion.div>
          </div>
        </section>

        <MarqueeBand />

        <section id="toolbox" className="bg-[#f5f7f6] px-4 py-16 sm:px-8 sm:py-28 lg:px-16">
          <div className="mx-auto grid max-w-[1440px] gap-8 xl:grid-cols-[0.72fr_1.35fr_0.72fr]">
            <Reveal className="xl:sticky xl:top-28 xl:self-start">
              <SectionKicker>Toolbox</SectionKicker>
              <h2 className="text-[40px] font-light leading-tight tracking-tight text-[#132a24] sm:text-6xl">
                先把实验问题跑清楚，再讨论业务决策。
              </h2>
              <p className="mt-6 text-base font-light leading-relaxed text-[#4b615a] sm:text-xl">
                四个工具分别覆盖实验前设计、实验后判断、分组优化和上线前体检。首页负责业务场景，工具页保留原有计算能力。
              </p>
            </Reveal>

            <div className="space-y-7">
              {toolUseCases.map((tool, index) => (
                <ToolStoryCard key={tool.id} tool={tool} index={index} onNavigate={onNavigate} />
              ))}
            </div>

            <Reveal className="xl:sticky xl:top-28 xl:self-start">
              <div className="rounded-[2rem] bg-[#132a24] p-7 text-white">
                <Sparkles className="mb-8 h-7 w-7 text-[#b8dfbd]" />
                <h3 className="text-2xl font-light tracking-tight">工具不是终点，业务判断才是。</h3>
                <div className="mt-8 space-y-5">
                  {toolUseCases.map((tool) => (
                    <div key={tool.id} className="border-t border-white/10 pt-5">
                      <p className="text-sm font-medium text-[#b8dfbd]">{tool.phase}</p>
                      <p className="mt-2 text-sm font-light leading-relaxed text-white/66">{tool.decision}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="course-path" className="border-y border-black/5 bg-[#eef5f1] px-4 py-16 sm:px-8 sm:py-28 lg:px-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <Reveal>
                <SectionKicker>Course workspace</SectionKicker>
                <h2 className="max-w-4xl text-[40px] font-light leading-tight tracking-tight text-[#132a24] sm:text-6xl">
                  从会算，到会判断，再到会表达。
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <Button type="button" onClick={() => onNavigate('course-introduction')} variant="outline" className="h-auto w-fit rounded-full border-[#132a24]/20 bg-white/50 px-7 py-4 text-[#132a24] hover:bg-white">
                  查看完整课程
                  <BookOpen className="ml-2 h-4 w-4" />
                </Button>
              </Reveal>
            </div>
            <LearningTimeline />
          </div>
        </section>

        <TrustSection />

        <RoadmapSection isAuthenticated={isAuthenticated} isMember={isMember} handleMemberModuleClick={handleMemberModuleClick} />

        <section className="bg-[#132a24] px-4 py-16 text-white sm:px-8 sm:py-24 lg:px-16">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <Reveal>
              <SectionKicker tone="dark">Contact</SectionKicker>
              <h2 className="max-w-4xl text-[38px] font-light leading-tight tracking-tight sm:text-6xl">
                有课程、工具或职业规划问题，可以直接联系 Ray。
              </h2>
            </Reveal>
            <Reveal delay={0.12} className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Button type="button" onClick={() => setIsWechatModalOpen(true)} className="h-auto rounded-full bg-white px-7 py-4 text-[#132a24] hover:bg-white/90">
                <MessageCircle className="mr-2 h-5 w-5" />
                微信联系
              </Button>
              <Button type="button" onClick={() => setIsContactModalOpen(true)} variant="outline" className="h-auto rounded-full border-white/20 bg-transparent px-7 py-4 text-white hover:bg-white/10 hover:text-white">
                <Mail className="mr-2 h-5 w-5" />
                邮箱联系
              </Button>
              <a href="https://space.bilibili.com/86758610?spm_id_from=333.337.search-card.all.click" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-white transition-colors hover:bg-white/10">
                <Video className="mr-2 h-5 w-5" />
                Bilibili
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="bg-[#0b1713] px-4 py-8 text-white sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-4 text-sm font-light text-white/55 sm:flex-row">
          <p>由 Ray 设计与开发，专注于 A/B 实验、因果推断和数据分析职业成长。</p>
          <p>© {new Date().getFullYear()} Ray Data Science Lab</p>
        </div>
      </footer>

      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#274f44]" />
              联系方式
            </DialogTitle>
            <DialogDescription>欢迎通过邮箱联系 Ray。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#eef5f1] p-4">
              <p className="text-sm text-[#4b615a]">邮箱地址</p>
              <p className="mt-1 font-medium text-[#132a24]">rayhezack@163.com</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigator.clipboard?.writeText('rayhezack@163.com')}>
                复制邮箱
              </Button>
              <Button type="button" onClick={() => setIsContactModalOpen(false)}>关闭</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isWechatModalOpen} onOpenChange={setIsWechatModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#274f44]" />
              微信联系方式
            </DialogTitle>
            <DialogDescription>扫码添加微信，咨询课程、工具使用或职业规划问题。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <img
              src="/qrcode.jpg"
              alt="微信二维码"
              className="mx-auto h-44 w-44 rounded-2xl object-contain"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
            <Button type="button" onClick={() => setIsWechatModalOpen(false)}>关闭</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Motion.div>
  )
}

export default HomePage
