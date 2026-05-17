import { useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { Calculator, BarChart3, Shuffle, Database, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import HomePage from './components/HomePage'
import CourseIntroduction from './components/CourseIntroduction'
import AuthDialog from './components/AuthDialog'
import MemberFeaturePage from './components/MemberFeaturePage'
import SampleSizeCalculator from './components/SampleSizeCalculator'
import SignificanceTest from './components/SignificanceTest'
import Rerandomization from './components/Rerandomization'
import OfflineAABacktrack from './components/OfflineAABacktrack'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [activeTab, setActiveTab] = useState('sample-size')

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
              className="sticky top-0 z-20 border-b border-black/5 bg-[#f5f7f6]/90 backdrop-blur-md"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16">
                <div className="flex min-h-20 flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
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
                      className="flex rounded-full border border-[#132a24]/10 bg-white/50 px-4 text-[#132a24] hover:bg-white"
                    >
                      <Home className="w-4 h-4" />
                      <span>首页</span>
                    </Button>
                  </div>
                  <div className="min-w-0 overflow-x-auto">
                    <div className="flex min-w-max gap-2 pb-1 lg:justify-end lg:pb-0">
                      {tabs.map((tab, index) => {
                        const Icon = tab.icon
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
                            <span>{tab.name}</span>
                          </Motion.button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Motion.nav>

            <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-16">
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
