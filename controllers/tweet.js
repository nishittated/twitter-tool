const express = require('express');
const router = express.Router();
const oauth = require('oauth');
const dotenv = require('dotenv');
dotenv.config();

const twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
const twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
const twitterCallbackUrl = process.env.TWITTER_CALLBACK_URL;
const twitterRequestUrl = process.env.TWITTER_REQUEST_URL;
const twitterAccessUrl = process.env.TWITTER_ACCESS_URL;

const consumer = new oauth.OAuth(twitterRequestUrl, twitterAccessUrl, twitterConsumerKey, twitterConsumerSecret, '1.0A', twitterCallbackUrl, 'HMAC-SHA1');
const tweetModel = require('../db_models/tweet_model');
const twitterModel = require('../db_models/user-details_model');

router.post('/posttweet', async (req, res) => {
    const twitterUser = await twitterModel.findOne({ user_id: req.body.user_id }).exec();

    let postBody = {
        'status': req.body.tweetText
    };

    consumer.post('https://api.twitter.com/1.1/statuses/update.json',
        twitterUser.oauth_token, twitterUser.oauth_token_secret, postBody,
        function (err, tweetResp, resp) {
            if (err) {
                let errData = JSON.parse(err.data);
                console.log('tweeted error data >>', errData);
                return res.status(err.statusCode).send({ msg: errData.errors[0].message });
            } else {
                let parsedTweetData = JSON.parse(tweetResp);
                console.log('tweeted successfully json parsed data >>', parsedTweetData);

                let tweetData = new tweetModel({
                    screen_name: req.body.screen_name,
                    user_id: req.body.user_id,
                    tweet_id: parsedTweetData.id_str,
                    tweet_text: parsedTweetData.text,
                    created_at: parsedTweetData.created_at
                });

                tweetData.save(function (err, doc) {
                    if (err) {
                        console.log('tweet save error >>', err);
                        return res.status(500).send({ msg: 'tweet not inserted in db' });
                    }
                    else {
                        console.log('tweet config saved >>', doc);
                        return res.status(200).send({ msg: 'tweet sent & saved in db' });
                    }
                })
            }
        });
});

router.get('/gettweets', async (req, res) => {
    console.log('user_id >>', req.query.user_id);
    const twitterUser = await twitterModel.findOne({ user_id: req.query.user_id }).exec();

    consumer.get('https://api.twitter.com/1.1/statuses/user_timeline.json?user_id=' + req.query.user_id + '&include_rts=1',
        twitterUser.oauth_token, twitterUser.oauth_token_secret,
        function (err, data, response) {
            // try {
            //     console.log('fetch tweets data >>', data);
            //     return res.status(200).send([{ msg: '', data: data }]);
            // }
            // catch (e) {
            //     console.log('fetch tweets failed >>', err);
            //     return res.status(500).send({ msg: 'tweet fetch failed' });
            // }
            if (err) {
                let errData = JSON.parse(err.data);
                console.log('fetch tweets failed >>', errData);
                //  return res.status(err.statusCode).send({ msg: errData.errors[0].message });
            } else {
                console.log('fetch tweets data >>', data);
                return res.status(200).send([{ msg: 'tweet fetched successfully', data: data }]);
            }
        });
});

module.exports = router;