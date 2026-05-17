/**
 * 应用配置文件
 * 集中管理API地址和其他配置
 */

const config = {
  // 后端API地址
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // API端点
  endpoints: {
    sampleSize: '/sample-size',
    experimentAnalysis: '/experiment-analysis',
    rerandomization: '/rerandomization',
    health: '/health',
    memberResources: '/member/resources',
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      logout: '/auth/logout',
      me: '/auth/me',
      redeemInvite: '/auth/redeem-invite'
    }
  },
  
  // 默认配置
  defaults: {
    iterations: 1000,
    significanceLevel: 0.05,
    power: 0.8
  }
}

export default config
