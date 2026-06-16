import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import '../Dashboard/authoritySidebar.css';

const ACADsidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {

    sessionStorage.removeItem("acadLoginPopup");
    if (logout) logout();
    navigate('/login');
  };
 
  return (
    <div>
      {/* Sidebar */}
      <div className="sidebar">
        <h3 className="sidebar-titlee">NUB</h3>
        <h3 className="sidebar-titles">Special Exam Application</h3>

        <div className="sidebar-welcome">
          <p className="welcome-text">
            Welcome <br className="gap" /> {user?.name || "ACAD"}
          </p>
        </div>

        <ul className="sidebar-menu">
          <li>
            <NavLink
              to="/acad-dashboard"
              end
              className={({ isActive }) =>
                isActive
                  ? "sidebar-item custom-hover active"
                  : "sidebar-item custom-hover"
              }
            >
              <i className="fa-solid fa-gauge"></i>
              <span>Dashboard</span>
            </NavLink>
          </li>

          <li>
             <NavLink to="/acad-dashboard/students-acad-applications" className="sidebar-item custom-hover">
               <i className="fa-solid fa-file"></i>
               <span>Student Application</span>
             </NavLink>
         </li>
          

          {/* <li>
            <NavLink
              to="/ACAD-dashboard/settings"
              className="sidebar-item custom-hover"
            >
              <i className="fa-solid fa-gears"></i>
              <span>Settings</span>
            </NavLink>
          </li> */}
        </ul>

        <div>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ACADsidebar;
