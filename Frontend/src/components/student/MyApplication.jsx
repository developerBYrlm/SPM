import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../Dashboard/ViewActionButton/ViewActionButton.css';


const MyApplication = () => {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "http://localhost:8000/api/student-application/my-application",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) setApp(res.data.application);
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

    // apply consider percentage to total fine
  const handleConsiderAmount = async () => {
    const newFine = Math.round(app.totalFine * (considerPercentage / 100)); // calculate considered fine
    setConsideredFine(newFine); // update frontend immediately

    try {
      setActionLoading(true);

      const res = await axios.put(
        `http://localhost:8000/api/student-application/update-consider-amount/${id}`,
        { percentage: considerPercentage },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (res.data.success) setApp(res.data.application); // update backend fine
      alert(`Total Fine updated to ${newFine} Tk (${considerPercentage}% considered)`);
    } catch (error) {
      alert("Failed to update total fine");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!app) return <div>No Application Found</div>;

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
          <p><strong>Semester:</strong> {app.semester} (Section: {app.section})</p>
          <p><strong>Total Fine:</strong> {app.totalFine} Tk</p>
 
          

          <h3>Missed Courses:</h3>
          <ul>
            {app.courses.map((course, index) => (
              <li key={index}>
                {course.courseId} - {course.courseTitle} (Faculty: {course.facultyAcr}) - 
                Date: {new Date(course.missedExamDate).toLocaleDateString()}
              </li>
            ))}
          </ul>

          <pre className="reason-box">
            <h3>Reason:</h3> 
            {app.reason}
          </pre>

          {app.attachment && (
            <div className="pdf-view">
              <h3>Attachment:</h3>
              <iframe
                src={`http://localhost:8000/${app.attachment}`}
                width="100%"
                height="220px"
                title="PDF Attachment"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplication;
