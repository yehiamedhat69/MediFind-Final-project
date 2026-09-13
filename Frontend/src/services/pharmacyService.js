import { request, idOf } from "./api";

const normalizePharmacy = (pharmacy) => ({
  ...pharmacy,
  id: idOf(pharmacy),
  name: pharmacy?.name || "",
  address: pharmacy?.address || "",
  phone: pharmacy?.phone || "",
  email: pharmacy?.email || "",
  description: pharmacy?.description || "",
  status: pharmacy?.isActive === false ? "Inactive" : "Active",
});

export const getPharmacyById = async (pharmacyId) => {
  const data = await request(`/pharmacies/${encodeURIComponent(pharmacyId)}`);
  return normalizePharmacy(data.pharmacy);
};

export const getMedicineAvailability = async (pharmacyId, medicineId) => {
  const data = await request(`/search/medicine/${encodeURIComponent(medicineId)}/pharmacy/${encodeURIComponent(pharmacyId)}`);
  const item = data.inventory || {};
  return {
    ...item,
    id: idOf(item) || null,
    medicineId: idOf(item.medicineId || data.medicine),
    price: item.price ?? null,
    quantity: Number(item.quantity ?? 0),
    availability: Boolean(item.availability),
    available: Boolean(data.available && item.availability && Number(item.quantity) > 0),
  };
};

export const getAllPharmacies = async () => {
  const data = await request("/pharmacies");
  return (data.data || []).map(normalizePharmacy);
};

export const getPharmacyMedicines = async (pharmacyId) => {
  const data = await request(`/search/pharmacy/${encodeURIComponent(pharmacyId)}/medicines?limit=1000`);
  return (data.data || []).map((item) => ({
    ...item,
    id: idOf(item.inventoryId),
    medicineId: idOf(item.medicine),
    name: item.medicine?.name || "Unknown Medicine",
    available: Boolean(item.availability && item.quantity > 0),
  }));
};
