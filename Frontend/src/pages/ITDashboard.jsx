import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import './website.css';
import ITSidebar from '../components/IT/ITSidebar';
import { Outlet } from 'react-router-dom';

const ITDashboard = () =>  {
    const { user } = useAuth();
  
    const [success, setSuccess] = useState(() => {
        const popupShown = sessionStorage.getItem("itLoginPopup");
        if (!popupShown) {
            sessionStorage.setItem("itLoginPopup", "true");
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
                        <p>Welcome, {user?.name || "IT"}!</p>
                        <button onClick={() => setSuccess(false)}>OK</button>
                    </div>
                </div>
            )}

            <div>
                <ITSidebar />
                <Outlet />
            </div>
        </>
    );
};

export default ITDashboard
