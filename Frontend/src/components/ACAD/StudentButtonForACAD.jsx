import React from 'react'
import { useNavigate } from "react-router-dom";
import '../Dashboard/studentButtons.css'

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
//         cell: (row) => <studentButtons id={row._id} />,
//         width: "200px"
//     },
// ]

const StudentButtonForACAD = ({ id }) =>{
    const navigate = useNavigate();

    // const handleDelete = async (id) => {
    //     const  confirm = window.confirm("Do you want to Delete?");
    //     if(confirm){
    //         try{
    //             const response = await axios.delete (
    //                 `http://localhost:8000/api/ deletePath /${ delete_types }`,
    //                 {
    //                     headers: {
    //                         Authorization: `Bearere ${localStorage.getItem("token")}`,
    //                     },
    //                 }
    //             );
    //             if (response.data,success) {
    //                 on delete_types variable ( delete_types );
    //             }
    //         }catch (error) {
    //             if(error.response && !error.response.data.success){
    //                 alert(error.response.data.error);
    //             }
    //         }
    //     }
    // };

     return (
    <div className="action-btn-group">
      <button
        className="student-action-btn btn-view"
        onClick={() => navigate(`/students/view/${id}`)}
      >
        View
      </button>

    </div>
  );

}

export default StudentButtonForACAD;
