const mongoose = require("mongoose");

const devuserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String },
  password: { type: String, required: true },
});

module.exports = mongoose.model("devuserSchema", devuserSchema);
