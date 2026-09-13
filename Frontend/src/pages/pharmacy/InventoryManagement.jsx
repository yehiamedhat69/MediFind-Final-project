import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePharmacy } from "../../context/PharmacyContext.jsx";
import { useMedicine } from "../../context/MedicineContext.jsx";

import "./InventoryManagement.css";

const emptyForm = {
  medicineId: "",
  quantity: "",
  price: "",
  availability: true,
};

const InventoryManagement = () => {
  const navigate = useNavigate();

  const {
    pharmacy,
    inventory,
    addMedicine,
    updateMedicine,
    removeMedicine,
    refresh,
  } = usePharmacy();

  const { medicines, refreshMedicines } = useMedicine();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      refresh().catch(() => {});
      refreshMedicines().catch(() => {});
    }
  }, []);

  const [formData, setFormData] = useState(emptyForm);
  const [editingItemId, setEditingItemId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Medicines that are not already in the pharmacy inventory
  const availableMedicinesForSelect = useMemo(() => {
    const existingMedicineIds = new Set(
      inventory.map((item) => String(item.medicineId))
    );

    return medicines.filter((medicine) => {
      // While editing, the medicine dropdown is disabled,
      // so there is no need to filter the current medicine.
      if (editingItemId !== null) {
        return true;
      }

      return !existingMedicineIds.has(String(medicine.id));
    });
  }, [medicines, inventory, editingItemId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setError("");
    setSuccess("");
  };

  const validate = () => {
    const errors = {};

    if (editingItemId === null && !formData.medicineId) {
      errors.medicineId = "Please select a medicine.";
    }

    if (
      formData.quantity === "" ||
      formData.quantity === null
    ) {
      errors.quantity = "Quantity is required.";
    } else if (
      !Number.isInteger(Number(formData.quantity)) ||
      Number(formData.quantity) < 0
    ) {
      errors.quantity =
        "Quantity must be a non-negative integer.";
    }

    if (
      formData.price === "" ||
      formData.price === null
    ) {
      errors.price = "Price is required.";
    } else if (
      Number.isNaN(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      errors.price =
        "Price must be a non-negative number.";
    }

    return errors;
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingItemId(null);
    setFieldErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);

      // EDIT EXISTING MEDICINE
      if (editingItemId !== null) {
        await updateMedicine(editingItemId, {
          quantity: Number(formData.quantity),
          price: Number(formData.price),
          availability: Boolean(formData.availability),
        });

        setSuccess(
          "Inventory item updated successfully."
        );
      }

      // ADD NEW MEDICINE
      else {
        const selectedMedicine = medicines.find(
          (medicine) =>
            String(medicine.id) ===
            String(formData.medicineId)
        );

        if (!selectedMedicine) {
          throw new Error(
            "Selected medicine could not be found."
          );
        }

        await addMedicine({
          medicineId: selectedMedicine.id,
          medicineName: selectedMedicine.name,
          quantity: Number(formData.quantity),
          price: Number(formData.price),
          availability: Boolean(formData.availability),
        });

        setSuccess(
          "Medicine added to inventory successfully."
        );
      }

      resetForm();
    } catch (err) {
      setError(
        err.message ||
          "Unable to save inventory item."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    // Store only the ID of the item being edited
    setEditingItemId(item.id);

    setFormData({
      medicineId: String(item.medicineId),
      quantity: String(item.quantity ?? ""),
      price: String(item.price ?? ""),
      availability: item.availability !== false,
    });

    setFieldErrors({});
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Remove ${item.medicineName} from inventory?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingId(item.id);
      setError("");
      setSuccess("");

      await removeMedicine(item.id);

      // If we were editing the deleted medicine,
      // reset the form.
      if (editingItemId === item.id) {
        resetForm();
      }

      setSuccess(
        "Medicine removed from inventory successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to remove inventory item."
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="inventory-page">
      <div className="inventory-container">

        {/* Header */}
        <div className="inventory-header">
          <div>
            <p className="inventory-eyebrow">
              Pharmacy Management
            </p>

            <h1>Inventory Management</h1>

            <p>
              Manage medicines, quantities, prices
              and availability.
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

        {/* Pharmacy Summary */}
        {pharmacy && (
          <div className="pharmacy-summary">
            <strong>{pharmacy.name}</strong>

            <span>{pharmacy.address}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="inventory-alert error">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="inventory-alert success">
            {success}
          </div>
        )}

        {/* Add / Edit Form */}
        <section className="inventory-form-card">

          <div className="inventory-card-header">
            <div>
              <h2>
                {editingItemId !== null
                  ? "Edit Inventory Item"
                  : "Add Medicine"}
              </h2>

              <p>
                {editingItemId !== null
                  ? "Update the selected medicine."
                  : "Add a medicine to your pharmacy inventory."}
              </p>
            </div>

            {editingItemId !== null && (
              <button
                type="button"
                className="cancel-edit-button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="inventory-form"
          >
            <div className="inventory-form-grid">

              {/* Medicine */}
              <div className="form-group">
                <label htmlFor="medicineId">
                  Medicine
                </label>

                <select
                  id="medicineId"
                  name="medicineId"
                  value={formData.medicineId}
                  onChange={handleChange}
                  disabled={editingItemId !== null}
                  className={
                    fieldErrors.medicineId
                      ? "input-error"
                      : ""
                  }
                >
                  <option value="">
                    Select medicine
                  </option>

                  {availableMedicinesForSelect.map(
                    (medicine) => (
                      <option
                        key={medicine.id}
                        value={medicine.id}
                      >
                        {medicine.name}
                      </option>
                    )
                  )}
                </select>

                {fieldErrors.medicineId && (
                  <span className="field-error">
                    {fieldErrors.medicineId}
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label htmlFor="quantity">
                  Quantity
                </label>

                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={
                    fieldErrors.quantity
                      ? "input-error"
                      : ""
                  }
                  placeholder="0"
                />

                {fieldErrors.quantity && (
                  <span className="field-error">
                    {fieldErrors.quantity}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="form-group">
                <label htmlFor="price">
                  Price
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className={
                    fieldErrors.price
                      ? "input-error"
                      : ""
                  }
                  placeholder="0.00"
                />

                {fieldErrors.price && (
                  <span className="field-error">
                    {fieldErrors.price}
                  </span>
                )}
              </div>

              {/* Availability */}
              <div className="availability-group">
                <label className="availability-label">
                  Availability
                </label>

                <label className="switch-row">
                  <input
                    type="checkbox"
                    name="availability"
                    checked={formData.availability}
                    onChange={handleChange}
                  />

                  <span className="switch"></span>

                  <span>
                    {formData.availability
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">

              {editingItemId !== null && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingItemId !== null
                  ? "Update Medicine"
                  : "Add Medicine"}
              </button>

            </div>
          </form>
        </section>

        {/* Inventory List */}
        <section className="inventory-list-card">

          <div className="inventory-card-header">
            <div>
              <h2>Current Inventory</h2>

              <p>
                {inventory.length} medicine
                {inventory.length !== 1
                  ? "s"
                  : ""}{" "}
                in inventory
              </p>
            </div>
          </div>

          {inventory.length === 0 ? (
            <div className="inventory-empty">

              <div className="empty-icon">
                +
              </div>

              <h3>No medicines yet</h3>

              <p>
                Add your first medicine to start
                managing your inventory.
              </p>

            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="inventory-table-wrapper">

                <table className="inventory-table">

                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {inventory.map((item) => {

                     const isAvailable = item.availability;

                      return (
                        <tr key={item.id}>

                          <td>
                            <strong>
                              {item.medicineName}
                            </strong>
                          </td>

                          <td>
                            {item.quantity}
                          </td>

                          <td>
                            {Number(
                              item.price
                            ).toFixed(2)}
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                isAvailable
                                  ? "available"
                                  : "unavailable"
                              }`}
                            >
                              {isAvailable
                                ? "Available"
                                : "Unavailable"}
                            </span>
                          </td>

                          <td>
                            <div className="action-buttons">

                              <button
                                type="button"
                                className="edit-button"
                                onClick={() =>
                                  handleEdit(item)
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="delete-button"
                                onClick={() =>
                                  handleDelete(item)
                                }
                                disabled={
                                  removingId ===
                                  item.id
                                }
                              >
                                {removingId ===
                                item.id
                                  ? "Removing..."
                                  : "Remove"}
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>

              {/* Mobile List */}
              <div className="inventory-mobile-list">

                {inventory.map((item) => {

                  const isAvailable =
                    item.availability &&
                    Number(item.quantity) > 0;

                  return (
                    <div
                      className="inventory-mobile-card"
                      key={item.id}
                    >

                      <div className="mobile-card-header">

                        <strong>
                          {item.medicineName}
                        </strong>

                        <span
                          className={`status-badge ${
                            isAvailable
                              ? "available"
                              : "unavailable"
                          }`}
                        >
                          {isAvailable
                            ? "Available"
                            : "Unavailable"}
                        </span>

                      </div>

                      <div className="mobile-info-grid">

                        <div>
                          <span>Quantity</span>

                          <strong>
                            {item.quantity}
                          </strong>
                        </div>

                        <div>
                          <span>Price</span>

                          <strong>
                            {Number(
                              item.price
                            ).toFixed(2)}
                          </strong>
                        </div>

                      </div>

                      <div className="mobile-actions">

                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            handleEdit(item)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDelete(item)
                          }
                          disabled={
                            removingId ===
                            item.id
                          }
                        >
                          {removingId ===
                          item.id
                            ? "Removing..."
                            : "Remove"}
                        </button>

                      </div>

                    </div>
                  );
                })}

              </div>
            </>
          )}

        </section>
      </div>
    </div>
  );
};

export default InventoryManagement;