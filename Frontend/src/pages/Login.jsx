import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./website.css";
import "./pageAnimation.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Submit login data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        "https://spm-1-u37a.onrender.com/api/auth/login",
        { email, password }
      );

      if (response.data.success) {
        setTimeout(() => {
          const user = response.data.user;
          login(user);
          localStorage.setItem("token", response.data.token);

          const idToSave = user.studentId || user._id;
          localStorage.setItem("studentId", idToSave);

          // Open dashboard by user role
          if (user.role === "authority") navigate("/authority-dashboard");
          else if (user.role === "IT") navigate("/it-dashboard");
          else if (user.role === "student") navigate("/student-dashboard");
          else if (user.role === "faculty") navigate("/faculty-dashboard");
          else navigate("/ACAD-dashboard");

          setLoading(false);
        }, 2000);
      }
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.error || "Invalid User");
    }
  };

  return (
    <>
      <div className="page slide-left">
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
            <h1>Special Exam Management</h1>
            <h2>LogIn</h2>
            {error && <p className="text">{error}</p>}

            <div className="input-box">
              <input
                type="email"
                placeholder="Enter email"
                required
                value={email}
                onInput={(e) => e.target.value = e.target.value.replace(/[^0-9a-zA-Z@.]/g, "")}
                onChange={(e) => setEmail(e.target.value)}
              />
              <i className="fa-solid fa-user"></i>
            </div>

            <div className="input-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i
                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
              ></i>
            </div>

            <div className="remember-forgot">
              <Link to="/forgot">Forgot password</Link>
            </div>

            <button type="submit" className="button" disabled={loading}>
              Login
            </button>
          </form>
        </div>
      </div>

      {/* Show loading popup */}
      {loading && (
        <div className="loading-popup-overlay">
          <div className="loading-popup-box">
            <div className="spinner"></div>
            <p>Logging in, please wait...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;