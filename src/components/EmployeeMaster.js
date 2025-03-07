import React, { useState } from "react";
import "./EmployeeMaster.css"; // Import CSS for styling

const EmployeeMaster = () => {
  const [formData, setFormData] = useState({
    employeeName: "",
    username: "",
    password: "",
  });

  const [employees, setEmployees] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      // Update existing employee
      const updatedEmployees = [...employees];
      updatedEmployees[editingIndex] = formData;
      setEmployees(updatedEmployees);
      setEditingIndex(null);
    } else {
      // Add new employee
      setEmployees([...employees, formData]);
    }
    setFormData({ employeeName: "", username: "", password: "" });
  };

  // Handle Edit
  const handleEdit = (index) => {
    setFormData(employees[index]);
    setEditingIndex(index);
  };

  // Handle Delete
  const handleDelete = (index) => {
    const updatedEmployees = employees.filter((_, i) => i !== index);
    setEmployees(updatedEmployees);
    if (editingIndex === index) {
      setFormData({ employeeName: "", username: "", password: "" });
      setEditingIndex(null);
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
            required
          />
        </div>
        <div className="form-group full-width">
          <button type="submit">{editingIndex !== null ? "Update" : "Submit"}</button>
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
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr key={index}>
                  <td>{employee.employeeName}</td>
                  <td>{employee.username}</td>
                  <td>{employee.password}</td>
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

export default EmployeeMaster;
