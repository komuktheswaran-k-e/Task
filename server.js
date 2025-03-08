require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const sql = require("mssql");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database configuration
const config = {
  user: "tasksa",
  password: "Task@Sa",
  server: "103.38.50.149",
  port: 5121,
  database: "TaskMaster",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Connection pool management
let pool;
sql
  .connect(config)
  .then((p) => {
    pool = p;
    console.log("Connected to SQL Server");
  })
  .catch((err) => {
    console.error("Database Connection Error:", err);
  });

// Helper function for parameterized queries
async function executeQuery(query, inputs = []) {
  const request = pool.request();
  inputs.forEach(({ name, type, value }) => request.input(name, type, value));
  return await request.query(query);
}

// ==================== Authentication Endpoints ====================
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await executeQuery(
      "SELECT * FROM Users WHERE username = @username",
      [{ name: "username", type: sql.VarChar, value: username }]
    );

    if (!result.recordset.length) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.recordset[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, username }, "secretkey", {
      expiresIn: "1h",
    });

    // Create login log
    const logResult = await executeQuery(
      `INSERT INTO Logs (employeeID, logDate, loginTime, macAddress)
       OUTPUT INSERTED.logID
       VALUES (@employeeID, @logDate, @loginTime, @macAddress)`,
      [
        { name: "employeeID", type: sql.VarChar, value: username },
        {
          name: "logDate",
          type: sql.Date,
          value: moment().format("YYYY-MM-DD"),
        },
        { name: "loginTime", type: sql.DateTime, value: moment().toDate() },
        { name: "macAddress", type: sql.VarChar, value: "00-B0-D0-63-C2-26" },
      ]
    );

    res.json({
      token,
      username,
      logID: logResult.recordset[0].logID,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    const { logID } = req.body;
    await executeQuery(
      "UPDATE Logs SET logoutTime = @logoutTime WHERE logID = @logID",
      [
        { name: "logID", type: sql.Int, value: logID },
        { name: "logoutTime", type: sql.DateTime, value: moment().toDate() },
      ]
    );
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Master Data Endpoints ====================
// Countries
app.get("/api/countries", async (req, res) => {
  try {
    const result = await executeQuery("SELECT * FROM CountryMasters");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/countries", async (req, res) => {
  try {
    const { CountryName } = req.body;
    await executeQuery(
      "INSERT INTO CountryMasters (CountryName) VALUES (@CountryName)",
      [{ name: "CountryName", type: sql.VarChar, value: CountryName }]
    );
    res.status(201).json({ message: "Country created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/countries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { CountryName } = req.body;
    await executeQuery(
      "UPDATE CountryMasters SET CountryName = @CountryName WHERE CountryID = @id",
      [
        { name: "id", type: sql.Int, value: id },
        { name: "CountryName", type: sql.VarChar, value: CountryName },
      ]
    );
    res.json({ message: "Country updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/countries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await executeQuery("DELETE FROM CountryMasters WHERE CountryID = @id", [
      { name: "id", type: sql.Int, value: id },
    ]);
    res.json({ message: "Country deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// States
app.get("/api/states", async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT s.*, c.CountryName 
      FROM StateMasters s
      JOIN CountryMasters c ON s.CountryID = c.CountryID
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/states/:countryID", async (req, res) => {
  try {
    const { countryID } = req.params;
    const result = await executeQuery(
      "SELECT * FROM StateMasters WHERE CountryID = @countryID",
      [{ name: "countryID", type: sql.Int, value: countryID }]
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/states", async (req, res) => {
  try {
    const { StateName, CountryID } = req.body;
    await executeQuery(
      "INSERT INTO StateMasters (StateName, CountryID) VALUES (@StateName, @CountryID)",
      [
        { name: "StateName", type: sql.VarChar, value: StateName },
        { name: "CountryID", type: sql.Int, value: CountryID },
      ]
    );
    res.status(201).json({ message: "State created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/states/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { StateName, CountryID } = req.body;
    await executeQuery(
      "UPDATE StateMasters SET StateName = @StateName, CountryID = @CountryID WHERE StateID = @id",
      [
        { name: "id", type: sql.Int, value: id },
        { name: "StateName", type: sql.VarChar, value: StateName },
        { name: "CountryID", type: sql.Int, value: CountryID },
      ]
    );
    res.json({ message: "State updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/states/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await executeQuery("DELETE FROM StateMasters WHERE StateID = @id", [
      { name: "id", type: sql.Int, value: id },
    ]);
    res.json({ message: "State deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Customer Endpoints ====================
app.get("/api/customers", async (req, res) => {
  try {
    const result = await executeQuery("SELECT * FROM CustomerMasters");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { customerID, customerName, mobileNo } = req.body;
    await executeQuery(
      `INSERT INTO CustomerMasters 
       (customerID, customerName, mobileNo)
       VALUES (@customerID, @customerName, @mobileNo)`,
      [
        { name: "customerID", type: sql.VarChar, value: customerID },
        { name: "customerName", type: sql.VarChar, value: customerName },
        { name: "mobileNo", type: sql.VarChar, value: mobileNo },
      ]
    );
    res.status(201).json({ message: "Customer created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Job Management Endpoints ====================
// Job Types
app.get("/api/jobtypes", async (req, res) => {
  try {
    const result = await executeQuery("SELECT * FROM JobTypeMasters");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/jobtypes", async (req, res) => {
  try {
    const { jobTypeName } = req.body;
    await executeQuery(
      "INSERT INTO JobTypeMasters (jobTypeName) VALUES (@jobTypeName)",
      [{ name: "jobTypeName", type: sql.VarChar, value: jobTypeName }]
    );
    res.status(201).json({ message: "Job type created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT j.*, jt.jobTypeName 
      FROM JobMasters j
      JOIN JobTypeMasters jt ON j.jobTypeID = jt.jobTypeID
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/jobs", async (req, res) => {
  try {
    const { jobTypeID, jobName, frequency, recurringDate } = req.body;
    await executeQuery(
      `INSERT INTO JobMasters 
       (jobTypeID, jobName, frequency, recurringDate)
       VALUES (@jobTypeID, @jobName, @frequency, @recurringDate)`,
      [
        { name: "jobTypeID", type: sql.Int, value: jobTypeID },
        { name: "jobName", type: sql.VarChar, value: jobName },
        { name: "frequency", type: sql.VarChar, value: frequency },
        { name: "recurringDate", type: sql.DateTime, value: recurringDate },
      ]
    );
    res.status(201).json({ message: "Job created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Customer Jobs Endpoints ====================
app.get("/api/customer-jobs", async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT cjm.*, cm.customerName, jm.jobName, u.username
      FROM CustomerJobMaster cjm
      JOIN CustomerMasters cm ON cjm.customerID = cm.customerID
      JOIN JobMasters jm ON cjm.jobID = jm.jobID
      JOIN Users u ON cjm.employeeID = u.id
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Company Endpoints ====================
app.get("/api/company", async (req, res) => {
  try {
    const result = await executeQuery("SELECT * FROM company_details");
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Error Handling ====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Internal Server Error", details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
