import { useEffect, useRef, useState } from "react";
import "../../App.css";
import api from "../../services/api";
import { getProductImage } from "../../services/imageUrl";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  image: null,
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, categoriesResponse] =
        await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

      setProducts(productsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load product data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setForm((current) => ({
        ...current,
        image: null,
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";

      setForm((current) => ({
        ...current,
        image: null,
      }));

      return;
    }

    setError("");

    setForm((current) => ({
      ...current,
      image: file,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.productId);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      categoryId: product.categoryId ?? "",
      image: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const formData = new FormData();

    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("categoryId", form.categoryId);

    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      if (editingId) {
        await api.put(
          `/products/${editingId}`,
          formData
        );

        setMessage("Product updated successfully.");
      } else {
        await api.post(
          "/products",
          formData
        );

        setMessage("Product created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error(
        "Admin product save error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(`/products/${productId}`);

      setMessage("Product deleted successfully.");

      if (editingId === productId) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete product."
      );
    }
  };

  return (
    <section className="admin-module-page-modern">

      <div className="admin-page-heading">
        <div>
          <p className="small-label">
            STORE MANAGEMENT
          </p>

          <h1>
            Products
          </h1>

          <p>
            Create, update and delete products.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
        </div>
      )}

      {message && (
        <div className="admin-alert admin-alert-success">
          {message}
        </div>
      )}

      <section className="admin-form-card">

        <div className="admin-card-heading">

          <div>
            <p className="small-label">
              PRODUCT FORM
            </p>

            <h2>
              {editingId
                ? `Edit Product #${editingId}`
                : "Add Product"}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              className="secondary-btn"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}

        </div>

        <form
          className="admin-form-grid"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label>
              Product Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Category
            </label>

            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">
                Select category
              </option>

              {categories.map((category) => (
                <option
                  value={category.categoryId}
                  key={category.categoryId}
                >
                  {category.name}
                </option>
              ))}
            </select>

          </div>

          <div className="form-group">

            <label>
              Price
            </label>

            <input
              name="price"
              type="number"
              min="1"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Stock
            </label>

            <input
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              required
            />

          </div>

          <div className="form-group admin-full-width-field">

            <label>
              Product Image
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleImageChange}
            />

            <small className="admin-muted">
              {form.image
                ? `Selected: ${form.image.name}`
                : editingId
                ? "Select a new image only if you want to replace the existing image."
                : "Select a JPG, JPEG, PNG or WEBP image."}
            </small>

          </div>

          <div className="form-group admin-full-width-field">

            <label>
              Description
            </label>

            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
            />

          </div>

          <div className="admin-form-actions">

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
              >
                Clear
              </button>
            )}

          </div>

        </form>

      </section>

      <section className="admin-table-card">

        <div className="admin-card-heading">

          <div>
            <p className="small-label">
              LIVE CATALOG
            </p>

            <h2>
              Products ({products.length})
            </h2>
          </div>

        </div>

        {loading ? (

          <p className="admin-muted">
            Loading products...
          </p>

        ) : (

          <div className="admin-table-wrap">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {products.map((product) => (

                  <tr key={product.productId}>

                    <td>

                      <div className="admin-product-cell">

                        <div className="admin-product-thumb">

                          {product.imageUrl ? (

                            <img
                              src={getProductImage(
                                product.imageUrl
                              )}
                              alt={product.name}
                            />

                          ) : (

                            <span>
                              H
                            </span>

                          )}

                        </div>

                        <div>

                          <strong>
                            {product.name}
                          </strong>

                          <span>
                            #{product.productId}
                          </span>

                        </div>

                      </div>

                    </td>

                    <td>
                      ₹
                      {Number(
                        product.price
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>

                      <span
                        className={
                          product.stock > 0
                            ? "admin-stock-badge"
                            : "admin-stock-badge admin-stock-out"
                        }
                      >
                        {product.stock}
                      </span>

                    </td>

                    <td>
                      #{product.categoryId}
                    </td>

                    <td>

                      <div className="admin-table-actions">

                        <button
                          type="button"
                          className="secondary-btn compact-btn"
                          onClick={() =>
                            handleEdit(product)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger-btn compact-btn"
                          onClick={() =>
                            deleteProduct(
                              product.productId
                            )
                          }
                        >
                          Delete
                        </button>

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

export default AdminProducts;