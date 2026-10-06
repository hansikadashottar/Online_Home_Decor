import { useEffect, useState } from "react";
import "../../App.css";
import api from "../../services/api";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/payments/admin/all");
        setPayments(response.data || []);
      } catch (err) {
        console.error("Admin payments error:", err);
        setError(err.response?.data?.message || "Unable to load payments.");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  return (
    <section className="admin-module-page-modern">
      <div className="admin-page-heading">
        <div>
          <p className="small-label">STORE MANAGEMENT</p>
          <h1>Payments</h1>
          <p>View Razorpay and COD payment records from the backend.</p>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <section className="admin-table-card">
        <div className="admin-card-heading"><div><p className="small-label">PAYMENT RECORDS</p><h2>{payments.length} payments</h2></div></div>

        {loading ? <p className="admin-muted">Loading payments...</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Payment</th><th>Order</th><th>Amount</th><th>Method</th><th>Status</th><th>Razorpay ID</th><th>Date</th></tr></thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan="7" className="admin-empty-cell">No payment records found.</td></tr>
                ) : payments.map((payment) => (
                  <tr key={payment.paymentId}>
                    <td>#{payment.paymentId}</td>
                    <td>#{payment.orderId}</td>
                    <td>₹{Number(payment.amount).toLocaleString("en-IN")}</td>
                    <td>{payment.paymentMethod}</td>
                    <td><span className={`payment-status payment-status-${payment.paymentStatus?.toLowerCase()}`}>{payment.paymentStatus}</span></td>
                    <td className="admin-mono-cell">{payment.razorpayPaymentId || payment.razorpayOrderId || "—"}</td>
                    <td>{formatDate(payment.paymentDate)}</td>
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

export default AdminPayments;
