import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CustomerJobMaster.css";
import moment from "moment-timezone";
import Header from "./header";
import Footer from "./footer";

const CustomerJobMaster = () => {
  const [formData, setFormData] = useState({
    customerID: "",
    jobID: "",
    jobFrequency: "",
    jobDate: "",
    employeeID: "",
  });

  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [savedjobs, setsavedJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCustomers();
    fetchEmployees();
    fetchJobs();
    fetchsavedJobs(); // <-- Ensure saved jobs are fetched
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        "https://103.38.50.149:5001/api/customers"
      );
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        "https://103.38.50.149:5001/api/employees"
      );
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get("https://103.38.50.149:5001/api/jobs");
      setJobs(response.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchsavedJobs = async () => {
    try {
      const response = await axios.get(
        "https://103.38.50.149:5001/api/customer-jobs"
      );
      console.log("Saved Jobs Data:", response.data); // Debug API response
      setsavedJobs(response.data || []);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.customerID ||
      !formData.jobID ||
      !formData.jobFrequency ||
      !formData.jobDate ||
      !formData.employeeID
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        ...formData,
        employeeID: Number(formData.employeeID),
        jobDate: moment(formData.jobDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      };

      if (editingId) {
        await axios.put(
          `https://103.38.50.149:5001/api/customer-jobs/${editingId}`,
          payload
        );
      } else {
        await axios.post(
          "https://103.38.50.149:5001/api/customer-jobs",
          payload
        );
      }

      fetchsavedJobs();
      resetForm();
    } catch (error) {
      console.error("Error saving job:", error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
          "Error saving job. Check console for details."
      );
    }
  };

  const handleEdit = (job) => {
    setFormData({
      customerID: job.customerID,
      jobID: job.jobID,
      jobFrequency: job.jobFrequency,
      jobDate: moment(job.jobDate).format("YYYY-MM-DD"),
      employeeID: job.employeeID.toString(),
    });
    setEditingId(job.customerJobID);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`https://103.38.50.149:5001/api/customer-jobs/${id}`);
      fetchsavedJobs();
    } catch (error) {
      console.error(
        "Error deleting job:",
        error.response?.data || error.message
      );
      alert("Error deleting job. Check console for details.");
    }
  };

  const resetForm = () => {
    setFormData({
      customerID: "",
      jobID: "",
      jobFrequency: "",
      jobDate: "",
      employeeID: "",
    });
    setEditingId(null);
  };

  return (
    <div className="job-container">
      <h2>Customer Job Master</h2>
      <form className="job-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Customer Name:</label>
          <select
            name="customerID"
            value={formData.customerID}
            onChange={handleChange}
            required
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.customerID} value={customer.customerID}>
                {customer.customerName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Job Name:</label>
          <select
            name="jobID"
            value={formData.jobID}
            onChange={handleChange}
            required
          >
            <option value="">Select Job</option>
            {jobs.map((job) => (
              <option key={job.jobID} value={job.jobID}>
                {job.jobName || "N/A"}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Frequency:</label>
          <select
            name="jobFrequency"
            value={formData.jobFrequency}
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
          <select
            name="employeeID"
            value={formData.employeeID}
            onChange={handleChange}
            required
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.username}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">{editingId ? "Update" : "Create"} Job</button>
      </form>

      <h3>Existing Job Assignments</h3>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Job</th>
            <th>Frequency</th>
            <th>Date</th>
            <th>Employee</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {savedjobs.map((job) => (
            <tr key={job.customerJobID}>
              <td>{job.customerName || "Unknown Customer"}</td>
              <td>{job.jobName || "Unknown Job"}</td>
              <td>{job.jobFrequency}</td>
              <td>{moment(job.jobDate).format("DD MMM YYYY")}</td>
              <td>{job.username || "Unknown Employee"}</td>
              <td>
                <button onClick={() => handleEdit(job)}>Edit</button>
                <button
                  onClick={() => handleDelete(job.customerJobID)}
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
  );
};

export default CustomerJobMaster;
