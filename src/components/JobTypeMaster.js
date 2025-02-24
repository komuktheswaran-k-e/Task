import React, { useState } from "react";
import "./jobtype.css"; // Ensure CSS is applied

const JobTypeMaster = () => {
  const [formData, setFormData] = useState({
    jobTypeID: "",
    jobTypeName: "",
  });

  const [jobTypes, setJobTypes] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingIndex !== null) {
      // Update existing job type
      const updatedJobTypes = [...jobTypes];
      updatedJobTypes[editingIndex] = formData;
      setJobTypes(updatedJobTypes);
      setEditingIndex(null);
    } else {
      // Add new job type
      setJobTypes([...jobTypes, formData]);
    }

    // Reset form
    setFormData({ jobTypeID: "", jobTypeName: "" });
  };

  const handleEdit = (index) => {
    setFormData(jobTypes[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const filteredJobTypes = jobTypes.filter((_, i) => i !== index);
    setJobTypes(filteredJobTypes);
  };

  return (
    <div className="jobtype-container">
      <h2>Job Type Master</h2>
      <form className="jobtype-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Job Type ID:</label>
          <input
            type="text"
            name="jobTypeID"
            value={formData.jobTypeID}
            placeholder="Enter Job Type ID"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Job Type Name:</label>
          <input
            type="text"
            name="jobTypeName"
            value={formData.jobTypeName}
            placeholder="Enter Job Type Name"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group full-width">
          <button type="submit">{editingIndex !== null ? "Update" : "Submit"}</button>
        </div>
      </form>

      {/* Display Job Type List */}
      {jobTypes.length > 0 && (
        <div className="jobtype-list">
          <h3>Job Type List</h3>
          <table>
            <thead>
              <tr>
                
                <th>Job Type Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobTypes.map((jobType, index) => (
                <tr key={index}>
                 
                  <td>{jobType.jobTypeName}</td>
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

export default JobTypeMaster;
