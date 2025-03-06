import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./components/login";
import CustomerMaster from "./components/CustomerMaster";
import CountryMaster from "./components/CountryMaster";
import StateMaster from "./components/StateMaster";
import JobMaster from "./components/JobMaster";
import JobTypeMaster from "./components/JobTypeMaster";
import EmployeeMaster from "./components/EmployeeMaster";
import CustomerJobMaster from "./components/CustomerJobMaster";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate(); // Redirect after logout

  // ✅ Manual Logout Function
  const handleLogout = async () => {
    const logID = localStorage.getItem("logID");

    if (!logID) {
      console.warn("No logID found in localStorage.");
      return;
    }

    try {
      const response = await axios.post("/api/logout", {
        logID,
      });
      console.log("Logout response:", response.data);

      // Clear localStorage & Update State
      localStorage.removeItem("logID");
      localStorage.removeItem("token");
      setToken(null); // Update state to hide menu/logout
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  // ✅ Auto Logout on Tab Close
  useEffect(() => {
    const handleTabClose = () => {
      const logID = localStorage.getItem("logID");
      if (!logID) return;

      const logoutURL = "api/logout";
      const data = JSON.stringify({ logID });

      navigator.sendBeacon(logoutURL, data);

      // ✅ Remove token & Update State
      localStorage.removeItem("logID");
      localStorage.removeItem("token");
      setToken(null); // ✅ Update state to reflect logout
    };

    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, []);

  return (
    <div className="container">
      {/* ✅ Show Menu & Logout Only If Logged In */}
      {token ? (
        <>
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰ Menu
          </button>
          {menuOpen && (
            <nav className="menu">
              <ul>
                <li>
                  <Link to="/customer">Customer details</Link>
                </li>
                <li>
                  <Link to="/state">State Master</Link>
                </li>
                <li>
                  <Link to="/country">Country Master</Link>
                </li>
                <li>
                  <Link to="/employee">Employee Master</Link>
                </li>
                <li>
                  <Link to="/job-type">Job Type Master</Link>
                </li>
                <li>
                  <Link to="/job">Job Master</Link>
                </li>
                <li>
                  <Link to="/customer-job">Customer Job Master</Link>
                </li>
              </ul>
            </nav>
          )}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : null}

      <div className="content">
        <Routes>
          <Route path="/" element={<Login setToken={setToken} />} />
          <Route
            path="/customer"
            element={
              <ProtectedRoute>
                <CustomerMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/state"
            element={
              <ProtectedRoute>
                <StateMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/country"
            element={
              <ProtectedRoute>
                <CountryMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee"
            element={
              <ProtectedRoute>
                <EmployeeMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-type"
            element={
              <ProtectedRoute>
                <JobTypeMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job"
            element={
              <ProtectedRoute>
                <JobMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-job"
            element={
              <ProtectedRoute>
                <CustomerJobMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-filing"
            element={
              <ProtectedRoute>
                <div>Audit Filing Master</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
