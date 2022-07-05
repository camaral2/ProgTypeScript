export type ErrorRes = {error: {type: string , message: string}}
export type AuthRes = ErrorRes | {userId: string}

function auth(bearerToken: string): Promise<AuthRes>{
    return new Promise(function(resolve, reject){
        const token = bearerToken.replace('Bearer ','')

        if(token ==='testApp'){
            resolve({userId: 'userIdTest'})
            return
        }

        resolve({error: {type: 'unauthorized', message: 'Authentication o API Failed'}})
    })
}

export default {auth: auth}