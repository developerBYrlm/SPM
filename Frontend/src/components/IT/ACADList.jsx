import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import DataTable from "react-data-table-component";
import AcadButtons from "./ActionButtons/ACADActionButtons"; 
import "../Dashboard/list.css";

const ACADList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filteredStudents = students
    .filter((student) =>
      (student.studentId || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const columns = [
    { name: "ACAD ID", selector: (row) => row.studentId, sortable: true, grow: 1.2, minWidth: "125px" },
    {
      name: "Image",
      cell: (row) => (
        <img
          src={row.profileImage || "/default.png"}
          alt="IMG"
          className="student-image"
        />
      ),
      width: "70px",
      center: true,
    },
    { name: "Name", selector: (row) => row.name, sortable: true, grow: 1.8, minWidth: "140px" },
    { name: "Department", selector: (row) => row.department, sortable: true, grow: 1, minWidth: "105px", center: true },
    {
      name: "Action",
      cell: (row) => <AcadButtons id={row._id} />, 
      grow: 1.2,
      minWidth: "125px", 
      center: true,
    },
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://spm-1-u37a.onrender.com/api/acad", {
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
            profileImage: s.user?.profileImage  ? `https://spm-1-u37a.onrender.com/imageUploads/uploads/${s.user.profileImage}`: "",
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }; 

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
          <Link to="/it-dashboard">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <div className="table-wrapper glass">
          <DataTable
            columns={columns}
            data={filteredStudents}
            progressPending={loading}
            pagination
            responsive
          />
        </div>
      </div>
    </div>
  );
};

export default ACADList
