import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import './website.css';
import AuthoritySidebar from '../components/Dashboard/AuthoritySidebar';
import AuthoritySummary from '../components/Dashboard/AuthoritySummary';
import { Outlet } from 'react-router-dom';
 
const AuthorityDashboard = () => {
 
    const { user } = useAuth();
  
    const [success, setSuccess] = useState(false);

    // Popup will show only ONCE after login
    useEffect(() => {
    if (user) {
        const popupShown = sessionStorage.getItem("authorityLoginPopup");

        if (!popupShown) {
            setSuccess(true);
            sessionStorage.setItem("authorityLoginPopup", "true");
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
