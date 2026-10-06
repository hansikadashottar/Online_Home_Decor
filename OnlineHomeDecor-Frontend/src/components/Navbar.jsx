import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Navbar() {
  const { isAuthenticated, role, fullName, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRoute =
    role === "ADMIN" ? "/admin/dashboard" : "/profile";

  const loadCartCount = async () => {
    if (!isAuthenticated || role !== "CUSTOMER") {
      setCartCount(0);
      return;
    }

    try {
      const response = await api.get("/cart");

      const total = response.data.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      );

      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    const query =
      new URLSearchParams(location.search).get("search") || "";

    setSearch(query);
  }, [location.search]);

  useEffect(() => {
    loadCartCount();

    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener(
      "cart-updated",
      handleCartUpdate
    );

    return () =>
      window.removeEventListener(
        "cart-updated",
        handleCartUpdate
      );
  }, [isAuthenticated, role]);

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    if (value) {
      navigate(
        `/products?search=${encodeURIComponent(value)}`
      );
    } else {
      navigate("/products");
    }
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">

        <Link to="/" className="brand">
          <span className="brand-icon">⌂</span>
          <span>HOMELY</span>
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>

          <Link to="/products">
            Products
          </Link>

          <Link to="/categories">
            Categories
          </Link>

          {isAuthenticated &&
            role === "CUSTOMER" && (
              <Link to="/orders">
                Orders
              </Link>
            )}
        </nav>

        <div className="nav-actions">

          <form
            className="navbar-search"
            onSubmit={handleSearch}
          >
            <input
              aria-label="Search products"
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <button
              type="submit"
              className="navbar-search-btn"
              title="Search"
            >
              ⌕
            </button>
          </form>

          {isAuthenticated ? (
            <div className="profile-menu-wrapper">

              <button
                type="button"
                className="profile-nav-link"
                onClick={() =>
                  setShowProfileMenu(
                    (current) => !current
                  )
                }
                title="Account"
              >
                <span className="profile-icon">
                  ♙
                </span>

                <span className="profile-name">
                  {fullName || "Account"}
                </span>
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">

                  <Link
                    to={profileRoute}
                    className="profile-dropdown-item"
                    onClick={() =>
                      setShowProfileMenu(false)
                    }
                  >
                    <span className="dropdown-icon">
                      ♙
                    </span>

                    <span>
                      Profile
                    </span>
                  </Link>

                  <button
                    type="button"
                    className="profile-dropdown-item logout-dropdown-item"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon">
                      ↪
                    </span>

                    <span>
                      Logout
                    </span>
                  </button>

                </div>
              )}

            </div>
          ) : (
            <Link
              to="/login"
              className="nav-login-btn"
            >
              Login
            </Link>
          )}

          {role === "CUSTOMER" && (
            <Link
              to="/cart"
              className="nav-icon cart-icon"
              title="Cart"
            >
              ♧

              {cartCount > 0 && (
                <span className="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}

export default Navbar;