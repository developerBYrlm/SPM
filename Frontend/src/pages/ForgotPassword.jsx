import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [studentId, setStudentId] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [userId, setUserId] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [emailHint, setEmailHint] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const API_BASE_URL = "https://spm-1-u37a.onrender.com/api/auth";

  useEffect(() => {
    if (step !== 2) return;

    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  useEffect(() => {
    if (step === 2 && timeLeft === 0) {
      setMessage("OTP expired. Please send OTP again.");
      setMessageType("error");
    }
  }, [step, timeLeft]);

  const resetMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const handleSendOtp = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    resetMessage();

    if (!studentId.trim()) {
      setMessage("Please enter your ID / Acronym.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/forgot-password/send-otp`, {
        studentId: studentId.trim(),
      });

      if (res.data.success) {
        setUserId(res.data.userId);
        setEmailHint(res.data.emailHint || "");
        setOtp("");
        setResetToken("");
        setPassword("");
        setStep(2);
        setTimeLeft(60);

        setMessage(
          res.data.emailHint
            ? `OTP sent to your linked email: ${res.data.emailHint}`
            : "OTP sent to your linked email."
        );

        setMessageType("success");
      }
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.error || "Failed to send OTP. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    resetMessage();

    if (timeLeft <= 0) {
      setMessage("OTP expired. Please send OTP again.");
      setMessageType("error");
      return;
    }

    if (!otp.trim()) {
      setMessage("Please enter OTP.");
      setMessageType("error");
      return;
    }

    if (otp.trim().length !== 6) {
      setMessage("OTP must be 6 digits.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/forgot-password/verify-otp`, {
        userId,
        otp: otp.trim(),
      });

      if (res.data.success) {
        setResetToken(res.data.resetToken);
        setPassword("");
        setStep(3);
        setMessage("OTP verified. Now update your password.");
        setMessageType("success");
      }
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.error || "Invalid OTP. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    resetMessage();

    if (!password) {
      setMessage("Please enter a new password.");
      setMessageType("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE_URL}/forgot-password/update-password`,
        {
          userId,
          resetToken,
          password,
        }
      );

      if (res.data.success) {
        alert("Password updated successfully!");
        navigate("/login");
      }
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.error ||
          "Failed to update password. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendAgain = async () => {
    setOtp("");
    setTimeLeft(60);

    await handleSendOtp({
      preventDefault: () => {},
    });
  };

  const handleBackStep = () => {
    resetMessage();

    if (step === 1) {
      navigate("/login");
      return;
    }

    if (step === 2) {
      setStep(1);
      setOtp("");
      setUserId("");
      setEmailHint("");
      setTimeLeft(60);
      return;
    }

    if (step === 3) {
      setStep(2);
      setPassword("");
      setResetToken("");
      setTimeLeft(60);
    }
  };

  return (
    <div className="page slide-right">
      <div className="main-content-forgot forgot-page-wrapper">
        <div className="user-dashboard forgot-card">
          <div className="forgot-header-row">
            <button
              type="button"
              className="forgot-back-btn"
              onClick={handleBackStep}
              title="Back"
            >
              <i className="fa-solid fa-backward"></i>
            </button>

            <h2 className="form-title forgot-title">Forgot Password</h2>
          </div>

          <form
            className="glass-form forgot-form"
            onSubmit={
              step === 1
                ? handleSendOtp
                : step === 2
                ? handleVerifyOtp
                : handleUpdatePassword
            }
          >
            {message && (
              <div
                className={
                  messageType === "success"
                    ? "forgot-message success"
                    : "forgot-message error"
                }
              >
                {message}
              </div>
            )}

            {step === 1 && (
              <>
                <div className="form-group forgot-input-group">
                  <label>ID / Acronym*</label>

                  <input
                    type="text"
                    name="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Insert ID / Acronym"
                    autoComplete="off"
                  />
                </div>

                <button
                  type="submit"
                  className="submit-btn forgot-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-group forgot-input-group">
                  <label>OTP</label>

                  <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={(e) => {
                      const onlyNumber = e.target.value.replace(/\D/g, "");
                      setOtp(onlyNumber.slice(0, 6));
                    }}
                    placeholder="Enter 6 digit OTP"
                    autoComplete="off"
                    maxLength="6"
                  />
                </div>

                <div className="forgot-timer">
                  {timeLeft > 0 ? (
                    <span>
                      OTP expires in{" "}
                      <b>{String(timeLeft).padStart(2, "0")}s</b>
                    </span>
                  ) : (
                    <span className="otp-expired-text">OTP expired</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="submit-btn forgot-submit-btn"
                  disabled={loading || timeLeft <= 0}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                {timeLeft <= 0 && (
                  <button
                    type="button"
                    className="forgot-secondary-btn"
                    onClick={handleSendAgain}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send OTP Again"}
                  </button>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div className="form-group forgot-input-group">
                  <label>Update Password</label>

                  <div className="password-wrapper forgot-password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Include letters, symbol & number"
                      autoComplete="new-password"
                    />

                    <i
                      className={
                        showPassword
                          ? "fa-solid fa-eye-slash"
                          : "fa-solid fa-eye"
                      }
                      onClick={() => setShowPassword(!showPassword)}
                    ></i>
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn forgot-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;