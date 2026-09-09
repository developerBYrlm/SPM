import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../Dashboard/studentButtons.css";


const ITActionButtons = ({ id }) =>{
    const navigate = useNavigate();

    const handleRemove = async () => {
        const confirmRemove = window.confirm("Are you sure you want to remove this Faculty Member?");
        
        if (confirmRemove) {
            try {
                const response = await axios.delete(
                    `https://spm-1-u37a.onrender.com/api/faculty/faculty-remove/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                
                if (response.data.success) {
                    alert("IT removed successfully");
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
        onClick={() => navigate(`/it-dashboard/it/it-view/${id}`)} 
      >
        View
      </button>

      <button
        className="student-action-btn btn-edit"
        onClick={() => navigate(`/it-dashboard/it/it-edit/${id}`)}
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

export default ITActionButtons;
