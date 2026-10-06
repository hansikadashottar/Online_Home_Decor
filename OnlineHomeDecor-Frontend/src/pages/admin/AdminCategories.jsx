import { useEffect, useRef, useState } from "react";
import "../../App.css";
import api from "../../services/api";

const emptyForm = {
  name: "",
  description: "",
  image: null,
};

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories");

      setCategories(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const formData = new FormData();

    formData.append(
      "name",
      form.name.trim()
    );

    formData.append(
      "description",
      form.description.trim()
    );

    if (form.image) {
      formData.append(
        "image",
        form.image
      );
    }

    try {
      if (editingId) {
        await api.put(
          `/categories/${editingId}`,
          formData
        );

        setMessage(
          "Category updated successfully."
        );
      } else {
        await api.post(
          "/categories",
          formData
        );

        setMessage(
          "Category created successfully."
        );
      }

      resetForm();

      await loadCategories();
    } catch (err) {
      console.error(
        "Admin category save error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(
      category.categoryId
    );

    setForm({
      name: category.name || "",
      description: category.description || "",
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

  const deleteCategory = async (categoryId) => {
    if (!window.confirm("Delete this category?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(
        `/categories/${categoryId}`
      );

      setMessage(
        "Category deleted successfully."
      );

      if (editingId === categoryId) {
        resetForm();
      }

      await loadCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete category. If products still use it, remove or move those products first."
      );
    }
  };

  const getCategoryImageUrl = (category) => {
    if (!category.imageUrl) {
      return "";
    }

    if (
      category.imageUrl.startsWith("http://") ||
      category.imageUrl.startsWith("https://")
    ) {
      return category.imageUrl;
    }

    if (
      category.imageUrl.startsWith("/")
    ) {
      return `http://localhost:8080${category.imageUrl}`;
    }

    return `http://localhost:8080/images/categories/${category.imageUrl}`;
  };

  return (
    <section className="admin-module-page-modern">

      <div className="admin-page-heading">
        <div>
          <p className="small-label">
            STORE MANAGEMENT
          </p>

          <h1>
            Categories
          </h1>

          <p>
            Manage the categories used by your live product catalog.
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
              CATEGORY FORM
            </p>

            <h2>
              {editingId
                ? `Edit Category #${editingId}`
                : "Add Category"}
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
              Category Name
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
              Category Image
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
                ? "Update Category"
                : "Add Category"}
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
              Categories ({categories.length})
            </h2>
          </div>

        </div>

        {loading ? (

          <p className="admin-muted">
            Loading categories...
          </p>

        ) : (

          <div className="admin-table-wrap">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Image</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {categories.map((category) => {

                  const imageUrl =
                    getCategoryImageUrl(category);

                  return (
                    <tr
                      key={category.categoryId}
                    >

                      <td>
                        #{category.categoryId}
                      </td>

                      <td>
                        <strong>
                          {category.name}
                        </strong>
                      </td>

                      <td>

                        {imageUrl ? (
                          <a
                            href={imageUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Image
                          </a>
                        ) : (
                          "—"
                        )}

                      </td>

                      <td>
                        {category.description ||
                          "—"}
                      </td>

                      <td>

                        <div className="admin-table-actions">

                          <button
                            type="button"
                            className="secondary-btn compact-btn"
                            onClick={() =>
                              handleEdit(
                                category
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="danger-btn compact-btn"
                            onClick={() =>
                              deleteCategory(
                                category.categoryId
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </section>
  );
}

export default AdminCategories;