import { faker } from '@faker-js/faker';

import request from 'supertest'
import { Express } from 'express-serve-static-core'

import database from '@exmpl/utils/database'
import { createServer } from '@exmpl/utils/server'

let server: Express

beforeAll(async () => {
    await database.open()
    server = await createServer()
})

afterAll(async () => {
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