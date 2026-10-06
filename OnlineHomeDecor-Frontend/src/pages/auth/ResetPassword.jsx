import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../App.css";
import api from "../../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/users/reset-password", {
        otp,
        newPassword,
      });

      setMessage(response.data || "Password reset successfully.");
      setTimeout(() => navigate("/login/customer"), 1000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-heading">
            <p className="small-label">ACCOUNT RECOVERY</p>
            <h1>Reset Password</h1>
            <p>Enter the OTP you received and create a new password.</p>
            {location.state?.email && <p className="auth-help">OTP sent to {location.state.email}</p>}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>OTP</label>
              <input type="text" placeholder="Enter 6-digit OTP" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value)} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password" minLength={6} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm new password" minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </div>
            {error && <p className="auth-error">{error}</p>}
            {message && <p className="auth-success">{message}</p>}
            <button type="submit" className="primary-btn auth-submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className="auth-switch">Remember your password? <Link to="/login/customer">Back to Login</Link></p>
        </div>
      </main>
    </>
  );
}

export default ResetPassword;
