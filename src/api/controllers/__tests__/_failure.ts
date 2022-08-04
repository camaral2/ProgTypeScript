import request from 'supertest';
import { Express } from 'express-serve-static-core'
import UserService from '@exmpl/api/services/user'
import { createServer } from '@exmpl/utils/server';

import { faker } from '@faker-js/faker';

jest.mock('@exmpl/api/services/user')

let server: Express
beforeAll(async () => {
    server = await createServer()
})

describe('auth failure', () => {
    it("Should return 500 e valid response if auth reject with an error", done => {
        (UserService.auth as jest.Mock).mockRejectedValue(new Error())
        request(server)
            .get('/api/v1/logout')
            .set('Authorization', 'Bearer fakeToken')
            .expect(500)
            .then(res => {
                expect(res.body).toMatchObject({ error: { type: 'internal_server_error', message: 'Internal Server Error' } })
                done()
            });
    });
})

describe('createUser failure', () => {
    it('Should return 500 e valid response if createUser reject with an error', done => {
        (UserService.createUser as jest.Mock).mockResolvedValue({error: {type: 'unkonwn'}})
        request(server)
            .post(`/api/v1/user`)
            .send({
                email: faker.internet.email(),
                password: faker.internet.password(),
                name: faker.name.firstName()
            })
            .expect(500)
            .then(res => {
                expect(res.body).toMatchObject({ error: { type: 'internal_server_error', message: 'Internal Server Error' } })
                done()
            });
    })
})

describe('login failure', ()=>{
    it('Should return 500 e valid response if auth rejects with an error', done=>{
        (UserService.login as jest.Mock).mockResolvedValue({error: {type: 'unkonwn'}})
        request(server)
            .post(`/api/v1/login`)
            .send({
                email: faker.internet.email(),
                password: faker.internet.password()
            })
            .expect(500)
            .then(res =>{
                expect(res.body).toMatchObject({error: {type: 'internal_server_error', message: 'Internal Server Error'}})
                done()
            })
    })
})