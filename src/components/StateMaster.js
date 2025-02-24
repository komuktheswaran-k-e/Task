import React, { useState, useEffect } from "react";
import "./state.css"; // CSS for styling

const StateMaster = () => {
  const [formData, setFormData] = useState({
    stateID: "",
    stateName: "",
    countryID: "",
  });

  const [countries, setCountries] = useState([]);

  useEffect(() => {
    // Fetch country data (Replace with API call)
    setCountries([
      { id: "1", name: "India" },
      { id: "2", name: "USA" },
    ]);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("State Data Submitted:", formData);
  };

  return (
    <div className="state-container">
      <h2>State Master</h2>
      <form className="state-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>State ID:</label>
          <input
            type="text"
            name="stateID"
            placeholder="Enter State ID"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>State Name:</label>
          <input
            type="text"
            name="stateName"
            placeholder="Enter State Name"
            onChange={handleChange}
            required
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
        <div className="form-group full-width">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default StateMaster;
