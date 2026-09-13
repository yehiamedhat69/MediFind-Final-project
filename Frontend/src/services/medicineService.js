import { request, idOf } from "./api";

const normalizeMedicine = (medicine) => ({
  ...medicine,
  id: idOf(medicine),
  name: medicine?.name || "",
  category: medicine?.category || "",
  description: medicine?.description || "",
});

export const searchMedicines = async (searchTerm) => {
  const term = searchTerm.trim();
  if (!term) return [];
  const data = await request(`/search/medicine?name=${encodeURIComponent(term)}&limit=20`);
  return (data.data || []).map((item) => ({
    id: idOf(item.medicine),
    name: item.medicine?.name || item.name,
    category: item.medicine?.category || "",
    description: item.medicine?.description || "",
    pharmacy: item.pharmacy,
    quantity: item.quantity,
    price: item.price,
    availability: item.availability,
    available: item.availability && item.quantity > 0,
    distance: item.distance,
    inventoryId: item.inventoryId,
  }));
};

export const getMedicineById = async (medicineId) => {
  const data = await request(`/medicines/${encodeURIComponent(medicineId)}`);
  return normalizeMedicine(data.medicine);
};

export const getAllMedicines = async (params = {}) => {
  const query = new URLSearchParams({ limit: "1000", ...params });
  const data = await request(`/medicines?${query}`);
  return (data.data || []).map(normalizeMedicine);
};

export const addMedicine = async (medicine) => {
  const data = await request("/medicines", {
    method: "POST",
    body: JSON.stringify(medicine),
  });
  return normalizeMedicine(data.medicine);
};

export const updateMedicine = async (id, medicine) => {
  const data = await request(`/medicines/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(medicine),
  });
  return normalizeMedicine(data.medicine);
};

export const deleteMedicine = async (id) => {
  return request(`/medicines/${encodeURIComponent(id)}`, { method: "DELETE" });
};

export const getPharmaciesByMedicineId = async (medicineId) => {
  const data = await request(`/search/medicine?name=${encodeURIComponent(await medicineNameForSearch(medicineId))}&limit=100`);
  return (data.data || [])
    .filter((item) => String(idOf(item.medicine)) === String(medicineId))
    .map((item) => ({
      id: idOf(item.pharmacy),
      name: item.pharmacy?.name,
      location: item.pharmacy?.address,
      address: item.pharmacy?.address,
      phone: item.pharmacy?.phone,
      price: item.price,
      quantity: item.quantity,
      available: Boolean(item.availability && item.quantity > 0),
      inventoryId: item.inventoryId,
    }));
};

const medicineNameForSearch = async (medicineId) => {
  const medicine = await getMedicineById(medicineId);
  return medicine.name;
};
