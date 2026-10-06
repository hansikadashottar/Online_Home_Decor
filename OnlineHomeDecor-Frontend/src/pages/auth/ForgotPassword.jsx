import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../App.css";
import api from "../../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await api.post("/users/forgot-password", {
        email,
      });

      setMessage(
        response.data?.message ||
        "OTP has been sent to your registered email."
      );

      navigate("/reset-password", {
        state: { email },
      });
    } catch (err) {
      console.error("Forgot password error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to send OTP. Please try again.");
      }
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

            <h1>Forgot Password?</h1>

            <p>
              Enter your registered email and we'll send you
              an OTP to reset your password.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleForgotPassword}
          >

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-success">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="primary-btn auth-submit"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

          </form>

          <p className="auth-switch">
            Remember your password?{" "}
            <Link to="/login/customer">
              Back to Login
            </Link>
          </p>

        </div>
      </main>
    </>
  );
}

export default ForgotPassword;