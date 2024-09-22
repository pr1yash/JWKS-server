const express = require('express');
const jwt = require('jsonwebtoken');
const jose = require('node-jose');

const app = express();
const port = 8080;

let keyPair;
let expiredKeyPair;
let token;
let expiredToken;
let simulateKeyFailure = false; // Flag to simulate key generation failure

// Initialize the key pairs
async function generateKeyPairs() {
  if (simulateKeyFailure) {
    throw new Error('Simulated key pair generation failure'); // Simulate failure
  }
  try {
    keyPair = await jose.JWK.createKey('RSA', 2048, { alg: 'RS256', use: 'sig' });
    keyPair.expired = false;

    expiredKeyPair = await jose.JWK.createKey('RSA', 2048, { alg: 'RS256', use: 'sig' });
    expiredKeyPair.expired = true;
  } catch (error) {
    console.error("Error generating key pairs:", error);
    throw error;
  }
}

// Generate a fresh JWT
function generateToken() {
  const payload = {
    user: 'sampleUser',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const options = {
    algorithm: 'RS256',
    header: {
      typ: 'JWT',
      alg: 'RS256',
      kid: keyPair.kid,
    },
  };
  token = jwt.sign(payload, keyPair.toPEM(true), options);
}

// Generate an expired JWT
function generateExpiredJWT() {
  const payload = {
    user: 'sampleUser',
    iat: Math.floor(Date.now() / 1000) - 30000,
    exp: Math.floor(Date.now() / 1000) - 3600,
  };
  const options = {
    algorithm: 'RS256',
    header: {
      typ: 'JWT',
      alg: 'RS256',
      kid: expiredKeyPair.kid,
    },
  };
  expiredToken = jwt.sign(payload, expiredKeyPair.toPEM(true), options);
}

app.all('/auth', (req, res, next) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  next();
});

app.all('/.well-known/jwks.json', (req, res, next) => {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }
  next();
});

app.get('/.well-known/jwks.json', (req, res) => {
  if (!keyPair || !expiredKeyPair) {
    return res.status(503).send({ status: 'Service Unavailable' });
  }
  const validKeys = [keyPair, expiredKeyPair].filter(key => key && !key.expired);
  res.setHeader('Content-Type', 'application/json');
  res.json({ keys: validKeys.map(key => key.toJSON()) });
});

app.get('/ready', (req, res) => {
  if (simulateKeyFailure) {
    res.status(500).send({ status: 'Simulated key pair generation failure' });
  } else if (keyPair && expiredKeyPair) {
    res.send({ status: 'ready' });
  } else {
    res.status(503).send({ status: 'not ready' });
  }
});


app.post('/auth', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.query.expired === 'true') {
    return res.json({ token: expiredToken });
  }
  res.json({ token: token });
});

app.get('/toggle-failure-simulation', (req, res) => {
  simulateKeyFailure = !simulateKeyFailure;
  res.status(200).send(`Simulate key failure set to ${simulateKeyFailure}`);
});

// Error handling middleware
app.use((err, req, res) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: 'Internal Server Error' });
});

generateKeyPairs().then(() => {
  generateToken();
  generateExpiredJWT();
  app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});

module.exports = app; // Export for testing
