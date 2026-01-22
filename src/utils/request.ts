import { useTokenStore } from '@/stores/token'
import axios from 'axios'
import {ElMessage} from 'element-plus'
import router from '@/router'


const baseURL = '/api'
const instance = axios.create({
    baseURL,
    withCredentials: true  // 支持HttpOnly Cookie
})
let isRefreshing = false // 是否正在刷新Token
let requestsQueue: Array<() => void> = []  // 明确为函数数组,等待刷新的请求队列


//添加请求拦截器
instance.interceptors.request.use(
    config => {
        const tokenStore = useTokenStore()
       
        const requestPath = config.url
        if (requestPath?.includes('/login')|| requestPath?.startsWith('/sendVerificationCode/')|| requestPath?.includes('/auth/register')) {
           return config
        }
        // 检查是否有访问令牌
        if (!tokenStore.accessToken ) {
            ElMessage.warning('请先登录账号！')
            router.push('/login')
            return  config
        }
         // 跳过刷新Token请求的拦截器
        if (config.skipInterceptors) return config
        if(tokenStore.accessToken){
            config.headers.Authorization = 'Bearer '+ tokenStore.accessToken
        }
        return config
    },
    err => {
        return Promise.reject(err)
    }
)



//添加响应拦截器
instance.interceptors.response.use(
    result => {

        // 如果是 text 类型响应，直接返回（不处理code）
        if (result.config.responseType === 'text') {
        return result.data; 
        }
        // 若是直接返回 Blob 对象
        if (result.config.responseType === 'blob') {
            return result.data; 
        }

        if(result.data.code == 0){
            return result.data
        }else{
            ElMessage.error(result.data.message?result.data.message:"未知错误")
            return Promise.reject(result.data)
        }
    },
    async(err) => {
        const originalConfig = err.config
        const tokenStore = useTokenStore()
        // 刷新Token请求本身失败
        if (originalConfig?.skipInterceptors) {
            ElMessage.warning('登录过期，请重新登录！！！')
            tokenStore.removeToken()
            router.push('/login')
            return Promise.reject(err)
        }
    
        // 处理401错误（Token过期）
        if (err.response?.status === 401) {
            if (!tokenStore.accessToken) {
            router.push('/login')
            return Promise.reject(err)
        }

        // 如果不在刷新中，发起刷新请求
        if (!isRefreshing) {
            isRefreshing = true
            try {
                // 调用刷新Token接口 (refreshToken通过HttpOnly Cookie自动发送)
                const refreshRes = await instance.post(
                    '/refreshToken',
                    {},
                    { 
                        skipInterceptors: true,
                        withCredentials: true  // 确保发送Cookie
                    }
                )
                
                // 更新accessToken (refreshToken由后端通过Cookie管理)
                // 响应格式: { code: 0, msg: null, data: "token字符串" }
                tokenStore.setToken(refreshRes.data)
                
                // 重试队列中的所有请求
                requestsQueue.forEach(cb => cb())
                requestsQueue = []
                
                // 重试当前请求
                return instance(originalConfig)
            } catch (refreshErr) {
                // 刷新失败，需要重新登录
                tokenStore.removeToken()
                router.push('/login')
                return Promise.reject(refreshErr)
            } finally {
                isRefreshing = false
            }
        } else {
            // 如果正在刷新中，将请求加入队列等待
            return new Promise(resolve => {
                requestsQueue.push(() => {
                    resolve(instance(originalConfig))
                })
            })
        }
        }
        
        // 处理其他错误
        if(err.response?.status === 403){
            ElMessage.error('您没有权限执行此操作！')
        }
        if(err.response?.status === 404){
            ElMessage.error('请求的资源不存在！')
        }
        if(err.response?.status === 500){
            ElMessage.error('服务器异常，请稍后再试！')
        }
        return Promise.reject(err)
    }
)

export default instance
