import React, { useState, useEffect } from "react";
import "./state.css"; // Ensure CSS is applied

const StateMaster = () => {
  const [formData, setFormData] = useState({
    stateID: "",
    stateName: "",
    
  });

  
  const [states, setStates] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingIndex !== null) {
      // Update existing state
      const updatedStates = [...states];
      updatedStates[editingIndex] = formData;
      setStates(updatedStates);
      setEditingIndex(null);
    } else {
      // Add new state
      setStates([...states, formData]);
    }

    // Reset form
    setFormData({ stateID: "", stateName: "" });
  };

  const handleEdit = (index) => {
    setFormData(states[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const filteredStates = states.filter((_, i) => i !== index);
    setStates(filteredStates);
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
          <button type="submit">{editingIndex !== null ? "Update" : "Submit"}</button>
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
              {states.map((state, index) => (
                <tr key={index}>
                  
                  <td>{state.stateName}</td>
                 
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(index)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(index)}>Delete</button>
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
