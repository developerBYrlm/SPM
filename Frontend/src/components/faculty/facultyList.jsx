import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import StudentButtonForFaculty from "./StudentButtonForFaculty";
import "../Dashboard/list.css";

const List = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState(null); 

  // Fetch logged‑in faculty profile (department)
  const fetchFacultyProfile = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.success) {
        setFaculty(res.data.user); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  //  Department-wise + search filter
  const filteredStudents = students
    .filter((student) => {
      if (!faculty) return false;

      return (
        student.department?.toLowerCase() ===
        faculty.department?.toLowerCase()
      );
    })
    .filter((student) =>
      (student.studentId || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const columns = [
    // {
    //   name: "S No",
    //   selector: (row) => row.sno,
    //   width: "120px",
    // },
    {
      name: "Student ID",
      selector: (row) => row.studentId,
      sortable: true,
      width: "170px",
    },
    {
      name: "Image",
      cell: (row) => (
        <img
          src={row.profileImage || "/default.png"}
          alt="student"
          className="student-image"
        />
      ),
      width: "160px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "200px",
    },
    {
      name: "Action",
      cell: (row) => <StudentButtonForFaculty id={row._id} />,
      width: "150px",
    },
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8000/api/students", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.data.success) {
          let i = 1;
          setStudents(
            res.data.students.map((s) => ({
              _id: s._id,
              sno: i++,
              studentId: s.user?.userID || "N/A",
              name: s.user?.name || "N/A",
              department: s.user?.department,
              profileImage: s.user?.profileImage
                ? `http://localhost:8000/imageUploads/uploads/${s.user.profileImage}`
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

export default List;