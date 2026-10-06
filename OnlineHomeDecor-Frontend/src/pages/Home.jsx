import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import "../App.css";
import api from "../services/api";
import {
  getProductImage,
  getCategoryImage,
} from "../services/imageUrl";

const categoryImages = {
  Furniture: "/images/categories/furniture.jpg",
  "Wall Art & Decor": "/images/categories/wall-art.jpg",
  "Rugs & Carpets": "/images/categories/rugs.jpg",
  "Bed & Bedding": "/images/categories/bed-bedding.jpg",
  "Flower Pots & Plants": "/images/categories/plants.jpg",
  Lighting: "/images/categories/lighting.jpg",
  "Home Decor": "/images/categories/home-decor.jpg",
  "Storage & Organizers": "/images/categories/storage.jpg",
};

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);

      const response = await api.get("/products");

      setProducts(response.data);
    } catch (error) {
      console.error(
        "Error loading home products:",
        error
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const response = await api.get("/categories");

      setCategories(response.data);
    } catch (error) {
      console.error(
        "Error loading home categories:",
        error
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  return (
    <>
      <Navbar />

      <main>

        {/* ================= HERO ================= */}

        <section className="hero">

          <div className="hero-content">

            <p className="hero-label">
              MADE FOR YOUR HOME
            </p>

            <h1>
              Make your space
              <br />
              feel like home.
            </h1>

            <p className="hero-text">
              Thoughtfully selected furniture and decor made
              for beautiful, comfortable spaces.
            </p>

            <Link
              to="/products"
              className="primary-btn"
            >
              Explore Products
            </Link>

          </div>

        </section>

        {/* ================= CATEGORIES ================= */}

        <section className="section page-container">

          <div className="section-heading-row">

            <div>

              <h2 className="section-title">
                Shop by Category
              </h2>

              <p className="section-subtitle">
                Find something beautiful for every corner
                of your home.
              </p>

            </div>

            <Link
              to="/categories"
              className="text-link-btn"
            >
              View All Categories →
            </Link>

          </div>

          {loadingCategories ? (

            <div className="products-message">
              Loading categories...
            </div>

          ) : (

            <div className="category-grid">

              {categories
                .slice(0, 8)
                .map((category) => (

                  <Link
                    key={category.categoryId}
                    to={`/products?categoryId=${category.categoryId}`}
                    className="category-card"
                  >

                    <img
                      src={
                        getCategoryImage(
                          category.imageUrl
                        ) ||
                        categoryImages[category.name] ||
                        "/images/categories/home-decor.jpg"
                      }
                      alt={category.name}
                    />

                    <div className="category-overlay">

                      <h3>
                        {category.name}
                      </h3>

                      <span>
                        Explore →
                      </span>

                    </div>

                  </Link>

                ))}

            </div>

          )}

        </section>

        {/* ================= FEATURED PRODUCTS ================= */}

        <section className="section featured-section">

          <div className="page-container">

            <div className="section-heading-row">

              <div>

                <h2 className="section-title">
                  Featured Products
                </h2>

                <p className="section-subtitle">
                  Beautiful pieces from the HOMELY collection.
                </p>

              </div>

              <Link
                to="/products"
                className="text-link-btn"
              >
                View All Products →
              </Link>

            </div>

            {loadingProducts ? (

              <div className="products-message">
                Loading products...
              </div>

            ) : (

              <div className="product-grid">

                {products
                  .slice(0, 4)
                  .map((product) => (

                    <article
                      className="product-card"
                      key={product.productId}
                    >

                      <div className="product-image-wrapper">

                        <img
                          src={getProductImage(
                            product.imageUrl
                          )}
                          alt={product.name}
                        />

                      </div>

                      <div className="product-info">

                        <p className="product-category">
                          Category #{product.categoryId}
                        </p>

                        <h3>
                          {product.name}
                        </h3>

                        <p className="product-price">
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString("en-IN")}
                        </p>

                        <Link
                          to={`/products/${product.productId}`}
                          className="secondary-btn"
                        >
                          View Details
                        </Link>

                      </div>

                    </article>

                  ))}

              </div>

            )}

          </div>

        </section>

        {/* ================= WHY HOMELY ================= */}

        <section className="why-section">

          <div className="page-container">

            <div className="section-heading-center">

              <p className="small-label">
                WHY HOMELY
              </p>

              <h2 className="section-title">
                Designed around your home.
              </h2>

              <p className="section-subtitle">
                Everything you need to create a space that
                feels comfortable, beautiful and truly yours.
              </p>

            </div>

            <div className="trust-grid">

              <div className="trust-card">

                <div className="trust-icon">
                  ✓
                </div>

                <h3>
                  Quality Products
                </h3>

                <p>
                  Carefully selected products made for
                  everyday living.
                </p>

              </div>

              <div className="trust-card">

                <div className="trust-icon">
                  ↺
                </div>

                <h3>
                  Easy Returns
                </h3>

                <p>
                  A simple shopping experience with
                  convenient returns.
                </p>

              </div>

              <div className="trust-card">

                <div className="trust-icon">
                  ▣
                </div>

                <h3>
                  Secure Payments
                </h3>

                <p>
                  Your payments are handled through secure
                  payment methods.
                </p>

              </div>

              <div className="trust-card">

                <div className="trust-icon">
                  ⌁
                </div>

                <h3>
                  Order Tracking
                </h3>

                <p>
                  Keep track of your orders from purchase
                  to delivery.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>
    </>
  );
}

export default Home;