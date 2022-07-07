import * as express from 'express'

import userAuth from '@exmpl/api/services/user'
import {writeJsonResponse} from '@exmpl/utils/express'

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