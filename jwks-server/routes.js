const express = require('express');
const jwt = require('jsonwebtoken');
const {getValidKeys, getExpiredKeys, getKeyByKid} = require('./keys');
const router = express.Router();

// JWKS endpoint to return valid public keys
router.get('/jwks', (req,res) => {
    const validKeys = getValidKeys();
    if(validKeys.length == 0){
        return res.status(404).json({error: 'No valid keyes available'});
    }

    res.json({
        keys: validKeys
    });
});

router.post('/auth', (req, res) => {
    const expired = req.query.expired == 'true';
    const currentTime = Math.floor(Date.now() / 1000);

    let signingKey;
    if (expired) {
        signingKey = getExpireddKey();
        if(!signingKey){
            return res.status(500).json({ error: 'No Expired key available'});
        }
    } else{
        const validKeys = getValidKeys();
        if(validKeys.length === 0){
            return res.status(500).json({ error: 'No valid key available'});
        }

        // now we get the first valid key
        signingKey = getKeyByKid(validKeys[0].kid);
    }

    const payload = {
        sub: "987654321", //test user ID
        name: "Priyash Shah",
        iat: currentTime
    };

    //here we will sign the JWT withn a private key and then include the kid in the header

    const token = jwt.sign(payload, signingKey.privateKey, {
        algorithm: 'RS256',
        keyid: signingKey.kid,
        expiresIn: expired ? '-1s' : '1h'  //expired token if 'expired' query is true
    });

    res.json({
        token: token
    });
});

module.exports = router;