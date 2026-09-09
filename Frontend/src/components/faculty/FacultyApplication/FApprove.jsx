import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import DataTable from "react-data-table-component";
import StudentApplicationsButtonsForFaculty from "../StudentApplicationButtonsForFaculty"
import '../../Dashboard/list.css'
import '../../Dashboard/ViewActionButton/ViewActionButton.css'

const FApprove = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState(null); 

const fetchFacultyProfile = async () => {
  try {
    const res = await axios.get(
      "http://localhost:8000/api/auth/me",
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
  .filter((app) => app.facultyStatus === "Approved") 
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
    // { name: "S No", selector: (row) => row.sno, width: "100px" },
    { name: "Student ID", selector: (row) => row.studentId, sortable: true, width: "170px" },
    { name: "Name", selector: (row) => row.name, sortable: true, width: "310px" },
    { 
      name: "Exam Type", 
      selector: (row) => row.missedExamType, 
      sortable: true, 
      width: "150px",
      cell: (row) => <span style={{textTransform: 'capitalize'}}>{row.missedExamType}</span>
    },
    { name: "Faculty Status", selector: (row) => row.facultyStatus, sortable: true, width: "190px", },
    { 
      name: "Action",
      cell: (row) => (
        <StudentApplicationsButtonsForFaculty
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
    const res = await axios.get(
      "http://localhost:8000/api/student-application",
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
};

useEffect(() => {
  fetchFacultyProfile();
}, []);

useEffect(() => {
  if (faculty) {
    fetchApplications();
  }
}, [faculty]);

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
          />
        </div>
      </div>
    </div>
  );
};

export default FApprove
