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
        <h2 className="dashboard-title">Full Application Details</h2>
         <div className="back">
           <Link to="/acad-dashboard/students-acad-applications">
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

        <span
          className={`status-text-view ${
            app.facultyStatus === "Approved"
             ? "approved"
             : app.facultyStatus === "Rejected"
             ? "rejected"
             : "pending"
         }`}
        >
          Faculty: {app.facultyStatus || "Pending"}
        </span>
        </div>

          <h3>
            <strong> Application Submit Date: </strong>
            {new Date(app.missedExamDate).toLocaleDateString()}
          </h3>

          <p><strong>Department:</strong> {app.department}</p>
          <p><strong>Student ID:</strong> {app.studentId}</p>
          <p><strong>Name:</strong> {app.name}</p>
          <p><strong>Exam Type:</strong> {app.missedExamType}</p>
          <p>
            <strong>Semester:</strong> {app.semester}
            {" "} (Section: {app.section})
          </p>
          <p><u><strong>  Total Fine: </strong> {app.totalFine} Tk</u></p>

          <h3>Courses:</h3>
          <ul>
            {app.courses.map((course, index) => (
              <li key={index}>
                {course.courseId} - {course.courseTitle}
                {" "} (Faculty: {course.facultyAcr})
                {" "} - (Missed Exam Date:
                {" "}
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


        </div>
      </div>
    </div>
  );
};

export default ACADApplicationView;
