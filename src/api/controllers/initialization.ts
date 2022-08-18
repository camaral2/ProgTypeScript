import * as express from 'express'
import { writeJsonResponse } from '@exmpl/utils/express'
import cacheExternal from '@exmpl/utils/cache_external'
import logger from '@exmpl/utils/logger'

export function test(req: express.Request, res: express.Response): void {
    const name = req.query.name || 'Jone'
    const message = `Hi ${name} - I'm Fine !!!`

    res.json({
        "message": message
    })
}
export function logout(req: express.Request, res: express.Response): void {
    const userId = res.locals.auth.userId
    writeJsonResponse(res, 200, { 'message': `Finalized your session ${userId}` })
}