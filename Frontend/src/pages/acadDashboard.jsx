import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { Outlet } from 'react-router-dom';
import './website.css';
import ACADsidebar from '../components/ACAD/ACADsidebar';

const AcadDashboard = () => {
    const { user } = useAuth();

    const [success, setSuccess] = useState(() => {
        const popupShown = sessionStorage.getItem("acadLoginPopup");
        if (!popupShown) {
            sessionStorage.setItem("acadLoginPopup", "true");
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

export default AcadDashboard;
