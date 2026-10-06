import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../App.css";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function CustomerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/users/login", { email, password });
      const data = response.data;

      if (data.role !== "CUSTOMER") {
        setError("Please use a customer account to login here.");
        return;
      }

      login(data.token, data.role, {
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
      });

      navigate("/products");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
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
            <p className="small-label">CUSTOMER ACCOUNT</p>
            <h1>Welcome back</h1>
            <p>Login to continue shopping with HOMELY.</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <div className="auth-options"><Link to="/forgot-password">Forgot Password?</Link></div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="primary-btn auth-submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-switch">Don't have an account? <Link to="/register">Create an account</Link></p>
          <Link to="/login" className="change-account">← Change account type</Link>
        </div>
      </main>
    </>
  );
}

export default CustomerLogin;
