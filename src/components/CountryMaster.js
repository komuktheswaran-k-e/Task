import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CountryMaster.css";
import { v4 as uuidv4 } from "uuid";

const CountryMaster = () => {
  const [formData, setFormData] = useState({ CountryID: "", countryName: "" });
  const [countries, setCountries] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch countries from the database
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/countries");
      setCountries(response.data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingIndex !== null) {
        // Update existing country
        const response = await axios.put(
          `http://localhost:5000/api/countries/${formData.countryID}`,
          formData
        );
        if (response.data.success) {
          setMessage("Country updated successfully!");
        }
      } else {
        // Add new country with unique ID
        const newCountry = { ...formData, CountryID: uuidv4() };
        const response = await axios.post(
          "http://localhost:5000/api/countries",
          newCountry
        );
        if (response.data.success) {
          setMessage("Country added successfully!");
        }
      }
      fetchCountries(); // Refresh the list
    } catch (error) {
      console.error("Error saving country:", error);
      setMessage("Error saving country.");
    }

    setFormData({ countryID: "", countryName: "" }); // Reset form
    setEditingIndex(null);
  };

  // Handle Edit
  const handleEdit = (country) => {
    setFormData({ ...country });
    setEditingIndex(country.CountryID);
  };

  // Handle Delete
  const handleDelete = async (CountryID) => {
    if (!CountryID) {
      console.error("Error: countryID is undefined");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/countries/${CountryID}`);
      setMessage("Country deleted successfully!");
      fetchCountries(); // Refresh the list
    } catch (error) {
      console.error("Error deleting country:", error);
      setMessage("Error deleting country.");
    }
  };

  return (
    <div className="country-container">
      <h2>Country Master</h2>
      {message && <p className="message">{message}</p>}

      <form className="country-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Country Name:</label>
          <input
            type="text"
            name="countryName"
            value={formData.countryName || ""}
            placeholder="Enter Country Name"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group full-width">
          <button type="submit">
            {editingIndex !== null ? "Update" : "Submit"}
          </button>
        </div>
      </form>

      {countries.length > 0 && (
        <div className="country-list">
          <h3>Stored Countries</h3>
          <table>
            <thead>
              <tr>
                <th>Country Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <tr key={country.CountryID}>
                  <td>{country.CountryName}</td>
                  <td>
                    <button onClick={() => handleEdit(country.CountryID)}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(country.CountryID)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CountryMaster;
