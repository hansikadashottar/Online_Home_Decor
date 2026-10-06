import { useEffect, useState } from "react";
import "../../App.css";
import api from "../../services/api";

const statusActions = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["DELIVERED", "CANCELLED"],
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/orders/admin/all");
      setOrders(response.data || []);
    } catch (err) {
      console.error("Admin orders error:", err);
      setError(err.response?.data?.message || "Unable to load admin orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    setError("");

    try {
      await api.put(`/api/orders/admin/${orderId}/status`, { status });
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="admin-module-page-modern">
      <div className="admin-page-heading">
        <div>
          <p className="small-label">STORE MANAGEMENT</p>
          <h1>Orders</h1>
          <p>Review customer orders and update their status.</p>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <section className="admin-table-card">
        <div className="admin-card-heading"><div><p className="small-label">LIVE ORDERS</p><h2>{orders.length} orders</h2></div></div>

        {loading ? <p className="admin-muted">Loading orders...</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="6" className="admin-empty-cell">No orders found.</td></tr>
                ) : orders.map((order) => (
                  <tr key={order.orderId}>
                    <td><strong>#{order.orderId}</strong></td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>{order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0}</td>
                    <td>₹{Number(order.totalAmount).toLocaleString("en-IN")}</td>
                    <td><span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                    <td>
                      <div className="admin-order-actions">
                        {(statusActions[order.status] || []).map((status) => (
                          <button
                            type="button"
                            key={status}
                            className={status === "CANCELLED" ? "danger-btn compact-btn" : "secondary-btn compact-btn"}
                            onClick={() => updateStatus(order.orderId, status)}
                            disabled={updatingId === order.orderId}
                          >
                            {updatingId === order.orderId ? "Saving..." : status}
                          </button>
                        ))}
                        {!statusActions[order.status] && <span className="admin-muted">Final status</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminOrders;
