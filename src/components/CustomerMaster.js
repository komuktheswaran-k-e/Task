import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import "./CustomerMaster.css"; // Import CSS for styling

const CustomerMaster = () => {
  const [customerID] = useState(Date.now()); // Temporary ID, backend should handle this
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
  const [message, setMessage] = useState(""); // To display success/failure messages

  useEffect(() => {
    // Fetch country and state data (Replace with API call)
    setCountries([
      { id: "1", name: "India" },
      { id: "2", name: "USA" },
    ]);
    setStates([
      { id: "101", name: "Maharashtra", countryID: "1" },
      { id: "102", name: "Gujarat", countryID: "1" },
      { id: "201", name: "California", countryID: "2" },
    ]);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/customers", {
        customerID,
        ...formData,
      });
      console.log("Response:", response.data);

      if (response.data.success) {
        setMessage("Customer added successfully!");
      } else {
        setMessage("Failed to add customer.");
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      setMessage("Error saving customer.");
    }
  };

  return (
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
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>State:</label>
          <select name="stateID" onChange={handleChange} required>
            <option value="">Select State</option>
            {states
              .filter((state) => state.countryID === formData.countryID)
              .map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
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
          <input
            type="text"
            name="jobFrequency"
            placeholder="Enter Job Frequency"
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Active:</label>
          <select name="active" onChange={handleChange}>
            <option value="Y">Yes</option>
            <option value="N">No</option>
          </select>
        </div>
        <div className="form-group full-width">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default CustomerMaster;
