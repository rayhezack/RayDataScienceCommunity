import { useEffect, useState } from 'react'
import { KeyRound, LogIn, Ticket, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Input } from '@/components/ui/input.jsx'
import { useAuth } from '../context/useAuth'

const modeCopy = {
  login: {
    title: '登录学生账户',
    description: '登录后可兑换邀请码，会员可进入课程答疑、简历优化和课程资料。',
    icon: LogIn
  },
  register: {
    title: '注册学生账户',
    description: '使用邮箱和密码注册；如果已有课程邀请码，可注册时直接开通会员。',
    icon: UserPlus
  },
  redeem: {
    title: '兑换课程邀请码',
    description: '付费学生输入课程邀请码后，即可解锁会员功能。',
    icon: Ticket
  }
}

export default function AuthDialog() {
  const {
    dialog,
    closeAuthDialog,
    isAuthenticated,
    login,
    register,
    redeemInvite
  } = useAuth()
  const [mode, setMode] = useState(dialog.mode)
  const [form, setForm] = useState({ email: '', password: '', inviteCode: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMode(dialog.mode)
    setError('')
  }, [dialog.mode, dialog.open])

  const copy = modeCopy[mode]
  const Icon = copy.icon

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        await login(form)
      } else if (mode === 'register') {
        await register(form)
      } else {
        await redeemInvite(form.inviteCode)
      }
      closeAuthDialog()
      setForm({ email: '', password: '', inviteCode: '' })
    } catch (apiError) {
      setError(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={dialog.open} onOpenChange={(open) => !open && closeAuthDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-[#274f44]" />
            {copy.title}
          </DialogTitle>
          <DialogDescription>{dialog.message || copy.description}</DialogDescription>
        </DialogHeader>

        <div className="flex rounded-full border border-[#132a24]/10 bg-[#eef5f1] p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-full px-3 py-2 text-sm transition-colors ${
              mode === 'login' ? 'bg-white text-[#132a24] shadow-sm' : 'text-[#4b615a]'
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-full px-3 py-2 text-sm transition-colors ${
              mode === 'register' ? 'bg-white text-[#132a24] shadow-sm' : 'text-[#4b615a]'
            }`}
          >
            注册
          </button>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setMode('redeem')}
              className={`flex-1 rounded-full px-3 py-2 text-sm transition-colors ${
                mode === 'redeem' ? 'bg-white text-[#132a24] shadow-sm' : 'text-[#4b615a]'
              }`}
            >
              邀请码
            </button>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode !== 'redeem' && (
            <>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="邮箱"
                autoComplete="email"
                required
              />
              <Input
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                placeholder="密码（至少 8 位）"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={8}
                required
              />
            </>
          )}

          {(mode === 'register' || mode === 'redeem') && (
            <Input
              value={form.inviteCode}
              onChange={(event) => updateField('inviteCode', event.target.value)}
              placeholder={mode === 'register' ? '课程邀请码（可选）' : '课程邀请码'}
              autoComplete="one-time-code"
              required={mode === 'redeem'}
            />
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full bg-[#132a24] text-white hover:bg-[#1b3b33]" disabled={isSubmitting}>
            <KeyRound className="mr-2 h-4 w-4" />
            {isSubmitting ? '处理中...' : mode === 'login' ? '登录' : mode === 'register' ? '注册' : '兑换会员'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
