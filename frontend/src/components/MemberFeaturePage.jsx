import { useEffect, useState } from 'react'
import { ArrowLeft, BookOpen, BriefcaseBusiness, HelpCircle, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import config from '../config'
import { useAuth } from '../context/useAuth'

const featureCopy = {
  'course-qa': {
    icon: HelpCircle,
    title: '课程答疑工作台',
    description: '集中提交课程作业、工具使用问题和项目报告反馈，后续会接入助教处理流程。'
  },
  'resume-optimizer': {
    icon: BriefcaseBusiness,
    title: '简历优化模块',
    description: '围绕数据科学项目经历做结构化梳理，沉淀符合大厂面试表达的项目亮点。'
  },
  'course-materials': {
    icon: BookOpen,
    title: '课程资料获取',
    description: '汇总课程讲义、案例数据、练习模板和工具使用说明，方便会员统一下载。'
  }
}

export default function MemberFeaturePage({ featureId, onNavigate }) {
  const { isAuthenticated, openAuthDialog } = useAuth()
  const [status, setStatus] = useState('loading')
  const [features, setFeatures] = useState([])
  const copy = featureCopy[featureId] || featureCopy['course-qa']
  const Icon = copy.icon

  useEffect(() => {
    fetch(`${config.apiBaseUrl}${config.endpoints.memberResources}`, {
      credentials: 'include'
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload.error || 'Membership required')
        }
        setFeatures(payload.features || [])
        setStatus('ready')
      })
      .catch(() => setStatus('locked'))
  }, [])

  const isEnabled = features.some((feature) => feature.id === featureId && feature.enabled)

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#132a24]">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f5f7f6]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-4 sm:px-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onNavigate('home')}
            className="rounded-full px-0 text-[#4b615a] hover:bg-transparent hover:text-[#132a24]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>
          <span className="rounded-full border border-[#132a24]/10 bg-white px-4 py-2 text-sm text-[#4b615a]">
            会员功能 V1
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1180px] flex-col gap-8 px-4 py-16 sm:px-8">
        <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-[0_12px_40px_-24px_rgba(19,42,36,0.24)]">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5f1] text-[#274f44]">
            <Icon className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-light tracking-tight text-[#132a24]">{copy.title}</h1>
          <p className="mt-4 max-w-3xl text-base font-light leading-relaxed text-[#4b615a]">{copy.description}</p>

          {status === 'loading' && (
            <div className="mt-8 rounded-xl bg-[#eef5f1] p-5 text-sm text-[#4b615a]">正在校验会员权限...</div>
          )}

          {status === 'locked' && (
            <div className="mt-8 rounded-xl border border-[#132a24]/10 bg-[#eef5f1] p-5">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 h-5 w-5 text-[#274f44]" />
                <div>
                  <h2 className="font-medium text-[#132a24]">该功能仅对付费会员开放</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#4b615a]">
                    请先登录学生账户并兑换课程邀请码。后端 API 已同步校验会员身份，直接访问链接也不会绕过权限。
                  </p>
                  <Button
                    type="button"
                    className="mt-4 rounded-full bg-[#132a24] text-white hover:bg-[#1b3b33]"
                    onClick={() => openAuthDialog(
                      isAuthenticated ? 'redeem' : 'login',
                      '登录或兑换邀请码后即可访问该会员功能。'
                    )}
                  >
                    登录 / 兑换邀请码
                  </Button>
                </div>
              </div>
            </div>
          )}

          {status === 'ready' && isEnabled && (
            <div className="mt-8 rounded-xl border border-[#78A184]/25 bg-[#eef5f1] p-5">
              <h2 className="font-medium text-[#132a24]">会员权限已解锁</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4b615a]">
                V1 已完成登录、邀请码开通和权限保护闭环。这里会作为后续答疑工单、简历优化和资料下载的承载页。
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
