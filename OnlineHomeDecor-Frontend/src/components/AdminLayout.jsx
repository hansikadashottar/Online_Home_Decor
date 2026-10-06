import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function AdminLayout() {
  const { fullName, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <div className="brand-icon">⌂</div>
          <div>
            <strong>HOMELY</strong>
            <span>Admin Panel</span>
          </div>
        </div>

        <div className="admin-topbar-actions">
          <NavLink to="/" className="admin-store-link">
            View Store
          </NavLink>
          <span className="admin-user-name">{fullName || "Admin"}</span>
          <button type="button" className="nav-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <p className="admin-sidebar-label">STORE MANAGEMENT</p>

          <nav className="admin-sidebar-nav">
            <NavLink to="/admin/dashboard" className="admin-sidebar-link">
              <span>⌂</span>
              Dashboard
            </NavLink>
            <NavLink to="/admin/products" className="admin-sidebar-link">
              <span>▣</span>
              Products
            </NavLink>
            <NavLink to="/admin/categories" className="admin-sidebar-link">
              <span>◈</span>
              Categories
            </NavLink>
            <NavLink to="/admin/orders" className="admin-sidebar-link">
              <span>◫</span>
              Orders
            </NavLink>
            <NavLink to="/admin/payments" className="admin-sidebar-link">
              <span>₹</span>
              Payments
            </NavLink>
          </nav>
        </aside>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
