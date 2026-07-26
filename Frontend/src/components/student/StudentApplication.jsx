import React from "react";
import { Link } from "react-router-dom";
import "../Dashboard/authoritySummary.css";

const StudentApplication = () => {
  const sId = localStorage.getItem("studentId");

  return (
    <div>
      <div className="main-content">
        <div className="dashboard-container">
          <h3 className="dashboard-title">Student Dashboard</h3>

          <div className="user-design">

            <Link
              to="/student-dashboard/new-application"
              style={{ textDecoration: "none" }}
            >
              <button className="user">
                New Applications
              </button>
            </Link>

            <Link
              to="/student-dashboard/update-application"
              style={{ textDecoration: "none" }}
            >
              <button className="user">
                Update Applications
              </button>
            </Link>

            <Link
              to="/student-dashboard/current-application"
              style={{ textDecoration: "none" }}
            >
              <button className="user">
                Application Status
              </button>
            </Link>

            <Link
              to={sId ? `/student-dashboard/student-profile/${sId}` : "#"}
              style={{ textDecoration: "none" }}
            >
              <button
                className="user"
                disabled={!sId}
              >
                Profile
              </button>
            </Link>

            {!sId && (
              <p style={{ color: "red", fontSize: "12px" }}>
                Profile ID missing. Please Re-login.
              </p>
            )}

            <Link
              to={sId ? `/student-dashboard/student-profile-update/${sId}` : "#"}
              style={{ textDecoration: "none" }}
            >
              <button
                className="user"
                disabled={!sId}
              >
                Update Profile
              </button>
            </Link>

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

export default StudentApplication;
