import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../Dashboard/ViewActionButton/ViewActionButton.css';

const ACADApplicationView = () => {
  const { id } = useParams();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await axios.get(
          `https://spm-1-u37a.onrender.com/api/student-application/application-view/${id}`,
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
        alert("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id]);

  if (loading) {
    return (
      <div className="loading">
        <div className="ring"></div>
      </div>
    );
  }

  const handleStatusChange = async (status) => {
    try {
      setActionLoading(true);

      await axios.put(
        `https://spm-1-u37a.onrender.com/api/student-application/update-status/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setApp((prev) => {
        if (status === "approved_by_authority")
          return { ...prev, authorityStatus: "approved" };

        if (status === "rejected_by_authority")
          return { ...prev, authorityStatus: "rejected" };

        if (status === "approved_by_faculty")
          return { ...prev, facultyStatus: "approved" };

        if (status === "rejected_by_faculty")
          return { ...prev, facultyStatus: "rejected" };

        return prev;
      });

      alert(`Application ${status.replaceAll("_", " ").toUpperCase()}`);
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  return (
      <div className="main-content">
        <div className="dashboard-container">
          <h2 className="dashboard-title">My Application Status</h2>
  
          <div className="back">
          <Link to="/acad-dashboard/students-acad-applications">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>
  
          <div className="details-card">
            <div className="status-container-view">
              <div className="faculty-status-list">
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
  
          </div>
        </div>
      </div>
    );
};

export default ACADApplicationView;