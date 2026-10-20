import React from 'react';
import axios from 'axios';
import "../../Dashboard/studentButtons.css"

const StudentApplicationButtons = ({ id, onDeleteSuccess }) => {
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
        console.error(err);
        alert("Failed to remove application");
      }
    }
  };

  return (
    <div className="action-btn-group">
      <button
        className="student-action-btn btn-leave"
        onClick={handleRemove}
        title="Remove"
      >
        <i className="fa-solid fa-trash-can"></i>
      </button>
    </div>
  );
};

export default StudentApplicationButtons;