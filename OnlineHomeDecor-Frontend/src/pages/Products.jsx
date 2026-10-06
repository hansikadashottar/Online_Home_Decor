import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";
import api from "../services/api";
import { getProductImage } from "../services/imageUrl";

function Products() {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryId = searchParams.get("categoryId");
  const searchQuery = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(searchQuery);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchInput(searchQuery);
    fetchProducts();
  }, [categoryId, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (searchQuery) {
        response = await api.get(
          `/products/search?name=${encodeURIComponent(searchQuery)}`
        );
      } else if (categoryId) {
        response = await api.get(
          `/categories/${categoryId}/products`
        );
      } else {
        response = await api.get("/products");
      }

      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const value = searchInput.trim();

    const params = new URLSearchParams();

    if (value) {
      params.set("search", value);
    }

    if (categoryId) {
      params.set("categoryId", categoryId);
    }

    setSearchParams(params);
  };

  const clearSearch = () => {
    setSearchInput("");

    const params = new URLSearchParams();

    if (categoryId) {
      params.set("categoryId", categoryId);
    }

    setSearchParams(params);
  };

  return (
    <>
      <Navbar />

      <main className="products-page">

        {/* =========================
            PRODUCTS HEADER
        ========================= */}

        <section className="products-header">
          <div className="page-container">

            <p className="small-label">
              HOMELY COLLECTION
            </p>

            <h1>
              Products
            </h1>

            <p>
              Discover furniture and decor pieces made for your home.
            </p>

          </div>
        </section>


        {/* =========================
            PRODUCTS SECTION
        ========================= */}

        <section className="section page-container">

          {/* SEARCH */}

          <div className="products-toolbar">

            <form
              onSubmit={handleSearch}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >

              <div className="products-search">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.target.value)
                  }
                />

              </div>

              <button
                type="submit"
                className="primary-btn"
              >
                Search
              </button>

            </form>

            {searchQuery && (
              <button
                type="button"
                className="secondary-btn"
                onClick={clearSearch}
              >
                Clear
              </button>
            )}

          </div>


          {/* LOADING */}

          {loading && (
            <div className="products-message">
              Loading products...
            </div>
          )}


          {/* ERROR */}

          {!loading && error && (
            <div className="products-message products-error">
              {error}
            </div>
          )}


          {/* NO PRODUCTS */}

          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="products-message">
                No products found.
              </div>
            )}


          {/* =========================
              PRODUCT GRID
          ========================= */}

          {!loading &&
            !error &&
            products.length > 0 && (

              <div className="product-grid">

                {products.map((product) => (

                  <article
                    className="product-card"
                    key={product.productId}
                  >

                    {/* PRODUCT IMAGE */}

                    <Link
                      to={`/products/${product.productId}`}
                      className="product-image-wrapper"
                    >

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

                    </Link>


                    {/* PRODUCT INFORMATION */}

                    <div className="product-info">

                      <p className="product-category">
                        Category #{product.categoryId}
                      </p>

                      <h3>
                        {product.name}
                      </h3>

                      <p className="product-description">
                        {product.description}
                      </p>

                      <p className="product-price">
                        ₹
                        {Number(
                          product.price
                        ).toLocaleString("en-IN")}
                      </p>


                      {/* VIEW DETAILS ONLY */}

                      <Link
                        to={`/products/${product.productId}`}
                        className="secondary-btn product-card-details-btn"
                      >
                        View Details
                      </Link>

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

export default Products;