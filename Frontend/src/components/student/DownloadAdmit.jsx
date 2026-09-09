import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdmitCard.css";

const DownloadAdmit = () => {
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    getApplication();
  }, []);

  const getApplication = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/student-application/my-application",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        res.data.application.authorityStatus ===
        "Approved"
      ) {
        setApproved(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadAdmit = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/student-application/download-admit-card",
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");

      link.href = url;
      link.download = "AdmitCard.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10">
        Loading...
      </div>
    );
  }

  return (
<div className="admit-main-content">

  <div className="admit-container">

    <h1 className="admit-title">
      Special Exam Admit Card
    </h1>

    <p className="admit-subtitle">
      Download your authority approved
      Special Examination Admit Card.
    </p>

    {approved ? (
      <>
        <div className="admit-status approved">
          ✅ Authority Approved Successfully
        </div>

        <button
          className="download-btn"
          onClick={downloadAdmit}
        >
          <i className="fa-solid fa-download"></i>
          Download Admit Card
        </button>
      </>
    ) : (
      <div className="admit-status pending">
        ⏳ Authority Approval Pending.
        Admit Card Not Available.
      </div>
    )}

    <div className="admit-info-card">
      <h3>PDF Includes</h3>

      <ul>
        <li>Student Information</li>
        <li>Missed Exam Type</li>
        <li>Missed Exam Date</li>
        <li>Faculty Name & Faculty ID</li>
        <li>Course Information</li>
        <li>Special Exam Date</li>
        <li>Application Deadline</li>
        <li>Approved Authority Name</li>
        <li>Approved Official Seal</li>
      </ul>
    </div>

  </div>

</div>
  );
};

export default DownloadAdmit;