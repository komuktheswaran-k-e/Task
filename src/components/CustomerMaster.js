import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CustomerMaster.css";
import { v4 as uuidv4 } from "uuid";

const CustomerMaster = () => {
  const [customerID] = useState(uuidv4()); // Generate a unique ID
  const [formData, setFormData] = useState({
    customerName: "",
    address1: "",
    address2: "",
    address3: "",
    city: "",
    stateID: "",
    countryID: "",
    pincode: "",
    gstNo: "",
    mobileNo: "",
    emailID: "",
    active: "Y",
    jobName: "",
    jobFrequency: "",
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCountries();
    fetchCustomers();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await axios.get("api/countries");
      setCountries(response.data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchStates = async (countryID) => {
    try {
      console.log("Fetching states for country:", countryID);
      const response = await axios.get(
        `api/states/${countryID}`
      );
      console.log("States response:", response.data);
      setStates(response.data);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("api/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      let updatedData = { ...prevData, [name]: value };

      if (name === "countryID") {
        const selectedCountry = countries.find((c) => c.CountryID === value);
        updatedData = {
          ...updatedData,
          countryName: selectedCountry ? selectedCountry.CountryName : "",
          stateID: "", // Reset State when Country changes
          stateName: "",
        };
        fetchStates(value);
      }

      if (name === "stateID") {
        const selectedState = states.find((s) => s.StateID === value);
        updatedData = {
          ...updatedData,
          stateName: selectedState ? selectedState.StateName : "",
        };
      }

      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/customers", {
        customerID,
        ...formData,
      });

      if (response.data.success) {
        setMessage("Customer added successfully!");
        fetchCustomers(); // Refresh customer list
      } else {
        setMessage("Failed to add customer.");
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      setMessage("Error saving customer.");
    }
  };

  return (
    <div>
      {/* Customer Form */}
      <div className="customer-container">
        <h2>Customer Details</h2>
        {message && <p className="message">{message}</p>}
        <form className="customer-form" onSubmit={handleSubmit}>
          <div className="form-group" style={{ display: "none" }}>
            <label>Customer ID:</label>
            <input type="text" value={customerID} disabled />
          </div>
          <div className="form-group">
            <label>Customer Name:</label>
            <input
              type="text"
              name="customerName"
              placeholder="Enter Name"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Address 1:</label>
            <input
              type="text"
              name="address1"
              placeholder="Enter Address"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Address 2:</label>
            <input
              type="text"
              name="address2"
              placeholder="Enter Address"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Address 3:</label>
            <input
              type="text"
              name="address3"
              placeholder="Enter Address"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>City:</label>
            <input
              type="text"
              name="city"
              placeholder="Enter City"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Country:</label>
            <select name="countryID" onChange={handleChange} required>
              <option value="">Select Country</option>
              {countries && countries.length > 0 ? (
                countries.map((country) => (
                  <option key={country.CountryID} value={country.CountryID}>
                    {country.CountryName}
                  </option>
                ))
              ) : (
                <option disabled>Loading countries...</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label>State:</label>
            <select name="stateID" onChange={handleChange} required>
              <option value="">Select state</option>
              {states && states.length > 0 ? (
                states.map((State) => (
                  <option key={State.StateID} value={State.StateID}>
                    {State.StateName}
                  </option>
                ))
              ) : (
                <option disabled>Loading states...</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label>Pincode:</label>
            <input
              type="text"
              name="pincode"
              placeholder="Enter Pincode"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>GST No:</label>
            <input
              type="text"
              name="gstNo"
              placeholder="Enter GST No"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Mobile No:</label>
            <input
              type="text"
              name="mobileNo"
              placeholder="Enter Mobile No"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email ID:</label>
            <input
              type="email"
              name="emailID"
              placeholder="Enter Email ID"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Job Name:</label>
            <input
              type="text"
              name="jobName"
              placeholder="Enter Job Name"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Job Frequency:</label>
            <select name="active" onChange={handleChange}>
              <option value="">Select Frequency</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Fortnight">Fortnight</option>
              <option value="Monthly">Monthly</option>
              <option value="QuarterlyN">Quarterly</option>
              <option value="HalfYearly">HalfYearly</option>
              <option value="Annual">Annual</option>
            </select>
          </div>
          <div className="form-group">
            <label>Active:</label>
            <select name="active" onChange={handleChange}>
              <option value="">Select Active</option>
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>
          <div className="form-group full-width">
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>

      {/* Customer List - Separate from Form */}
      <div className="customer-list-container">
        <h2>Customer List</h2>
        <table border="1">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Address</th>
              <th>City</th>
              <th>State ID</th>
              <th>Country ID</th>
              <th>Pincode</th>
              <th>GST No</th>
              <th>Mobile No</th>
              <th>Email</th>
              <th>Job Name</th>
              <th>Job Frequency</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.customerID}>
                  <td>{customer.customerName}</td>
                  <td>{`${customer.address1}, ${customer.address2}, ${customer.address3}`}</td>
                  <td>{customer.city}</td>
                  <td>{customer.stateID}</td>
                  <td>{customer.countryID}</td>
                  <td>{customer.pincode}</td>
                  <td>{customer.gstNo}</td>
                  <td>{customer.mobileNo}</td>
                  <td>{customer.emailID}</td>
                  <td>{customer.jobName}</td>
                  <td>{customer.jobFrequency}</td>
                  <td>{customer.active}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerMaster;
