import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext';
import '../Dashboard/authoritySidebar.css'

const ITSidebar = () =>  {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

  const handleLogout = () => {
    
    sessionStorage.removeItem("ITLoginPopup");

    if (logout) logout();

    navigate('/login'); 
};

  return (
      <div>
      <div className="sidebar">
        <h3 className="sidebar-titlee">NUB</h3>
        <h3 className="sidebar-titles">Special Exam Management System</h3>

        <div className="sidebar-welcome">
                 <p className="welcome-text">Welcome <br className='gap' /> {user.name}</p>
                 
        </div>

        <ul className="sidebar-menu">
          <li>
            <NavLink to="/IT-dashboard" 
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
            <NavLink to="/IT-dashboard/it" className="sidebar-item custom-hover">
              <i className="fa-solid fa-desktop"></i>
              <span>IT Member</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/IT-dashboard/authority" className="sidebar-item custom-hover">
              <i className="fa-solid fa-chalkboard-user"></i>
              <span>Department Head</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink to="/IT-dashboard/students" className="sidebar-item custom-hover">
              <i className="fa-solid fa-user-graduate"></i>
              <span>Students</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/IT-dashboard/students-applicationss" className="sidebar-item custom-hover">
              <i className="fa-solid fa-file"></i>
              <span>Student Application</span>
            </NavLink>
          </li> 


          <li>
            <NavLink to="/IT-dashboard/faculty" className="sidebar-item custom-hover">
              <i className="fa-solid fa-person-chalkboard"></i>
              <span>Faculty</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/IT-dashboard/acad" className="sidebar-item custom-hover">
              <i className="fa-solid fa-computer"></i>
              <span>ACAD</span>
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

export default ITSidebar
