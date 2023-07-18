const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String
})

module.exports = new mongoose.model('User', userSchema)
