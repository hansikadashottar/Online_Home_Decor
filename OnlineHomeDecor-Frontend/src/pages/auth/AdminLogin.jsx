import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import Navbar from "../../components/Navbar";
import "../../App.css";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function AdminLogin() {
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

      const response = await api.post(
        "/users/login",
        {
          email,
          password,
        }
      );

      const data = response.data;

      if (data.role !== "ADMIN") {
        setError(
          "Please use an admin account to login here."
        );
        return;
      }

      login(
        data.token,
        data.role,
        {
          userId: data.userId,
          fullName: data.fullName,
          email: data.email,
        }
      );

      navigate("/admin/dashboard");

    } catch (err) {
      console.error(
        "Admin login error:",
        err
      );

      if (err.response?.data?.message) {
        setError(
          err.response.data.message
        );
      } else {
        setError(
          "Login failed. Please check your email and password."
        );
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

            <p className="small-label">
              ADMIN ACCOUNT
            </p>

            <h1>
              Admin Login
            </h1>

            <p>
              Sign in to manage the HOMELY store.
            </p>

          </div>


          <form
            className="auth-form"
            onSubmit={handleLogin}
          >

            <div className="form-group">

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

            </div>


            <div className="form-group">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

            </div>


            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}


            <button
              type="submit"
              className="primary-btn auth-submit"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>


          <Link
            to="/login"
            className="change-account"
          >
            ← Change account type
          </Link>

        </div>

      </main>
    </>
  );
}

export default AdminLogin;