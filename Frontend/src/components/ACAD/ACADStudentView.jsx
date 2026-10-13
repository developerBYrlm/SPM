import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom'

import '../Dashboard/authoritySummary.css'


const ACADStudentView = () => {
  const [applications, setApplications] = useState([]);
  const [ACAD, setACAD] = useState(null);

  const token = localStorage.getItem("token");
  const fId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchACADProfile = async () => {
      try {
        const res = await fetch("https://spm-1-u37a.onrender.com/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setACAD(data.user);
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

    fetchACADProfile();
    fetchApplications();
  }, [token]);

  const filteredApps = applications.filter((app) => {
    if (!ACAD) return false;

    return (
      app.department?.toLowerCase() ===
      ACAD.department?.toLowerCase()
    );
  });

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
        
        <h3 className="dashboard-title">ACAD Dashboard</h3>

        <div className="dashboard-cards">
          <Link to="/acad-dashboard/students-applications-approve">
            <button className="card-common card2">
              <span><i className="fa-solid fa-circle-check" style={{ marginRight: "8px" }}></i> Applications Approved</span>
              <span className="badge">{approved}</span>
            </button>
          </Link>

          <Link to="/acad-dashboard/students-applications-pending">
            <button className="card-common card3">
              <span><i className="fa-solid fa-clock" style={{ marginRight: "8px" }}></i> Applications Pending</span>
              <span className="badge">{pending}</span>
            </button>
          </Link>

          <Link to="/acad-dashboard/students-applications-rejected">
            <button className="card-common card4">
              <span><i className="fa-solid fa-circle-xmark" style={{ marginRight: "8px" }}></i> Applications Rejected</span>
              <span className="badge">{rejected}</span>
            </button>
          </Link>
        </div>

        <div className="user-design">
          <Link to={fId ? `/acad-dashboard/acad-profile/${fId}` : "#"}>
            <button className="user" disabled={!fId}>
              <i className="fa-solid fa-id-badge"></i> Profile
            </button>
          </Link>

          <Link
            to={
              fId
                ? `/acad-dashboard/acad-profile-update/${fId}`
                : "#"
            }
          >
            <button className="user" disabled={!fId}>
              <i className="fa-solid fa-user-pen"></i> Update Profile
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

export default ACADStudentView
