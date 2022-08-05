import fs from 'fs'
import jwt, { SignOptions, VerifyErrors, VerifyOptions } from 'jsonwebtoken'

import User, {IUser} from "@exmpl/api/models/user"
import config from "@exmpl/config"
import logger from "@exmpl/utils/logger"
import cacheLocal from '@exmpl/utils/cache_local'

export type ErrorRes = { error: { type: string, message: string } }
export type AuthRes = ErrorRes | { userId: string }
export type CreateUserResponse = ErrorRes | { userId: string }
export type LoginUserRes = ErrorRes | { token: string, userId: string, expireAt: Date }

const privateKey = fs.readFileSync(config.privateKeyFile)
const privateSecret = {
    key: privateKey,
    passphrase: config.privateKeyPassPhrase
}

const signOptions: SignOptions = {
    algorithm: 'RS256',
    expiresIn: '14d'
}

const publicKey = fs.readFileSync(config.publicKeyFile)
const verifyOptions: VerifyOptions = {
    algorithms: ['RS256']
}

function auth(bearerToken: string): Promise<AuthRes> {
    return new Promise(function (resolve, reject) {
        const token = bearerToken.replace('Bearer ', '')


        // verifies secret and checks exp
        jwt.verify(token, publicKey, verifyOptions, (err: VerifyErrors | null, decoded: any | undefined) => {
            if (err === null && decoded !== undefined) {
                const d = decoded as { userId?: string, exp: number }

                if (d.userId) {
                    resolve({ userId: d.userId })
                    return
                }
            }

            resolve({ error: { type: 'unauthorized', message: 'Authentication o API Failed' } })
        })
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


function createAuthToken(userId: string): Promise<{ token: string, expireAt: Date }> {
    return new Promise(function (resolve, reject) {
        jwt.sign({ userId: userId }, privateSecret, signOptions, (err: Error | null, encoded: string | undefined) => {
            if (err == null && encoded !== undefined) {
                const expireAfter = 2 * 604800 /* 14 days */
                const expireAt = new Date()

                expireAt.setSeconds(expireAt.getSeconds() + expireAfter)

                resolve({ token: encoded, expireAt: expireAt })
            }
            else {
                reject(err)
            }
        })
    })
}

async function login(login: string, password: string): Promise<LoginUserRes> {
    try {
        /*
        const user = await User.findOne({ email: login })
        if (!user) {
            return { error: { type: 'invalid_credentials', message: 'Invalid Login/Password' } }
        }
        */
        let user: IUser | undefined | null = cacheLocal.get<IUser>(login)
        if(!user){
            user = await User.findOne({email: login})

            if(!user){
                return { error: { type: 'invalid_credentials', message: 'Invalid Login/Password' } }
            }

            cacheLocal.set(user._id.toString(), user)
            cacheLocal.set(login, user)
        }


        const passwordMatch = await user.comparePassword(password)
        if (!passwordMatch) {
            return { error: { type: 'invalid_credentials', message: 'Invalid Login/Password' } }
        }

        const authToken = await createAuthToken(user._id.toString())
        return { userId: user._id.toString(), token: authToken.token, expireAt: authToken.expireAt }
    }
    catch (err) {
        logger.error(`login: ${err}`)
        return Promise.reject({ error: { type: 'internal_server_error', message: 'Internal Server Error' } })
    }
}

export default { auth: auth, createUser: createUser, login: login, createAuthToken: createAuthToken }