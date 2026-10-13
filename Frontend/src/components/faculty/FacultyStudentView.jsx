import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom'

import '../Dashboard/authoritySummary.css'
import './faculty.css'
 


const FacultyStudentView = () =>  {
  const [applications, setApplications] = useState([]);
  const [faculty, setFaculty] = useState(null);

  const token = localStorage.getItem("token");
  const fId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchFacultyProfile = async () => {
      try {
        const res = await fetch("https://spm-1-u37a.onrender.com/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setFaculty(data.user);
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
          console.log(data.applications);
          setApplications(data.applications);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchFacultyProfile();
    fetchApplications();
  }, [token]);

  const filteredApps = applications.filter((app) => {
  if (!faculty) return false;

  const deptMatch =
    app.department?.toLowerCase() ===
    faculty.department?.toLowerCase();

  const facultyMatch = app.courses?.some(
    (course) =>
      course.facultyAcr?.trim().toUpperCase() ===
      faculty.userID?.trim().toUpperCase()
  );

  return deptMatch && facultyMatch;
});

  const facultyAcr = faculty?.userID?.trim().toUpperCase();
  
  const approved = filteredApps.filter((app) =>
  app.facultyStatuses?.some(
    (item) =>
      item.facultyAcr?.trim().toUpperCase() === facultyAcr &&
      item.status === "Approved"
  )
).length;

  const pending = filteredApps.filter((app) =>
  app.facultyStatuses?.some(
    (item) =>
      item.facultyAcr?.trim().toUpperCase() === facultyAcr &&
      item.status === "Pending"
  )
).length;

  const rejected = filteredApps.filter((app) =>
  app.facultyStatuses?.some(
    (item) =>
      item.facultyAcr?.trim().toUpperCase() === facultyAcr &&
      item.status === "Rejected"
  )
).length;

  
  return (
  <div>
    <div className="main-content">
      <div className="dashboard-container">
        <h3 className="dashboard-title_unknown" >Faculty Dashboard</h3>

        {/* Dashboard Cards */}
        <div className="dashboard-three-cards">
          <Link to="/faculty-dashboard/students-applications-approve" >
            <button className="card-common card2"  >
              <span><i className="fa-solid fa-circle-check" style={{ marginRight: "8px" }}></i> Applications Approved</span> 
              <span className="badge">{approved}</span>
            </button>
          </Link>

          <Link to="/faculty-dashboard/students-applications-pending"  >
            <button className="card-common card3" >
              <span><i className="fa-solid fa-clock" style={{ marginRight: "8px" }}></i> Applications Pending</span> 
              <span className="badge">{pending}</span>
            </button>
          </Link>

          <Link to="/faculty-dashboard/students-applications-rejected" >
            <button className="card-common card4" >
              <span><i className="fa-solid fa-circle-xmark" style={{ marginRight: "8px" }}></i> Applications Rejected</span> 
              <span className="badge">{rejected}</span>
            </button>
          </Link>
        </div>

        {/* Profile */}
        <div className='user-design'>
          <Link to={fId ? `/faculty-dashboard/faculty-profile/${fId}` : "#"}
            style={{ textDecoration: "none" }}
          >
            <button
              className="user"
              disabled={!fId}
              style={{ textDecoration: "none", borderBottom: "none" }}
            >
              <i className="fa-solid fa-id-badge"></i> Profile
            </button>
          </Link>

          {!fId && (
            <p style={{ color: "red", fontSize: "12px" }}>
              Profile ID missing. Please Re-login.
            </p>
          )}
        
          <Link to={
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
  </div>
);

};

export default FacultyStudentView
