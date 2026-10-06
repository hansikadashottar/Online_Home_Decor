import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../App.css";
import api from "../../services/api";
import { getProductImage } from "../../services/imageUrl";

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [form, setForm] = useState({
    houseFlat: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
  });

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/cart");
      const items = response.data || [];
      setCartItems(items);

      const details = await Promise.all(
        items.map(async (item) => {
          try {
            const productResponse = await api.get(`/products/${item.productId}`);
            return [item.productId, productResponse.data];
          } catch {
            return [item.productId, null];
          }
        })
      );
      setProductMap(Object.fromEntries(details));
    } catch (err) {
      console.error("Checkout cart error:", err);
      setError(err.response?.data?.message || "Unable to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0),
    [cartItems]
  );
  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const openRazorpayCheckout = async (order, payment) => {
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      throw new Error("Razorpay Checkout could not be loaded.");
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key) {
      throw new Error("Razorpay public key is missing in frontend .env file.");
    }

    return new Promise((resolve) => {
      const razorpay = new window.Razorpay({
        key,
        amount: Math.round(Number(payment.amount) * 100),
        currency: "INR",
        name: "HOMELY",
        description: `Payment for Order #${order.orderId}`,
        order_id: payment.razorpayOrderId,
        prefill: {
          name: localStorage.getItem("fullName") || "",
          email: localStorage.getItem("email") || "",
        },
        theme: {
          color: "#6B4F3A",
        },
        handler: async (response) => {
          try {
            await api.post("/api/payments/verify", null, {
              params: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });

            resolve({ success: true });
          } catch (err) {
            resolve({
              success: false,
              error: err.response?.data?.message || "Payment verification failed.",
            });
          }
        },
        modal: {
          ondismiss: () => {
            resolve({
              success: false,
              cancelled: true,
              error: "Payment window was closed. Your order is placed with payment pending.",
            });
          },
        },
      });

      razorpay.open();
    });
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);

      const orderResponse = await api.post("/api/orders", form);
      const order = orderResponse.data;

      if (!order?.orderId) {
        throw new Error("Order was created but order ID was not returned by backend.");
      }

      const paymentResponse = await api.post("/api/payments", {
        orderId: order.orderId,
        paymentMethod,
      });
      const payment = paymentResponse.data;

      if (paymentMethod === "COD") {
        window.dispatchEvent(new Event("cart-updated"));
        navigate(`/orders/${order.orderId}`);
        return;
      }

      const result = await openRazorpayCheckout(order, payment);

      window.dispatchEvent(new Event("cart-updated"));

      if (result.success) {
        navigate(`/orders/${order.orderId}`);
      } else {
        setMessage(
          result.error ||
            "Order placed successfully, but payment is still pending."
        );
        setTimeout(() => navigate(`/orders/${order.orderId}`), 1200);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.message || err.message || "Unable to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="checkout-page">
          <div className="page-container product-not-found">Loading checkout...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="checkout-page">
        <section className="checkout-header">
          <div className="page-container">
            <p className="small-label">SECURE CHECKOUT</p>
            <h1>Complete Your Order</h1>
            <p>Enter your delivery details and choose how you want to pay.</p>
          </div>
        </section>

        <section className="section page-container">
          {cartItems.length === 0 ? (
            <div className="empty-state-card">
              <h2>Your cart is empty</h2>
              <p>Add products before going to checkout.</p>
              <Link to="/products" className="primary-btn">Explore Products</Link>
            </div>
          ) : (
            <form className="checkout-layout" onSubmit={handlePlaceOrder}>
              <div className="checkout-main">
                <section className="checkout-card">
                  <div className="checkout-card-header">
                    <div>
                      <p className="small-label">DELIVERY</p>
                      <h2>Shipping Address</h2>
                    </div>
                  </div>

                  <div className="checkout-form">
                    <div className="checkout-form-row">
                      <div className="form-group">
                        <label>House / Flat</label>
                        <input name="houseFlat" value={form.houseFlat} onChange={handleChange} required placeholder="101, Apartment name" />
                      </div>
                      <div className="form-group">
                        <label>Area</label>
                        <input name="area" value={form.area} onChange={handleChange} required placeholder="Area / Locality" />
                      </div>
                    </div>

                    <div className="checkout-form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input name="city" value={form.city} onChange={handleChange} required placeholder="City" />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input name="state" value={form.state} onChange={handleChange} required placeholder="State" />
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>Pincode</label>
                      <input name="pincode" value={form.pincode} onChange={handleChange} required inputMode="numeric" placeholder="452010" />
                    </div>
                  </div>
                </section>

                <section className="checkout-card">
                  <div className="checkout-card-header">
                    <div>
                      <p className="small-label">PAYMENT</p>
                      <h2>Choose Payment Method</h2>
                    </div>
                  </div>

                  <div className="payment-options">
                    {[
                      ["UPI", "UPI / QR / wallet supported by Razorpay"],
                      ["CARD", "Credit or debit card through Razorpay"],
                      ["NETBANKING", "Pay through your bank"],
                      ["COD", "Pay when your order arrives"],
                    ].map(([value, subtitle]) => (
                      <label className={`payment-option ${paymentMethod === value ? "payment-option-active" : ""}`} key={value}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={value}
                          checked={paymentMethod === value}
                          onChange={(event) => setPaymentMethod(event.target.value)}
                        />
                        <div className="payment-option-content">
                          <strong>{value === "NETBANKING" ? "Net Banking" : value === "COD" ? "Cash on Delivery" : value}</strong>
                          <span>{subtitle}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="checkout-summary">
                <div className="checkout-summary-header">
                  <p className="small-label">YOUR ORDER</p>
                  <h2>Order Summary</h2>
                </div>

                <div className="checkout-items">
                  {cartItems.map((item) => (
                    <div className="checkout-item" key={item.cartItemId}>
                      <div className="checkout-item-with-image">
                        {productMap[item.productId]?.imageUrl && (
                          <img
                            src={getProductImage(productMap[item.productId].imageUrl)}
                            alt={item.productName}
                          />
                        )}
                        <div>
                          <h3>{item.productName}</h3>
                          <p>Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <strong>₹{Number(item.totalPrice).toLocaleString("en-IN")}</strong>
                    </div>
                  ))}
                </div>

                <div className="checkout-summary-details">
                  <div className="summary-row"><span>Items</span><span>{totalItems}</span></div>
                  <div className="summary-row"><span>Subtotal</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div>
                  <div className="summary-row"><span>Payment</span><span>{paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay"}</span></div>
                </div>

                {error && <p className="auth-error">{error}</p>}
                {message && <p className="auth-success">{message}</p>}

                <div className="summary-divider" />
                <div className="summary-total">
                  <span>Total</span>
                  <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                </div>

                <button type="submit" className="primary-btn checkout-place-order" disabled={placingOrder}>
                  {placingOrder ? "Processing..." : paymentMethod === "COD" ? "Place COD Order" : "Place & Pay"}
                </button>

                <Link to="/cart" className="back-to-cart">← Back to Cart</Link>
                <p className="checkout-security">Your order is created by the HOMELY backend before payment verification.</p>
              </aside>
            </form>
          )}
        </section>
      </main>
    </>
  );
}

export default Checkout;
