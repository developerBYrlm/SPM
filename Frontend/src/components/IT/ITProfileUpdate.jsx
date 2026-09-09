import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../Dashboard/add.css';
import '../Dashboard/ViewActionButton/ViewActionButton.css';

const ITProfileUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    email: '',
    studentId: '',
    name: '',
    phone: '',
    password: '',
    image: null
  });

  useEffect(() => {
    const fetchIT = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/it/it-view/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        if (res.data.success) {
          const s = res.data.student;

          setFormData({
            email: s.user.email,
            studentId: s.studentId,
            name: s.user.name,
            phone: s.phone,
            password: '',
            image: null
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIT();
  }, [id]);

  if (loading) {
    return (
      <div className="loading">
        <div className="ring"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === "image" ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Unauthorized");
      return;
    }

    const formDataObj = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        formDataObj.append(key, value);
      }
    });

    try {
      const res = await axios.post(
        `http://localhost:8000/api/it/it-edit/${id}`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        alert("IT Account updated successfully");
        navigate("/it-dashboard");
      }

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.error ||
        "Server error occurred"
      );
    }
  };

  return (
    <div className="main-content">
      <div className="user-dashboard">

        <h2 className="form-title">Update IT Information</h2>

        <div className="back">
          <Link to="/it-dashboard">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <form className="glass-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Insert a Valid Email"
              value={formData.email}
              onInput={(e) =>
                e.target.value = e.target.value.replace(/[^a-z0-9.@]/g, '')
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>User ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Insert Full Name"
              onInput={(e) =>
                e.target.value = e.target.value.replace(/[^A-Za-z.\s]/g, '')
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              placeholder='01*********' maxLength={11}
              onInput={(e) =>
                e.target.value = e.target.value.replace(/[^0-9]/g, '')
              }
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Update Password</label>
            <input
              type="password"
              name="password"
              minLength={6}
              placeholder="Include letters, symbols & numbers"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Profile Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit
          </button>

        </form>
      </div>
    </div>
  );
};

export default ITProfileUpdate;