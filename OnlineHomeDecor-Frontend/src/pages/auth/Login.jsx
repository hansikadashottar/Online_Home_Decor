import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../App.css";

function Login() {
  return (
    <>
      <Navbar />

      <main className="login-page">
        <div className="login-container">

          <div className="login-heading">
            <p className="small-label">WELCOME TO HOMELY</p>

            <h1>Login to your account</h1>

            <p>
              Choose your account type to continue.
            </p>
          </div>

          <div className="account-type-grid">

            {/* Customer */}
            <Link
              to="/login/customer"
              className="account-type-card"
            >
              <div className="account-type-icon">
                ♙
              </div>

              <h2>Customer</h2>

              <p>
                Shop products, manage your cart,
                place orders and track your purchases.
              </p>

              <span>
                Continue as Customer →
              </span>
            </Link>

            {/* Admin */}
            <Link
              to="/login/admin"
              className="account-type-card"
            >
              <div className="account-type-icon">
                ◈
              </div>

              <h2>Admin</h2>

              <p>
                Manage products, categories,
                orders and payments.
              </p>

              <span>
                Continue as Admin →
              </span>
            </Link>

          </div>

        </div>
      </main>
    </>
  );
}

export default Login;