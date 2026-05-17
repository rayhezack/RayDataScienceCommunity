import { useEffect, useRef, useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  ChevronDown,
  Database,
  FileText,
  FlaskConical,
  HelpCircle,
  Mail,
  MessageCircle,
  Quote,
  ShieldCheck,
  Shuffle,
  Users,
  Video
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { useAuth } from '../context/useAuth'
import {
  futureModules,
  learningPath,
  proofMetrics,
  rayProfile,
  testimonialQuotes,
  toolModules
} from '../homepageContent'

const iconMap = {
  'sample-size': Calculator,
  'significance-test': BarChart3,
  rerandomization: Shuffle,
  'offline-aa-backtrack': Database
}

const moduleIcons = [FlaskConical, HelpCircle, BriefcaseBusiness, FileText]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
}

const HeroVideo = () => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return undefined

    const context = canvas.getContext('2d')
    const image = new Image()
    image.src = '/hero-data-science-lab.png'

    let frameId
    let startTime

    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = Math.round(window.innerWidth * ratio)
      canvas.height = Math.round(window.innerHeight * ratio)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const draw = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = (timestamp - startTime) / 1000
      const width = window.innerWidth
      const height = window.innerHeight

      context.clearRect(0, 0, width, height)
      context.fillStyle = '#f5f7f6'
      context.fillRect(0, 0, width, height)

      if (image.complete && image.naturalWidth > 0) {
        const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * (1.05 + Math.sin(elapsed * 0.28) * 0.018)
        const drawWidth = image.naturalWidth * scale
        const drawHeight = image.naturalHeight * scale
        const offsetX = (width - drawWidth) / 2 + Math.sin(elapsed * 0.18) * 18
        const offsetY = (height - drawHeight) / 2 + Math.cos(elapsed * 0.16) * 14

        context.globalAlpha = 0.78
        context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
        context.globalAlpha = 1
      }

      const gradient = context.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, 'rgba(245, 247, 246, 0.78)')
      gradient.addColorStop(0.46, 'rgba(238, 245, 241, 0.45)')
      gradient.addColorStop(1, 'rgba(19, 42, 36, 0.18)')
      context.fillStyle = gradient
      context.fillRect(0, 0, width, height)

      context.strokeStyle = 'rgba(39, 79, 68, 0.16)'
      context.lineWidth = 1
      for (let i = 0; i < 6; i += 1) {
        const y = height * (0.18 + i * 0.12) + Math.sin(elapsed * 0.42 + i) * 9
        context.beginPath()
        context.moveTo(width * -0.1, y)
        context.bezierCurveTo(width * 0.28, y - 36, width * 0.58, y + 42, width * 1.1, y - 12)
        context.stroke()
      }

      frameId = window.requestAnimationFrame(draw)
    }

    resizeCanvas()
    const stream = canvas.captureStream(24)
    video.srcObject = stream
    video.play().catch(() => {})
    frameId = window.requestAnimationFrame(draw)
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.cancelAnimationFrame(frameId)
      stream.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="/hero-data-science-lab.png"
        aria-hidden="true"
      />
    </>
  )
}

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

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
      className="min-h-screen bg-[#f5f7f6] text-[#132a24] selection:bg-[#132a24] selection:text-white"
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
          <button
            type="button"
            onClick={() => scrollToSection('top')}
            className="group flex items-center gap-3 text-left"
            aria-label="返回首页顶部"
          >
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-16px_rgba(19,42,36,0.35)] ring-1 ring-[#132a24]/10 transition-all duration-500 group-hover:rotate-3 group-hover:scale-105">
              <img
                src="/logo.png"
                alt="Ray Data Science Lab Logo"
                className="h-full w-full object-cover"
              />
            </span>
            <span>
              <span className="block text-xl font-light tracking-tight text-[#132a24] sm:text-2xl">
                Ray Data Science Lab
              </span>
              <span className="block text-xs font-light uppercase tracking-[0.28em] text-[#879f98]">
                Toolbox · Course · Career
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-8 text-sm font-light text-[#546b64] md:flex lg:text-base">
            <button type="button" onClick={() => scrollToSection('toolbox')} className="nav-link-deep">
              工具箱
            </button>
            <button type="button" onClick={() => scrollToSection('course-path')} className="nav-link-deep">
              学习路径
            </button>
            <button type="button" onClick={() => scrollToSection('proof')} className="nav-link-deep">
              学员反馈
            </button>
            <button type="button" onClick={() => scrollToSection('future')} className="nav-link-deep">
              未来模块
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <div
              className="relative hidden sm:block"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <Button
                type="button"
                className="rounded-full border border-[#132a24]/15 bg-white/60 px-5 py-2 text-[#132a24] shadow-none hover:border-[#132a24]/30 hover:bg-white"
                variant="outline"
              >
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
                    className="absolute right-0 top-full z-50 mt-3 w-64 rounded-2xl border border-black/5 bg-white p-2 shadow-[0_20px_50px_-20px_rgba(19,42,36,0.28)]"
                  >
                    {toolModules.map((tool) => {
                      const Icon = iconMap[tool.id]
                      return (
                        <button
                          type="button"
                          key={tool.id}
                          onClick={() => onNavigate(tool.id)}
                          className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#eef5f1]"
                        >
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#274f44]" />
                          <span>
                            <span className="block text-sm font-medium text-[#132a24]">{tool.title}</span>
                            <span className="block text-xs leading-relaxed text-[#4b615a]">{tool.outcome}</span>
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
                if (!isAuthenticated) {
                  openAuthDialog('login')
                } else if (!isMember) {
                  openAuthDialog('redeem', '你已登录，兑换课程邀请码后即可解锁会员功能。')
                } else {
                  logout()
                }
              }}
              className="hidden rounded-full border-[#132a24]/15 bg-white/60 px-5 py-2 text-[#132a24] shadow-none hover:border-[#132a24]/30 hover:bg-white md:inline-flex"
            >
              {isAuthenticated ? (isMember ? '会员 · 退出' : '兑换会员') : '登录'}
            </Button>
            <Button
              type="button"
              onClick={() => setIsWechatModalOpen(true)}
              className="group rounded-full bg-[#132a24] px-5 py-2 text-white hover:bg-[#1b3b33] sm:px-6"
            >
              联系 Ray
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden border-b border-black/5 px-4 py-16 sm:px-8 sm:py-24 lg:px-16">
          <HeroVideo />
          <div className="absolute inset-0 bg-[#f5f7f6]/55" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(0deg,rgba(245,247,246,1),rgba(245,247,246,0))]" />

          <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col justify-center gap-12 lg:min-h-[calc(100vh-13rem)]">
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-6xl"
            >
              <p className="mb-8 text-xs font-light uppercase tracking-[0.34em] text-[#879f98] sm:text-sm">
                Data Science Toolbox · Course Workspace · Career Growth
              </p>
              <h1 className="max-w-4xl text-[38px] font-light leading-[1.12] tracking-tight text-[#132a24] sm:text-5xl lg:text-[64px]">
                实验分析与因果评估的
                <span className="text-[#274f44]">实战工作台</span>
              </h1>
            </Motion.div>

            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <Motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-2xl"
              >
                <p className="text-lg font-light leading-relaxed tracking-tight text-[#4b615a] sm:text-2xl">
                  面向已购课学员、数据分析新人和求职转型者：先用工具完成判断，再用课程和职业服务沉淀可复用的业务分析能力。
                </p>
              </Motion.div>

              <Motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-5 lg:items-end"
              >
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                  <Button
                    type="button"
                    onClick={() => scrollToSection('toolbox')}
                    className="group h-auto rounded-full bg-[#132a24] px-8 py-4 text-base font-light text-white hover:bg-[#1b3b33] sm:text-lg"
                  >
                    立即使用工具
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1.5" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onNavigate('course-introduction')}
                    variant="outline"
                    className="h-auto rounded-full border-[#132a24]/20 bg-transparent px-8 py-4 text-base font-light text-[#132a24] hover:border-[#132a24]/40 hover:bg-black/5 sm:text-lg"
                  >
                    查看课程路径
                  </Button>
                </div>
                <p className="text-xs font-light uppercase tracking-[0.26em] text-[#879f98]">
                  Tool-first, decision-oriented, business-ready.
                </p>
              </Motion.div>
            </div>

            <Motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              {proofMetrics.map((metric) => (
                <div key={metric.label} className="rounded-[1.5rem] border border-black/5 bg-white/60 p-5 shadow-[0_8px_30px_-18px_rgba(19,42,36,0.2)] backdrop-blur">
                  <p className="text-3xl font-light tracking-tight text-[#132a24]">{metric.value}</p>
                  <p className="mt-2 text-sm font-medium text-[#274f44]">{metric.label}</p>
                  <p className="mt-1 text-xs font-light text-[#879f98]">{metric.detail}</p>
                </div>
              ))}
            </Motion.div>
          </div>
        </section>

        <section id="toolbox" className="px-4 py-16 sm:px-8 sm:py-28 lg:px-16">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="lg:sticky lg:top-28"
            >
              <p className="mb-5 text-xs font-light uppercase tracking-[0.32em] text-[#879f98]">Toolbox</p>
              <h2 className="max-w-xl text-[38px] font-light leading-tight tracking-tight text-[#132a24] sm:text-6xl">
                先把实验问题跑清楚，再讨论业务决策。
              </h2>
              <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-[#4b615a] sm:text-xl">
                四个现有工具覆盖实验前设计、实验中分流、实验后判断和上线前风险检查。首页负责解释业务场景，工具页继续承载原有计算逻辑。
              </p>
            </Motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              {toolModules.map((tool, index) => {
                const Icon = iconMap[tool.id]
                return (
                  <Motion.button
                    type="button"
                    key={tool.id}
                    onClick={() => onNavigate(tool.id)}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: index * 0.08, duration: 0.7 }}
                    className="group flex min-h-[300px] flex-col justify-between rounded-[2rem] border border-black/5 bg-white p-7 text-left shadow-[0_8px_30px_-12px_rgba(19,42,36,0.10)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-18px_rgba(19,42,36,0.22)]"
                  >
                    <div>
                      <div className="mb-8 flex items-center justify-between">
                        <span className="rounded-full bg-[#eef5f1] px-3 py-1 text-xs font-light uppercase tracking-[0.18em] text-[#879f98]">
                          {tool.eyebrow}
                        </span>
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#132a24] text-white transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105">
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                      <h3 className="text-2xl font-light tracking-tight text-[#132a24] transition-colors group-hover:text-[#274f44] sm:text-3xl">
                        {tool.title}
                      </h3>
                      <p className="mt-4 text-base font-light leading-relaxed text-[#4b615a]">{tool.description}</p>
                    </div>
                    <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-5">
                      <span className="max-w-[78%] text-sm font-light text-[#879f98]">{tool.outcome}</span>
                      <ArrowRight className="h-5 w-5 text-[#274f44] transition-transform group-hover:translate-x-1.5" />
                    </div>
                  </Motion.button>
                )
              })}
            </div>
          </div>
        </section>

        <section id="course-path" className="border-y border-black/5 bg-[#eef5f1] px-4 py-16 sm:px-8 sm:py-28 lg:px-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <Motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7 }}
              >
                <p className="mb-5 text-xs font-light uppercase tracking-[0.32em] text-[#879f98]">Course workspace</p>
                <h2 className="max-w-3xl text-[38px] font-light leading-tight tracking-tight text-[#132a24] sm:text-6xl">
                  从会算，到会判断，再到会表达。
                </h2>
              </Motion.div>
              <Button
                type="button"
                onClick={() => onNavigate('course-introduction')}
                variant="outline"
                className="h-auto w-fit rounded-full border-[#132a24]/20 bg-white/40 px-7 py-4 text-[#132a24] hover:bg-white"
              >
                查看完整课程
                <BookOpen className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-5 lg:grid-cols-4">
              {learningPath.map((item, index) => (
                <Motion.div
                  key={item.step}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.08, duration: 0.7 }}
                  className="rounded-[2rem] border border-black/5 bg-[#f5f7f6] p-7"
                >
                  <p className="text-sm font-light text-[#879f98]">{item.step}</p>
                  <h3 className="mt-10 text-2xl font-light tracking-tight text-[#132a24]">{item.title}</h3>
                  <p className="mt-4 text-sm font-light leading-relaxed text-[#4b615a]">{item.description}</p>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="proof" className="px-4 py-16 sm:px-8 sm:py-28 lg:px-16">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="rounded-[2rem] bg-[#132a24] p-8 text-white sm:p-10"
            >
              <p className="mb-5 text-xs font-light uppercase tracking-[0.32em] text-[#78A184]">Trust signal</p>
              <h2 className="text-[36px] font-light leading-tight tracking-tight sm:text-5xl">
                一线业务经验 + 二期学员真实反馈。
              </h2>
              <p className="mt-6 text-base font-light leading-relaxed text-white/72">
                {rayProfile.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {rayProfile.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-light text-white/80">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-5">
                  <Users className="mb-4 h-5 w-5 text-[#78A184]" />
                  <p className="text-sm font-light text-white/68">课程实训反馈</p>
                  <p className="mt-2 text-lg font-light">19/19 认为提升了业务-实验-分析-决策闭环能力</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-5">
                  <ShieldCheck className="mb-4 h-5 w-5 text-[#78A184]" />
                  <p className="text-sm font-light text-white/68">真实案例反馈</p>
                  <p className="mt-2 text-lg font-light">18/19 认为业务案例对理解数据联动有较大或极大帮助</p>
                </div>
              </div>
            </Motion.div>

            <div className="space-y-5">
              {testimonialQuotes.map((quote, index) => (
                <Motion.figure
                  key={quote}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.06, duration: 0.7 }}
                  className="rounded-[1.5rem] border border-black/5 bg-white p-6 shadow-[0_8px_30px_-16px_rgba(19,42,36,0.16)]"
                >
                  <Quote className="mb-4 h-5 w-5 text-[#78A184]" />
                  <blockquote className="text-lg font-light leading-relaxed tracking-tight text-[#132a24]">
                    {quote}
                  </blockquote>
                  <figcaption className="mt-4 text-xs font-light uppercase tracking-[0.22em] text-[#879f98]">
                    二期学员匿名反馈
                  </figcaption>
                </Motion.figure>
              ))}
            </div>
          </div>
        </section>

        <section id="future" className="border-t border-black/5 bg-[#f5f7f6] px-4 py-16 sm:px-8 sm:py-28 lg:px-16">
          <div className="mx-auto max-w-[1440px]">
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="mb-12 max-w-4xl"
            >
              <p className="mb-5 text-xs font-light uppercase tracking-[0.32em] text-[#879f98]">Roadmap</p>
              <h2 className="text-[38px] font-light leading-tight tracking-tight text-[#132a24] sm:text-6xl">
                后续模块会围绕“无法直接 A/B 的真实业务问题”继续扩展。
              </h2>
            </Motion.div>

            <div className="grid gap-6 lg:grid-cols-4">
              {futureModules.map((module, index) => {
                const Icon = moduleIcons[index] || FlaskConical
                return (
                  <Motion.div
                    key={module.title}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: index * 0.08, duration: 0.7 }}
                    className="flex min-h-[320px] flex-col rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_8px_30px_-16px_rgba(19,42,36,0.16)]"
                  >
                    <div className="mb-10 flex items-center justify-between">
                      <Icon className="h-7 w-7 text-[#274f44]" />
                      <span className="rounded-full bg-[#eef5f1] px-3 py-1 text-xs font-light text-[#4b615a]">{module.status}</span>
                    </div>
                    <h3 className="text-2xl font-light tracking-tight text-[#132a24]">{module.title}</h3>
                    <p className="mt-4 flex-1 text-base font-light leading-relaxed text-[#4b615a]">{module.description}</p>
                    {module.memberOnly ? (
                      <Button
                        type="button"
                        onClick={() => handleMemberModuleClick(module)}
                        className="mt-8 rounded-full bg-[#132a24] text-white hover:bg-[#1b3b33]"
                      >
                        {isMember ? '进入功能' : isAuthenticated ? '兑换后进入' : '登录后进入'}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-8 rounded-full border-[#132a24]/15 bg-white text-[#132a24] hover:bg-[#eef5f1]"
                        disabled
                      >
                        继续规划中
                      </Button>
                    )}
                  </Motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#132a24] px-4 py-16 text-white sm:px-8 sm:py-24 lg:px-16">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="mb-5 text-xs font-light uppercase tracking-[0.32em] text-[#78A184]">Contact</p>
              <h2 className="max-w-4xl text-[38px] font-light leading-tight tracking-tight sm:text-6xl">
                有课程、工具或职业规划问题，可以直接联系 Ray。
              </h2>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Button
                type="button"
                onClick={() => setIsWechatModalOpen(true)}
                className="h-auto rounded-full bg-white px-7 py-4 text-[#132a24] hover:bg-white/90"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                微信联系
              </Button>
              <Button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                variant="outline"
                className="h-auto rounded-full border-white/20 bg-transparent px-7 py-4 text-white hover:bg-white/10 hover:text-white"
              >
                <Mail className="mr-2 h-5 w-5" />
                邮箱联系
              </Button>
              <a
                href="https://space.bilibili.com/86758610?spm_id_from=333.337.search-card.all.click"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-white transition-colors hover:bg-white/10"
              >
                <Video className="mr-2 h-5 w-5" />
                Bilibili
              </a>
            </div>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => navigator.clipboard?.writeText('rayhezack@163.com')}
              >
                复制邮箱
              </Button>
              <Button type="button" onClick={() => setIsContactModalOpen(false)}>
                关闭
              </Button>
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
            <Button type="button" onClick={() => setIsWechatModalOpen(false)}>
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Motion.div>
  )
}

export default HomePage
