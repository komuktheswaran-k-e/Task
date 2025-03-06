import React, { useState, useEffect } from "react";
import axios from "axios";
import "./state.css";

const StateMaster = () => {
  const [formData, setFormData] = useState({
    stateName: "",
    countryID: "",
  });

  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [editingStateID, setEditingStateID] = useState(null);
  const [message, setMessage] = useState("");

  // ✅ New state to manage selected state during edit
  const [selectedState, setSelectedState] = useState({
    stateName: "",
    CountryID: "",
  });

  // Fetch States and Countries on Load
  useEffect(() => {
    fetchStates();
    fetchCountries();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await axios.get("/api/states");
      setStates(response.data);
      console.log("Fetched States:", response.data);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get("/api/countries");
      setCountries(response.data);
      console.log("Fetched Countries:", response.data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const handleChange = (e) => {
    setSelectedState({ ...selectedState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data:", selectedState);
    const updatedState = {
      StateName: selectedState.stateName, // Ensure it matches backend field
      CountryID: selectedState.CountryID,
    };
    console.log("Updated State:", updatedState);

    try {
      if (editingStateID) {
        await axios.put(`api/states/${editingStateID}`, updatedState);
        setMessage("State updated successfully!");
      } else {
        await axios.post("api/states", selectedState);
        setMessage("State added successfully!");
      }

      fetchStates();
      setSelectedState({ StateName: "", CountryID: "" });
      setEditingStateID(null);
    } catch (error) {
      console.error("Error saving state:", error);
      setMessage("Error saving state.");
    }
  };

  const handleEdit = (state) => {
    console.log("Editing state:", state);
    setSelectedState({
      stateName: state.StateName,
      CountryID: state.CountryID, // ✅ Use CountryID, not CountryName
    });
    setEditingStateID(state.StateID);
  };

  const handleDelete = async (stateID) => {
    if (!stateID) {
      console.error("Error: stateID is undefined!");
      setMessage("Error deleting state. State ID is missing.");
      return;
    }

    console.log("Deleting state with ID:", stateID);
    try {
      await axios.delete(`api/states/${stateID}`);
      setMessage("State deleted successfully!");
      fetchStates();
    } catch (error) {
      console.error("Error deleting state:", error);
      setMessage("Error deleting state.");
    }
  };

  return (
    <div className="state-container">
      <h2>State Master</h2>
      {message && <p className="message">{message}</p>}

      {/* Form Section */}
      <form className="state-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="stateName"
            value={selectedState.stateName || ""}
            placeholder="Enter State Name"
            onChange={handleChange}
            required
          />
        </div>

        {/* Dropdown for Country Selection */}
        <div className="form-group">
          <label>Country Name:</label>
          <select
            name="CountryID"
            value={selectedState.CountryID || ""}
            onChange={handleChange}
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.CountryID} value={country.CountryID}>
                {country.CountryName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <button type="submit">{editingStateID ? "Update" : "Submit"}</button>
        </div>
      </form>

      {/* State List Table */}
      {states.length > 0 && (
        <div className="state-list">
          <h3>State List</h3>
          <table>
            <thead>
              <tr>
                <th>State Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {states.map((state) => (
                <tr key={state.StateID}>
                  <td>{state.StateName}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(state)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(state.StateID)}
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

export default StateMaster;
