import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../App.css";
import api from "../../services/api";
import { getProductImage } from "../../services/imageUrl";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cart");
      const items = response.data || [];

      setCartItems(items);

      const details = await Promise.all(
        items.map(async (item) => {
          try {
            const productResponse = await api.get(
              `/products/${item.productId}`
            );

            return [item.productId, productResponse.data];
          } catch {
            return [item.productId, null];
          }
        })
      );

      setProductMap(Object.fromEntries(details));
    } catch (err) {
      console.error("Cart load error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your cart."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) {
      return;
    }

    const previousItem = item;

    const updatedItem = {
      ...item,
      quantity,
      totalPrice: Number(item.price) * quantity,
    };

    setBusyId(item.cartItemId);

    setCartItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.cartItemId === item.cartItemId
          ? updatedItem
          : currentItem
      )
    );

    try {
      const response = await api.put(
        `/cart/item/${item.cartItemId}`,
        {
          quantity,
        }
      );

      const serverItem = response.data;

      setCartItems((currentItems) =>
        currentItems.map((currentItem) => {
          if (currentItem.cartItemId !== item.cartItemId) {
            return currentItem;
          }

          return {
            ...currentItem,
            ...(serverItem || {}),
            quantity:
              serverItem?.quantity ?? quantity,
            totalPrice:
              serverItem?.totalPrice ??
              Number(currentItem.price) * quantity,
          };
        })
      );

      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error(
        "Update quantity error:",
        err
      );

      setCartItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.cartItemId === item.cartItemId
            ? previousItem
            : currentItem
        )
      );

      alert(
        err.response?.data?.message ||
          "Unable to update quantity."
      );
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (cartItemId) => {
    const previousItems = cartItems;

    setBusyId(cartItemId);

    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item.cartItemId !== cartItemId
      )
    );

    try {
      await api.delete(
        `/cart/item/${cartItemId}`
      );

      window.dispatchEvent(
        new Event("cart-updated")
      );
    } catch (err) {
      console.error(
        "Remove cart item error:",
        err
      );

      setCartItems(previousItems);

      alert(
        err.response?.data?.message ||
          "Unable to remove item."
      );
    } finally {
      setBusyId(null);
    }
  };

  const clearCart = async () => {
    const previousItems = cartItems;

    setCartItems([]);

    try {
      await api.delete("/cart/clear");

      window.dispatchEvent(
        new Event("cart-updated")
      );
    } catch (err) {
      console.error(
        "Clear cart error:",
        err
      );

      setCartItems(previousItems);

      alert(
        err.response?.data?.message ||
          "Unable to clear cart."
      );
    }
  };

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum + Number(item.totalPrice || 0),
        0
      ),
    [cartItems]
  );

  const totalItems = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  return (
    <>
      <Navbar />

      <main className="cart-page">

        <section className="cart-header">
          <div className="page-container">

            <p className="small-label">
              YOUR SHOPPING CART
            </p>

            <h1>
              Your Cart
            </h1>

            <p>
              Review your selected products before checkout.
            </p>

          </div>
        </section>

        <section className="section page-container">

          {loading && (
            <div className="products-message">
              Loading cart...
            </div>
          )}

          {!loading && error && (
            <div className="products-message products-error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            cartItems.length === 0 && (
              <div className="empty-state-card">

                <h2>
                  Your cart is empty
                </h2>

                <p>
                  Add some beautiful pieces and come back here to checkout.
                </p>

                <Link
                  to="/products"
                  className="primary-btn"
                >
                  Explore Products
                </Link>

              </div>
            )}

          {!loading &&
            !error &&
            cartItems.length > 0 && (
              <div className="cart-layout">

                <div className="cart-items-section">

                  <div className="cart-items-header">

                    <h2>
                      Cart Items
                    </h2>

                    <span>
                      {totalItems}{" "}
                      {totalItems === 1
                        ? "item"
                        : "items"}
                    </span>

                  </div>

                  {cartItems.map((item) => {
                    const product =
                      productMap[item.productId];

                    const image =
                      product?.imageUrl
                        ? getProductImage(
                            product.imageUrl
                          )
                        : "";

                    return (
                      <div
                        className="cart-item"
                        key={item.cartItemId}
                      >

                        <div className="cart-item-image">

                          {image ? (
                            <img
                              src={image}
                              alt={item.productName}
                            />
                          ) : (
                            <div className="product-image-placeholder">
                              HOMELY
                            </div>
                          )}

                        </div>

                        <div className="cart-item-info">

                          <h3>
                            {item.productName}
                          </h3>

                          <p>
                            ₹
                            {Number(
                              item.price
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <div className="cart-item-actions">

                            <div className="cart-quantity">

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item,
                                    item.quantity - 1
                                  )
                                }
                                disabled={
                                  busyId ===
                                    item.cartItemId ||
                                  item.quantity <= 1
                                }
                              >
                                −
                              </button>

                              <span>
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item,
                                    item.quantity + 1
                                  )
                                }
                                disabled={
                                  busyId ===
                                    item.cartItemId ||
                                  (product?.stock != null &&
                                    item.quantity >=
                                      product.stock)
                                }
                              >
                                +
                              </button>

                            </div>

                            <button
                              type="button"
                              className="remove-cart-btn"
                              onClick={() =>
                                removeItem(
                                  item.cartItemId
                                )
                              }
                              disabled={
                                busyId ===
                                item.cartItemId
                              }
                            >
                              Remove
                            </button>

                          </div>

                        </div>

                        <strong className="cart-item-total">
                          ₹
                          {Number(
                            item.totalPrice
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>
                    );
                  })}

                  <div className="cart-bottom-actions">

                    <Link
                      to="/products"
                      className="continue-shopping"
                    >
                      ← Continue Shopping
                    </Link>

                    <button
                      type="button"
                      className="remove-cart-btn"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </button>

                  </div>

                </div>

                <aside className="cart-summary">

                  <p className="small-label">
                    ORDER SUMMARY
                  </p>

                  <h2>
                    Cart Summary
                  </h2>

                  <div className="summary-row">
                    <span>
                      Items
                    </span>

                    <span>
                      {totalItems}
                    </span>
                  </div>

                  <div className="summary-row">

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                  <div className="summary-row">

                    <span>
                      Delivery
                    </span>

                    <span>
                      Calculated at checkout
                    </span>

                  </div>

                  <div className="summary-divider" />

                  <div className="summary-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                  <Link
                    to="/checkout"
                    className="primary-btn checkout-btn"
                  >
                    Proceed to Checkout
                  </Link>

                </aside>

              </div>
            )}

        </section>
      </main>
    </>
  );
}

export default Cart;