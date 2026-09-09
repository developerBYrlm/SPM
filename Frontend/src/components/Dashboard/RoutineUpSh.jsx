import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './routine.css'; 
import { Link, useNavigate } from "react-router-dom"

const RoutineUpsh = () => {
    const [file, setFile] = useState(null);
    const [latestRoutine, setLatestRoutine] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Page load holei check korbe routine ache kina
    useEffect(() => {
        fetchRoutine();
    }, []);

    const fetchRoutine = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/routine/latest");
            if (res.data.success) {
                setLatestRoutine(res.data.routine);
            }
        } catch (err) {
            setLatestRoutine(null); // Routine na thakle null thakbe
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // --- Routine Upload & viewLogic ---
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please select a PDF file first");

        const data = new FormData();
        data.append("attachment", file);

        setLoading(true);
        try {
            const res = await axios.post("http://localhost:8000/api/routine/upload", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data.success) {
                alert("Routine Published Successfully!");
                setFile(null);
                fetchRoutine(); // View update korar jonno call
            }
        } catch (err) {
            alert(err.response?.data?.error || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    // --- Routine Delete Logic ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this routine? This will allow you to upload a new one.")) return;

        try {
            const res = await axios.delete(`http://localhost:8000/api/routine/delete/${id}`);
            if (res.data.success) {
                alert("Routine Deleted Successfully!");
                setLatestRoutine(null); // UI theke routine remove hobe ebong upload form asbe
            }
        } catch (err) {
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
                                    <div className="upload-icon">
                                        <i className="fa-solid fa-cloud-arrow-up"></i>
                                    </div>
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

                        <div className="pdf-viewer-frame">
                            <iframe
                                src={`http://localhost:8000/uploads/routines/${latestRoutine.filename}`}
                                width="100%"
                                height="600px"
                                title="Exam Routine"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>

);
};

export default RoutineUpsh;