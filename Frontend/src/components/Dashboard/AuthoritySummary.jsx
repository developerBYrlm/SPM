import React from 'react';
import { Link } from 'react-router-dom'
import './authoritySummary.css'

const number = null; // variable must be declared with const/let

const AuthoritySummary = () => {

 
  const fId = localStorage.getItem("studentId");
  return (
  <div className="main-content">
    <div className="dashboard-container">
      <h3 className="dashboard-title">Authority Dashboard</h3>

      {/* Dashboard Cards */}
      <div className="dashboard-cards">
       
         <a 
          href="/authority-dashboard/students-applications"
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
          href="/authority-dashboard/students-applications-approve"
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
          href="/authority-dashboard/students-applications-pending"
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
          href="/authority-dashboard/students-applications-rejected"
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

      {/* Add New User */}
      <div className='user-design'>
        <a 
          href="/authority-dashboard/add-users"
          style={{ textDecoration: "none" }}
        >
          <button
            className="user"
            style={{ textDecoration: "none", borderBottom: "none" }}
          >
            + Add New User
          </button>
        </a>
      
        <a
          href={fId ? `/authority-dashboard/authority-profile/${fId}` : "#"}
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
      
        <a
          href={
            fId
              ? `/authority-dashboard/authority-profile-update/${fId}`
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
);

};

export default AuthoritySummary;
