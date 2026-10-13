import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import DataTable from "react-data-table-component";
import StudentButtonForACAD from "./StudentButtonForACAD";
import "../Dashboard/list.css"
 
const List = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [acad, setAcad] = useState(null);

  useEffect(() => {
    const fetchAcadProfile = async () => {
      try {
        const res = await axios.get("https://spm-1-u37a.onrender.com/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.data.success) {
          setAcad(res.data.user); 
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://spm-1-u37a.onrender.com/api/students", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.data.success) {
          let i = 1;
          setStudents(res.data.students.map((s) => ({
            _id: s._id,
            sno: i++,
            studentId: s.user?.userID || "N/A",
            name: s.user?.name || "N/A",
            department: s.user?.department || "N/A",
            profileImage: s.user?.profileImage  ? `https://spm-1-u37a.onrender.com/imageUploads/uploads/${s.user.profileImage}`: "",
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAcadProfile();
    fetchStudents();
  }, []);

  const filteredStudents = students
    .filter((student) => {
      if (!acad) return true;

      return (
        student.department?.toLowerCase() ===
        acad.department?.toLowerCase()
      );
    })
    .filter((student) =>
      (student.studentId || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const columns = [
    { name: "Student ID", selector: (row) => row.studentId, sortable: true, grow: 1.3, minWidth: "130px" },
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
    { name: "Name", selector: (row) => row.name, sortable: true, grow: 2, minWidth: "150px" },
    {
      name: "Action",
      cell: (row) => <StudentButtonForACAD id={row._id} />, 
      grow: 1.2,
      minWidth: "115px",
      center: true
    },
  ];

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
        <h2 className="dashboard-title">Manage Students</h2>
        <div className="search-box glass">
          <input
              type="text"
             placeholder="Search by student ID"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="back">
          <Link to="/ACAD-dashboard">
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

export default List;
