import { defineStore } from "pinia";
import { ref } from "vue";


export const useTokenStore = defineStore(
    'token',
    ()=>{
        const accessToken = ref(localStorage.getItem('access_token') || '')
        const setToken = (newAccessToken:string)=>{
            accessToken.value = newAccessToken;
            localStorage.setItem('access_token', newAccessToken)
        }
        const removeToken = ()=>{
            accessToken.value = ''
            localStorage.removeItem('access_token')
        }
        return {
            accessToken,setToken,removeToken
        }
    }
)