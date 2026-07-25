import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext';
import '../Dashboard/authoritySidebar.css'


const StudentSidebar = () => {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

  const handleLogout = () => {
 
    sessionStorage.removeItem("studentLoginPopup");
    
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
          <p className="welcome-text">Welcome <br className='gap' /> {user.name}</p>
                 
        </div>

        <ul className="sidebar-menu">

          <li>
            <NavLink to="/student-dashboard" 
            end 
            className={({ isActive }) => 
            isActive 
            ? "sidebar-item custom-hover active" 
            : "sidebar-item custom-hover" }>
              
              <i className="fa-solid fa-gauge"></i>
              <span>Dashboard</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/student-dashboard/student-faculty-view"  className="sidebar-item custom-hover">
              
              <i className="fa-solid fa-person-chalkboard"></i>
              <span>Faculty</span>
            </NavLink>
          </li>
         </ul>
         
        <div className='developer'>
          <a href="https://www.facebook.com/robiulislam.RLM"  target="_blank"  rel="noopener noreferrer">
          Developer by RLM (NUBian)            
          </a>
        </div>

        <div>
            <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      
    </div>
  );
};

  
export default StudentSidebar
