import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./ViewActionButton.css";

const ApplicationView = () => {
  // Get application ID from URL
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [considerPercentage, setConsiderPercentage] = useState(100);
  const [consideredFine, setConsideredFine] = useState(0);

  // Get application data
  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await axios.get(
          `https://spm-1-u37a.onrender.com/api/student-application/application-view/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        if (res.data.success) {
          setApp(res.data.application);
          setConsideredFine(res.data.application.totalFine);
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id]);

  // Update authority status
  const handleStatusChange = async (status) => {
    try {
      setActionLoading(true);
      await axios.put(
        `https://spm-1-u37a.onrender.com/api/student-application/update-status/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setApp((prev) => {
        if (status === "approved_by_authority") return { ...prev, authorityStatus: "Approved" };
        if (status === "rejected_by_authority") return { ...prev, authorityStatus: "Rejected" };
        if (status === "approved_by_faculty") return { ...prev, facultyStatus: "Approved" };
        if (status === "rejected_by_faculty") return { ...prev, facultyStatus: "Rejected" };
        return prev;
      });
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // Update considered fine amount
  const handleConsiderAmount = async () => {
    const newFine = Math.round(app.totalFine * (considerPercentage / 100));
    setConsideredFine(newFine);

    try {
      setActionLoading(true);
      const res = await axios.put(
        `https://spm-1-u37a.onrender.com/api/student-application/update-consider-amount/${id}`,
        { percentage: considerPercentage },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (res.data.success) setApp(res.data.application);
    } catch (error) {
      console.error(error);
      alert("Failed to update total fine");
    } finally {
      setActionLoading(false);
    }
  };

  // Grant special permission directly by Authority in view
  const handleGrantPermission = async () => {
    const confirmGrant = window.confirm(
      `Grant Special Examination Permission for ${app.name} (${app.studentId})? This student has attended 5+ special exams.`
    );
    if (!confirmGrant) return;

    try {
      setActionLoading(true);
      const res = await axios.put(
        `https://spm-1-u37a.onrender.com/api/student-application/grant-permission/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (res.data.success) {
        alert("Special examination permission granted successfully! The application is now sorted in your Authority Pending List.");
        setApp((prev) => ({ ...prev, specialPermissionGranted: true }));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to grant special permission");
    } finally {
      setActionLoading(false);
    }
  };

  // Show loading
  if (loading) return <div className="loading"><div className="ring"></div></div>;

  // Show message if data is not found
  if (!app) return <div>No application data found</div>;

  return (
    <div className="main-content">
      <div className="dashboard-container">
        <h2 className="dashboard-title">Full Application Details</h2>

        {/* Back button */}
        <div className="back">
          <Link to="/authority-dashboard/students-applications">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <div className="details-card">
          {/* 5+ special exams permission alert for Authority */}
          {app.requiresSpecialPermission && (
            <div
              style={{
                backgroundColor: app.specialPermissionGranted
                  ? "rgba(34, 197, 94, 0.12)"
                  : "rgba(239, 68, 68, 0.12)",
                border: `2px solid ${app.specialPermissionGranted ? "#22c55e" : "#ef4444"}`,
                borderRadius: "10px",
                padding: "16px 20px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <i
                    className={`fa-solid ${app.specialPermissionGranted ? "fa-circle-check" : "fa-triangle-exclamation"}`}
                    style={{ fontSize: "22px", color: app.specialPermissionGranted ? "#22c55e" : "#ef4444" }}
                  ></i>
                  <span style={{ fontWeight: "700", color: app.specialPermissionGranted ? "#22c55e" : "#ef4444", fontSize: "14.5px" }}>
                    {app.specialPermissionGranted
                      ? "Special Exam Permission: GRANTED (Student has attended 5+ times)"
                      : "Special Exam Permission: REQUIRED (Student has attended 5+ times)"}
                  </span>
                </div>

                {!app.specialPermissionGranted && (
                  <button
                    onClick={handleGrantPermission}
                    disabled={actionLoading}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "13.5px",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)"
                    }}
                  >
                    <i className="fa-solid fa-key" style={{ marginRight: "6px" }}></i>
                    Grant Permission
                  </button>
                )}
              </div>

              {!app.specialPermissionGranted && (
                <p style={{ margin: 0, fontSize: "13px", color: "#fca5a5", lineHeight: "1.5" }}>
                  This student has already attended 5 special examinations. They must physically meet the Head of Department with required documents. Grant permission here or via the email button to make this application available in your Pending list for final approval.
                </p>
              )}
            </div>
          )}

          {/* Status buttons */}
          <div className="action-buttons">
            <div className="status-container-view">
              <button
                className={`btn-authority ${app.authorityStatus.toLowerCase() === "approved" ? "approved" : app.authorityStatus.toLowerCase() === "rejected" ? "rejected" : ""}`}
                onClick={() => handleStatusChange("approved_by_authority")}
                disabled={actionLoading}
              >
                <i className="fa-solid fa-circle-check"></i> {app.authorityStatus.toLowerCase() === "approved" ? "Approved" : "Approve (Authority)"}
              </button>

              <button
                className={`btn-authority ${app.authorityStatus.toLowerCase() === "rejected" ? "rejected" : app.authorityStatus.toLowerCase() === "approved" ? "approved" : ""}`}
                onClick={() => handleStatusChange("rejected_by_authority")}
                disabled={actionLoading}
              >
                <i className="fa-solid fa-circle-xmark"></i> {app.authorityStatus.toLowerCase() === "rejected" ? "Rejected" : "Reject (Authority)"}
              </button>
            </div>

            {/* Faculty status */}
            <div className="faculty-status-list">
              {app.facultyStatuses?.map((item, index) => (
                <span
                  key={index}
                  className={`status-text-view faculty-status-item ${item.status === "Approved" ? "approved" : item.status === "Rejected" ? "rejected" : "pending"}`}
                >
                  <i className={`fa-solid ${item.status === "Approved" ? "fa-circle-check" : item.status === "Rejected" ? "fa-circle-xmark" : "fa-clock"}`}></i> Faculty: {item.status} [{item.facultyAcr}]
                </span>
              ))}
            </div>
          </div>

          {/* Application details */}
          <h3><strong>Application Submit Date:</strong> {new Date(app.missedExamDate).toLocaleDateString()}</h3>
          <p><strong>Department:</strong> {app.department}</p>
          <p><strong>Student ID:</strong> {app.studentId}</p>
          <p><strong>Name:</strong> {app.name}</p>
          <p><strong>Exam Type:</strong> {app.missedExamType}</p>
          <p><strong>Semester:</strong> {app.semester} (Section: {app.section})</p>
          <p>
            <strong>Total Fine:</strong> {consideredFine} Tk{" "}
            {considerPercentage < 100 && `(${100 - considerPercentage}% considered)`}
          </p>

          {/* Fine consideration */}
          <div style={{ margin: "10px 0" }}>
            <div className="consider-amount">
              <label>
                Consider Amount (%):{" "}
                <select value={considerPercentage} onChange={(e) => setConsiderPercentage(Number(e.target.value))}>
                  <option value={0}>100%</option>
                  <option value={50}>50%</option>
                  <option value={70}>30%</option>
                  <option value={80}>20%</option>
                  <option value={90}>10%</option>
                </select>
              </label>
              <button onClick={handleConsiderAmount} disabled={actionLoading} style={{ marginLeft: "10px" }}>
                <i className="fa-solid fa-check"></i> Apply
              </button>
            </div>
          </div>

          {/* Course list */}
          <h3>Courses:</h3>
          <ul>
            {app.courses.map((course, index) => (
              <li key={index}>
                {course.courseId} - {course.courseTitle} (Faculty: {course.facultyAcr}) -
                (Missed Exam Date: {new Date(course.missedExamDate).toISOString().split("T")[0].split("-").reverse().join("-")})
              </li>
            ))}
          </ul>

          {/* Application reason */}
          <div className="reason-box"><strong></strong> {app.reason}</div>

          {/* PDF attachment */}
          {app.attachment && (
            <div className="pdf-view">
              <h3>Attachment:</h3>
              {`https://spm-1-u37a.onrender.com/${app.attachment}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationView;