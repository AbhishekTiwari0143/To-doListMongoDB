const mongoose = require("mongoose")
const User = require('userSchema')

const listSchema = new mongoose.Schema({
    name: String,
    items: [userSchema]
})

module.exports = new mongoose.model("List", listSchema)