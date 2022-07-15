import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createServer } from '@exmpl/utils/server'

let server: Express

beforeAll(async () => {
    server = await createServer()
})

describe('GET /test', () => {
    it("It should response the GET method", done => {
        request(server)
            .get('/api/v1/test?name=Lucas')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toMatchObject({ message: 'Hi Lucas - I\'m Fine !!!' })
                done();
            });
    });

    it('Should return 200 & valid response if request param list is empty', done => {
        request(server)
            .get('/api/v1/test')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toMatchObject({ message: 'Hi Jone - I\'m Fine !!!' })
                done()
            })
    })

    it("Should return 400 & valid error response if name param is empty", done => {
        request(server)
            .get('/api/v1/test?name=')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => {
                expect(res.body).toMatchObject({'error': {
                    type: 'request_validation', 
                    message: expect.stringMatching(/Empty.*\parameter.*\'name\'/), 
                    errors: expect.anything()
                  }})
                done();
            });
    });
});

describe('Get /logout', ()=>{
    it("Should return 200 & valid response to authorization with fakeToken request", done => {
        request(server)
            .get('/api/v1/logout')
            .set('Authorization', 'Bearer testApp')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toMatchObject({'message': 'Finalized your session userIdTest'})
                done();
            });
    });

    it("Should return 401 & valid error to invalid authorization", done => {
        request(server)
            .get('/api/v1/logout')
            .set('Authorization', 'Bearer invalidToken')
            .expect('Content-Type', /json/)
            .expect(401)
            .then(res => {
                expect(res.body).toMatchObject({error: {type: 'unauthorized', message: 'Authentication o API Failed'}})
                done();
            });
    });

    it("Should return 401 & valid eror response if authorization header field is missed", done => {
        request(server)
            .get('/api/v1/logout')
            .expect('Content-Type', /json/)
            .expect(401)
            .then(res => {
                expect(res.body).toMatchObject({'error': {
                    type: 'request_validation', 
                    message: 'Authorization header required', 
                    errors: expect.anything()
                  }})
                done();
            });
    });
})