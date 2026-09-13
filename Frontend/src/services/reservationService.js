import { request, idOf } from "./api";
import { getMedicineById } from "./medicineService";
import { getPharmacyById, getMedicineAvailability } from "./pharmacyService";

const normalizeReservation = (reservation) => ({
  ...reservation,
  id: idOf(reservation),
  medicineId: idOf(reservation.medicineId),
  pharmacyId: idOf(reservation.pharmacyId),
  customerId: idOf(reservation.customerId),
  medicineName: reservation.medicineId?.name || "Unknown Medicine",
  pharmacyName: reservation.pharmacyId?.name || "Unknown Pharmacy",
  customerName: reservation.customerId?.username || "Unknown Customer",
  customerPhone: reservation.customerId?.phone || "",
  price: reservation.unitPrice,
  date: reservation.createdAt || reservation.date,
  status: reservation.status ? reservation.status[0].toUpperCase() + reservation.status.slice(1) : reservation.status,
});

export const getReservationDetails = async (medicineId, pharmacyId) => {
  const [medicine, pharmacy, availability] = await Promise.all([
    getMedicineById(medicineId),
    getPharmacyById(pharmacyId),
    getMedicineAvailability(pharmacyId, medicineId),
  ]);
  if (!availability) throw new Error("This medicine is not available at this pharmacy.");
  return { medicine, pharmacy, availability };
};

export const createReservation = async ({ medicineId, pharmacyId, quantity }) => {
  const data = await request("/reservations", {
    method: "POST",
    body: JSON.stringify({
      medicineId,
      pharmacyId,
      quantity: Number(quantity),
    }),
  });
  return { ...data, reservation: normalizeReservation(data.reservation) };
};

export const getCustomerReservations = async () => {
  const data = await request("/reservations/my");
  return (data.reservations || []).map(normalizeReservation);
};

export const cancelReservation = async (reservationId) => {
  const data = await request(`/reservations/${encodeURIComponent(reservationId)}/cancel`, { method: "PATCH" });
  return { ...data, reservation: normalizeReservation(data.reservation) };
};

export const getPharmacyReservations = async (pharmacyId) => {
  const data = await request(`/reservations/pharmacy/${encodeURIComponent(pharmacyId)}`);
  return (data.reservations || []).map(normalizeReservation);
};

export const updateReservationStatus = async (id, status) => {
  const data = await request(`/reservations/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: status.toLowerCase() }),
  });
  return normalizeReservation(data.reservation);
};
