const mongoose = require('mongoose');

const connectionDB = async () => {
    try {
        // Simulate database connection
        await mongoose.connect(process.env.MONGO_URI, {serverSelectionTimeoutMS:30000} )       
        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error 
    }
}
module.exports = connectionDB;