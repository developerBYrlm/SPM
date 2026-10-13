import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import DataTable from "react-data-table-component";
import StudentApplicationsButtonsForACAD from "../StudentApplicationButtonsForACAD";
import "../../Dashboard/list.css" 
import '../../Dashboard/ViewActionButton/ViewActionButton.css'

const ARejected = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [ACAD, setACAD] = useState(null);
  

  const fetchACADProfile = async () => {
  try {
    const res = await axios.get("https://spm-1-u37a.onrender.com/api/auth/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (res.data.success) {
      setACAD(res.data.user); 
    }
  } catch (err) {
    console.error(err);
  }
};

  const filteredApplications = applications
  .filter((app) => app.authorityStatus === "Rejected")
  .filter((app) => {
    if (!ACAD) return false;

    return app.department === ACAD.department; 
  })
  .filter((app) =>
    app.studentId.toLowerCase().includes(search.toLowerCase())
  );
 
  const columns = [
    { name: "Student ID", selector: (row) => row.studentId, sortable: true, grow: 1.1, minWidth: "115px" },
    { name: "Name", selector: (row) => row.name, sortable: true, grow: 1.6, minWidth: "140px" },
    { 
      name: "Exam Type", 
      selector: (row) => row.missedExamType, 
      sortable: true, 
      grow: 1.2,
      minWidth: "125px",
      center: true,
      cell: (row) => <span style={{textTransform: 'capitalize'}}>{row.missedExamType}</span>
    },
    { name: "Status", selector: (row) => row.authorityStatus, sortable: true, grow: 1.3, minWidth: "135px", center: true },
    { 
      name: "Action",
      cell: (row) => (
        <StudentApplicationsButtonsForACAD
          id={row._id} 
          onDeleteSuccess={fetchApplications} 
        />
      ), 
      grow: 1,
      minWidth: "105px", 
      center: true
    },
  ];

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://spm-1-u37a.onrender.com/api/student-application", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        let i = 1;
        setApplications(res.data.applications.map((app) => ({
          ...app,
          sno: i++,
          studentId: app.studentId,
          name: app.name,
          missedExamType: app.missedExamType
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchACADProfile();
    fetchApplications();
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
        <h2 className="dashboard-title">Special Exam Applications</h2>
        <div className="search-box glass">
          <input
            type="text"
            placeholder="Search by Student ID"
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
            data={filteredApplications}
            progressPending={loading}
            pagination
            responsive
          />
        </div>
      </div>
    </div>
  );
};

export default ARejected;
