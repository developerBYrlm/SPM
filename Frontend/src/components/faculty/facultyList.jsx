import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import StudentButtonForFaculty from "./StudentButtonForFaculty";
import "../Dashboard/list.css";
import "../Dashboard/ViewActionButton/ViewActionButton.css";

const facultyList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState(null);

  // Get logged-in faculty profile
  const fetchFacultyProfile = async () => {
    try {
      const res = await axios.get(
        "https://spm-1-u37a.onrender.com/api/auth/me",
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (res.data.success) setFaculty(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter students by department and student ID
  const filteredStudents = students
    .filter((student) => {
      if (!faculty) return false;
      return student.department?.toLowerCase() === faculty.department?.toLowerCase();
    })
    .filter((student) =>
      (student.studentId || "").toLowerCase().includes(search.toLowerCase())
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
      name: "Image",
      cell: (row) => (
        row.profileImage ? (
          <img
            src={row.profileImage}
            alt={`${row.name} profile`}
            className="student-profile-image"
          />
        ) : (
          <span>No image</span>
        )
      ),
      width: "160px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "310px",
    },
    {
      name: "Action",
      cell: (row) => <StudentButtonForFaculty id={row._id} />,
      width: "150px",
    },
  ];

  // Get faculty profile and student list
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);

      try {
        const res = await axios.get(
          "https://spm-1-u37a.onrender.com/api/students",
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        if (res.data.success) {
          setStudents(
            res.data.students.map((student, index) => ({
              _id: student._id,
              sno: index + 1,
              studentId: student.user?.userID || "N/A",
              name: student.user?.name || "N/A",
              department: student.user?.department,
              profileImage: student.user?.profileImage
                ? `https://spm-1-u37a.onrender.com/imageUploads/uploads/${student.user.profileImage}`
                : "",
            }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyProfile();
    fetchStudents();
  }, []);

  // Show loading
  if (loading) return <div className="loading"><div className="ring"></div></div>;

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

export default facultyList;