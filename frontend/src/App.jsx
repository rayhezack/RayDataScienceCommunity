import { useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { Calculator, BarChart3, Shuffle, Database, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import HomePage from './components/HomePage'
import CourseIntroduction from './components/CourseIntroduction'
import AuthDialog from './components/AuthDialog'
import MemberFeaturePage from './components/MemberFeaturePage'
import SampleSizeCalculator from './components/SampleSizeCalculator'
import SignificanceTest from './components/SignificanceTest'
import Rerandomization from './components/Rerandomization'
import OfflineAABacktrack from './components/OfflineAABacktrack'
import { toolUseCases } from './homepageContent'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [activeTab, setActiveTab] = useState('sample-size')
  const toolContentById = toolUseCases.reduce((acc, tool) => {
    acc[tool.id] = tool
    return acc
  }, {})

  const tabs = [
    {
      id: 'sample-size',
      name: '样本量计算器',
      icon: Calculator,
      component: SampleSizeCalculator
    },
    {
      id: 'significance-test',
      name: '显著性检验',
      icon: BarChart3,
      component: SignificanceTest
    },
    {
      id: 'rerandomization',
      name: '重随机',
      icon: Shuffle,
      component: Rerandomization
    },
    {
      id: 'offline-aa-backtrack',
      name: '离线AA回溯',
      icon: Database,
      component: OfflineAABacktrack
    }
  ]

  const handleNavigate = (page) => {
    setCurrentPage(page)
    if (page !== 'home' && page !== 'course-introduction') {
      setActiveTab(page)
    }
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component
  const activeTool = toolContentById[activeTab]
  const memberFeatureIds = ['course-qa', 'resume-optimizer', 'course-materials']

  return (
    <div className="min-h-screen bg-background">
      <AuthDialog />
      <AnimatePresence mode="wait">
        {currentPage === 'home' ? (
          <Motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HomePage onNavigate={handleNavigate} />
          </Motion.div>
        ) : currentPage === 'course-introduction' ? (
          <Motion.div
            key="course-introduction"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CourseIntroduction onNavigate={handleNavigate} />
          </Motion.div>
        ) : memberFeatureIds.includes(currentPage) ? (
          <Motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MemberFeaturePage featureId={currentPage} onNavigate={handleNavigate} />
          </Motion.div>
        ) : (
          <Motion.div
            key="tools"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Motion.nav 
              className="sticky top-0 z-20 border-b border-black/5 bg-[#f5f7f6]/92 backdrop-blur-md"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16">
                <div className="flex min-h-20 flex-col gap-3 py-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage('home')}
                      className="rounded-full px-0 text-[#4b615a] hover:bg-transparent hover:text-[#132a24]"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>返回工具中枢</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage('home')}
                      className="hidden rounded-full border border-[#132a24]/10 bg-white/60 px-3 text-[#132a24] hover:bg-white sm:flex"
                    >
                      <img src="/logo.png" alt="" className="h-5 w-5 rounded-md object-cover" />
                      <span>Ray Lab</span>
                    </Button>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full border border-[#132a24]/10 bg-white/55 px-3 py-2 text-xs font-light uppercase tracking-[0.18em] text-[#4b615a] lg:flex">
                    <span className="h-2 w-2 rounded-full bg-[#78A184]" />
                    {activeTool?.phase || 'Experiment Workspace'}
                  </div>
                  <div className="min-w-0 overflow-x-auto">
                    <div className="flex min-w-max gap-2 pb-1 xl:justify-end xl:pb-0">
                      {tabs.map((tab, index) => {
                        const Icon = tab.icon
                        const meta = toolContentById[tab.id]
                        return (
                          <Motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-light transition-all duration-300 ${
                              activeTab === tab.id
                                ? 'border-[#132a24] bg-[#132a24] text-white shadow-[0_8px_24px_-16px_rgba(19,42,36,0.8)]'
                                : 'border-[#132a24]/10 bg-white/55 text-[#4b615a] hover:border-[#132a24]/30 hover:bg-white hover:text-[#132a24]'
                            }`}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{meta?.shortTitle || tab.name}</span>
                          </Motion.button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Motion.nav>

            <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-16">
              {activeTool && (
                <Motion.section
                  key={`${activeTab}-intro`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="mb-8 overflow-hidden rounded-[2rem] border border-black/5 bg-[#132a24] text-white shadow-[0_18px_60px_-36px_rgba(19,42,36,0.8)]"
                >
                  <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="p-7 sm:p-8">
                      <p className="mb-5 text-xs font-light uppercase tracking-[0.3em] text-[#b8dfbd]">{activeTool.phase}</p>
                      <h1 className="text-[34px] font-light leading-tight tracking-tight sm:text-5xl">{activeTool.title}</h1>
                      <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-white/72">{activeTool.scenario}</p>
                    </div>
                    <div className="grid border-t border-white/10 bg-white/[0.04] p-5 sm:grid-cols-3 lg:border-l lg:border-t-0">
                      <div className="border-white/10 p-3 sm:border-r">
                        <p className="text-xs font-light uppercase tracking-[0.22em] text-[#b8dfbd]">Input</p>
                        <p className="mt-3 text-sm font-light leading-relaxed text-white/70">{activeTool.input}</p>
                      </div>
                      <div className="border-white/10 p-3 sm:border-r">
                        <p className="text-xs font-light uppercase tracking-[0.22em] text-[#b8dfbd]">Output</p>
                        <p className="mt-3 text-sm font-light leading-relaxed text-white/70">{activeTool.outcome.replace('输出：', '')}</p>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-light uppercase tracking-[0.22em] text-[#b8dfbd]">Decision</p>
                        <p className="mt-3 text-sm font-light leading-relaxed text-white/70">{activeTool.decision}</p>
                      </div>
                    </div>
                  </div>
                </Motion.section>
              )}
              <AnimatePresence mode="wait">
                <Motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {ActiveComponent && <ActiveComponent />}
                </Motion.div>
              </AnimatePresence>
            </main>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
