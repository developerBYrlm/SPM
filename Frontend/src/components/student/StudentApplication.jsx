import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/authoritySummary.css';

const StudentApplication = () => {
  const sId = localStorage.getItem("studentId");
  
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const [showDeadlinePopup, setShowDeadlinePopup] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("https://spm-1-u37a.onrender.com/api/exam-schedule", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success && res.data.schedule) {
          const deadline = new Date(res.data.schedule.applicationDeadlineDate);
          deadline.setHours(23, 59, 59, 999);
          
          if (new Date() > deadline) {
            setIsDeadlinePassed(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch exam schedule", err);
      }
    };
    fetchSchedule();
  }, []);

  const handleNewApplicationClick = (e) => {
    if (isDeadlinePassed) {
      e.preventDefault(); 
      setShowDeadlinePopup(true); 
    }
  };

  return (
    <div>
      {showDeadlinePopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2 style={{color: "red"}}>Application Date is Over!</h2>
            <p>You can no longer submit a new application.</p>
            <button onClick={() => setShowDeadlinePopup(false)} style={{padding: '10px 20px', marginTop: '15px', cursor: 'pointer'}}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="main-content">
        <div className="dashboard-container">
          <h3 className="dashboard-title">Student Dashboard</h3>
          <div className='user-design'>
            <a
              href="/student-dashboard/new-application"
              onClick={handleNewApplicationClick}
              style={{ textDecoration: "none" }}
            >
              <button
                className="user"
                style={{ textDecoration: "none", borderBottom: "none" }}
              >
                New Applications
              </button>
            </a>
            <a
              href="/student-dashboard/update-application"
              style={{ textDecoration: "none" }}
            >
              <button
                className="user"
                style={{ textDecoration: "none", borderBottom: "none" }}
              >
                Update Applications
              </button>
            </a>
            <a
              href="/student-dashboard/current-application"
              style={{ textDecoration: "none" }}
            >
              <button
                className="user"
                style={{ textDecoration: "none", borderBottom: "none" }}
              >
                Application Status
              </button>
            </a>
            <a
              href="/student-dashboard/download-admit"
              style={{ textDecoration: "none" }}
            >
              <button
                className="user"
                style={{ textDecoration: "none", borderBottom: "none" }}
              >
                Download Admit
              </button>
            </a>
            <a
              href={sId ? `/student-dashboard/student-profile/${sId}` : "#"}
              style={{ textDecoration: "none" }}
            >
              <button
                className="user"
                disabled={!sId}
                style={{ textDecoration: "none", borderBottom: "none" }}
              >
                Profile
              </button>
            </a>
            {!sId && (
              <p style={{ color: "red", fontSize: "12px" }}>
                Profile ID missing. Please Re-login.
              </p>
            )}
            <a
              href={sId ? `/student-dashboard/student-profile-update/${sId}` : "#"}
              style={{ textDecoration: "none" }}
            >
              <button
                className="user"
                disabled={!sId}
                style={{ textDecoration: "none", borderBottom: "none" }}
              >
                Update Profile
              </button>
            </a>
            {!sId && (
              <p style={{ color: "red", fontSize: "12px" }}>
                Profile ID missing. Please Re-login.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentApplication;