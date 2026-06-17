import axios from 'axios';
import React, { useEffect, useState} from 'react';
import { useParams, Link } from 'react-router-dom';
import '../Dashboard/ViewActionButton/ViewActionButton.css';

const FacultyApplicationView = () => {
  const { id } = useParams();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
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

      //alert(`Application ${status.replaceAll("_", " ").toUpperCase()}`);
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
  <div className="main-content">
    <div className="dashboard-container">
      
      {/* Title & Back Button */}
      <h2 className="dashboard-title">Full Application Details</h2>
      <div className="back">
        <Link to="/faculty-dashboard/students-faculty-applications">
          <i className="fa-solid fa-backward"></i>
        </Link>
      </div>

      <div className="details-card">

        {/* ================= Action Buttons ================= */}
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

          {/* Faculty Approve */}
          <button
            className={`btn-faculty ${
              app.facultyStatus.toLowerCase() === "approved"
                ? "approved"
                : app.facultyStatus.toLowerCase() === "rejected"
                ? "rejected"
                : ""
            }`}
            onClick={() => handleStatusChange("approved_by_faculty")}
            disabled={actionLoading}
          >
            {app.facultyStatus.toLowerCase() === "approved"
              ? "Approved"
              : "Approve (Faculty)"}
          </button>

          {/* Faculty Reject */}
          <button
            className={`btn-faculty ${
              app.facultyStatus.toLowerCase() === "rejected"
                ? "rejected"
                : app.facultyStatus.toLowerCase() === "approved"
                ? "approved"
                : ""
            }`}
            onClick={() => handleStatusChange("rejected_by_faculty")}
            disabled={actionLoading}
          >
            {app.facultyStatus.toLowerCase() === "rejected"
              ? "Rejected"
              : "Reject (Faculty)"}
          </button>

        </div>
        {/* ================= End Action Buttons ================= */}


        {/* ================= Application Info ================= */}
        <h3>
          <strong>Application Submit Date:</strong>{" "}
          {new Date(app.missedExamDate).toLocaleDateString()}
        </h3>

        <p><strong>Department:</strong> {app.department}</p>
        <p><strong>Student ID:</strong> {app.studentId}</p>
        <p><strong>Name:</strong> {app.name}</p>
        <p><strong>Exam Type:</strong> {app.missedExamType}</p>

        <p>
          <strong>Semester:</strong> {app.semester}{" "}
          (Section: {app.section})
        </p>

        <p><strong>Total Fine:</strong> {app.totalFine} Tk</p>
        {/* ================= End Application Info ================= */}


        {/* ================= Courses ================= */}
        <h3>Courses:</h3>
        <ul>
          {app.courses.map((course, index) => (
            <li key={index}>
              {course.courseId} - {course.courseTitle}{" "}
              (Faculty: {course.facultyAcr}) —{" "}
              Date: {new Date(course.missedExamDate).toLocaleDateString()}
            </li>
          ))}
        </ul>
        {/* ================= End Courses ================= */}


        {/* ================= Reason ================= */}
        <div className="reason-box">
          <strong> </strong> {app.reason}
        </div>
        {/* ================= End Reason ================= */}


        {/* ================= Attachment ================= */}
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
        {/* ================= End Attachment ================= */}

      </div>
    </div>
  </div>
);

};

export default FacultyApplicationView;
