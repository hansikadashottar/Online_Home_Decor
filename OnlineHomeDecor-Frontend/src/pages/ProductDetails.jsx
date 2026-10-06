import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";
import api from "../services/api";
import { getProductImage } from "../services/imageUrl";
import { useAuth } from "../context/AuthContext";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartItemId, setCartItemId] = useState(null);
  const [updatingQuantity, setUpdatingQuantity] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/products/${productId}`);

      setProduct(response.data);
    } catch (err) {
      console.error("Error fetching product:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login/customer");
      return;
    }

    if (role !== "CUSTOMER") {
      alert("Only customer accounts can add products to cart.");
      return;
    }

    try {
      setAddingToCart(true);

      const response = await api.post("/cart/add", {
        productId: product.productId,
        quantity: 1,
      });

      setCartItemId(response.data.cartItemId);
      setQuantity(response.data.quantity);
      setAddedToCart(true);

      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Add to cart error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to add product to cart."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const updateQuantity = async (newQuantity) => {
    if (
      !cartItemId ||
      newQuantity < 1 ||
      !product ||
      newQuantity > product.stock
    ) {
      return;
    }

    try {
      setUpdatingQuantity(true);

      const response = await api.put(
        `/cart/item/${cartItemId}`,
        {
          quantity: newQuantity,
        }
      );

      setQuantity(response.data.quantity);

      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Update cart quantity error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to update cart quantity."
      );
    } finally {
      setUpdatingQuantity(false);
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.stock && !updatingQuantity) {
      updateQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1 && !updatingQuantity) {
      updateQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="product-details-page">
          <div className="page-container product-not-found">
            Loading product...
          </div>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />

        <main className="product-details-page">
          <div className="page-container product-not-found">
            <h2>Product not found</h2>

            <p>
              {error || "The product is not available."}
            </p>

            <Link
              to="/products"
              className="primary-btn"
            >
              Back to Products
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="product-details-page">
        <div className="page-container">

          <Link
            to="/products"
            className="back-link"
          >
            ← Back to Products
          </Link>

          <section className="product-details-layout">

            <div className="product-details-image">
              {product.imageUrl ? (
                <img
                  src={getProductImage(product.imageUrl)}
                  alt={product.name}
                />
              ) : (
                <div className="product-image-placeholder">
                  HOMELY
                </div>
              )}
            </div>

            <div className="product-details-info">

              <p className="small-label">
                PRODUCT DETAILS
              </p>

              <h1>
                {product.name}
              </h1>

              <p className="product-details-description">
                {product.description}
              </p>

              <div className="product-details-price">
                ₹
                {Number(
                  product.price
                ).toLocaleString("en-IN")}
              </div>

              <div className="product-detail-row">
                <span>Product ID</span>

                <strong>
                  {product.productId}
                </strong>
              </div>

              <div className="product-detail-row">
                <span>Category ID</span>

                <strong>
                  {product.categoryId}
                </strong>
              </div>

              <div className="product-detail-row">
                <span>Availability</span>

                <strong
                  className={
                    product.stock > 0
                      ? "stock-available"
                      : "stock-unavailable"
                  }
                >
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </strong>
              </div>

              {product.stock > 0 && (
                <>
                  {!addedToCart ? (
                    <button
                      type="button"
                      className="primary-btn add-cart-btn"
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                    >
                      {addingToCart
                        ? "Adding..."
                        : "Add to Cart"}
                    </button>
                  ) : (
                    <div className="quantity-section">

                      <label>
                        Quantity
                      </label>

                      <div className="quantity-control">

                        <button
                          type="button"
                          onClick={decreaseQuantity}
                          disabled={
                            quantity <= 1 ||
                            updatingQuantity
                          }
                        >
                          −
                        </button>

                        <span>
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={increaseQuantity}
                          disabled={
                            quantity >= product.stock ||
                            updatingQuantity
                          }
                        >
                          +
                        </button>

                      </div>

                    </div>
                  )}
                </>
              )}

            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default ProductDetails;