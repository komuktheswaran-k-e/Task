import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EmployeeMaster.css";

const API_BASE_URL = "https://103.38.50.149:5001/api/employees"; // Adjust API URL

const EmployeeMaster = () => {
  const [formData, setFormData] = useState({
    employeeName: "",
    username: "",
    password: "",
  });

  const [employees, setEmployees] = useState([]);
  const [editingID, setEditingID] = useState(null); // Store Employee ID for update

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      console.log("Fetched employees:", response.data); // Debugging line
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingID) {
        // Update Employee
        await axios.put(`${API_BASE_URL}/${editingID}`, formData);
      } else {
        // Add New Employee
        await axios.post(API_BASE_URL, formData);
      }
      fetchEmployees(); // Refresh list
      resetForm();
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({ employeeName: "", username: "", password: "" });
    setEditingID(null);
  };

  // Handle Edit
  const handleEdit = (employee) => {
    setFormData({
      employeeName: employee.employeeName,
      username: employee.username,
      password: "", // Don't prefill password for security
    });
    setEditingID(employee.id); // Store correct Employee ID
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!id) {
      console.error("Error: Employee ID is undefined");
      return;
    }

    console.log("Deleting employee with ID:", id); // Debugging line

    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      setEmployees((prevEmployees) =>
        prevEmployees.filter((emp) => emp.id !== id)
      );
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  return (
    <div className="employee-container">
      <h2>Employee Master</h2>
      <form className="employee-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Employee Name:</label>
          <input
            type="text"
            name="employeeName"
            value={formData.employeeName}
            placeholder="Enter Employee Name"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            placeholder="Enter Username"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter Password"
            onChange={handleChange}
            required={!editingID} // Password required only for new users
          />
        </div>
        <div className="form-group full-width">
          <button type="submit">{editingID ? "Update" : "Submit"}</button>
          {editingID && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {employees.length > 0 && (
        <div className="employee-list">
          <h3>Stored Employees</h3>
          <table>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Username</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.employeeName}</td>
                  <td>{employee.username}</td>
                  <td>
                    <button onClick={() => handleEdit(employee)}>Edit</button>
                    <button
                      onClick={() => handleDelete(employee.id)}
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
      )}
    </div>
  );
};

export default EmployeeMaster;
