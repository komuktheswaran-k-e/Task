
import Login from "./login";
import "./style.css";

const LoginPage = () => {
  return (
    <div className="login-wrapper">
   

      {/* ✅ Login Container - Centered */}
      <div className="login-container">
        <div className="login-box">
          <Login />
        </div>
      </div>

      
    </div>

  );
};

export default LoginPage;
