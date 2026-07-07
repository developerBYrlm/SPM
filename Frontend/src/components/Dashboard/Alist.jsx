import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import DataTable from "react-data-table-component";
import AcadButtons from "./acadButtons";
import "./list.css";
import './ViewActionButton/ViewActionButton.css'


// acad done

const List = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [authority, setAuthority] = useState(null); 

 
  const fetchAuthorityProfile = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.success) {
        setAuthority(res.data.user); 
      }
    } catch (err) {
      console.error(err);
    }
  };
 
  const filteredStudents = students
    .filter((student) => {
      if (!authority) return true;

      return (
        student.department?.toLowerCase() ===
        authority.department?.toLowerCase()
      );
    })
    
    .filter((student) =>
      (student.studentId || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );



  const columns = [
    // { name: "S No", selector: (row) => row.sno, width: "120px" },
    { name: "ACAD ID", selector: (row) => row.studentId, sortable: true, width: "170px" },
    {
      name: "Image",
      cell: (row) => (
        <img
          src={row.profileImage || "/default.png"}
          alt="student"
          className="student-image"
        />
      ),
      width: "160px",
    },
    { name: "Name", selector: (row) => row.name, sortable: true, width: "310px" },
    {
      name: "Action",
      cell: (row) => <AcadButtons id={row._id} />, width: "290px", center: "true"
    },
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8000/api/acad", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.data.success) {
          let i = 1;
          setStudents(res.data.students.map((s) => ({
            _id: s._id,
            sno: i++,
            studentId: s.user?.userID || "N/A",
            name: s.user?.name || "N/A",
            department: s.user?.department,
            profileImage: s.user?.profileImage  ? `http://localhost:8000/imageUploads/uploads/${s.user.profileImage}`: "",
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }; 

    fetchAuthorityProfile(); 
    fetchStudents();
  }, []);

  
  if (loading) { 
    return ( 
     <div className="loading">
        <div className="ring"></div>
    </div>
    );
  }

  return (
    <div className="main-content">
      <div className="dashboard-container">
        <h2 className="dashboard-title">Manage ACAD</h2>

        <div className="search-box glass">
          <input
              type="text"
             placeholder="Search by ACAD ID"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <div className="back">
          <Link to="/authority-dashboard">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <div className="table-wrapper glass">
          <DataTable
            columns={columns}
            data={filteredStudents}
            progressPending={loading}
            pagination
          />
        </div>
      </div>
    </div>
  );
};

export default List;
