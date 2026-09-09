import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./authoritySummary.css";

const AuthoritySummary = () => {
  const [applications, setApplications] = useState([]);
  const [authority, setAuthority] = useState(null);

  const token = localStorage.getItem("token");
  const fId = localStorage.getItem("studentId");

  const fetchAuthorityProfile = async () => {
    try {
      const res = await fetch("https://spm-1-u37a.onrender.com/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setAuthority(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(
        "https://spm-1-u37a.onrender.com/api/student-application",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuthorityProfile();
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    if (!authority) return false;

    return (
      app.department?.toLowerCase() ===
      authority.department?.toLowerCase()
    );
  });

  const total = filteredApps.length;
  const approved = filteredApps.filter(
    (a) => a.authorityStatus === "Approved"
  ).length;

  const pending = filteredApps.filter(
    (a) => a.authorityStatus === "Pending"
  ).length;

  const rejected = filteredApps.filter(
    (a) => a.authorityStatus === "Rejected"
  ).length;

  return (
    <div className="main-content">
      <div className="dashboard-container">
        
        <h3 className="dashboard-title">Authority Dashboard</h3>

        <div className="dashboard-cards">

          
          <Link to="/authority-dashboard/students-applications">
            <button className="card-common card1">
              Total Applications
              <span className="badge">{total}</span>
            </button>
          </Link>

          <Link to="/authority-dashboard/students-applications-approve">
            <button className="card-common card2">
              Applications Approved
              <span className="badge">{approved}</span>
            </button>
          </Link>

          <Link to="/authority-dashboard/students-applications-pending">
            <button className="card-common card3">
              Applications Pending
              <span className="badge">{pending}</span>
            </button>
          </Link>

          <Link to="/authority-dashboard/students-applications-rejected">
            <button className="card-common card4">
              Applications Rejected
              <span className="badge">{rejected}</span>
            </button>
          </Link>

        </div>

        <div className="user-design">

          <Link to="/authority-dashboard/add-users">
            <button className="user">
              + Add New User
            </button>
          </Link>

          <Link to={fId ? `/authority-dashboard/authority-profile/${fId}` : "#"}>
            <button className="user" disabled={!fId}>
              Profile
            </button>
          </Link>

          <Link
            to={
              fId
                ? `/authority-dashboard/authority-profile-update/${fId}`
                : "#"
            }
          >
            <button className="user" disabled={!fId}>
              Update Profile
            </button>
          </Link>


          {!fId && (
            <p style={{ color: "red", fontSize: "12px" }}>
              Profile ID missing. Please Re-login.
            </p>
          )}

        </div>

      </div>
    </div>
  );
};

export default AuthoritySummary;