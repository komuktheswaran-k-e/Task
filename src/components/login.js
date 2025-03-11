import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";

import { useNavigate } from "react-router-dom";

const Login = ({ setToken }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Get the client IP address
      const ipResponse = await axios.get("https://api64.ipify.org?format=json");
      const clientIp = ipResponse.data.ip;

      // Send login request with client IP
      const response = await axios.post(
        "https://103.38.50.149:5001/api/login",
        {
          username,
          password,
          clientIp, // Attach IP address
        }
      );

      console.log("res", response.data);
      if (response.data.success) {
        toast.success("Login Successful!");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("logID", response.data.logID);
        setToken(response.data.token); // ✅ Update App.js state
        navigate("/customer");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid Credentials");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-box">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
