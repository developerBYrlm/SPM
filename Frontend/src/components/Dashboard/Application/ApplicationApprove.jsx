import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import DataTable from "react-data-table-component";
import StudentApplicationButtons from "../StudentApplicationsButtons"
import '../list.css'
const ApplicationApprove = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filteredApplications = applications
  .filter((app) => app.authorityStatus === "Approved") 
  .filter((app) => app.studentId.toLowerCase().includes(search.toLowerCase())

  );
 
  const columns = [
    { name: "S No", selector: (row) => row.sno, width: "100px" },
    { name: "Student ID", selector: (row) => row.studentId, sortable: true, width: "170px" },
    { name: "Name", selector: (row) => row.name, sortable: true, width: "220px" },
    { 
      name: "Exam Type", 
      selector: (row) => row.missedExamType, 
      sortable: true, 
      width: "150px",
      cell: (row) => <span style={{textTransform: 'capitalize'}}>{row.missedExamType}</span>
    },
    { name: "Status", selector: (row) => row.authorityStatus, sortable: true, width: "140px" },
    { 
      name: "Action",
      cell: (row) => (
        <StudentApplicationButtons 
          id={row._id} 
          onDeleteSuccess={fetchApplications} 
        />
      ), 
      width: "250px", 
      center: "true"
    },
  ];

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/student-application", {
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
    fetchApplications();
  }, []);

  return (
    <div className="main-content">
      <div className="dashboard-container">
        <h2 className="dashboard-title">Student Missed Exam Applications</h2>
        <div className="search-box glass">
          <input
            type="text"
            placeholder="Search by Student ID"
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
            data={filteredApplications}
            progressPending={loading}
            pagination
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationApprove
