import { faker } from '@faker-js/faker';

import user from '@exmpl/api/services/user'
import database from '@exmpl/utils/database'

beforeAll(async ()=> {
    await database.open()
})

afterAll(async ()=>{
    await database.close()
})


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

describe('createUser', ()=>{
  it('Should resolve with true and valid userId', async ()=>{
    const email = faker.internet.email()
    const password = faker.internet.password()
    const name = faker.name.findName()

    await expect(user.createUser(email, password, name)).resolves.toEqual({userId: expect.stringMatching(/^[a-f0-9]{24}$/)})
  })  

  it('Should resolves with false e valid error if duplicate userId', async ()=>{
    const email = faker.internet.email()
    const password = faker.internet.password()
    const name = faker.name.findName()

    await user.createUser(email, password, name)

    await expect(user.createUser(email, password, name)).resolves.toEqual({error: {type: 'account_already_exists', message: `${email} already exists`}})
  })

  it('Should rejects if invalid email input', async ()=>{
    const email = 'dfasd@sf'
    const password = faker.internet.password()
    const name = faker.name.findName()

    await expect(user.createUser(email, password, name)).rejects.toThrowError('validation failed: email')
  })
})