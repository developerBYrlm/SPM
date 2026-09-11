import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../Dashboard/ViewActionButton/ViewActionButton.css";

const ACADApplicationView = () => {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const { data } = await axios.get(
          `https://spm-1-u37a.onrender.com/api/student-application/application-view/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        if (data.success) setApp(data.application);
      } catch (error) {
        console.error(error);
        alert("Error fetching application data");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const getStatusClass = (status) => {
    const value = status?.toLowerCase();
    if (value === "approved") return "approved";
    if (value === "rejected") return "rejected";
    return "pending";
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

  if (loading) {
    return <div className="loading"><div className="ring" /></div>;
  }

  if (!app) {
    return <div className="main-content"><p>Application not found.</p></div>;
  }

  return (
    <div className="main-content">
      <div className="dashboard-container">
        <h2 className="dashboard-title">Application Details</h2>

        <div className="back">
          <Link to="/acad-dashboard/students-acad-applications">
            <i className="fa-solid fa-backward" />
          </Link>
        </div>

        <div className="details-card">
          <div className="status-container-view">
            <div className="faculty-status-list">
              <span className={`status-text-view ${getStatusClass(app.authorityStatus)}`}>
                Authority: {app.authorityStatus || "Pending"}
              </span>
            </div>

            <div className="faculty-status-list">
              {app.facultyStatuses?.map((item, index) => (
                <span
                  key={item._id || `${item.facultyAcr}-${index}`}
                  className={`status-text-view ${getStatusClass(item.status)}`}
                >
                  Faculty: {item.status || "Pending"} [{item.facultyAcr}]
                </span>
              ))}
            </div>
          </div>

          <h3><strong>Application Submit Date:</strong> {formatDate(app.createdAt)}</h3>
          <p><strong>Department:</strong> {app.department || "N/A"}</p>
          <p><strong>Student ID:</strong> {app.studentId || "N/A"}</p>
          <p><strong>Name:</strong> {app.name || "N/A"}</p>
          <p><strong>Exam Type:</strong> {app.missedExamType || "N/A"}</p>
          <p><strong>Semester:</strong> {app.semester || "N/A"} (Section: {app.section || "N/A"})</p>
          <p><strong>Total Fine:</strong> {app.totalFine ?? 0} Tk</p>

          <h3>Missed Courses:</h3>
          <ul>
            {app.courses?.map((course, index) => (
              <li key={course._id || `${course.courseId}-${index}`}>
                {course.courseId} - {course.courseTitle} (Faculty: {course.facultyAcr}) - Date: {formatDate(course.missedExamDate)}
              </li>
            ))}
          </ul>

          <pre className="reason-box">{app.reason || "No reason provided."}</pre>
        </div>
      </div>
    </div>
  );
};

export default ACADApplicationView;