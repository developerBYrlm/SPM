import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import StudentSidebar from '../components/student/StudentSidebar';
import { useNavigate, Outlet } from 'react-router-dom';
import './website.css';

const StudentDashboard = () => {

    const { user } = useAuth();

    const [success, setSuccess] = useState(false);

    // Popup will show only ONCE after login
        useEffect(() => {
        if (user) {
            const popupShown = sessionStorage.getItem("studentLoginPopup");
    
            if (!popupShown) {
                setSuccess(true);
                sessionStorage.setItem("studentLoginPopup", "true");
                    }
                }
            }, [user]);
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
