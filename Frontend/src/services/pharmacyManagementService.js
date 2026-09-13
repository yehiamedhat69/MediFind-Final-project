import { request, idOf } from "./api";

export const getMyPharmacy = async () => {
  const data = await request("/pharmacies");
  const pharmacies = data.data || [];
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = idOf(user);
  const pharmacy = pharmacies.find((item) => String(idOf(item.ownerId)) === String(userId));
  if (!pharmacy) throw new Error("No pharmacy is associated with this account.");
  return pharmacy;
};

export const getPharmacyProfile = async (pharmacyId) => {
  const data = await request(`/pharmacies/${encodeURIComponent(pharmacyId)}`);
  return data.pharmacy;
};

export const updatePharmacyProfile = async (pharmacyId, pharmacyData) => {
  const data = await request(`/pharmacies/${encodeURIComponent(pharmacyId)}`, {
    method: "PATCH",
    body: JSON.stringify(pharmacyData),
  });
  return data.pharmacy;
};

export const getPharmacyInventory = async (pharmacyId) => {
  const data = await request(`/inventory/pharmacy/${encodeURIComponent(pharmacyId)}`);
  return (data.inventory || []).map((item) => ({
    ...item,
    id: idOf(item),
    medicineId: idOf(item.medicineId),
    medicineName: item.medicineId?.name || item.medicineName || "Unknown Medicine",
    availability: Boolean(item.availability),
  }));
};

export const getMedicines = async () => {
  const data = await request("/medicines?limit=1000");
  return (data.data || []).map((item) => ({
    ...item,
    id: idOf(item),
  }));
};

export const addInventoryItem = async (inventoryData) => {
  const data = await request("/inventory", {
    method: "POST",
    body: JSON.stringify(inventoryData),
  });
  return data.inventory;
};

export const updateInventoryItem = async (inventoryId, inventoryData) => {
  const data = await request(`/inventory/${encodeURIComponent(inventoryId)}`, {
    method: "PUT",
    body: JSON.stringify(inventoryData),
  });
  return data.inventory;
};

export const removeInventoryItem = async (inventoryId) => {
  return request(`/inventory/${encodeURIComponent(inventoryId)}`, { method: "DELETE" });
};

export const getPharmacyDashboard = async () => {
  const pharmacy = await getMyPharmacy();
  const pharmacyId = idOf(pharmacy);
  const inventory = await getPharmacyInventory(pharmacyId);
  let reservations = [];
  try {
    const data = await request(`/reservations/pharmacy/${encodeURIComponent(pharmacyId)}`);
    reservations = data.reservations || [];
  } catch {}
  const counts = { pending: 0, accepted: 0, rejected: 0, fulfilled: 0, cancelled: 0 };
  reservations.forEach((r) => { if (counts[r.status] !== undefined) counts[r.status]++; });
  return {
    pharmacy,
    inventory: {
      availableMedicines: inventory.filter((i) => i.availability && Number(i.quantity) > 0).length,
      totalStock: inventory.reduce((sum, i) => sum + Number(i.quantity || 0), 0),
      lowStock: inventory.filter((i) => Number(i.quantity) > 0 && Number(i.quantity) <= 5).length,
      items: inventory,
    },
    reservations: {
      pending: counts.pending,
      confirmed: counts.accepted,
      completed: counts.fulfilled,
      cancelled: counts.cancelled + counts.rejected,
      total: reservations.length,
    },
  };
};
