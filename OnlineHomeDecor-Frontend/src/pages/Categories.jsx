import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import "../App.css";
import api from "../services/api";
import { getCategoryImage } from "../services/imageUrl";

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

function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories");

      setCategories(response.data);
    } catch (err) {
      console.error(
        "Error fetching categories:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(
      `/products?categoryId=${categoryId}`
    );
  };

  return (
    <>
      <Navbar />

      <main className="categories-page">

        <section className="products-header">

          <div className="page-container">

            <p className="small-label">
              HOMELY CATEGORIES
            </p>

            <h1>
              Shop by Category
            </h1>

            <p>
              Find something beautiful for every corner of
              your home.
            </p>

          </div>

        </section>

        <section className="section page-container">

          {loading && (
            <div className="products-message">
              Loading categories...
            </div>
          )}

          {!loading && error && (
            <div className="products-message products-error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            categories.length === 0 && (
              <div className="products-message">
                No categories available.
              </div>
            )}

          {!loading &&
            !error &&
            categories.length > 0 && (

              <div className="category-grid">

                {categories.map((category) => (

                  <article
                    className="category-card"
                    key={category.categoryId}
                    onClick={() =>
                      handleCategoryClick(
                        category.categoryId
                      )
                    }
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

                  </article>

                ))}

              </div>

            )}

        </section>

      </main>
    </>
  );
}

export default Categories;