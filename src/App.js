import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import CustomerMaster from "./components/CustomerMaster";
import CountryMaster from "./components/CountryMaster";
import StateMaster from "./components/StateMaster";
import JobMaster from "./components/JobMaster";
import JobTypeMaster from "./components/JobTypeMaster";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="container">
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
        ☰ Menu
      </button>
      {menuOpen && (
        <nav className="menu">
          <ul>
            <li>
              <Link to="/customer" onClick={() => setMenuOpen(false)}>
                Customer details
              </Link>
            </li>
            <li>
              <Link to="/state" onClick={() => setMenuOpen(false)}>
                State Master
              </Link>
            </li>
            <li>
              <Link to="/country" onClick={() => setMenuOpen(false)}>
                Country Master
              </Link>
            </li>
            <li>
              <Link to="/employee" onClick={() => setMenuOpen(false)}>
                Employee Master
              </Link>
            </li>
            <li>
              <Link to="/job-type" onClick={() => setMenuOpen(false)}>
                Job Type Master
              </Link>
            </li>
            <li>
              <Link to="/job" onClick={() => setMenuOpen(false)}>
                Job Master
              </Link>
            </li>
            <li>
              <Link to="/customer-job" onClick={() => setMenuOpen(false)}>
                Customer Job Master
              </Link>
            </li>
            <li>
              <Link to="/audit-filing" onClick={() => setMenuOpen(false)}>
                Audit Filing Master
              </Link>
            </li>
          </ul>
        </nav>
      )}
      <div className="content">
        <Routes>
          <Route path="/customer" element={<CustomerMaster />} />
          <Route path="/state" element={<StateMaster />} />
          <Route path="/country" element={<CountryMaster />} />
          <Route path="/employee" element={<div>Employee Master</div>} />
          <Route path="/job-type" element={<JobTypeMaster />} />
          <Route path="/job" element={<JobMaster />} />
          <Route
            path="/customer-job"
            element={<div>Customer Job Master</div>}
          />
          <Route
            path="/audit-filing"
            element={<div>Audit Filing Master</div>}
          />
        </Routes>
      </div>
    </div>
  );
}
