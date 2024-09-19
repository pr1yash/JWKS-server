const request = require('supertest');
const { expect } = require('chai');
const app = require('../index');

describe('/auth Endpoint', () => {
    it('should return a vlid signed JWT if the expire query is false', async() => {
        const res= await request(app).post('/auth');
        expect(res.status).to.equal(200);
        expect(res.body.token).to.be.a('string');
    });

    it('should return an expired JWT when expire query is true', async() =>{
        const res = await request(app).post('/auth?expired=true');
        expect(res.status).to.equal(200);
        expect(res.body.token).to.be.a('string');
    });
});