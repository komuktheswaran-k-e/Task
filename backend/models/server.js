const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const sequelize = require("./config/db");
const Customer = require("./models/Customer");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Test API
app.get("/", (req, res) => {
  res.send("Customer API is running!");
});

// Add a new customer
app.post("/api/customers", async (req, res) => {
  try {
    const newCustomer = await Customer.create(req.body);
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all customers
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
