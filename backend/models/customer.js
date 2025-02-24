const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Customer = sequelize.define("Customer", {
  customerID: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address1: DataTypes.STRING,
  address2: DataTypes.STRING,
  address3: DataTypes.STRING,
  city: DataTypes.STRING,
  stateID: DataTypes.STRING,
  countryID: DataTypes.STRING,
  pincode: DataTypes.STRING,
  gstNo: DataTypes.STRING,
  mobileNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  emailID: DataTypes.STRING,
  active: {
    type: DataTypes.STRING,
    defaultValue: "Y",
  },
  jobName: DataTypes.STRING,
  jobFrequency: DataTypes.STRING,
});

sequelize
  .sync()
  .then(() => console.log("✅ Customers Table Created"))
  .catch((err) => console.error("❌ Error Creating Table:", err));

module.exports = Customer;
