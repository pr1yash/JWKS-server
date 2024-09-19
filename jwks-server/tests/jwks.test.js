const request = require('supertest');
const { expect } = require('chai');
const app = require('../index');

describe('/jwks Endpoint', () => {
    it('shoudl return valid JWKS keys', async() => {
        const res = await request(app).get('/jwks');
        expect(res.status).to.equal(200);
        expect(res.body.keys).to.be.an('array');
        expect(res.body.keys.length).to.be.greaterThan(0);
    });

    it('should return 404 if none of the valid keys are available', async() => {

        const res = await request(app).get("/jwks");
        expect(res.status).to.equal(404);
    });

});