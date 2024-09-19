const express = require('express');
const routes = require('./routes'); //Import routes
const app = express();
const port = 8080;

// Basic route to ensure the server is working
app.get('/', (req,res) => {
    res.send('JWKS Server is Working');
});

//start server
app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`);
});