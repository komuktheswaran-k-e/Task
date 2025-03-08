import { useState, useEffect } from "react";
import axios from "axios";

const Header = () => {
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    axios
      .get("https://103.38.50.149:5001/api/company")
      .then((response) => {
        if (response.data && response.data.header) {
          setCompanyName(response.data.header);
        }
      })
      .catch((error) => {
        console.error("Error fetching company header:", error);
      });
  }, []);

  return (
    <header className="bg-blue-600 text-white text-lg md:text-2xl font-semibold p-4 shadow-md text-center w-full">
      {companyName || "Loading..."}
    </header>
  );
};

export default Header;
