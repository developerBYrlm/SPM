import React, { useEffect, useState, useCallback } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import DataTable from "react-data-table-component";
import StudentApplicationsButtonsForFaculty from "../StudentApplicationButtonsForFaculty"
import '../../Dashboard/list.css'
import '../../Dashboard/ViewActionButton/ViewActionButton.css'


const FRejcted = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState(null); 

const fetchFacultyProfile = async () => {
  try {
    const res = await axios.get(
      "https://spm-1-u37a.onrender.com/api/auth/me",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (res.data.success) {
      setFaculty(res.data.user);
    }
  } catch (err) {
    console.error(err);
  }
};

const filteredApplications = applications
  .filter((app) => app.facultyStatus === "Rejected") 
  .filter((app) => {
    if (!faculty) return false;

    const deptMatch = app.department === faculty.department;

    const facultyCourseMatch = app.courses?.some(
      (course) =>
        course.facultyAcr?.trim().toUpperCase() ===
        faculty.userID?.trim().toUpperCase()
    );

    return deptMatch && facultyCourseMatch;
  })
  .filter((app) =>
    app.studentId
      ?.toLowerCase()
      .includes(search.toLowerCase())
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
    { name: "Faculty Status", selector: (row) => row.facultyStatus, sortable: true, grow: 1.3, minWidth: "135px", center: true },
    { 
      name: "Action",
      cell: (row) => (
        <StudentApplicationsButtonsForFaculty
          id={row._id} 
          onDeleteSuccess={fetchApplications} 
        />
      ), 
      grow: 1,
      minWidth: "105px", 
      center: true
    },
  ];

const fetchApplications = useCallback(async () => {
  setLoading(true);

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

      const facultyAcr = faculty?.userID?.trim().toUpperCase();

      const apps = res.data.applications.map((app) => {
        const currentFacultyStatus =
          app.facultyStatuses?.find(
            (item) =>
              item.facultyAcr?.trim().toUpperCase() === facultyAcr
            )?.status || "Pending";

        return {
          ...app,
          sno: i++,
          facultyStatus: currentFacultyStatus,
        };
      });

      setApplications(apps);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [faculty]);

useEffect(() => {
  fetchFacultyProfile();
}, []);

useEffect(() => {
  if (faculty) {
    fetchApplications();
  }
}, [faculty, fetchApplications]);

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

export default FRejcted
