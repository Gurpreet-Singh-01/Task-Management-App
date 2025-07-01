const mongoose = require('mongoose')
const { DB_NAME } = require('../constants')

const connectDB = async() =>{
    try {
        const connection = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log("MongoDB connected successfully || host", connection.connection.host)
    } catch (error) {
        console.log("MongoDB failed to connect", error)
        process.exit(1)
    }
}

module.exports = connectDB