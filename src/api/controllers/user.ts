import * as express from 'express'

import userAuth, {ErrorRes} from '@exmpl/api/services/user'
import {writeJsonResponse} from '@exmpl/utils/express'
import logger from '@exmpl/utils/logger'

export function auth(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const token = req.headers.authorization!
    userAuth.auth(token)
    .then(authRes=>{
        if(!(authRes as any).error){
            res.locals.auth = {
                userId: (authRes as {userId: string}).userId
            }

            next()
        } else {
            writeJsonResponse(res, 401, authRes)
        }
    })
    .catch(err=>{
        writeJsonResponse(res, 500, {error: {type: 'internal_server_error', message: 'Internal Server Error'}})
    })
}

export function createUser(req: express.Request, res: express.Response): void {
    const {email, password, name} = req.body

    userAuth.createUser(email, password, name)
    .then(resp=>{
        if((resp as any).error){
            if((resp as ErrorRes).error.type === 'account_already_exists'){
                writeJsonResponse(res, 409, resp)
            }
            else {
                throw new Error(`unsupported ${resp}`)
            }
        } else {
            writeJsonResponse(res, 201, resp)
        }
    })
    .catch((err: any)=>{
        logger.error(`createUser: ${err}`)
        writeJsonResponse(res, 500, {error: {type: 'internal_server_error', message: 'Internal Server Error'}})
    })
}


export function login(req: express.Request, res: express.Response): void {
    const {email, password} = req.body

    userAuth.login(email, password)
        .then(resp =>{
            if((resp as any).error){
                if((resp as ErrorRes).error.type === 'invalid_credentials'){
                    writeJsonResponse(res, 404, resp)
                } else {
                    throw new Error(`unsupported ${resp}`)
                }
            } else {
                const {userId, token, expireAt} = resp as {token: string, userId: string, expireAt: Date}
                writeJsonResponse(res, 200, {userId: userId, token: token}, {'X-Expires-After': expireAt.toISOString()})
            }
        })
        .catch((err: any)=>{
            logger.error(`login: ${err}`)
            writeJsonResponse(res, 500, {error: {type: 'internal_server_error', message: 'Internal Server Error'}})
        })
}