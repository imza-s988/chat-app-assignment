const mongoose = require("mongoose");
async function connectDB(){
    await mongoose.connect(process.env.DB_URL);
    console.log("Db connection done successfully");
}
module.exports={
    connectDB,
};