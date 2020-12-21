const express = require('express');
const router = express.Router();
const oauth = require('oauth');
const qs = require('qs');
const request = require('request');
const jwt = require('jsonwebtoken');
const config = require('../config.json');
const dotenv = require('dotenv');
dotenv.config();

const twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
const twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
const twitterCallbackUrl = process.env.TWITTER_CALLBACK_URL;
const twitterRequestUrl = process.env.TWITTER_REQUEST_URL;
const twitterAccessUrl = process.env.TWITTER_ACCESS_URL;

const consumer = new oauth.OAuth(twitterRequestUrl, twitterAccessUrl, twitterConsumerKey, twitterConsumerSecret, '1.0A', twitterCallbackUrl, 'HMAC-SHA1');
const twitterModel = require('../db_models/user-details_model');

router.post('/login', (req, res) => {
    consumer.getOAuthRequestToken(function (error, oauthToken, oauthTokenSecret, results) {
        if (error) {
            console.log("login error >>", error);
            return res.status(403).send({ msg: error.message });
        } else {
            const redirect = {
                redirectUrl: 'https://api.twitter.com/oauth/authorize?oauth_token=' + oauthToken
            }
            res.send(redirect);
        }
    });
});

router.get('/saveaccesstokens', (req, res) => {
    let options = {
        'method': 'GET',
        'url': 'https://api.twitter.com/oauth/access_token?oauth_token=' + req.query.oauth_token + '&oauth_verifier=' + req.query.oauth_verifier,
    };

    request(options, function (error, response) {
        if (error) {
            console.log('error.msg >>', error.message);
        } else {
            let twitResp = qs.parse(response.body);     //converting plain-text into json object
            console.log('twitResp >>', twitResp);

            twitterModel.findOne({ user_id: twitResp.user_id }, async (err, twitterUserRecord) => {
                let token = jwt.sign({ user_id: twitResp.user_id, screen_name: twitResp.screen_name }, config.secret, {
                    expiresIn: 86400
                });

                if (twitterUserRecord) {
                    console.log("tonn >", token);
                    return res.status(200).send({ msg: 'Twitter user id logged in', token: token });
                } else if (twitResp && twitResp.oauth_token) {                  
                    console.log("tokenn >", token);
                    let twitterData = new twitterModel({
                        oauth_token: twitResp.oauth_token,
                        oauth_token_secret: twitResp.oauth_token_secret,
                        screen_name: twitResp.screen_name,
                        user_id: twitResp.user_id
                    });

                    twitterData.save(function (err, doc) {
                        if (err) {
                            console.log('twitter user save error >>', err);
                            res.send('twitter user config document error');
                        }
                        else {
                            console.log('twitter user config saved >>', doc);
                            return res.status(200).send({ msg: 'Twitter user data saved', token: token });
                        }
                    })
                }
            });
        }
    });
});

module.exports = router;