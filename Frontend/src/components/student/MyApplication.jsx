import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Dashboard/ViewActionButton/ViewActionButton.css";

const MyApplication = () => {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "https://spm-1-u37a.onrender.com/api/student-application/my-application",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res.data.success) {
          const applicationData = res.data.application;
          setApp(applicationData);

          // If student has attended 5+ special exams and authority has not granted permission yet, show red warning popup
          if (
            applicationData.requiresSpecialPermission &&
            !applicationData.specialPermissionGranted
          ) {
            setShowWarningModal(true);
          }
        }
      } catch (err) {
        console.error(err);
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
      {/* 5+ special exams red warning popup on application status page */}
      {showWarningModal && (
        <div className="popup-overlay" style={{ zIndex: 9999 }}>
          <div
            className="popup-box"
            style={{
              border: "3px solid #ef4444",
              boxShadow: "0 15px 35px rgba(239, 68, 68, 0.45)",
              background: "linear-gradient(145deg, #181824, #2c151c)",
              color: "#ffffff",
              maxWidth: "490px",
              padding: "30px 24px",
              borderRadius: "14px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "50px", color: "#ef4444", marginBottom: "14px" }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h2
              style={{
                color: "#ef4444",
                fontSize: "20px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                margin: "0 0 14px"
              }}
            >
              Special Exam Warning
            </h2>
            <p
              style={{
                color: "#fecaca",
                fontSize: "15px",
                fontWeight: "600",
                lineHeight: "1.6",
                margin: "0 0 24px"
              }}
            >
              You already attend 5 times on special exam and now you meet on Head of department to approve your application with necessary documents IF you have!
            </p>
            <button
              type="button"
              onClick={() => setShowWarningModal(false)}
              style={{
                backgroundColor: "#ef4444",
                color: "#ffffff",
                border: "none",
                padding: "12px 34px",
                fontSize: "15px",
                fontWeight: "700",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(239, 68, 68, 0.5)"
              }}
            >
              OK, I Understand
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-container">
        <h2 className="dashboard-title">My Application Status</h2>

        <div className="back">
          <Link to="/student-dashboard">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <div className="details-card">
          {/* Persistent warning banner if 5+ exams permission is pending */}
          {app.requiresSpecialPermission && !app.specialPermissionGranted && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "2px solid #ef4444",
                color: "#fecaca",
                padding: "14px 18px",
                borderRadius: "10px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)"
              }}
            >
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "24px", color: "#ef4444" }}></i>
              <div>
                <strong style={{ color: "#ef4444", fontSize: "14px", display: "block", marginBottom: "4px" }}>
                  ATTENTION REQUIRED (5+ Special Exams Attended):
                </strong>
                <span style={{ fontSize: "13.5px", lineHeight: "1.5" }}>
                  You already attend 5 times on special exam and now you meet on Head of department to approve your application with necessary documents IF you have!
                </span>
              </div>
            </div>
          )}

          {app.requiresSpecialPermission && app.specialPermissionGranted && (
            <div
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                border: "1px solid #22c55e",
                color: "#86efac",
                padding: "12px 18px",
                borderRadius: "10px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              <i className="fa-solid fa-circle-check" style={{ fontSize: "20px", color: "#22c55e" }}></i>
              <span style={{ fontSize: "14px", fontWeight: "600" }}>
                Special Exam Permission Granted by Head of Department
              </span>
            </div>
          )}

          <div className="status-container-view">
            <div className="faculty-status-list">
              <span
                className={`status-text-view ${app.authorityStatus === "Approved"
                  ? "approved"
                  : app.authorityStatus === "Rejected"
                    ? "rejected"
                    : "pending"
                  }`}
              >
                Authority: {app.requiresSpecialPermission && !app.specialPermissionGranted
                  ? "Permission Required (5+ Attended)"
                  : (app.authorityStatus || "Pending")}
              </span>
            </div>
            <div className="faculty-status-list">
              {app.facultyStatuses?.map((item, index) => (
                <span
                  key={index}
                  className={`status-text-view ${item.status === "Approved"
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

          <p><strong>Department:</strong> {app.department}</p>
          <p><strong>Student ID:</strong> {app.studentId}</p>
          <p><strong>Name:</strong> {app.name}</p>
          <p><strong>Exam Type:</strong> {app.missedExamType}</p>
          <p><strong>Semester:</strong> {app.semester} (Section: {app.section})</p>
          <p><strong>Total Fine:</strong> {app.totalFine} Tk</p>

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

              <iframe
                src={`https://spm-1-u37a.onrender.com/${app.attachment}`}
                width="100%"
                height="220px"
                title="Attachment"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplication;