import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ViewActionButton.css';

const ApplicationView = () => {
  const { id } = useParams();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [considerPercentage, setConsiderPercentage] = useState(100);
  const [consideredFine, setConsideredFine] = useState(0);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/student-application/application-view/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        if (res.data.success) {
          setApp(res.data.application);
          setConsideredFine(res.data.application.totalFine);
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
        `http://localhost:8000/api/student-application/update-status/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setApp(prev => {
        if (status === "approved_by_authority")
          return { ...prev, authorityStatus: "Approved" };

        if (status === "rejected_by_authority")
          return { ...prev, authorityStatus: "Rejected" };

        if (status === "approved_by_faculty")
          return { ...prev, facultyStatus: "Approved" };

        if (status === "rejected_by_faculty")
          return { ...prev, facultyStatus: "Rejected" };

        return prev;
      });

    } catch (error) {
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConsiderAmount = async () => {
    const newFine = Math.round(app.totalFine * (considerPercentage / 100));
    setConsideredFine(newFine);

    try {
      setActionLoading(true);

      const res = await axios.put(
        `http://localhost:8000/api/student-application/update-consider-amount/${id}`,
        { percentage: considerPercentage },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (res.data.success) {
        setApp(res.data.application);
      }

    } catch (error) {
      alert("Failed to update total fine");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="main-content">
      <div className="dashboard-container">
        <h2 className="dashboard-title">Full Application Details</h2>

        <div className="back">
          <Link to="/authority-dashboard/students-applications">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <div className="details-card">
          <div className="action-buttons">
            <div className="status-container-view">

              {/* Authority Approve */}
              <button
                className={`btn-authority ${
                  app.authorityStatus.toLowerCase() === "approved"
                    ? "approved"
                    : app.authorityStatus.toLowerCase() === "rejected"
                    ? "rejected"
                    : ""
                }`}
                onClick={() => handleStatusChange("approved_by_authority")}
                disabled={actionLoading}
              >
                {app.authorityStatus.toLowerCase() === "approved"
                  ? "Approved"
                  : "Approve (Authority)"}
              </button>

              {/* Authority Reject */}
              <button
                className={`btn-authority ${
                  app.authorityStatus.toLowerCase() === "rejected"
                    ? "rejected"
                    : app.authorityStatus.toLowerCase() === "approved"
                    ? "approved"
                    : ""
                }`}
                onClick={() => handleStatusChange("rejected_by_authority")}
                disabled={actionLoading}
              >
                {app.authorityStatus.toLowerCase() === "rejected"
                  ? "Rejected"
                  : "Reject (Authority)"}
              </button>
              </div>
              <div className="faculty-status-list">
                {app.facultyStatuses?.map((item, index) => (
                  <span
                    key={index}
                    className={`status-text-view faculty-status-item ${
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

          <p><strong>Department:</strong> {app.department}</p>
          <p><strong>Student ID:</strong> {app.studentId}</p>
          <p><strong>Name:</strong> {app.name}</p>
          <p><strong>Exam Type:</strong> {app.missedExamType}</p>
          <p><strong>Semester:</strong> {app.semester} (Section: {app.section})</p>

          <p>
            <strong>Total Fine:</strong> {consideredFine} Tk{" "}
            {considerPercentage < 100 && `(${100 - considerPercentage}% considered)`}
          </p>

          <div style={{ margin: "10px 0" }}>
            <div className="consider-amount">
              <label>
                Consider Amount (%):{" "}
                <select
                  value={considerPercentage}
                  onChange={(e) => setConsiderPercentage(Number(e.target.value))}
                >
                  <option value={0}>100%</option>
                  <option value={50}>50%</option>
                  <option value={70}>30%</option>
                  <option value={80}>20%</option>
                  <option value={90}>10%</option>
                </select>
              </label>

              <button
                onClick={handleConsiderAmount}
                style={{ marginLeft: "10px" }}
              >
                Apply
              </button>
            </div>
          </div>

          <h3>Courses:</h3>
          <ul>
            {app.courses.map((course, index) => (
              <li key={index}>
                {course.courseId} - {course.courseTitle} (Faculty: {course.facultyAcr}) -
                (Missed Exam Date:{" "}
                {new Date(course.missedExamDate)
                  .toISOString()
                  .split("T")[0]
                  .split("-")
                  .reverse()
                  .join("-")}
                )
              </li>
            ))}
          </ul>

          <div className="reason-box">
            <strong> </strong> {app.reason}
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

export default ApplicationView;