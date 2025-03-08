import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CountryMaster.css";

import Header from "./header";
import Footer from "./footer";

const CountryMaster = () => {
  const [formData, setFormData] = useState({ CountryID: "", CountryName: "" });
  const [countries, setCountries] = useState([]);
  const [editingID, setEditingID] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch countries from the database
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://103.38.50.149:5001/api/countries"
      );
      setCountries(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching countries:", error);
      setLoading(false);
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
      if (editingID) {
        // Update existing country
        const response = await axios.put(`api/countries/${editingID}`, {
          CountryName: formData.CountryName,
        });
        if (response.data.success) {
          setMessage("Country updated successfully!");
        }
      } else {
        // Add new country
        const response = await axios.post("api/countries", {
          CountryName: formData.CountryName,
        });
        if (response.data.success) {
          setMessage("Country added successfully!");
        }
      }
      fetchCountries(); // Refresh the list
    } catch (error) {
      console.error("Error saving country:", error);
      setMessage("Error saving country.");
    }

    setFormData({ CountryID: "", CountryName: "" }); // Reset form
    setEditingID(null);
  };

  // Handle Edit
  const handleEdit = (country) => {
    setFormData({
      CountryID: country.CountryID,
      CountryName: country.CountryName,
    });
    setEditingID(country.CountryID);
  };

  // Handle Delete
  const handleDelete = async (CountryID) => {
    if (!CountryID) {
      console.error("Error: CountryID is undefined");
      return;
    }

    try {
      await axios.delete(
        `https://103.38.50.149:5001/api/countries/${CountryID}`
      );
      setMessage("Country deleted successfully!");
      fetchCountries(); // Refresh the list
    } catch (error) {
      console.error("Error deleting country:", error);
      setMessage("Error deleting country.");
    }
  };

  return (
    <div className="country-container">
      {/* ✅ Header */}
      <Header />
      <h2>Country Master</h2>
      {message && <p className="message">{message}</p>}

      <form className="country-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Country Name:</label>
          <input
            type="text"
            name="CountryName"
            value={formData.CountryName || ""}
            placeholder="Enter Country Name"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group full-width">
          <button type="submit">{editingID ? "Update" : "Submit"}</button>
        </div>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        countries.length > 0 && (
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
                      <button onClick={() => handleEdit(country)}>Edit</button>
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
        )
      )}

      {/* ✅ Footer */}
      <Footer />
    </div>
  );
};

export default CountryMaster;
