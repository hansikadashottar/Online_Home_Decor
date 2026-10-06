import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../App.css";
import api from "../../services/api";
import { getProductImage } from "../../services/imageUrl";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = async () => {
    try {
      setLoading(true);
      const [orderResponse, paymentResponse] = await Promise.all([
        api.get(`/api/orders/${orderId}`),
        api.get(`/api/payments/order/${orderId}`).catch(() => ({ data: null })),
      ]);

      const currentOrder = orderResponse.data;
      setOrder(currentOrder);
      setPayment(paymentResponse.data);

      const details = await Promise.all(
        (currentOrder.items || []).map(async (item) => {
          try {
            const response = await api.get(`/products/${item.productId}`);
            return [item.productId, response.data];
          } catch {
            return [item.productId, null];
          }
        })
      );

      setProductMap(Object.fromEntries(details));
    } catch (err) {
      console.error("Order details error:", err);
      setError(err.response?.data?.message || "Unable to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const cancelOrder = async () => {
    if (!window.confirm("Do you want to cancel this order?")) return;

    try {
      await api.put(`/api/orders/${orderId}/cancel`);
      await loadOrder();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      alert(err.response?.data?.message || "Unable to cancel the order.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="order-details-page">
          <div className="page-container product-not-found">Loading order...</div>
        </main>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <main className="order-details-page">
          <div className="page-container product-not-found">
            <h2>Order not found</h2>
            <p>{error || "The requested order could not be loaded."}</p>
            <Link to="/orders" className="primary-btn">Back to Orders</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="order-details-page">
        <section className="order-details-header">
          <div className="page-container">
            <p className="small-label">ORDER DETAILS</p>
            <div className="order-title-row">
              <div>
                <h1>Order #{order.orderId}</h1>
                <p>Placed on {formatDate(order.orderDate)}</p>
              </div>
              <span className={`order-status status-${order.status.toLowerCase()}`}>
                {order.status.replaceAll("_", " ")}
              </span>
            </div>
          </div>
        </section>

        <section className="section page-container">
          <div className="order-details-layout">
            <div className="order-details-main">
              <section className="order-details-card">
                <div className="details-card-header">
                  <p className="small-label">ITEMS</p>
                  <h2>Ordered Products</h2>
                </div>

                <div className="details-products">
                  {order.items?.map((item) => {
                    const product = productMap[item.productId];
                    const image = product?.imageUrl ? getProductImage(product.imageUrl) : "";

                    return (
                      <div className="details-product" key={item.orderItemId}>
                        <div className="details-product-image">
                          {image ? (
                            <img src={image} alt={item.productName} />
                          ) : (
                            <div className="product-image-placeholder">HOMELY</div>
                          )}
                        </div>

                        <div className="details-product-info">
                          <h3>{item.productName}</h3>
                          <p>Quantity: {item.quantity}</p>
                        </div>

                        <div className="details-product-price">
                          <span>₹{Number(item.price).toLocaleString("en-IN")} each</span>
                          <strong>₹{Number(item.totalPrice).toLocaleString("en-IN")}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="order-details-card">
                <div className="details-card-header">
                  <p className="small-label">DELIVERY</p>
                  <h2>Shipping Address</h2>
                </div>
                <div className="shipping-address">
                  <p>{order.houseFlat}</p>
                  <p>{order.area}</p>
                  <p>{order.city}, {order.state}</p>
                  <p>{order.pincode}</p>
                </div>
              </section>
            </div>

            <aside className="order-details-summary">
              <p className="small-label">ORDER SUMMARY</p>
              <h2>Payment Summary</h2>

              <div className="details-summary-row">
                <span>Items</span>
                <span>{order.items?.reduce((total, item) => total + Number(item.quantity || 0), 0)}</span>
              </div>

              <div className="details-summary-row">
                <span>Order Total</span>
                <strong>₹{Number(order.totalAmount).toLocaleString("en-IN")}</strong>
              </div>

              <div className="details-summary-row">
                <span>Payment</span>
                <span>{payment?.paymentStatus || "Not started"}</span>
              </div>

              {payment?.paymentMethod && (
                <div className="details-summary-row">
                  <span>Method</span>
                  <span>{payment.paymentMethod}</span>
                </div>
              )}

              <div className="summary-divider" />

              <div className="details-summary-total">
                <span>Total</span>
                <strong>₹{Number(order.totalAmount).toLocaleString("en-IN")}</strong>
              </div>

              <div className="order-detail-action-stack">
                {order.status === "PLACED" && (
                  <button type="button" className="danger-outline-btn full-width-btn" onClick={cancelOrder}>
                    Cancel Order
                  </button>
                )}
                <Link to="/orders" className="secondary-btn order-back-btn">← Back to Orders</Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}

export default OrderDetails;
