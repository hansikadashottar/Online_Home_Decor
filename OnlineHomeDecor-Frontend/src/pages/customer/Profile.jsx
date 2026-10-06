import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../App.css";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const { userId, updateUserData, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await api.get(`/users/${userId}`);
      setUser(response.data);
      setForm({
        fullName: response.data.fullName || "",
        phone: response.data.phone || "",
        password: "",
      });
      updateUserData(response.data);
    } catch (err) {
      console.error("Profile load error:", err);
      setError(err.response?.data?.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setSaving(true);

      const payload = {
        fullName: form.fullName || undefined,
        phone: form.phone || undefined,
        password: form.password || undefined,
      };

      const response = await api.put(`/users/${userId}`, payload);
      setUser(response.data);
      updateUserData(response.data);
      setForm((current) => ({ ...current, password: "" }));
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "This will permanently delete your account. Do you want to continue?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/users/${userId}`);
      logout();
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete your account."
      );
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="profile-page">
          <div className="page-container product-not-found">Loading profile...</div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="profile-page">
          <div className="page-container product-not-found">
            <h2>Profile unavailable</h2>
            <p>{error || "Unable to load your profile."}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <section className="profile-header">
          <div className="page-container">
            <p className="small-label">YOUR ACCOUNT</p>
            <h1>My Profile</h1>
            <p>Manage your account information and preferences.</p>
          </div>
        </section>

        <section className="section page-container">
          <div className="profile-layout">
            <section className="profile-card">
              <div className="profile-card-header">
                <div>
                  <p className="small-label">ACCOUNT INFORMATION</p>
                  <h2>Personal Details</h2>
                </div>
                <div className="profile-avatar">{user.fullName?.charAt(0) || "U"}</div>
              </div>

              {message && <p className="auth-success profile-message">{message}</p>}
              {error && <p className="auth-error profile-message">{error}</p>}

              {!editing ? (
                <>
                  <div className="profile-details">
                    <div className="profile-detail"><span>Full Name</span><strong>{user.fullName}</strong></div>
                    <div className="profile-detail"><span>Email Address</span><strong>{user.email}</strong></div>
                    <div className="profile-detail"><span>Phone Number</span><strong>{user.phone}</strong></div>
                  </div>

                  <button type="button" className="primary-btn profile-edit-btn" onClick={() => setEditing(true)}>
                    Edit Profile
                  </button>
                </>
              ) : (
                <form className="profile-edit-form" onSubmit={handleSave}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input name="fullName" value={form.fullName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>New Password (optional)</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} minLength={6} placeholder="Leave blank to keep current password" />
                  </div>
                  <div className="profile-edit-actions">
                    <button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                    <button type="button" className="secondary-btn" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </section>

            <aside className="profile-menu">
              <h2>Account</h2>
              <Link to="/orders" className="profile-menu-item">
                <div><strong>My Orders</strong><span>View and track your orders</span></div><span>→</span>
              </Link>
              <Link to="/cart" className="profile-menu-item">
                <div><strong>My Cart</strong><span>Review items before checkout</span></div><span>→</span>
              </Link>
              <Link to="/products" className="profile-menu-item">
                <div><strong>Continue Shopping</strong><span>Explore the home collection</span></div><span>→</span>
              </Link>
              <button type="button" className="profile-menu-item profile-logout" onClick={handleLogout}>
                <div><strong>Logout</strong><span>Sign out of your account</span></div><span>→</span>
              </button>
              <button type="button" className="profile-menu-item profile-delete" onClick={handleDeleteAccount}>
                <div><strong>Delete Account</strong><span>Permanently remove your account</span></div><span>→</span>
              </button>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}

export default Profile;
