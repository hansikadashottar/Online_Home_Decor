import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import api from "../../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, payments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [products, categories, orders, payments] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
          api.get("/api/orders/admin/all"),
          api.get("/api/payments/admin/all"),
        ]);

        setStats({
          products: products.data?.length || 0,
          categories: categories.data?.length || 0,
          orders: orders.data?.length || 0,
          payments: payments.data?.length || 0,
        });
      } catch (err) {
        console.error("Admin dashboard stats error:", err);
        setError(err.response?.data?.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const cards = [
    ["Products", stats.products, "Manage your home decor products.", "/admin/products"],
    ["Categories", stats.categories, "Manage store categories.", "/admin/categories"],
    ["Orders", stats.orders, "Review and update customer orders.", "/admin/orders"],
    ["Payments", stats.payments, "View payment transaction records.", "/admin/payments"],
  ];

  return (
    <section className="admin-dashboard-page">
      <div className="admin-page-heading">
        <div>
          <p className="small-label">ADMIN PANEL</p>
          <h1>Dashboard</h1>
          <p>Manage your HOMELY store from one place.</p>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div className="admin-stat-grid">
        {cards.map(([title, value, text, path]) => (
          <Link to={path} className="admin-stat-card" key={title}>
            <div className="admin-stat-icon">{title.charAt(0)}</div>
            <div>
              <span>{title}</span>
              <strong>{loading ? "—" : value}</strong>
              <p>{text}</p>
            </div>
          </Link>
        ))}
      </div>

      <section className="admin-quick-card">
        <div>
          <p className="small-label">QUICK ACTIONS</p>
          <h2>Store Management</h2>
          <p>Use the sidebar to work with the live backend data.</p>
        </div>
        <div className="admin-quick-actions">
          <Link to="/admin/products" className="secondary-btn">Manage Products</Link>
          <Link to="/admin/orders" className="secondary-btn">Manage Orders</Link>
        </div>
      </section>
    </section>
  );
}

export default AdminDashboard;
