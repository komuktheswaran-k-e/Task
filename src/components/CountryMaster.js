import React, { useState } from "react";
import "./CountryMaster.css"; // Import CSS for styling

const CountryMaster = () => {
  const [formData, setFormData] = useState({ countryID: "", countryName: "" });
  const [countries, setCountries] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      // Update existing country
      const updatedCountries = [...countries];
      updatedCountries[editingIndex] = formData;
      setCountries(updatedCountries);
      setEditingIndex(null);
    } else {
      // Add new country
      setCountries([...countries, formData]);
    }
    setFormData({ countryID: "", countryName: "" });
  };

  // Handle Edit
  const handleEdit = (index) => {
    setFormData(countries[index]);
    setEditingIndex(index);
  };

  // Handle Delete
  const handleDelete = (index) => {
    const updatedCountries = countries.filter((_, i) => i !== index);
    setCountries(updatedCountries);
    if (editingIndex === index) {
      setFormData({ countryID: "", countryName: "" });
      setEditingIndex(null);
    }
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
            value={formData.countryID}
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
            value={formData.countryName}
            placeholder="Enter Country Name"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group full-width">
          <button type="submit">{editingIndex !== null ? "Update" : "Submit"}</button>
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
              {countries.map((country, index) => (
                <tr key={index}>
                  <td>{country.countryID}</td>
                  <td>{country.countryName}</td>
                  <td>
                    <button onClick={() => handleEdit(index)}>Edit</button>
                    <button onClick={() => handleDelete(index)} className="delete-btn">Delete</button>
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
