import React, { useState } from "react";
import "./state.css"; // CSS for styling

const CountryMaster = () => {
  const [formData, setFormData] = useState({
    countryID: "",
    countryName: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Country Data Submitted:", formData);
  };

  return (
    <div className="country-container">
      <h2>Country Master</h2>
      <form className="country-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Country ID:</label>
          <input
            type="text"
            name="countryID"
            placeholder="Enter Country ID"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Country Name:</label>
          <input
            type="text"
            name="countryName"
            placeholder="Enter Country Name"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group full-width">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default CountryMaster;
