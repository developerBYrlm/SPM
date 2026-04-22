import React from 'react'
import { Link } from 'react-router-dom'

import '../Dashboard/authoritySummary.css'
import './faculty.css'
 
const number = null;
const num = null;
const Num = null;

const FacultyStudentView = () => {

  const fId = localStorage.getItem("studentId");
  
  return (
  <div>
    <div className="main-content">
      <div className="dashboard-container">
        <h3 className="dashboard-title">Faculty Dashboard</h3>

        {/* Dashboard Cards */}
        <div className="dashboard-three-cards">
          <a 
          href="/faculty-dashboard/students-applications-approve"
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
          href="/faculty-dashboard/students-applications-pending"
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
          href="/faculty-dashboard/students-applications-rejected"
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
            href={fId ? `/faculty-dashboard/faculty-profile/${fId}` : "#"}
            style={{ textDecoration: "none" }}
          >
            <button
              className="user"
              disabled={!fId}
              style={{ textDecoration: "none", borderBottom: "none" }}
            >
              Profile
            </button>
          </a>

          {!fId && (
            <p style={{ color: "red", fontSize: "12px" }}>
              Profile ID missing. Please Re-login.
            </p>
          )}
        
          <a
            href={
              fId
                ? `/faculty-dashboard/faculty-profile-update/${fId}`
                : "#"
            }
            style={{ textDecoration: "none" }}
          >
            <button
              className="user"
              disabled={!fId}
              style={{ textDecoration: "none", borderBottom: "none" }}
            >
              Update Profile
            </button>
          </a>

          {!fId && (
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

export default FacultyStudentView
