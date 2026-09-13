import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "./Register.css";
import { register } from "../../../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));

    // A pharmacy-only validation error must never block customer registration.
    if (name === "role") {
      setErrors({});
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name =
        "Full name is required";
    } else if (
      formData.name.trim().length < 3
    ) {
      newErrors.name =
        "Name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email is required";
    } else if (
      !/\S+@\S+\.\S+/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password =
        "Password is required";
    } else if (
      formData.password.length < 6
    ) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (
      formData.password !==
      formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setErrors({});
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      alert("Account created successfully. Please sign in.");
      navigate("/login");
    } catch (err) {
      setErrors({ general: err.message || "Unable to create account." });
    }
  };

  return (
    <div className="register-page">

      <div className="register-container">

        <div className="register-brand">

          <div className="register-logo">
            <span>+</span>
          </div>

          <h1>
            Medi<span>Find</span>
          </h1>

          <p>
            Create your account and make
            <br />
            finding medicine easier.
          </p>

        </div>

        <div className="register-card">

          <div className="register-header">

            <h2>Create Account</h2>

            <p>
              Join MediFind today
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="register-form"
          >
            {errors.general && <div className="error-message">{errors.general}</div>}

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className={
                  errors.name
                    ? "input-error"
                    : ""
                }
              />

              {errors.name && (
                <span className="error-message">
                  {errors.name}
                </span>
              )}

            </div>

            <div className="form-group">

              <label htmlFor="register-email">
                Email Address
              </label>

              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={
                  errors.email
                    ? "input-error"
                    : ""
                }
              />

              {errors.email && (
                <span className="error-message">
                  {errors.email}
                </span>
              )}

            </div>

            <div className="form-group">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="password-input-wrapper">

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className={
                    errors.password
                      ? "input-error"
                      : ""
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

              {errors.password && (
                <span className="error-message">
                  {errors.password}
                </span>
              )}

            </div>

            <div className="form-group">

              <label htmlFor="confirm-password">
                Confirm Password
              </label>

              <div className="password-input-wrapper">

                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  className={
                    errors.confirmPassword
                      ? "input-error"
                      : ""
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

              {errors.confirmPassword && (
                <span className="error-message">
                  {errors.confirmPassword}
                </span>
              )}

            </div>

            <div className="form-group">

              <label htmlFor="role">
                Account Type
              </label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer">
                  Customer
                </option>

                <option value="pharmacy">
                  Pharmacy
                </option>
              </select>

            </div>

            <button
              type="submit"
              className="register-submit"
            >
              Create Account
            </button>

          </form>

          <p className="register-switch">
            Already have an account?{" "}

            <Link to="/login">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Register;