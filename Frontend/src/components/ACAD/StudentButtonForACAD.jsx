import React from "react";
import { useNavigate } from "react-router-dom";
import "../Dashboard/studentButtons.css";

const StudentButtonForACAD = ({ id }) => {
  const navigate = useNavigate();

  return (
    <div className="action-btn-group">
      <button
        type="button"
        className="student-action-btn btn-view"
        onClick={() => navigate(`/acad-dashboard/student-application-view/${id}`)}
      >
        View
      </button>
    </div>
  );
};

export default StudentButtonForACAD;