import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Dashboard/ViewActionButton/ViewActionButton.css";

const MyApplication = () => {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "http://localhost:8000/api/student-application/my-application",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res.data.success) {
          setApp(res.data.application);
        }
      } catch (err) {
        alert("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="ring"></div>
      </div>
    );
  }

  if (!app) {
    return <div>No Application Found</div>;
  }

  return (
    <div className="main-content">
      <div className="dashboard-container">
        <h2 className="dashboard-title">My Application Status</h2>

        <div className="back">
          <Link to="/student-dashboard">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <div className="details-card">
          <div className="status-container-view">
            <span
              className={`status-text-view ${
                app.authorityStatus === "Approved"
                  ? "approved"
                  : app.authorityStatus === "Rejected"
                  ? "rejected"
                  : "pending"
              }`}
            >
              Authority: {app.authorityStatus || "Pending"}
            </span>

            <div className="faculty-status-list">
            {app.facultyStatuses?.map((item, index) => (
              <span
                key={index}
                className={`status-text-view ${
                  item.status === "Approved"
                    ? "approved"
                    : item.status === "Rejected"
                    ? "rejected"
                    : "pending"
                }`}
              >
                Faculty: {item.status} [ {item.facultyAcr} ]
              </span>
            ))}
            </div>
          </div>

          <h3>
            <strong>Application Submit Date:</strong>{" "}
            {new Date(app.missedExamDate).toLocaleDateString()}
          </h3>

          <p>
            <strong>Department:</strong> {app.department}
          </p>

          <p>
            <strong>Student ID:</strong> {app.studentId}
          </p>

          <p>
            <strong>Name:</strong> {app.name}
          </p>

          <p>
            <strong>Exam Type:</strong> {app.missedExamType}
          </p>

          <p>
            <strong>Semester:</strong> {app.semester} (Section: {app.section})
          </p>

          <p>
            <strong>Total Fine:</strong> {app.totalFine} Tk
          </p>

          <h3>Missed Courses:</h3>

          <ul>
            {app.courses?.map((course, index) => (
              <li key={index}>
                {course.courseId} - {course.courseTitle} (Faculty:{" "}
                {course.facultyAcr}) - Date:{" "}
                {new Date(course.missedExamDate).toLocaleDateString()}
              </li>
            ))}
          </ul>

          <pre className="reason-box">{app.reason}</pre>

          {app.attachment && (
            <div className="pdf-view">
              <h3>Attachment:</h3>
              {`http://localhost:8000/${app.attachment}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplication;