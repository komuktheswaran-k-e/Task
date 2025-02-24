const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mssql",
    dialectOptions: {
      options: {
        encrypt: false, // Set to true if using Azure SQL
        enableArithAbort: true,
      },
    },
    logging: console.log,
  }
);

sequelize
  .authenticate()
  .then(() => console.log("✅ Database Connected"))
  .catch((err) => console.error("❌ Database Connection Error:", err));

module.exports = sequelize;
