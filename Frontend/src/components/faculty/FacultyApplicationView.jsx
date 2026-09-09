import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../Dashboard/ViewActionButton/ViewActionButton.css";

const FacultyApplicationView = () => {
  const { id } = useParams();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [facultyAcr, setFacultyAcr] = useState("");

  useEffect(() => {

    const fetchFaculty = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/auth/me",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        setFacultyAcr(res.data.user.userID.trim().toUpperCase());
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchFaculty();

    const fetchApp = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/student-application/application-view/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.success) {
          setApp(res.data.application);
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

  const handleStatusChange = async (status) => {
    try {
      setActionLoading(true);

      const res = await axios.put(
        `http://localhost:8000/api/student-application/update-status/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        setApp(res.data.application);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="ring"></div>
      </div>
    );
  }

  if (!app) {
    return <div>Application not found</div>;
  }

 const facultyStatus =
  app.facultyStatuses?.find(
    (item) =>
      item.facultyAcr?.trim().toUpperCase() === facultyAcr
  )?.status || "Pending";

  return (
    <div className="main-content">
      <div className="dashboard-container">
        <h2 className="dashboard-title">
          Full Application Details
        </h2>

        <div className="back">
          <Link to="/faculty-dashboard">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <div className="details-card">
          <div className="action-buttons">

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
            </div>

            <button
              className={`btn-faculty ${
                facultyStatus.toLowerCase() === "approved"
                  ? "approved"
                  : facultyStatus.toLowerCase() === "rejected"
                  ? "rejected"
                  : ""
              }`}
              onClick={() =>
                handleStatusChange("approved_by_faculty")
              }
              disabled={actionLoading}
            >
              {facultyStatus.toLowerCase() === "approved"
                ? "Approved"
                : "Approve (Faculty)"}
            </button>

            <button
              className={`btn-faculty ${
                facultyStatus.toLowerCase() === "rejected"
                  ? "rejected"
                  : facultyStatus.toLowerCase() === "approved"
                  ? "approved"
                  : ""
              }`}
              onClick={() =>
                handleStatusChange("rejected_by_faculty")
              }
              disabled={actionLoading}
            >
              {facultyStatus.toLowerCase() === "rejected"
                ? "Rejected"
                : "Reject (Faculty)"}
            </button>
          </div>

          <h3>
            <strong>Application Submit Date:</strong>{" "}
            {new Date(
              app.missedExamDate
            ).toLocaleDateString()}
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
            <strong>Exam Type:</strong>{" "}
            {app.missedExamType}
          </p>

          <p>
            <strong>Semester:</strong> {app.semester}
            {" "}(
            Section: {app.section})
          </p>

          <p>
            <strong>Total Fine:</strong>{" "}
            {app.totalFine} Tk
          </p>

          <h3>Courses:</h3>

          <ul>
            {app.courses?.map((course, index) => (
              <li key={index}>
                {course.courseId} - {course.courseTitle}
                {" "}(
                Faculty: {course.facultyAcr})
                {" "}— Date:{" "}
                {new Date(
                  course.missedExamDate
                ).toLocaleDateString()}
              </li>
            ))}
          </ul>

          <div className="reason-box">
            {app.reason}
          </div>

          {app.attachment && (
            <div className="pdf-view">
              <h3>Attachment:</h3>

              <iframe
                src={`http://localhost:8000/${app.attachment}`}
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

export default FacultyApplicationView;