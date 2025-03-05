require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes, QueryTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MSSQL
const sequelize = new Sequelize("TaskMaster", "tasksa", "Task@Sa", {
  host: "103.38.50.149",
  port: 5121,
  dialect: "mssql",
  dialectOptions: {
    options: { encrypt: false },
  },
  logging: console.log,
});

sequelize
  .authenticate()
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

// Define Models
const Customer = sequelize.define("CustomerMasters", {
  customerID: { type: DataTypes.STRING },
  customerName: { type: DataTypes.STRING, allowNull: false },
  address1: DataTypes.STRING,
  address2: DataTypes.STRING,
  address3: DataTypes.STRING,
  city: DataTypes.STRING,
  stateID: DataTypes.STRING,
  countryID: DataTypes.INTEGER,
  pincode: DataTypes.STRING,
  gstNo: DataTypes.STRING,
  mobileNo: { type: DataTypes.STRING, allowNull: false },
  emailID: DataTypes.STRING,
  active: { type: DataTypes.STRING },
  jobName: DataTypes.STRING,
  jobFrequency: DataTypes.STRING,
});

// Define CountryMaster Model
const CountryMaster = sequelize.define(
  "CountryMasters",
  {
    CountryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    CountryName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "CountryMasters", // Ensure correct table mapping
    timestamps: false, // Disable Sequelize's automatic timestamps
  }
);

const StateMaster = sequelize.define(
  "StateMasters",
  {
    StateID: { type: DataTypes.INTEGER, primaryKey: true },
    StateName: { type: DataTypes.STRING, allowNull: false },
    CountryID: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "StateMasters", timestamps: false }
);
// Define Users

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: "Users", timestamps: false }
);

sequelize.sync();

// API Routes
app.post("/api/customers", async (req, res) => {
  try {
    const newCustomer = await Customer.create(req.body);
    res.json({ success: true, data: newCustomer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/customers", async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/countries", async (req, res) => {
  try {
    const countries = await CountryMaster.findAll();
    res.json(countries);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/states", async (req, res) => {
  try {
    const states = await StateMaster.findAll({
      attributes: ["StateID", "StateName"],
    });
    res.json(states);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/states/:countryID", async (req, res) => {
  try {
    const { countryID } = req.params;
    const states = await StateMaster.findAll({
      where: { CountryID: parseInt(countryID) },
    });
    res.json(states);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/countries", async (req, res) => {
  try {
    const { CountryName } = req.body;
    if (!CountryName) {
      return res
        .status(400)
        .json({ success: false, message: "Country Name is required" });
    }
    const newCountry = await CountryMaster.create({ CountryName });
    res.json({ success: true, data: newCountry });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/countries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { CountryName } = req.body;
    const country = await CountryMaster.findByPk(id);
    if (!country) {
      return res
        .status(404)
        .json({ success: false, message: "Country not found" });
    }
    await country.update({ CountryName });
    res.json({ success: true, message: "Country updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/countries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const country = await CountryMaster.findByPk(id);
    if (!country) {
      return res
        .status(404)
        .json({ success: false, message: "Country not found" });
    }
    await country.destroy();
    res.json({ success: true, message: "Country deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: user.id }, "your_secret_key", { expiresIn: "1h" });
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ message: "Login Failed" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));