import { faker } from '@faker-js/faker';

import user from '@exmpl/api/services/user'
import database from '@exmpl/utils/database'
import cacheExternal from '@exmpl/utils/cache_external'

import { createDummy, createDummyAndAuthorize } from '@exmpl/tests/user'

beforeAll(async () => {
  await cacheExternal.open()
  await database.open()
})

afterAll(async () => {
  await cacheExternal.close()
  await database.close()
})


describe('auth', () => {
  it('should resolve with true and valid userId for hardcode token', async () => {
    const dummy = await createDummyAndAuthorize()
    await expect(user.auth(dummy.token)).resolves.toEqual({ userId: dummy.userId })
  })

  it('shuld resolve with false for invalid token', async () => {
    const res = await user.auth('OutherTest')
    expect(res).toEqual({ error: { type: 'unauthorized', message: 'Authentication o API Failed' } })
  })
})

describe('createUser', () => {
  it('Should resolve with true and valid userId', async () => {
    const email = faker.internet.email()
    const password = faker.internet.password()
    const name = faker.name.findName()

    await expect(user.createUser(email, password, name)).resolves.toEqual({ userId: expect.stringMatching(/^[a-f0-9]{24}$/) })
  })

  it('Should resolves with false e valid error if duplicate userId', async () => {
    const email = faker.internet.email()
    const password = faker.internet.password()
    const name = faker.name.findName()

    await user.createUser(email, password, name)

    await expect(user.createUser(email, password, name)).resolves.toEqual({ error: { type: 'account_already_exists', message: `${email} already exists` } })
  })

  it('Should rejects if invalid email input', async () => {
    const email = 'dfasd@sf'
    const password = faker.internet.password()
    const name = faker.name.findName()

    await expect(user.createUser(email, password, name)).rejects.toThrowError('validation failed: email')
  })
})

describe('login', () => {
  it('Should return JWT token, userId, expireAt to a valid login/password', async () => {
    const dummy = await createDummy()
    await expect(user.login(dummy.email, dummy.password)).resolves.toEqual({
      userId: dummy.userId,
      token: expect.stringMatching(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/),
      expireAt: expect.any(Date)
    })
  })

  it('Should reject with error if login does not exist', async () => {
    await expect(user.login(faker.internet.email(), faker.internet.password())).resolves.toEqual({
      error: { type: 'invalid_credentials', message: 'Invalid Login/Password' }
    })
  })

  it('Should reject with error if password is wrong', async () => {
    const dummy = await createDummy()
    await expect(user.login(dummy.email, faker.internet.password())).resolves.toEqual({
      error: { type: 'invalid_credentials', message: 'Invalid Login/Password' }
    })
  })

  it('Should auth performance test', async () => {
    const dummy = await createDummyAndAuthorize()

    const now = new Date().getTime()
    let i = 0
    do {
      i += 1
      await user.auth(`Bearer ${dummy.token!}`)
    } while (new Date().getTime() - now < 1000)

    console.log(`auth performance test: ${i}`)
  })

})

