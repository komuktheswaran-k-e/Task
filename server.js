require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes, QueryTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const macaddress = require("macaddress");
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
const Log = sequelize.define(
  "Log",
  {
    logID: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    employeeID: { 
      type: DataTypes.STRING(50), // ✅ Employee codes like 'ads001'
      allowNull: false 
    },
    logDate: { 
      type: DataTypes.DATEONLY, // ✅ Stores only date (YYYY-MM-DD)
      allowNull: false, 
      defaultValue: Sequelize.literal("CAST(GETDATE() AS DATE)") 
    },
    loginTime: { 
      type: DataTypes.DATE, // ✅ Stores both date and time
      allowNull: false, 
      defaultValue: Sequelize.literal("GETDATE()") // ✅ Stores current timestamp
    },
    logoutTime: { 
      type: DataTypes.DATE, // ✅ Stores both date and time
      allowNull: true 
    },
    macAddress: {  // ✅ Add MAC Address field
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { 
    tableName: "Logs", 
    timestamps: false 
  }
);

module.exports = Log;

const Company = sequelize.define("company_details", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  header: { type: DataTypes.STRING, allowNull: false },
  footer: { type: DataTypes.STRING, allowNull: false }, // ✅ Ensure footer exists
}, { 
  tableName: "company_details", 
  timestamps: false 
});

module.exports = Company;



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
    console.error("Database error:", error);
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
  const { username, password } = req.body;
  console.log(username,password)

  try {
    
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userID: user.userID, username: user.username }, "secretkey", { expiresIn: "1h" });

    const macAddr = await macaddress.one();
    console.log("MAC Address:", macAddr);

    const logEntry = await Log.create({
      employeeID: user.username,
      logDate: moment().format("YYYY-MM-DD"), // ✅ Local Date
      loginTime:Sequelize.literal("FORMAT(GETDATE(), 'yyyy-MM-dd HH:mm:ss')"),// ✅ Local Time
      macAddress: macAddr, 
    });
    
    
    res.json({
      success: true,
      message: "Login successful",
      token,
      username: user.username,
      logID: logEntry.logID, // Return log ID to track logout
      
    });
  } catch (error) {
    
    console.error("Error Details:", error);
    
    res.status(500).json({ message: "Server error", error });
  }
});


app.post("/api/logout", async (req, res) => {
  const { logID } = req.body; // Frontend should send the logID

  try {
    const logEntry = await Log.findByPk(logID);
    if (!logEntry) {
      return res.status(404).json({ message: "Log entry not found" });
    }

    logEntry.logoutTime = Sequelize.literal("FORMAT(GETDATE(), 'yyyy-MM-dd HH:mm:ss')");

    await logEntry.save();

    res.json({ success: true, message: "Logout successful" });

  } catch (error) {
    console.error("Error updating logout time:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
app.get("/api/company", async (req, res) => {
  try {
    const company = await Company.findOne(); // ✅ Ensure table has at least 1 record
    if (!company) {
      return res.status(404).json({ message: "Company details not found" });
    }
    res.json({ header: company.header, footer: company.footer });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


app.listen(5000, () => console.log("Server running on port 5000"));