import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import './website.css';
import AuthoritySidebar from '../components/Dashboard/AuthoritySidebar';
import { Outlet } from 'react-router-dom';
 
const AuthorityDashboard = () => {
    const { user } = useAuth();
  
    const [success, setSuccess] = useState(() => {
        const popupShown = sessionStorage.getItem("authorityLoginPopup");
        if (!popupShown) {
            sessionStorage.setItem("authorityLoginPopup", "true");
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
                        <p>Welcome, {user?.name || "Authority"}!</p>
                        <button onClick={() => setSuccess(false)}>OK</button>
                    </div>
                </div>
            )}

            <div>
                <AuthoritySidebar />
                <Outlet />
            </div>
        </>
    );
};

export default AuthorityDashboard;
