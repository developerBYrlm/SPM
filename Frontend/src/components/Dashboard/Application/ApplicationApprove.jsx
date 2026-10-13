import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import DataTable from "react-data-table-component";
import StudentApplicationButtons from "../StudentApplicationsButtons";
import '../list.css';
import '../ViewActionButton/ViewActionButton.css'; 

const ApplicationApprove = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [authority, setAuthority] = useState(null);

  const fetchAuthorityProfile = async () => {
    try {
      const res = await axios.get("https://spm-1-u37a.onrender.com/api/auth/me", {
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

  const fetchApplications = async () => {
    try {
      const res = await axios.get(
        "https://spm-1-u37a.onrender.com/api/student-application",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        let i = 1;
        setApplications(
          res.data.applications.map((app) => ({
            ...app,
            sno: i++,
            studentId: app.studentId,
            name: app.name,
            department: app.department,
            missedExamType: app.missedExamType,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchAuthorityProfile(),
        fetchApplications(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  const filteredApplications = applications
    .filter((student) => {
      if (!authority) return false;

      return (
        student.department?.toLowerCase() ===
        authority.department?.toLowerCase()
      );
    })
    .filter((app) => app.authorityStatus === "Approved")
    .filter((app) =>
      app.studentId.toLowerCase().includes(search.toLowerCase())
    );

  const columns = [
    {
      name: "Student ID",
      selector: (row) => row.studentId,
      sortable: true,
      grow: 1.1,
      minWidth: "115px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      grow: 1.6,
      minWidth: "140px",
    },
    {
      name: "Exam Type",
      selector: (row) => row.missedExamType,
      sortable: true,
      grow: 1.2,
      minWidth: "125px",
      center: true,
      cell: (row) => (
        <span style={{ textTransform: "capitalize" }}>
          {row.missedExamType}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.authorityStatus,
      sortable: true,
      grow: 1.3,
      minWidth: "135px",
      center: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <StudentApplicationButtons
          id={row._id}
          onDeleteSuccess={fetchApplications}
        />
      ),
      grow: 1,
      minWidth: "105px",
      center: true,
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
        <h2 className="dashboard-title">
          Special Exam Approve Applications
        </h2>

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
            responsive
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationApprove;