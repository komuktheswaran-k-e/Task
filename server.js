require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const moment = require("moment-timezone");
const sql = require("mssql");
const jwt = require("jsonwebtoken");

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

// Connection pool
let pool;
async function connectDB() {
  try {
    pool = await sql.connect(config);
    console.log("Connected to SQL Server");
  } catch (err) {
    console.error("Database Connection Error:", err);
  }
}
// Proper startup sequence
connectDB(); // Handle connection failures
// Execute SQL queries safely
async function executeQuery(query, inputs = []) {
  await connectDB();
  try {
    const request = pool.request();
    inputs.forEach(({ name, type, value }) => request.input(name, type, value));
    return await request.query(query);
  } catch (error) {
    console.error("SQL Query Error:", error);
    throw error;
  }
}

// ==================== Error Handling ====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Internal Server Error", details: err.message });
});

// ==================== Authentication Endpoints ====================
// ✅ Login API
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    let pool = await sql.connect(config);
    let userResult = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM Users WHERE username = @username");

    if (userResult.recordset.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const user = userResult.recordset[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const JWT_SECRET = "hello";

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env file");
      return res
        .status(500)
        .json({ success: false, message: "Server error: Missing secret key" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Fix login time format
    const logDate = moment().format("YYYY-MM-DD"); // YYYY-MM-DD
    const loginTime = moment().format("YYYY-MM-DD HH:mm:ss"); // Correct DATETIME format

    let logResult = await pool
      .request()
      .input("employeeID", sql.Int, user.id)
      .input("logDate", sql.Date, logDate)
      .input("loginTime", sql.DateTime, loginTime)
      .input("clientIp", sql.VarChar, clientIp)
      .query(
        "INSERT INTO Logs (employeeID, logDate, loginTime, clientIp) OUTPUT INSERTED.logID VALUES (@employeeID, @logDate, @loginTime, @clientIp)"
      );

    res.json({
      success: true,
      message: "Login successful",
      token,
      username: user.username,
      logID: logResult.recordset[0].logID,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    const { logID } = req.body;
    await executeQuery(
      "UPDATE Logs SET logoutTime = @logoutTime WHERE logID = @logID",
      [
        { name: "logID", type: sql.Int, value: logID },
        {
          name: "logoutTime",
          type: sql.DateTime,
          value: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
        },
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
  console.log(req.body);
  try {
    const { CountryName } = req.body;
    await executeQuery(
      "INSERT INTO CountryMasters (CountryName) VALUES (@CountryName)",
      [{ name: "CountryName", type: sql.VarChar, value: CountryName }]
    );
    res.status(201).json({ message: "Country created successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
  console.log("res", res);
  console.log("req", req);
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
    console.log("Request received:", req.body); // Log the request body
    const { StateName, CountryID } = req.body;

    if (!StateName || !CountryID) {
      return res
        .status(400)
        .json({ error: "StateName and CountryID are required" });
    }

    await executeQuery(
      "INSERT INTO StateMasters (StateName, CountryID) VALUES (@StateName, @CountryID)",
      [
        { name: "StateName", type: sql.VarChar, value: StateName },
        { name: "CountryID", type: sql.Int, value: parseInt(CountryID) },
      ]
    );

    res.status(201).json({ message: "State created successfully" });
  } catch (error) {
    console.error("Database error:", error); // Log the actual error
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
  const {
    customerID,
    customerName,
    address1,
    address2,
    address3,
    city,
    stateID,
    countryID,
    pincode,
    gstNo,
    mobileNo,
    emailID,
    active,
    jobName,
    jobFrequency,
  } = req.body;

  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    // Insert into CustomerMasters
    const customerQuery = `
      INSERT INTO dbo.CustomerMasters 
      (CustomerID, CustomerName, Address1, Address2, Address3, City, StateID, CountryID, 
       Pincode, GSTNo, MobileNo, EmailID, Active)
      VALUES (@CustomerID, @CustomerName, @Address1, @Address2, @Address3, @City, 
              @StateID, @CountryID, @Pincode, @GSTNo, @MobileNo, @EmailID, @Active)
    `;

    await transaction
      .request()
      .input("CustomerID", sql.VarChar, customerID)
      .input("CustomerName", sql.NVarChar, customerName)
      .input("Address1", sql.NVarChar, address1)
      .input("Address2", sql.NVarChar, address2)
      .input("Address3", sql.NVarChar, address3)
      .input("City", sql.NVarChar, city)
      .input("StateID", sql.Int, stateID)
      .input("CountryID", sql.Int, countryID)
      .input("Pincode", sql.NVarChar, pincode)
      .input("GSTNo", sql.NVarChar, gstNo)
      .input("MobileNo", sql.NVarChar, mobileNo)
      .input("EmailID", sql.NVarChar, emailID)
      .input("Active", sql.Char, active)
      .query(customerQuery);

    // Insert into CustomerJobMaster if Job Name & Frequency provided
    if (jobName && jobFrequency) {
      const jobQuery = `
        INSERT INTO dbo.CustomerJobMaster (CustomerID, JobName, JobFrequency)
        VALUES (@CustomerID, @JobName, @JobFrequency)
      `;

      await transaction
        .request()
        .input("CustomerID", sql.VarChar, customerID)
        .input("JobName", sql.NVarChar, jobName)
        .input("JobFrequency", sql.NVarChar, jobFrequency)
        .query(jobQuery);
    }

    await transaction.commit();
    res.json({ success: true, message: "Customer added successfully!" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error adding customer:", error);
    res.status(500).json({ error: "Failed to add customer" });
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

app.put("/api/jobtypes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { jobTypeName } = req.body;

    await executeQuery(
      "UPDATE JobTypeMasters SET jobTypeName = @jobTypeName WHERE jobTypeID = @id",
      [
        { name: "jobTypeName", type: sql.VarChar, value: jobTypeName },
        { name: "id", type: sql.Int, value: id },
      ]
    );

    res.json({ message: "Job type updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
  console.log("req", req);
  console.log("res", res);
});

app.delete("/api/jobtypes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery("DELETE FROM JobTypeMasters WHERE jobTypeID = @id", [
      { name: "id", type: sql.Int, value: id },
    ]);

    res.json({ message: "Job type deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
  console.log("req", req);
  console.log("res", res);
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

app.put("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { jobTypeID, jobName, frequency, recurringDate } = req.body;

    await executeQuery(
      `UPDATE JobMasters 
       SET jobTypeID = @jobTypeID, 
           jobName = @jobName, 
           frequency = @frequency, 
           recurringDate = @recurringDate
       WHERE jobID = @id`,
      [
        { name: "jobTypeID", type: sql.Int, value: jobTypeID },
        { name: "jobName", type: sql.VarChar, value: jobName },
        { name: "frequency", type: sql.VarChar, value: frequency },
        { name: "recurringDate", type: sql.DateTime, value: recurringDate },
        { name: "id", type: sql.Int, value: id },
      ]
    );

    res.json({ message: "Job updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery("DELETE FROM JobMasters WHERE jobID = @id", [
      { name: "id", type: sql.Int, value: id },
    ]);

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get All Users (Employees)
app.get("/api/employees", async (req, res) => {
  try {
    const result = await executeQuery(
      "SELECT id, username, employeeName FROM Users"
    );
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Add User (Employee)
app.post("/api/employees", async (req, res) => {
  try {
    const { username, password, employeeName } = req.body;
    await executeQuery(
      `INSERT INTO Users (username, password, employeeName) 
       VALUES (@username, @password, @employeeName)`,
      [
        { name: "username", type: sql.VarChar, value: username },
        { name: "password", type: sql.VarChar, value: password },
        { name: "employeeName", type: sql.VarChar, value: employeeName },
      ]
    );
    res.status(201).json({ message: "Employee added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update User (Employee)
app.put("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, employeeName } = req.body;

    let query = `UPDATE Users 
                 SET username = @username, 
                     employeeName = @employeeName`;

    const params = [
      { name: "username", type: sql.VarChar, value: username },
      { name: "employeeName", type: sql.VarChar, value: employeeName },
      { name: "id", type: sql.Int, value: id },
    ];

    if (password) {
      query += `, password = @password`;
      params.push({ name: "password", type: sql.VarChar, value: password });
    }

    query += ` WHERE id = @id`;

    await executeQuery(query, params);
    res.json({ message: "Employee updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete User (Employee)
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await executeQuery("DELETE FROM Users WHERE id = @id", [
      { name: "id", type: sql.Int, value: id },
    ]);
    res.json({ message: "Employee deleted successfully" });
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

app.post("/api/customer-jobs", async (req, res) => {
  try {
    const { customerID, jobID, jobFrequency, jobDate, employeeID } = req.body;

    // Validate request body
    if (!customerID || !jobID || !jobFrequency || !jobDate || !employeeID) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await executeQuery(
      `INSERT INTO CustomerJobMaster (customerID, jobID, jobFrequency, jobDate, employeeID) 
       VALUES (@customerID, @jobID, @jobFrequency, @jobDate, @employeeID)`,
      [
        { name: "customerID", type: sql.NVarChar, value: customerID },
        { name: "jobID", type: sql.Int, value: jobID },
        { name: "jobFrequency", type: sql.VarChar, value: jobFrequency },
        { name: "jobDate", type: sql.Date, value: jobDate },
        { name: "employeeID", type: sql.Int, value: employeeID },
      ]
    );

    res.status(201).json({ message: "Customer job created successfully" });
  } catch (error) {
    console.error("Error in /api/customer-jobs:", error);
    res.status(500).json({ error: error.message });
  }
  console.log("req", req);
  console.log("res", res);
});

// Update a customer job
app.put("/api/customer-jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { customerID, jobID, jobFrequency, jobDate, employeeID } = req.body;

    if (!customerID || !jobID || !jobFrequency || !jobDate || !employeeID) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await executeQuery(
      `UPDATE CustomerJobMaster 
       SET customerID = @customerID, jobID = @jobID, jobFrequency = @jobFrequency, 
           jobDate = @jobDate, employeeID = @employeeID
       WHERE customerJobID = @id`,
      [
        { name: "customerID", type: sql.NVarChar, value: customerID },
        { name: "jobID", type: sql.Int, value: jobID },
        { name: "jobFrequency", type: sql.VarChar, value: jobFrequency },
        { name: "jobDate", type: sql.Date, value: jobDate },
        { name: "employeeID", type: sql.Int, value: employeeID },
        { name: "id", type: sql.Int, value: id },
      ]
    );

    res.json({ message: "Customer job updated successfully" });
  } catch (error) {
    console.error("Error in /api/customer-jobs:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a customer job
app.delete("/api/customer-jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery(
      `DELETE FROM CustomerJobMaster WHERE customerJobID = @id`,
      [{ name: "id", type: sql.Int, value: id }] // ✅ Pass an array with SQL type
    );

    res.json({ message: "Customer job deleted successfully" });
  } catch (error) {
    console.error("Error in /api/customer-jobs:", error);
    res.status(500).json({ error: error.message });
  }
  console.log("req", req);
  console.log("res", res);
});

// ==================== Company API ====================
app.get("/api/company", async (req, res) => {
  try {
    const result = await executeQuery("SELECT * FROM company_details");
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Company details not found" });
    }
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to server.js
app.get("/api/health", (req, res) => {
  res.json({
    status: pool ? "healthy" : "unhealthy",
    dbConnected: !!pool,
    uptime: process.uptime(),
  });
});

// ==================== Server Setup ====================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("Server running on port ${PORT}"));
