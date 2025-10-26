require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const cors = require("cors");

const devuserSchema = require("./models/agentmodel");
const authentic = require("./middleware/middleware");
const customerdata = require("./models/customermodel");
const app = express();
app.use(cors());

// Middleware for parsing JSON
app.use(express.json());

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9i4cg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => console.log("Db connected"))
  .catch((err) => console.error("Db connection error:", err));

app.get("/", (req, resp) => {
  return resp.send("Helloz world");
});

app.post("/register", async (req, resp) => {
  try {
    console.log(req.body); // Check the parsed request body
    const { fullname, email, mobile, password, confirmPassword } = req.body;

    if (!fullname || !email || !password || !confirmPassword) {
      return resp.status(400).send("Missing required fields");
    }

    const exist = await devuserSchema.findOne({ email });

    if (exist) {
      return resp.send("User already exists");
    }
    if (password != confirmPassword) {
      return resp.send("Password not matching");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new devuserSchema({
      fullname,
      email,
      mobile,
      password: hashedPassword,
    });

    await newUser.save();

    return resp.send("User registered successfully");
  } catch (err) {
    console.error(err);
    return resp.status(500).send("Server Error..");
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await devuserSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "❌ No user exists" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "❌ Password mismatch" });
    }

    // Create JWT payload
    const payload = { user: { id: user._id } };

    // Sign JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          message: "✅ Login successful",
          token,
          user: {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            mobile: user.mobile,
          },
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/allprofiles", authentic, async (req, resp) => {
  try {
    const allprofiles = await devuserSchema.find();
    return resp.send(allprofiles);
  } catch (err) {
    return resp.status(400).send("Bad Request");
  }
});

//Customers data

app.post("/api/customers/create", authentic, async (req, res) => {
  try {
    const { cId, name, setupBoxNo, phone, address } = req.body;
    const newCustomer = new customerdata({
      cId,
      name,
      setupBoxNo,
      phone,
      address,
      transactions: [],
    });

    await newCustomer.save();
    res.json({ message: "✅ Customer added successfully" });
  } catch (error) {
    res.status(500).json({ error: "❌ Server error" });
  }
});

//Customer

app.get("/allcustomers", authentic, async (req, res) => {
  try {
    const allcustomers = await customerdata.find();

    const filteredCustomers = allcustomers.map((customer) => ({
      id: customer._id,
      cId: customer.cId,
      name: customer.name,
      phone: customer.phone,
      setupBoxNo: customer.setupBoxNo,
    }));

    return res.json({ filteredCustomers });
  } catch (e) {
    console.log(e);
    return res.send(e);
  }
});

// Get single customer by MongoDB _id
app.get(`/viewcustomer/:cId`, authentic, async (req, res) => {
  try {
    const { cId } = req.params;

    // Find customer by cId
    const customer = await customerdata.findOne({ cId }).lean();

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Prepare response object
    const customerDetails = {
      id: customer._id,
      cId: customer.cId,
      name: customer.name,
      phone: customer.phone,
      setupBoxNo: customer.setupBoxNo,
      address: customer.address,
      transactions: (customer.transactions || []).map((t) => ({
        transId: t.transId || t._id, // Prefer custom TXN-xxxx, fallback to Mongo ID
        amount: t.amount,
        status: t.status,
        date: t.date,
      })),
    };

    return res.json(customerDetails);
  } catch (error) {
    console.error("Error fetching customer details:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

//Customer Delete

app.post("/api/customers/delete", authentic, async (req, res) => {
  try {
    const { cId } = req.body; // Get customer ID from request body

    if (!cId) {
      return res.status(400).json({ error: "❌ Customer ID is required" });
    }

    const deletedCustomer = await customerdata.findOneAndDelete({ cId });

    if (!deletedCustomer) {
      return res.status(404).json({ error: "❌ Customer not found" });
    }

    res.json({ message: "✅ Customer deleted successfully" });
  } catch (error) {
    console.log("❌ Error Deleting Customer:", error);
    res.status(500).json({ error: "❌ Server error" });
  }
});

app.delete("/api/customers", authentic, async (req, res) => {
  await customerdata.findOneAndDelete({ cId });
  res.json({ message: "✅ Customer deleted successfully" });
});

// Modify Customer Data

//Modify data of customer
app.put("/api/customers", authentic, async (req, res) => {
  try {
    const { cId, ...updateData } = req.body;
    const updatedCustomer = await customerdata.findOneAndUpdate(
      { cId },
      updateData,
      { new: true }
    );
    if (!updatedCustomer)
      return res.status(404).json({ error: "Customer not found" });
    res.json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Server error" });
  }
});

//Customer Transcations

app.post("/api/customers/transaction", authentic, async (req, res) => {
  try {
    const { cId, amount, status } = req.body;

    const customer = await customerdata.findOne({ cId });
    if (!customer) {
      return res.status(404).json({ error: "❌ Customer not found" });
    }

    // new transaction
    const newTransaction = {
      transId: "TXN-" + Date.now(),
      amount,
      status,
      date: new Date(),
    };

    customer.transactions.push(newTransaction);
    await customer.save();

    res.json({
      message: "✅ Transaction added successfully",
      transaction: newTransaction,
      customer,
    });
  } catch (error) {
    console.error("❌ Error adding transaction:", error);
    res.status(500).json({ error: "❌ Server error" });
  }
});

// ================== REPORTS API ==================

// 1️⃣ Collection Report (between two dates)
app.get("/api/reports/collection", async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "Please provide from and to dates" });
    }

    const fromDate = dayjs(from).startOf("day").toDate();
    const toDate = dayjs(to).endOf("day").toDate();

    const customers = await customerdata
      .find({
        "transactions.date": { $gte: fromDate, $lte: toDate },
        "transactions.status": "Paid",
      })
      .lean();

    // Flatten transactions
    let transactions = [];
    customers.forEach((c) => {
      c.transactions.forEach((t) => {
        if (t.status === "Paid" && t.date >= fromDate && t.date <= toDate) {
          transactions.push({
            cId: c.cId,
            name: c.name,
            setupBoxNo: c.setupBoxNo,
            phone: c.phone,
            amount: t.amount,
            status: t.status,
            date: t.date,
          });
        }
      });
    });

    res.json({ from, to, transactions });
  } catch (error) {
    console.error("Error generating collection report:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 2️⃣ Monthly Report
app.get("/api/reports/monthly", async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "Please provide year and month" });
    }

    const start = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const end = dayjs(`${year}-${month}-01`).endOf("month").toDate();

    const customers = await customerdata
      .find({
        "transactions.date": { $gte: start, $lte: end },
        "transactions.status": "Paid",
      })
      .lean();

    let transactions = [];
    customers.forEach((c) => {
      c.transactions.forEach((t) => {
        if (t.status === "Paid" && t.date >= start && t.date <= end) {
          transactions.push({
            cId: c.cId,
            name: c.name,
            amount: t.amount,
            status: t.status,
            date: t.date,
          });
        }
      });
    });

    const totalCollected = transactions.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      month: `${month}-${year}`,
      totalCollected,
      transactions,
    });
  } catch (error) {
    console.error("Error generating monthly report:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 3️⃣ Unpaid Customers (monthly)
app.get("/api/reports/unpaid", async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "Please provide year and month" });
    }

    const start = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const end = dayjs(`${year}-${month}-01`).endOf("month").toDate();

    const customers = await customerdata
      .find({
        "transactions.date": { $gte: start, $lte: end },
        "transactions.status": "Pending",
      })
      .lean();

    let unpaid = [];
    customers.forEach((c) => {
      c.transactions.forEach((t) => {
        if (t.status === "Pending" && t.date >= start && t.date <= end) {
          unpaid.push({
            cId: c.cId,
            name: c.name,
            setupBoxNo: c.setupBoxNo,
            phone: c.phone,
            status: t.status,
            date: t.date,
          });
        }
      });
    });

    res.json({ month: `${month}-${year}`, unpaid });
  } catch (error) {
    console.error("Error fetching unpaid report:", error);
    res.status(500).json({ message: "Server error" });
  }
});


//Daily Report of data for day collection

app.get("/api/reports/today", authentic, async (req, res) => {
  try {
    const startOfDay = dayjs().startOf("day").toDate();
    const endOfDay = dayjs().endOf("day").toDate();

    const customers = await customerdata
      .find({
        "transactions.date": { $gte: startOfDay, $lte: endOfDay },
        "transactions.status": "Paid",
      })
      .lean();

    let total = 0;
    customers.forEach((c) => {
      c.transactions.forEach((t) => {
        if (t.status === "Paid" && t.date >= startOfDay && t.date <= endOfDay) {
          total += t.amount;
        }
      });
    });

    res.json({
      date: dayjs().format("YYYY-MM-DD"),
      totalCollected: total,
    });
  } catch (error) {
    console.error("Error generating today's total:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(5000, () => console.log("Server Running..."));


