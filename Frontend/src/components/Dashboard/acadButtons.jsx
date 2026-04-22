import axios from "axios";
import { useNavigate } from "react-router-dom";
import './studentButtons.css'

// export const columns = [
//     {
//         name: "S No",
//         selector: (row) => row.sno,
//     },
//     {
//         name: "ACAD ID",
//         selector: (row) => row.StudentID,
//         sortable: true
//     },
//     {
//         name: "Image",
//         selector: (row) => row.profileImage,
//         sortable: true
//     },{
//         name: "Name",
//         selector: (row) => row.Name,
//         sortable: true
//     },
//     {
//         name: "Action",
//         cell: (row) => <acadButtons id={row._id} />,
//         width: "200px"
//     },
// ]

const acadButtons = ({ id }) =>{
    const navigate = useNavigate();

    const handleRemove = async () => {
        const confirmRemove = window.confirm("Are you sure you want to remove this ACAD member?");
        
        if (confirmRemove) {
            try {
                const response = await axios.delete(
                    `http://localhost:8000/api/acad/acad-remove/${id}`,
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
        onClick={() => navigate(`/authority-dashboard/acad/acad-view/${id}`)} 
      >
        View
      </button>

      <button
        className="student-action-btn btn-edit"
        onClick={() => navigate(`/authority-dashboard/acad/acad-edit/${id}`)}
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

}

export default acadButtons;