import { faker } from '@faker-js/faker';

import request from 'supertest'
import { Express } from 'express-serve-static-core'

import database from '@exmpl/utils/database'
import { createServer } from '@exmpl/utils/server'

import { createDummy } from '@exmpl/tests/user'
import exp from 'constants';
import cacheExternal from '@exmpl/utils/cache_external'

let server: Express

beforeAll(async () => {
    await cacheExternal.open()
    await database.open()
    server = await createServer()
})

afterAll(async () => {
    await cacheExternal.close()
    await database.close()
})

describe('POST /api/v1/user', () => {
    it('Should return 201 e valid response for valid user', done => {
        request(server)
            .post(`/api/v1/user`)
            .send({
                email: faker.internet.email(),
                password: faker.internet.password(),
                name: faker.name.findName()
            })
            .expect(201)
            .then(res => {
                expect(res.body).toMatchObject({ userId: expect.stringMatching(/^[a-f0-9]{24}$/) })
                done();
            });
    })

    it('Should return 409 e valid response for duplicate user', done => {
        const data = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            name: faker.name.findName()
        }


        request(server)
            .post(`/api/v1/user`)
            .send(data)
            .expect(201)
            .then(res => {

                request(server)
                    .post(`/api/v1/user`)
                    .send(data)
                    .expect(409)
                    .then(res => {
                        expect(res.body).toMatchObject({
                            error:
                                { type: 'account_already_exists', message: expect.stringMatching(/already exists/) }
                        })
                        done();
                    });
            });
    })

    test('Should return 400 e valid response for invalid request user', done => {
        request(server)
            .post(`/api/v1/user`)
            .send({
                mail: faker.internet.email(),
                password: faker.internet.password(),
                name: faker.name.findName()
            })
            .expect(400)
            .then(res => {
                expect(res.body).toMatchObject(
                    {
                        error: { type: 'request_validation', message: expect.stringMatching(/required property 'email'/) }
                    })
                done();
            })
    })
})

describe('POST /api/v1/login', () => {
    it('Should return 200 e valid response from a valid login request', done => {
        createDummy()
            .then(userLogin => {
                request(server)
                    .post(`/api/v1/login`)
                    .send({ email: userLogin.email, password: userLogin.password })
                    .expect(200)
                    .then(res => {
                        expect(res.header['x-expires-after']).toMatch(/^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/)
                        expect(res.body).toEqual({
                            userId: expect.stringMatching(/^[a-f0-9]{24}$/),
                            token: expect.stringMatching(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
                        })
                        done();
                    })
            })
    })

    it('Should return 404 e valid response for a non-exists user', done =>{
        request(server)
            .post(`/api/v1/login`)
            .send({email: faker.internet.email(), password: faker.internet.password()})
            .expect(404)
            .then(res =>{
                expect(res.body).toEqual({
                    error: {type: 'invalid_credentials', message:'Invalid Login/Password'}
                })
                done();
            })
    })

    it('Should return 400 e valid response for invalid request', done =>{
        request(server)
        .post(`/api/v1/login`)
        .send({email: 'hhhhh', password: faker.internet.password()})
        .expect(400)
        .then(res =>{
            expect(res.body).toMatchObject({
                error: {type: 'request_validation', message: expect.stringMatching(/should match format \"email\"/)}
            })
            done();
        })
    })
})