let mongoose = require('mongoose');

//Define a schema
let Schema = mongoose.Schema;

const schema = new Schema({
    created_at: { type: Date, required: false },
    screen_name: { type: String, required: false },
    user_id: { type: String, required: false },
    tweet_id: { type: String, unique: true, required: false },
    tweet_text: { type: String, required: false }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Tweet', schema);