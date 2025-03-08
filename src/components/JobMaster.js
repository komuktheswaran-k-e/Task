import React, { useState, useEffect } from "react";
import axios from "axios";
import "./jobtype.css";
import Header from "./header";
import Footer from "./footer";

const JobMaster = () => {
  const [formData, setFormData] = useState({
    jobTypeID: "",
    jobName: "",
    frequency: "",
    recurringDate: "",
  });
  const [jobs, setJobs] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // Fetch Job Types & Job Master List
  useEffect(() => {
    fetchJobTypes();
    fetchJobs();
  }, []);

  const fetchJobTypes = () => {
    axios
      .get("https://103.38.50.149:5001/api/jobtypes")
      .then((response) => setJobTypes(response.data))
      .catch((error) => console.error("Error fetching job types:", error));
  };

  const fetchJobs = () => {
    axios
      .get("https://103.38.50.149:5001/api/jobs")
      .then((response) => setJobs(response.data))
      .catch((error) => console.error("Error fetching jobs:", error));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const jobTypeID = Number(formData.jobTypeID);
    if (isNaN(jobTypeID) || jobTypeID === 0) {
      alert("Invalid Job Type selected");
      return;
    }

    const newJob = {
      jobTypeID,
      jobName: formData.jobName,
      frequency: formData.frequency,
      recurringDate: formData.recurringDate,
    };

    if (editingIndex !== null) {
      const jobId = jobs[editingIndex]?.jobID || jobs[editingIndex]?.id;
      axios
        .put(`https://103.38.50.149:5001/api/jobs/${jobId}`, newJob)
        .then(() => {
          fetchJobs(); // Fetch updated job list
          resetForm();
        })
        .catch((error) => console.error("Error updating job:", error));
    } else {
      axios
        .post("https://103.38.50.149:5001/api/jobs", newJob)
        .then(() => {
          fetchJobs(); // Fetch updated job list
          resetForm();
        })
        .catch((error) => console.error("Error adding job:", error));
    }
  };

  const resetForm = () => {
    setFormData({
      jobTypeID: "",
      jobName: "",
      frequency: "",
      recurringDate: "",
    });
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    const job = jobs[index];
    setFormData({
      jobTypeID: String(job.jobTypeID),
      jobName: job.jobName,
      frequency: job.frequency,
      recurringDate: job.recurringDate,
    });
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const jobId = jobs[index]?.jobID || jobs[index]?.id;
    axios
      .delete(`https://103.38.50.149:5001/api/jobs/${jobId}`)
      .then(() => fetchJobs()) // Fetch updated job list
      .catch((error) => console.error("Error deleting job:", error));
  };

  return (
    <div className="jobtype-container">
      <h2>Job Master</h2>
      <form className="jobtype-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Job Type:</label>
          <select
            name="jobTypeID"
            value={formData.jobTypeID}
            onChange={handleChange}
            required
          >
            <option value="">Select Job Type</option>
            {jobTypes.map((type) => (
              <option key={type.jobTypeID} value={type.jobTypeID}>
                {type.jobTypeName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Job Name:</label>
          <input
            type="text"
            name="jobName"
            value={formData.jobName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Frequency:</label>
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            required
          >
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
          <label>Recurring Date:</label>
          <input
            type="date"
            name="recurringDate"
            value={formData.recurringDate}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">
          {editingIndex !== null ? "Update" : "Submit"}
        </button>
      </form>

      {jobs.length > 0 && (
        <div className="jobtype-list">
          <h3>Job Master List</h3>
          <table>
            <thead>
              <tr>
                <th>Job Name</th>
                <th>Frequency</th>
                <th>Recurring Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, index) => (
                <tr key={index}>
                  <td>{job.jobName}</td>
                  <td>{job.frequency}</td>
                  <td>{job.recurringDate}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(index)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(index)}
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

export default JobMaster;
