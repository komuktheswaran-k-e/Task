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
const Customer = sequelize.define(
  "CustomerMasters",
  {
    customerID: { type: DataTypes.STRING, primaryKey: true },
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
  },
  {
    tableName: "CustomerMasters", // Ensure correct table mapping
    timestamps: false, // Disable Sequelize's automatic timestamps
  }
);

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

StateMaster.belongsTo(CountryMaster, {
  foreignKey: "CountryID",
  targetKey: "CountryID",
});
CountryMaster.hasMany(StateMaster, {
  foreignKey: "CountryID",
  sourceKey: "CountryID",
});

// Define JobTypeMaster Model
const JobTypeMaster = sequelize.define(
  "JobTypeMasters",
  {
    jobTypeID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jobTypeName: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: "JobTypeMasters", timestamps: false }
);

// Define JobMaster Model
const JobMaster = sequelize.define(
  "JobMasters",
  {
    jobID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    jobTypeID: { type: DataTypes.INTEGER, allowNull: false },
    jobName: { type: DataTypes.STRING, allowNull: false },
    frequency: { type: DataTypes.STRING, allowNull: false },
    recurringDate: { type: DataTypes.DATE },
  },
  { tableName: "JobMasters", timestamps: false }
);

// Establish relationship with JobTypeMaster
JobMaster.belongsTo(JobTypeMaster, { foreignKey: "jobTypeID" });
JobTypeMaster.hasMany(JobMaster, { foreignKey: "jobTypeID" });

// Define CustomerJobMaster Model
const CustomerJobMaster = sequelize.define(
  "CustomerJobMaster",
  {
    customerJobID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customerID: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: Customer, key: "customerID" },
    },
    jobID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: JobMaster, key: "jobID" },
    },
    jobFrequency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jobDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    employeeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
  },
  { tableName: "CustomerJobMaster", timestamps: false }
);

// Define relationships
CustomerJobMaster.belongsTo(Customer, { foreignKey: "customerID" });
CustomerJobMaster.belongsTo(JobMaster, { foreignKey: "jobID" });
CustomerJobMaster.belongsTo(User, { foreignKey: "employeeID" });

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
//list all countries
app.get("/api/countries", async (req, res) => {
  try {
    const countries = await CountryMaster.findAll();
    res.json(countries);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//list states
app.get("/api/states", async (req, res) => {
  try {
    const states = await StateMaster.findAll({
      attributes: ["StateID", "StateName", "CountryID"],
      include: [
        {
          model: CountryMaster,
          attributes: ["CountryName"], // ✅ Fetching CountryName
        },
      ],
    });
    res.json(states);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//list states with countries
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

app.put("/api/states/:id", async (req, res) => {
  console.log("req.params", req.params);
  try {
    const { id } = req.params;
    const { StateName, CountryID } = req.body;

    const state = await StateMaster.findByPk(id);
    if (!state) {
      return res
        .status(404)
        .json({ success: false, message: "State not found" });
    }

    await state.update({ StateName, CountryID });
    console.log("state", state);
    res.json({ success: true, message: "State updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/states/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the state by primary key
    const state = await StateMaster.findByPk(id);
    if (!state) {
      return res
        .status(404)
        .json({ success: false, message: "State not found" });
    }

    // Delete the state
    await state.destroy();
    res.json({ success: true, message: "State deleted successfully" });
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
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: user.id }, "your_secret_key", {
      expiresIn: "1h",
    });
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ message: "Login Failed" });
  }
});

// **Fetch all job types**
app.get("/api/jobtypes", async (req, res) => {
  try {
    const jobs = await JobTypeMaster.findAll();
    res.json(jobs);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// **Create a new job type**
app.post("/api/jobtypes", async (req, res) => {
  try {
    const { jobTypeName } = req.body;
    const newJob = await JobTypeMaster.create({ jobTypeName });
    res.json(newJob);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// **Update job type**
app.put("/api/jobtypes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { jobTypeName } = req.body;
    const job = await JobTypeMaster.findByPk(id);
    if (!job) {
      return res.status(404).json({ error: "Job type not found" });
    }
    await job.update({ jobTypeName });
    res.json({ success: true, message: "Job type updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// **Delete job type**
app.delete("/api/jobtypes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobTypeMaster.findByPk(id);
    if (!job) {
      return res.status(404).json({ error: "Job type not found" });
    }
    await job.destroy();
    res.json({ success: true, message: "Job type deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API: Fetch all jobs with job type details
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await JobMaster.findAll({
      include: [
        {
          model: JobTypeMaster,
          attributes: ["jobTypeName"], // Fetch job type name
        },
      ],
    });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// API: Create a new job
app.post("/api/jobs", async (req, res) => {
  console.log("req.body", req.body);
  try {
    const { jobTypeID, jobName, frequency, recurringDate } = req.body;

    if (!jobTypeID || !jobName || !frequency) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newJob = await JobMaster.create({
      jobTypeID: parseInt(jobTypeID),
      jobName,
      frequency,
      recurringDate,
    });

    res.status(201).json({ success: true, data: newJob });
  } catch (error) {
    console.error("Error adding job:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// API: Update a job
app.put("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { jobTypeID, jobName, frequency, recurringDate } = req.body;

    const job = await JobMaster.findByPk(id);
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });

    await job.update({ jobTypeID, jobName, frequency, recurringDate });
    res.json({ success: true, message: "Job updated successfully" });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// API: Delete a job
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobMaster.findByPk(id);
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });

    await job.destroy();
    res.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/api/customer-jobs", async (req, res) => {
  try {
    const customerJobs = await CustomerJobMaster.findAll({
      include: [
        { model: Customer, attributes: ["customerID", "customerName"] },
        { model: JobMaster, attributes: ["jobID", "jobName"] },
        { model: User, attributes: ["id", "username"] },
      ],
    });
    res.json(customerJobs);
  } catch (error) {
    console.error("Error fetching customer jobs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
  console.log("res", res);
});

// Fetch employees for dropdown
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await User.findAll({
      attributes: ["id", "username"],
    });
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new Customer Job
app.post("/api/customer-jobs", async (req, res) => {
  try {
    const { customerID, jobID, jobFrequency, jobDate, employeeID } = req.body;
    const newCustomerJob = await CustomerJobMaster.create({
      customerID,
      jobID,
      jobFrequency,
      jobDate,
      employeeID,
    });
    res.json({ success: true, data: newCustomerJob });
  } catch (error) {
    console.error("Error adding customer job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update an existing Customer Job
app.put("/api/customer-jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { customerID, jobID, jobFrequency, jobDate, employeeID } = req.body;
    const job = await CustomerJobMaster.findByPk(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    await job.update({ customerID, jobID, jobFrequency, jobDate, employeeID });
    res.json({ success: true, message: "Job updated successfully" });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a Customer Job
app.delete("/api/customer-jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const job = await CustomerJobMaster.findByPk(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    await job.destroy();
    res.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 0; // 0 allows the OS to assign an available port

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${server.address().port}`);
});
