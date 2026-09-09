import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import './website.css';
import ITSidebar from '../components/IT/ITSidebar';
import { Outlet } from 'react-router-dom';

const ITDashboard = () =>  {
 
    const { user } = useAuth();
  
    const [success, setSuccess] = useState(false);

    // Popup will show only ONCE after login
    useEffect(() => {
    if (user) {
        const popupShown = sessionStorage.getItem("itLoginPopup");

        if (!popupShown) {
            setSuccess(true);
            sessionStorage.setItem("itLoginPopup", "true");
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
