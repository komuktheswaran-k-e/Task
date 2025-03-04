


import React, { useState } from "react";
import "./jobtype.css"; // Ensure CSS is applied

const JobTypeMaster = () => {
  const [formData, setFormData] = useState({
    jobTypeID: "",
    jobTypeName: "",
    frequency: "",
    recurringDate: "",
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
    setFormData({ jobTypeID: "", jobTypeName: "", frequency: "", recurringDate: "" });
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
      <h2>Job Master</h2>
      <form className="jobtype-form" onSubmit={handleSubmit}>
        {/* Job Type Name */}
        <div className="form-group">
          <label>Job Name:</label>
          <input
            type="text"
            name="jobTypeName"
            value={formData.jobTypeName}
            placeholder="Enter Job  Name"
            onChange={handleChange}
            required
          />
        </div>

        {/* Frequency Dropdown */}
        <div className="form-group">
          <label>Frequency:</label>
          <select name="frequency" value={formData.frequency} onChange={handleChange} required>
            <option value="">Select Frequency</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Fortnightly">Fortnightly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Half-Yearly">Half-Yearly</option>
            <option value="Annually">Annually</option>
          </select>
        </div>
        <div className="form-group">
          <label>JobType Name:</label>
          <select name="frequency" value={formData.frequency} onChange={handleChange} required>
            <option value="">Select Name</option>
            <option value="Daily">****</option>
            <option value="Weekly">yyyy</option>
            
          </select>
        </div>

        {/* Recurring Date (Enabled only if Frequency is selected) */}
        <div className="form-group">
          <label>Recurring Date:</label>
          <input
            type="date"
            name="recurringDate"
            value={formData.recurringDate}
            onChange={handleChange}
            disabled={!formData.frequency} // Disable input if no frequency is selected
            required
          />
        </div>

        {/* Submit Button */}
        <div className="form-group full-width">
          <button type="submit">{editingIndex !== null ? "Update" : "Submit"}</button>
        </div>
      </form>

      {/* Display Job Type List */}
      {jobTypes.length > 0 && (
        <div className="jobtype-list">
          <h3>Job Master List</h3>
          <table>
            <thead>
              <tr>
                <th>Job  Name</th>
                <th>Frequency</th>
                <th>Recurring Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobTypes.map((jobType, index) => (
                <tr key={index}>
                  <td>{jobType.jobTypeName}</td>
                  <td>{jobType.frequency}</td>
                  <td>{jobType.recurringDate}</td>
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
       {/* <div className="form-group">
          <label>Job Type ID:</label>
          <input
            type="text"
            name="jobTypeID"
            value={formData.jobTypeID}
            placeholder="Enter Job Type ID"
            onChange={handleChange}
            required
          />
        </div> */}