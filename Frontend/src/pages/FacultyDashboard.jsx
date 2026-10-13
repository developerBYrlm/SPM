import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { Outlet } from 'react-router-dom';
import './website.css';
import FacultySidebar from '../components/faculty/facultySidebar';

const FacultyDashboard = () => {
    const { user } = useAuth();
    
    const [success, setSuccess] = useState(() => {
        const popupShown = sessionStorage.getItem("facultyLoginPopup");
        if (!popupShown) {
            sessionStorage.setItem("facultyLoginPopup", "true");
            return true;
        }
        return false;
    });

      return (
        <>
            {/* SUCCESS POPUP */}
            {success && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h2>Login Successful</h2>
                        <p>Welcome, {user?.name || "Faculty"}!</p>
                        <button onClick={() => setSuccess(false)}>OK</button>
                    </div>
                </div>
            )}

            <div>
                < FacultySidebar/>
                < Outlet />
            </div>
        </>
    );
};


export default FacultyDashboard
