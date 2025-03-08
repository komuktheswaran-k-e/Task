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
import "./menu.css"; // Assuming CSS is placed here
import Header from "./components/header";
import Footer from "./components/footer";

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
      const response = await axios.post("https://103.38.50.149:5001/api/logout", { logID });
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
      console.log("Stored Token in useEffect:", logID);
      if (!logID) return;

      const logoutURL = "https://103.38.50.149:5001/api/logout";
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

  // Function to close the menu when an option is clicked
  const handleMenuClick = () => {
    setMenuOpen(false);
  };

  return (
    <div className="container">
       {/* ✅ Header */}
       <Header />
      {/* ✅ Show Menu & Logout Only If Logged In */}
      {token ? (
        <>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
            ☰ Menu
          </button>

          {menuOpen && (
            <nav className={`menu ${menuOpen ? 'menuOpen' : ''}`}>
              {/* Close button to close the menu */}
              <button className="close-menu-button" onClick={handleMenuClick}>
                ✖
              </button>

              <ul>
                <li><Link to="/customer" onClick={handleMenuClick}>Customer details</Link></li>
                <li><Link to="/state" onClick={handleMenuClick}>State Master</Link></li>
                <li><Link to="/country" onClick={handleMenuClick}>Country Master</Link></li>
                <li><Link to="/employee" onClick={handleMenuClick}>Employee Master</Link></li>
                <li><Link to="/job-type" onClick={handleMenuClick}>Job Type Master</Link></li>
                <li><Link to="/job" onClick={handleMenuClick}>Job Master</Link></li>
                <li><Link to="/customer-job" onClick={handleMenuClick}>Customer Job Master</Link></li>
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
          <Route path="/customer" element={<ProtectedRoute><CustomerMaster /></ProtectedRoute>} />
          <Route path="/state" element={<ProtectedRoute><StateMaster /></ProtectedRoute>} />
          <Route path="/country" element={<ProtectedRoute><CountryMaster /></ProtectedRoute>} />
          <Route path="/employee" element={<ProtectedRoute><EmployeeMaster /></ProtectedRoute>} />
          <Route path="/job-type" element={<ProtectedRoute><JobTypeMaster /></ProtectedRoute>} />
          <Route path="/job" element={<ProtectedRoute><JobMaster /></ProtectedRoute>} />
          <Route path="/customer-job" element={<ProtectedRoute><CustomerJobMaster /></ProtectedRoute>} />
        </Routes>
      </div>
       <div>
        {/* ✅ Footer */}
       <Footer />
       </div>
    </div>
  );
};

export default App;
