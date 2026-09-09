import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard/routine.css'; 
import { Link, useNavigate } from "react-router-dom"

const RoutineSh = () => {
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
            const res = await axios.get("https://spm-1-u37a.onrender.com/api/routine/latest");
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

    // --- Routine View Logic ---
    const handleUpload = async (e) => {
    e.preventDefault();

    // Upload disable – only view / refresh routine
    setLoading(true);
    try {
        await fetchRoutine(); 
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
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

                        <p className="none">No routine available</p>
                        {/* 908 error case comment */}
                        {/* <form onSubmit={handleUpload} className="upload-form">
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
                        </form> */}
                    </div>
                ) : (
                    <div className="display-wwrapper">
                        <div className="display-actions">
                            <h3 className="current-status">
                                <span className="status-dot"></span> Active Routine
                            </h3>
                            
                        </div>

                        <div className="pdf-viewer-frame">
                            <iframe
                                src={`https://spm-1-u37a.onrender.com/uploads/routines/${latestRoutine.filename}`}
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

export default RoutineSh
