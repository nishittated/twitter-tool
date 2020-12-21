let mongoose = require('mongoose');

//Define a schema
let Schema = mongoose.Schema;

const schema = new Schema({
    oauth_token: { type: String, required: false },
    oauth_token_secret: { type: String, required: false },
    screen_name: { type: String, required: false },
    user_id: { type: String, unique: true, required: false }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TwitterUser', schema);