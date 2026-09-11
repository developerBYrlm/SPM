import React, { useEffect, useState } from "react";
import axios from "axios";
import "./routine.css";

const RoutineUpsh = () => {
  const [file, setFile] = useState(null);
  const [latestRoutine, setLatestRoutine] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get the latest routine
  const fetchRoutine = async () => {
    try {
      const res = await axios.get("https://spm-1-u37a.onrender.com/api/routine/latest");
      if (res.data.success) setLatestRoutine(res.data.routine);
    } catch (err) {
      console.error(err);
      setLatestRoutine(null);
    }
  };

  // Get routine when page loads
  useEffect(() => {
    fetchRoutine();
  }, []);

  // Select PDF file
  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Upload routine
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF file first");

    const data = new FormData();
    data.append("attachment", file);
    setLoading(true);

    try {
      const res = await axios.post(
        "https://spm-1-u37a.onrender.com/api/routine/upload",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert("Routine Published Successfully!");
        setFile(null);
        fetchRoutine();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Delete routine
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this routine? This will allow you to upload a new one.")) return;

    try {
      const res = await axios.delete(`https://spm-1-u37a.onrender.com/api/routine/delete/${id}`);
      if (res.data.success) {
        alert("Routine Deleted Successfully!");
        setLatestRoutine(null);
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="routine-card">
      <div className="routine-header">
        <h2 className="routine-title">
          <i className="fa-solid fa-calendar-days"></i> Exam Routine Control
        </h2>
        <p className="routine-subtitle">Manage and publish the Special exam schedule</p>
      </div>

      <div className="routine-body">
        {!latestRoutine ? (
          <div className="upload-wrapper">
            <form onSubmit={handleUpload} className="upload-form">
              <div className="upload-area">
                <label htmlFor="file-upload" className="file-label">
                  <div className="upload-icon"><i className="fa-solid fa-cloud-arrow-up"></i></div>
                  <span className="upload-text">Select Routine PDF</span>
                  <input
                    id="file-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    required
                  />
                </label>
                {file && <p className="selected-filename">Selected: {file.name}</p>}
              </div>

              <button type="submit" className="publish-btn" disabled={loading}>
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Publishing...</>
                ) : (
                  <><i className="fa-solid fa-paper-plane"></i> Publish Routine</>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="display-wwrapper">
            <div className="display-actions">
              <h3 className="current-status">
                <span className="status-dot"></span> Active Routine
              </h3>
              <button
                onClick={() => handleDelete(latestRoutine._id)}
                className="delete-routine-btn"
              >
                <i className="fa-solid fa-trash-can"></i> Remove & Update
              </button>
            </div>

            {/* Show routine PDF */}
            <div className="pdf-viewer-frame">
              {`https://spm-1-u37a.onrender.com/uploads/routines/${latestRoutine.filename}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineUpsh;