import { useNavigate } from "react-router-dom";
import '../Dashboard/studentButtons.css'


const StudentButtonForFaculty = ({ id }) =>{
    const navigate = useNavigate();

     return (
    <div className="action-btn-group">
      <button
        className="student-action-btn btn-view"
        onClick={() => navigate(`/faculty-dashboard/students/view/${id}`)}
        title="View"
      >
        <i className="fa-solid fa-eye"></i>
      </button>
    </div>
  );

}

export default StudentButtonForFaculty;