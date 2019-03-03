import HttpHelper from './HttpHelper';
import { SecureStore } from 'expo';

export default class AuthHelper {
    static instance
    static user

    static getInstance() {
        if (AuthHelper.instance == null) {
            AuthHelper.instance = new AuthHelper()
        }
        return AuthHelper.instance
    }

    async login(email, password) {
        return new Promise(async (resolve, reject) => {
            const http = new HttpHelper()
            const url = '/user/login'
            const headers = {email, password}
            http.put({url, headers})
                .then(async response => {
                    await SecureStore.setItemAsync('token', response.token)
                    await SecureStore.setItemAsync('id', response.id)
                    AuthHelper.user = response
                    resolve(response)
                })
                .catch(e => reject(e))
        })
    }   

    getToken() {
        return new Promise(async (resolve, reject) => {
            if(AuthHelper.user == undefined || AuthHelper.user == null){
                let token = await SecureStore.getItemAsync('token')
                resolve(token)
            } else {
                resolve(AuthHelper.user.token)
            }
        })
    }

    clearAuth(){
        AuthHelper.user = null
        SecureStore.deleteItemAsync('token')
        SecureStore.deleteItemAsync('id')
    }

}
