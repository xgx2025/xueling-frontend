import { defineStore } from "pinia";
import { ref } from "vue";


export const useTokenStore = defineStore(
    'token',
    ()=>{
        const accessToken = ref(localStorage.getItem('access_token') || '')
        const refreshToken = ref(localStorage.getItem('refresh_token') || '')

        const setToken = (newAccessToken:string,newRefreshToken:string)=>{
            accessToken.value = newAccessToken;
            refreshToken.value = newRefreshToken
            localStorage.setItem('access_token', newAccessToken)
            localStorage.setItem('refresh_token', newRefreshToken)
        }
        const removeToken = ()=>{
            accessToken.value = ''
            refreshToken.value = ''
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
        }
        return {
            accessToken,refreshToken,setToken,removeToken
        }
    }
)