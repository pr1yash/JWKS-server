const jose = require('node-jose');
const { v4: uuidv4 } = require('uuid');

//creating array to store keys
const keys = [];

//Function top generate a new RSA key pair
async function generateKeyPair(){
    const keystore = jose.JWK.createKeyStore();

    //generating RSA key 
    const key = await keystore.generate('RSA', 2048, {
        alg: 'RS256',
        use: 'sig',
        kid: uuidv4() //this helps in generationg unique kid for each key
    });

    // coding in the mmexpiry date (24 hours. Change at will)

    const expiry = Math.floor(Date.now() / 1000) + (24 * 60 * 60); 

    const keyObj = {
        kid: key.kid,
        publicKey: key.toJSON(), // Public Part (JWK)
        privateKey: key.toJSON(true), // Private Part (JWK)
        expiry
    };

    //now stroing the key in memory
    keys.push(keyObj);
}

// function to get all the non-expired keys
function getValidKeys(){
    const currentTime = Math.floor(Date.now() / 1000);
    return keys.filter( key => key.expiry > currentTime).map(key => key.publicKey);
}

// function to get the expired keys to test expiry by issuing expired JWT
function getExpireKey(){
    const currentTime = Math.floor(Date.now() / 1000);
    return keys.find(key => key.expiry < currentTime);
}

//function to obtain the key using kid
function getKeyByKid(kid) {
    return keys.find( key => key.kid == kid);
}

// this is to generate an initial pair of key when starting the server
generateKeyPair();

// we explore all the above functions to use in other modules

module.exports = {
    generateKeyPair,
    getValidKeys,
    getExpireKey,
    getKeyByKid
};

