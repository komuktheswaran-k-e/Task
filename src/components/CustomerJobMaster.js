import React, { useState } from 'react';
import './CustomerJobMaster.css'; // Import CSS for styling

const CustomerJobMaster = () => {
  const [formData, setFormData] = useState({
    customerID: '',
    slno: '',
    jobID: '',
    jobFrequency: '',
    jobDate: '',
    employeeID: '',
  });
  const [jobs, setJobs] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      // Update existing job entry
      const updatedJobs = [...jobs];
      updatedJobs[editingIndex] = formData;
      setJobs(updatedJobs);
      setEditingIndex(null);
    } else {
      // Add new job entry
      setJobs([...jobs, formData]);
    }
    setFormData({
      customerID: '',
      slno: '',
      jobID: '',
      jobFrequency: '',
      jobDate: '',
      employeeID: '',
    });
  };

  // Handle Edit
  const handleEdit = (index) => {
    setFormData(jobs[index]);
    setEditingIndex(index);
  };

  // Handle Delete
  const handleDelete = (index) => {
    const updatedJobs = jobs.filter((_, i) => i !== index);
    setJobs(updatedJobs);
    if (editingIndex === index) {
      setFormData({
        customerID: '',
        slno: '',
        jobID: '',
        jobFrequency: '',
        jobDate: '',
        employeeID: '',
      });
      setEditingIndex(null);
    }
  };

  return (
    <div className="job-container">
      <h2>Customer Job Master</h2>
      <form className="job-form" onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label>Customer Name:</label>
          <input
            type="text"
            name="slno"
            value={formData.slno}
            placeholder="Enter Name"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Job Name:</label>
          <input
            type="text"
            name="slno"
            value={formData.slno}
            placeholder="Enter Job Name"
            onChange={handleChange}
            required
          />
        </div>
    
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
          <label>Job Date:</label>
          <input
            type="date"
            name="jobDate"
            value={formData.jobDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
        <label>Employee Name:</label>
          <select name="frequency" value={formData.frequency} onChange={handleChange} required>
            <option value="">Select Employee</option>
            <option value="Daily">Daily</option>
            
          </select>
        
        </div>
       
        
        <div className="form-group full-width">
          <button type="submit">{editingIndex !== null ? 'Update' : 'Submit'}</button>
        </div>
      </form>

      {jobs.length > 0 && (
        <div className="job-list">
          <h3>Stored Jobs</h3>
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                
                <th>Job Name</th>
                <th>Job Frequency</th>
                <th>Job Date</th>
                <th>Employee Name</th>
                
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, index) => (
                <tr key={index}>
                  <td>ABD</td> 
                            <td>abc</td>
                  <td>Weekly</td>
                  <td>{job.jobDate}</td>
                  <td>ADS</td>
                  
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

export default CustomerJobMaster;