import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import DataTable from "react-data-table-component";
import StudentApplicationButtons from "./StudentApplicationsButtons";
import "./list.css";
import "./studentButtons.css"


const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const filteredApplications = applications

    .filter((student) => {
      if (!authority) return false;

      return (
        student.department?.toLowerCase() ===
        authority.department?.toLowerCase()
      );
    })

    .filter((app) => app.studentId.toLowerCase().includes(search.toLowerCase())

    );

  const handleRemoveAll = async () => {
    if (filteredApplications.length === 0) {
      alert("No applications found to remove.");
      return;
    }

    const firstConfirm = window.confirm("Are you sure you want to remove ALL applications?");

    if (firstConfirm) {
      const secondConfirm = window.confirm("WARNING: This action is permanent and cannot be undone! Are you absolutely sure?");

      if (secondConfirm) {
        setLoading(true);
        try {
          const res = await axios.delete("https://spm-1-u37a.onrender.com/api/student-application/application-remove-all", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });

          if (res.data.success) {
            alert("All applications have been successfully removed.");
            fetchApplications();
          }
        } catch (err) {
          console.error(err);
          alert("Failed to remove all applications.");
        } finally {
          setLoading(false);
        }
      }
    }
  };

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
      cell: (row) => <span style={{ textTransform: 'capitalize' }}>{row.missedExamType}</span>
    },
    {
      name: "Authority Status",
      selector: (row) => row.authorityStatus,
      sortable: true,
      grow: 1.4,
      minWidth: "175px",
      center: true,
      cell: (row) => {
        if (row.requiresSpecialPermission && !row.specialPermissionGranted) {
          return (
            <span style={{ color: "#ef4444", fontWeight: "700", fontSize: "12px" }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "4px" }}></i>
              Permission Required (5+)
            </span>
          );
        }
        return row.authorityStatus;
      }
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
          department: app.department,
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

    fetchAuthorityProfile();
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
          <Link to="/authority-dashboard">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <div className="application-list-actions-bar">
          <button
            className="student-action-btn btn-allLeave"
            onClick={handleRemoveAll}
          >
            <i className="fa-solid fa-trash-can"></i> Remove All Applications
          </button>

          <a
            href="https://docs.google.com/spreadsheets/d/1znIvCWAFUnnGsnzOcSGxvRWrZzHTEEFfdjR1mzgZIwk/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="student-action-btn btn-sheetView"
            title="Open Special Exam Applications Google Sheet (View Access)"
          >
            <i className="fa-solid fa-file-excel"></i> View Google Sheet
            <i
              className="fa-solid fa-arrow-up-right-from-square"
              style={{ fontSize: "11px", marginLeft: "4px", opacity: 0.85 }}
            ></i>
          </a>
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

export default ApplicationList;