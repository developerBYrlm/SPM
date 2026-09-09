import React, { useEffect, useState } from "react";
import "./add.css";

const ExamDateTime = () => {
  const [formData, setFormData] = useState({
    applicationDeadlineDate: "",
    applicationDeadlineText: "",
    specialExamStartDate: "",
    specialExamText: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    return new Date(dateValue).toISOString().slice(0, 10);
  };

  const fetchExamSchedule = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/exam-schedule", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.schedule) {
        setFormData({
          applicationDeadlineDate: formatDateForInput(
            data.schedule.applicationDeadlineDate
          ),
          applicationDeadlineText: data.schedule.applicationDeadlineText || "",
          specialExamStartDate: formatDateForInput(
            data.schedule.specialExamStartDate
          ),
          specialExamText: data.schedule.specialExamText || "",
        });
      }
    } catch (error) {
      console.error("Fetch exam schedule error:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchExamSchedule();
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8000/api/exam-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || "Exam schedule saved successfully");
      } else {
        setMessage(data.error || "Failed to save exam schedule");
      }
    } catch (error) {
      console.error("Save exam schedule error:", error);
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="user-dashboard">
        <h2 className="form-title">Exam Date & Mail Notice</h2>

        {message && <p className="exam-message">{message}</p>}

        <form className="glass-form exam-date-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Application Deadline Date</label>
            <input
              type="date"
              name="applicationDeadlineDate"
              value={formData.applicationDeadlineDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group exam-textarea-group">
            <label>Application Deadline Mail Text</label>
            <textarea
              name="applicationDeadlineText"
              value={formData.applicationDeadlineText}
              onChange={handleChange}
              placeholder="Write the mail text for application deadline..."
              required
            />
          </div>

          <div className="form-group">
            <label>Special Exam Start Date</label>
            <input
              type="date"
              name="specialExamStartDate"
              value={formData.specialExamStartDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group exam-textarea-group">
            <label>Special Exam Mail Text</label>
            <textarea
              name="specialExamText"
              value={formData.specialExamText}
              onChange={handleChange}
              placeholder="Write the mail text for special exam reminder..."
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : "Submit / Update"}
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExamDateTime;