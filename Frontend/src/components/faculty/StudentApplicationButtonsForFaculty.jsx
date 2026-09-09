import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../Dashboard/studentButtons.css"

const StudentApplicationButtons = ({ id, onDeleteSuccess }) => {
  const navigate = useNavigate();

  const handleRemove = async () => {
    if (window.confirm("Are you sure you want to remove this application?")) {
      try {
        const res = await axios.delete(`https://spm-1-u37a.onrender.com/api/student-application/application-remove/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }); 
        if (res.data.success) {
          alert("Application removed");
          onDeleteSuccess(); 
        }
      } catch (err) {
        alert("Failed to remove application");
      }
    }
  };

  return (
    <div className="action-btn-group">
      <button 
        className="student-action-btn btn-view" 
        onClick={() => navigate(`/faculty-dashboard/application/application-view/${id}`)}
      >
        View
      </button>
      
    </div>
  );
};

export default StudentApplicationButtons;