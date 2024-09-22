# JWKS-server 
# Building a JWKS server that generates JSTs (JSON Web Tokens)
This project is a Node.js server that demonstrates JWT (JSON Web Token) generation and validation using the `express` and `node-jose` libraries. It includes endpoints for generating both valid and expired JWTs, as well as a simulated key failure for testing purposes.

## Table of Contents

- Installation
- Usage
- Endpoints
- Error Handling
- Testing
- Test Results
- Contributing
- License

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/jwt-auth-server.git
    cd jwt-auth-server
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the server:
    ```bash
    npm start
    ```

## Usage

The server runs on `http://localhost:8080`. It generates JWTs using RSA key pairs and provides endpoints to retrieve these tokens and the public keys.

## Endpoints

### `POST /auth`

Generates a JWT. If the `expired` query parameter is set to `true`, an expired token is returned.

- **Request**:
    ```bash
    curl -X POST http://localhost:8080/auth
    ```

- **Response**:
    ```json
    {
      "token": "your.jwt.token.here"
    }
    ```

### `GET /.well-known/jwks.json`

Returns the JSON Web Key Set (JWKS) containing the public keys.

- **Request**:
    ```bash
    curl http://localhost:8080/.well-known/jwks.json
    ```

- **Response**:
    ```json
    {
      "keys": [
        {
          "kty": "RSA",
          "kid": "key-id",
          "use": "sig",
          "alg": "RS256",
          "n": "modulus",
          "e": "exponent"
        }
      ]
    }
    ```

### `GET /ready`

Checks if the server is ready by verifying the key pairs.

- **Request**:
    ```bash
    curl http://localhost:8080/ready
    ```

- **Response**:
    ```json
    {
      "status": "ready"
    }
    ```
### `GET /toggle-failure-simulation`

Toggles the simulation of key generation failure.

- **Request**:
    ```bash
    curl http://localhost:8080/toggle-failure-simulation
    ```

- **Response**:
    ```text
    Simulate key failure set to true/false
    ```

## Error Handling

The server includes error handling middleware to catch and respond to errors gracefully.

```javascript
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: 'Internal Server Error' });
});

Testing
To test the server, you can use tools like Postman or curl to make requests to the endpoints.

Test Results
The project includes tests for the JWKS server, error handling, and authentication endpoints. Here are the test results:

priyashshah@Priyashs-MacBook-Air js2 % npm run coverage

> project1_javascript@1.0.0 coverage
> nyc mocha

  JWKS Server
Server started on http://localhost:8080
    JWKS Endpoint Tests
      ✔ should return a valid JWKS response
    Error Handling
      ✔ should handle key pair generation failure
    Authentication Endpoint Tests
      ✔ should issue a valid JWT
      ✔ should issue an expired JWT when requested
      ✔ should only allow POST requests

  5 passing (345ms)

-----------|---------|----------|---------|---------|----------------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s          
-----------|---------|----------|---------|---------|----------------------------
All files  |   86.88 |       85 |   86.66 |   86.44 |                            
 server.js |   86.88 |       85 |   86.66 |   86.44 | 17,26-27,76,83,116-117,127 
-----------|---------|----------|---------|---------|----------------------------

Contributing
Contributions are welcome! Please open an issue or submit a pull request.
