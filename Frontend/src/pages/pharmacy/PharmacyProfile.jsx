import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyPharmacy,
  updatePharmacyProfile,
} from "../../services/pharmacyManagementService";

import "./PharmacyProfile.css";

const initialForm = {
  name: "",
  address: "",
  phone: "",
};

const PharmacyProfile = () => {
  const navigate = useNavigate();

  const [pharmacy, setPharmacy] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    loadPharmacy();
  }, []);

  const loadPharmacy = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyPharmacy();

      setPharmacy(data);

      setFormData({
        name: data?.name || "",
        address: data?.address || "",
        phone: data?.phone || "",
      });
    } catch (err) {
      setError(
        err.message ||
          "Unable to load pharmacy information."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSuccess("");
  };

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Pharmacy name is required.";
    } else if (formData.name.trim().length < 2) {
      errors.name =
        "Pharmacy name must be at least 2 characters.";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required.";
    }

    if (formData.phone.trim()) {
      const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

      if (!phoneRegex.test(formData.phone.trim())) {
        errors.phone = "Please enter a valid phone number.";
      }
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccess("");
    setError("");

    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);

      const pharmacyId = pharmacy?._id;

      const updatedPharmacy =
        await updatePharmacyProfile(pharmacyId, {
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
        });

      setPharmacy(updatedPharmacy);

      setFormData({
        name: updatedPharmacy?.name || "",
        address: updatedPharmacy?.address || "",
        phone: updatedPharmacy?.phone || "",
      });

      setSuccess(
        "Pharmacy profile updated successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to update pharmacy profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pharmacy-profile-page">
        <div className="profile-state">
          <div className="profile-loader"></div>
          <p>Loading pharmacy profile...</p>
        </div>
      </div>
    );
  }

  if (error && !pharmacy) {
    return (
      <div className="pharmacy-profile-page">
        <div className="profile-state profile-error">
          <h2>Unable to load profile</h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={loadPharmacy}
            className="primary-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pharmacy-profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div>
            <p className="profile-eyebrow">
              Pharmacy Management
            </p>

            <h1>Pharmacy Profile</h1>

            <p>
              View and update your pharmacy information.
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/pharmacy/dashboard")
            }
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="profile-alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-alert success">
            {success}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar">
              +
            </div>

            <div>
              <h2>
                {pharmacy?.name || "Pharmacy"}
              </h2>

              <span>
                Pharmacy account
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="profile-form"
          >
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  Pharmacy Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={
                    fieldErrors.name
                      ? "input-error"
                      : ""
                  }
                  placeholder="Enter pharmacy name"
                />

                {fieldErrors.name && (
                  <span className="field-error">
                    {fieldErrors.name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={
                    fieldErrors.phone
                      ? "input-error"
                      : ""
                  }
                  placeholder="Enter phone number"
                />

                {fieldErrors.phone && (
                  <span className="field-error">
                    {fieldErrors.phone}
                  </span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows="4"
                  value={formData.address}
                  onChange={handleChange}
                  className={
                    fieldErrors.address
                      ? "input-error"
                      : ""
                  }
                  placeholder="Enter pharmacy address"
                />

                {fieldErrors.address && (
                  <span className="field-error">
                    {fieldErrors.address}
                  </span>
                )}
              </div>
            </div>

            <div className="profile-form-footer">
              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  navigate("/pharmacy/dashboard")
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PharmacyProfile;