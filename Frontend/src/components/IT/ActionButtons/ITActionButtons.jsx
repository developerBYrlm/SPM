import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../Dashboard/studentButtons.css";


const ITActionButtons = ({ id }) => {
  const navigate = useNavigate();

  const handleRemove = async () => {
    const confirmRemove = window.confirm("Are you sure you want to remove this IT member?");

    if (confirmRemove) {
      try {
        const response = await axios.delete(
          `https://spm-1-u37a.onrender.com/api/it/it-remove/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          alert("IT member removed successfully");
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
        title="View"
      >
        <i className="fa-solid fa-eye"></i>
      </button>

      <button
        className="student-action-btn btn-edit"
        onClick={() => navigate(`/it-dashboard/it/it-edit/${id}`)}
        title="Edit"
      >
        <i className="fa-solid fa-pen-to-square"></i>
      </button>

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

export default ITActionButtons;
