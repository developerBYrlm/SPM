import React from "react";
import { Link } from "react-router-dom";
import "../Dashboard/authoritySummary.css";

const ITSummary = () => {
  const fId = localStorage.getItem("studentId");



  return (
    <div className="main-content">
      <div className="dashboard-container">
        
        <h3 className="dashboard-title">IT Dashboard</h3>


        <div className="user-design">
          <Link to="/IT-dashboard/add-users">
            <button className="user">
              <i className="fa-solid fa-user-plus"></i> Add New User
            </button>
          </Link>

          <Link to={fId ? `/IT-dashboard/IT-profile/${fId}` : "#"}>
            <button className="user" disabled={!fId}>
              <i className="fa-solid fa-id-badge"></i> Profile
            </button>
          </Link>

          <Link
            to={
              fId
                ? `/IT-dashboard/IT-profile-update/${fId}`
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


export default ITSummary
