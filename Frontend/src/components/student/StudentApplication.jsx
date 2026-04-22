import React from 'react'
import { Link } from 'react-router-dom'

import '../Dashboard/authoritySummary.css' 

const StudentApplication = () => {

  const sId = localStorage.getItem("studentId");

 return (
    <div>
  <div className="main-content">
    <div className="dashboard-container">
      <h3 className="dashboard-title">Student Dashboard</h3>

      <div className='user-design'>
        <a
          href="/student-dashboard/new-application"
          style={{ textDecoration: "none" }}
        >
          <button
            className="user"
            style={{ textDecoration: "none", borderBottom: "none" }}
          >
            New Applications
          </button>
        </a>
        <a
          href="/student-dashboard/update-application"
          style={{ textDecoration: "none" }}
        >
          <button
            className="user"
            style={{ textDecoration: "none", borderBottom: "none" }}
          >
            Update Applications
          </button>
        </a>
        <a
          href="/student-dashboard/current-application"
          style={{ textDecoration: "none" }}
        >
          <button
            className="user"
            style={{ textDecoration: "none", borderBottom: "none" }}
          >
            Application Status
          </button>
        </a>
      
        <a
          href={sId ? `/student-dashboard/student-profile/${sId}` : "#"}
          style={{ textDecoration: "none" }}
        >
          <button
            className="user"
            disabled={!sId}
            style={{ textDecoration: "none", borderBottom: "none" }}
          >
            Profile
          </button>
        </a>

        {!sId && (
          <p style={{ color: "red", fontSize: "12px" }}>
            Profile ID missing. Please Re-login.
          </p>
        )}
      
        <a
          href={sId ? `/student-dashboard/student-profile-update/${sId}` : "#"}
          style={{ textDecoration: "none" }}
        >
          <button
            className="user"
            disabled={!sId}
            style={{ textDecoration: "none", borderBottom: "none" }}
          >
            Update Profile
          </button>
        </a>

        {!sId && (
          <p style={{ color: "red", fontSize: "12px" }}>
            Profile ID missing. Please Re-login.
          </p>
        )}
      </div>
    </div>
  </div>
</div>

  );

};

export default StudentApplication
