import User from "@exmpl/api/models/user"
import logger from "@exmpl/utils/logger"

export type ErrorRes = { error: { type: string, message: string } }
export type AuthRes = ErrorRes | { userId: string }
export type CreateUserResponse = ErrorRes | { userId: string }
function auth(bearerToken: string): Promise<AuthRes> {
    return new Promise(function (resolve, reject) {
        const token = bearerToken.replace('Bearer ', '')

        if (token === 'testApp') {
            resolve({ userId: 'userIdTest' })
            return
        }

        resolve({ error: { type: 'unauthorized', message: 'Authentication o API Failed' } })
    })
}

function createUser(email: string, password: string, name: string): Promise<CreateUserResponse> {
    return new Promise(function (resolve, reject) {
        const user = new User({ email: email, password: password, name: name })

        user.save()
            .then(u => {
                resolve({ userId: u._id.toString() })
            })
            .catch(err => {
                if (err.code === 11000)
                    resolve({ error: { type: 'account_already_exists', message: `${email} already exists` } })
                else {
                    logger.error(`createUser: ${err}`)
                    reject(err)
                }
            })
    })
}

export default { auth: auth, createUser: createUser }