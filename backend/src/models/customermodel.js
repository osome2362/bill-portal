const mongoose = require("mongoose");

const customerdata = new mongoose.Schema({
  cId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  setupBoxNo: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  transactions: [
    {
      transId: { type: String, default: () => "TXN-" + Date.now() },
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now }, // full Date object
      status: { type: String, enum: ["Paid", "Pending"], default: "Pending" },
    },
  ],
});

module.exports = mongoose.model("customerdata", customerdata);
