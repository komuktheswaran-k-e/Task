import { useState, useEffect } from "react";
import axios from "axios";

const Footer = () => {
  const [footerText, setFooterText] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/company")
      .then((response) => {
        if (response.data && response.data.footer) {
          setFooterText(response.data.footer);
        }
      })
      .catch((error) => {
        console.error("Error fetching footer text:", error);
      });
  }, []);

  return (
    <footer className="bg-black text-white text-center p-4 mt-auto w-full">
      {footerText || "Loading..."}
    </footer>
  );
};

export default Footer;
