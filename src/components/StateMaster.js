import React, { useState, useEffect } from "react";
import axios from "axios";
import "./state.css";

const StateMaster = () => {
  const [formData, setFormData] = useState({
    stateID: "",
    stateName: "",
  });
  const [states, setStates] = useState([]);
  const [editingStateID, setEditingStateID] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/states");
      setStates(response.data);
      console.log("States response:", response.data);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStateID) {
        await axios.put(
          `http://localhost:5000/api/states/${editingStateID}`,
          formData
        );
        setMessage("State updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/states", formData);
        setMessage("State added successfully!");
      }
      fetchStates();
      setFormData({ stateID: "", stateName: "" });
      setEditingStateID(null);
    } catch (error) {
      console.error("Error saving state:", error);
      setMessage("Error saving state.");
    }
  };

  const handleEdit = (state) => {
    setFormData({ stateID: state.stateID, stateName: state.stateName });
    setEditingStateID(state.stateID);
  };

  const handleDelete = async (stateID) => {
    try {
      await axios.delete(`http://localhost:5000/api/states/${stateID}`);
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
      <form className="state-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>State ID:</label>
          <input
            type="text"
            name="stateID"
            value={formData.stateID}
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
            value={formData.stateName}
            placeholder="Enter State Name"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group full-width">
          <button type="submit">{editingStateID ? "Update" : "Submit"}</button>
        </div>
      </form>

      {/* Display State List */}
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
                <tr key={state.stateID}>
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
                      onClick={() => handleDelete(state.stateID)}
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
