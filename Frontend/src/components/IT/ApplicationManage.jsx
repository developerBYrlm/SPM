import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import StudentApplicationButtons from "./ActionButtons/ApplicationManageButtons";
import "../Dashboard/list.css";
import "../Dashboard/studentButtons.css";

const ApplicationManage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Get all applications
  const fetchApplications = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        "https://spm-1-u37a.onrender.com/api/student-application",
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (res.data.success) {
        setApplications(
          res.data.applications.map((app, index) => ({
            ...app,
            sno: index + 1,
            studentId: app.studentId,
            name: app.name,
            department: app.department,
            missedExamType: app.missedExamType,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Remove all applications
  const handleRemoveAll = async () => {
    if (filteredApplications.length === 0) {
      alert("No applications found to remove.");
      return;
    }

    const firstConfirm = window.confirm(
      "Are you sure you want to remove ALL applications?"
    );
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      "WARNING: This action is permanent and cannot be undone! Are you absolutely sure?"
    );
    if (!secondConfirm) return;

    setLoading(true);

    try {
      const res = await axios.delete(
        "https://spm-1-u37a.onrender.com/api/student-application/application-remove-all",
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

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
  };

  // Filter applications by student ID
  const filteredApplications = applications.filter((app) =>
    (app.studentId || "").toLowerCase().includes(search.toLowerCase())
  );

  // Table columns
  const columns = [
    {
      name: "Student ID",
      selector: (row) => row.studentId,
      sortable: true,
      width: "170px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "250px",
    },
    {
      name: "Department",
      selector: (row) => row.department,
      sortable: true,
      width: "170px",
    },
    {
      name: "Exam Type",
      selector: (row) => row.missedExamType,
      sortable: true,
      width: "150px",
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
      width: "180px",
    },
    {
      name: "Action",
      cell: (row) => (
        <StudentApplicationButtons
          id={row._id}
          onDeleteSuccess={fetchApplications}
        />
      ),
      width: "210px",
      center: true,
    },
  ];

  // Get applications when page loads
  useEffect(() => {
    fetchApplications();
  }, []);

  // Show loading
  if (loading) {
    return <div className="loading"><div className="ring"></div></div>;
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

        <button
          type="button"
          className="student-action-btn btn-allLeave"
          onClick={handleRemoveAll}
        >
          Remove All Applications
        </button>

        {/* Back button */}
        <div className="back">
          <Link to="/it-dashboard">
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

export default ApplicationManage;