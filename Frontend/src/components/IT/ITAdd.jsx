import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Dashboard/add.css";

const ITAdd = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    studentId: "",
    name: "",
    gender: "",
    phone: "",
    role: "",
    department: "",
    password: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: name === "image" ? files?.[0] || null : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Unauthorized. Please login again.");
      navigate("/login");
      return;
    }

    const formDataObj = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        formDataObj.append(key, value);
      }
    });

    try {
      setSubmitting(true);

      const response = await axios.post(
        "http://localhost:8000/api/students/add",
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Account created successfully");
        navigate("/it-dashboard");
      }
    } catch (error) {
      console.error("Add user error:", error);

      alert(
        error.response?.data?.error ||
          "Server error occurred while creating account"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      <div className="user-dashboard">
        <h2 className="form-title">Add New User</h2>

        <div className="back">
          <Link to="/it-dashboard">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <form
          className="glass-form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Insert a valid email"
              required
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>ID / Acronym</label>

            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              placeholder="Insert full ID or acronym"
              required
              onInput={(e) => {
                e.target.value = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9\s-]/g, "");
              }}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Insert full name"
              required
              onInput={(e) => {
                e.target.value = e.target.value.replace(
                  /[^A-Za-z.\s]/g,
                  ""
                );
              }}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Gender</label>

            <select
              name="gender"
              value={formData.gender}
              required
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phone</label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              placeholder="01*********"
              maxLength={11}
              required
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Department</label>

            <select
              name="department"
              value={formData.department}
              required
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              <option value="IT team">IT Team</option>
              <option value="CSE">CSE</option>
              <option value="EEE">EEE</option>
              <option value="BBA">BBA</option>
              <option value="Law">Law</option>
            </select>
          </div>

          <div className="form-group">
            <label>Role</label>

            <select
              name="role"
              value={formData.role}
              required
              onChange={handleChange}
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="authority">Authority</option>
              <option value="ACAD">ACAD</option>
              <option value="IT">IT</option>
            </select>
          </div>

          <div className="form-group password-group">
            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                placeholder="Include letters, symbols and numbers"
                minLength={6}
                required
                onChange={handleChange}
              />

              <i
                className={`fa-solid ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                }`}
                onClick={() => setShowPassword((previous) => !previous)}
                style={{ cursor: "pointer" }}
              ></i>
            </div>
          </div>

          <div className="form-group">
            <label>Profile Image</label>

            <input
              type="file"
              name="image"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              "Adding..."
            ) : (
              <>
                Add <i className="fa-solid fa-user-plus"></i>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ITAdd;