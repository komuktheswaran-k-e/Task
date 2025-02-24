import React, { useState } from "react";
import "./jobMaster.css"; // Ensure CSS is applied

const JobMaster = () => {
  const [formData, setFormData] = useState({
    jobID: "",
    jobName: "",
    jobTypeID: "",
  });

  const [jobs, setJobs] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingIndex !== null) {
      // Update existing job
      const updatedJobs = [...jobs];
      updatedJobs[editingIndex] = formData;
      setJobs(updatedJobs);
      setEditingIndex(null);
    } else {
      // Add new job
      setJobs([...jobs, formData]);
    }

    // Reset form
    setFormData({ jobID: "", jobName: "", jobTypeID: "" });
  };

  const handleEdit = (index) => {
    setFormData(jobs[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const filteredJobs = jobs.filter((_, i) => i !== index);
    setJobs(filteredJobs);
  };

  return (
    <div className="job-container">
      <h2>Job Master</h2>
      <form className="job-form" onSubmit={handleSubmit}>
      
        <div className="form-group">
          <label>Job Name:</label>
          <input
            type="text"
            name="jobName"
            value={formData.jobName}
            placeholder="Enter Job Name"
            onChange={handleChange}
            required
          />
        </div>
     
        <div className="form-group full-width">
          <button type="submit">{editingIndex !== null ? "Update" : "Submit"}</button>
        </div>
      </form>

      {/* Display Job List */}
      {jobs.length > 0 && (
        <div className="job-list">
          <h3>Job List</h3>
          <table>
            <thead>
              <tr>
                <th>Job Name</th>
                
                
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, index) => (
                <tr key={index}>
                  
                  <td>{job.jobName}</td>
                  
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

export default JobMaster;
