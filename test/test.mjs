import { expect } from 'chai';
import request from 'supertest';
import app from '../server.js';

describe('JWKS Server', function () {
    before(function (done) {
        // Function to repeatedly check server readiness before proceeding with tests
        function checkServerReady() {
            request(app)
                .get('/ready')
                .end((err, res) => {
                    if (res.status === 200) {
                        done();  // Server is ready, proceed with tests
                    } else {
                        setTimeout(checkServerReady, 100);  // Check again after a short delay
                    }
                });
        }
        checkServerReady();
    });

    describe('JWKS Endpoint Tests', function () {
        it('should return a valid JWKS response', async function () {
            const response = await request(app)
                .get('/.well-known/jwks.json')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.keys).to.be.an('array');
            expect(response.body.keys.length).to.be.greaterThan(0);
            expect(response.body.keys[0]).to.include.keys('kty', 'use', 'kid', 'alg', 'e', 'n');
        });
    });

    describe('Error Handling', function () {
        it('should handle key pair generation failure', async function () {
            // Toggle the simulation on
            await request(app)
                .get('/toggle-failure-simulation')
                .expect(200);

            // Now immediately check the `/ready` endpoint which will simulate the failure
            await request(app)
                .get('/ready')
                .expect(500);  // Expecting an error now since failure is simulated

            // Toggle the simulation off to clean up
            await request(app)
                .get('/toggle-failure-simulation')
                .expect(200);
        });
    });


    describe('Authentication Endpoint Tests', function () {
        it('should issue a valid JWT', async function () {
            const response = await request(app)
                .post('/auth')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.token).to.be.a('string');
        });

        it('should issue an expired JWT when requested', async function () {
            const response = await request(app)
                .post('/auth?expired=true')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.token).to.be.a('string');
        });

        it('should only allow POST requests', async function () {
            await request(app)
                .get('/auth')
                .expect(405); // Method Not Allowed
        });
    });
});
