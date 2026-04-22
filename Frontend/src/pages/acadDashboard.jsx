import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { Outlet } from 'react-router-dom';
import './website.css';
import ACADsidebar from '../components/ACAD/ACADsidebar';

const acadDashboard = () => {

    const { user } = useAuth();

    const [success, setSuccess] = useState(false);

    // Popup will show only ONCE after login
        useEffect(() => {
        if (user) {
            const popupShown = sessionStorage.getItem("acadLoginPopup");
    
            if (!popupShown) {
                setSuccess(true);
                sessionStorage.setItem("acadLoginPopup", "true");
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
                        <p>Welcome, {user?.name || "acad"}!</p>
                        <button onClick={() => setSuccess(false)}>OK</button>
                    </div>
                </div>
            )}

            <div>
                <ACADsidebar />
                <Outlet />
            </div>
        </>
    );
};

export default acadDashboard
