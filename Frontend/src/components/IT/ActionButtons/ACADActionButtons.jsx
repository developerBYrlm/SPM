import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../Dashboard/studentButtons.css";

const ACADActionButtons = ({ id }) =>{
    const navigate = useNavigate();

    const handleRemove = async () => {
        const confirmRemove = window.confirm("Are you sure you want to remove this ACAD member?");
        
        if (confirmRemove) {
            try {
                const response = await axios.delete(
                    `https://spm-1-u37a.onrender.com/api/acad/acad-remove/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                
                if (response.data.success) {
                    alert("ACAD removed successfully");
                    window.location.reload();
                }
            } catch (error) { 
                alert(error.response?.data?.error || "Delete failed");
            }
        }
    };

     return (
    <div className="action-btn-group">
      <button
        className="student-action-btn btn-view"
        onClick={() => navigate(`/it-dashboard/acad/acad-view/${id}`)} 
      >
        View
      </button>

      <button
        className="student-action-btn btn-edit"
        onClick={() => navigate(`/it-dashboard/acad/acad-edit/${id}`)}
      >
        Edit
      </button>


      <button
        className="student-action-btn btn-leave"
        onClick={handleRemove}
      >
        Remove
      </button>
    </div>
  );

};

export default ACADActionButtons;
