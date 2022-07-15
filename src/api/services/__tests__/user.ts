import user from '../user'

describe('auth', () => {
    it('should resolve with true and valid userId for hardcode token', async () => {
        const res = await user.auth('testApp')
        expect(res).toEqual({ userId: 'userIdTest' })
    })

    it('shuld resolve with false for invalid token', async () => {
        const res = await user.auth('OutherTest')
        expect(res).toEqual({ error: { type: 'unauthorized', message: 'Authentication o API Failed' } })
    })
})
