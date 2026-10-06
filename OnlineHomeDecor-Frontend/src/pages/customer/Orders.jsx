import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../App.css";
import api from "../../services/api";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/orders");
      setOrders(response.data || []);
    } catch (err) {
      console.error("Orders load error:", err);
      setError(err.response?.data?.message || "Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Do you want to cancel this order?")) return;

    try {
      await api.put(`/api/orders/${orderId}/cancel`);
      await loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to cancel the order.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="orders-page">
        <section className="orders-header">
          <div className="page-container">
            <p className="small-label">YOUR ACCOUNT</p>
            <h1>My Orders</h1>
            <p>Track and view your HOMELY orders.</p>
          </div>
        </section>

        <section className="section page-container">
          {loading && <div className="products-message">Loading orders...</div>}

          {!loading && error && (
            <div className="products-message products-error">{error}</div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="empty-state-card">
              <h2>No orders yet</h2>
              <p>Your placed orders will appear here.</p>
              <Link to="/products" className="primary-btn">Start Shopping</Link>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order) => (
                <article className="order-card" key={order.orderId}>
                  <div className="order-card-header">
                    <div>
                      <span className="order-label">ORDER ID</span>
                      <h2>#{order.orderId}</h2>
                    </div>
                    <div className="order-date">
                      <span className="order-label">ORDER DATE</span>
                      <p>{formatDate(order.orderDate)}</p>
                    </div>
                    <span className={`order-status status-${order.status.toLowerCase()}`}>
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="order-items">
                    {order.items?.map((item) => (
                      <div className="order-item" key={item.orderItemId}>
                        <div className="order-item-info">
                          <h3>{item.productName}</h3>
                          <p>Qty: {item.quantity}</p>
                        </div>
                        <strong>₹{Number(item.totalPrice).toLocaleString("en-IN")}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total">
                      <span>Total Amount</span>
                      <strong>₹{Number(order.totalAmount).toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="order-actions-row">
                      <Link to={`/orders/${order.orderId}`} className="secondary-btn">
                        View Details
                      </Link>
                      {order.status === "PLACED" && (
                        <button
                          type="button"
                          className="danger-outline-btn"
                          onClick={() => cancelOrder(order.orderId)}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Orders;
