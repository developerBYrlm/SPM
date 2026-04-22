import React from 'react'
import { Link } from 'react-router-dom'

import '../Dashboard/authoritySummary.css'

const Number = null;
const number = null;
const num = null;
const Num = null;

const ACADStudentView = () => {

  const sId = localStorage.getItem("studentId");

  return (
  <div>
    <div className="main-content">
      <div className="dashboard-container">
        <h3 className="dashboard-title">ACAD Dashboard</h3>

        {/* Dashboard Cards */}
        <div className="dashboard-cards">
       
         <a 
          href="/acad-dashboard/students-acad-applications"
          style={{ textDecoration: "none" }}
         >
          <button
            className="card-common card1"
            style={{ textDecoration: "none", borderBottom: "none" }}
          >
            Total Applications {number}
          </button>
        </a>


         <a 
          href="/acad-dashboard/students-applications-approve"
          style={{ textDecoration: "none" }}
         >
          <button
            className="card-common card2"
            style={{ textDecoration: "none", borderBottom: "none" }}
          >
            Applications Approved {number}
          </button>
        </a>
         <a 
          href="/acad-dashboard/students-applications-pending"
          style={{ textDecoration: "none" }}
         >
          <button
            className="card-common card3"
            style={{ textDecoration: "none", borderBottom: "none" }}
          >
            Applications Pending {number}
          </button>
        </a>
         <a 
          href="/acad-dashboard/students-applications-rejected"
          style={{ textDecoration: "none" }}
         >
          <button
            className="card-common card4"
            style={{ textDecoration: "none", borderBottom: "none" }}
          >
            Applications Rejected {number}
          </button>
        </a>
       
      </div>

        {/* Profile */}
        <div className='user-design'>
          <a
            href={sId ? `/acad-dashboard/acad-profile/${sId}` : "#"}
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
            href={sId ? `/acad-dashboard/acad-profile-update/${sId}` : "#"}
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

export default ACADStudentView
