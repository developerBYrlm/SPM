import axios from "axios";
import { useNavigate } from "react-router-dom";
import './studentButtons.css' 

// export const columns = [
//     {
//         name: "S No",
//         selector: (row) => row.sno,
//     },
//     {
//         name: "Student ID",
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
//         cell: (row) => <StudentButtons id={row._id} />,
//         width: "200px"
//     },
// ]

const StudentButtons = ({ id }) =>{
    const navigate = useNavigate();

    const handleRemove = async () => {
        const confirmRemove = window.confirm("Are you sure you want to remove this student?");
        
        if (confirmRemove) {
            try {
                const response = await axios.delete(
                    `http://localhost:8000/api/students/remove/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                
                if (response.data.success) {
                    alert("Student removed successfully");
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
        onClick={() => navigate(`/authority-dashboard/students/view/${id}`)} 
      >
        View 
      </button>

      <button
        className="student-action-btn btn-edit"
        onClick={() => navigate(`/authority-dashboard/students/edit/${id}`)}
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

export default StudentButtons;