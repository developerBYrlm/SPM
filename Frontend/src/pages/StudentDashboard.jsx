import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import StudentSidebar from '../components/student/StudentSidebar';
import { Outlet } from 'react-router-dom';
import './website.css';

const StudentDashboard = () => {
    const { user } = useAuth();

    const [success, setSuccess] = useState(() => {
        const popupShown = sessionStorage.getItem("studentLoginPopup");
        if (!popupShown) {
            sessionStorage.setItem("studentLoginPopup", "true");
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
                        <p>Welcome, {user?.name || "Student"}!</p>
                        <button onClick={() => setSuccess(false)}>OK</button>
                    </div>
                </div>
            )}

            <div>
                <StudentSidebar />
                <Outlet />
            </div>
        </>
    );
};


export default StudentDashboard
