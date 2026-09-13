import { createContext, useContext, useEffect, useState } from "react";
import {
  getMyPharmacy,
  getPharmacyInventory,
  getMedicines,
  addInventoryItem,
  updateInventoryItem,
  removeInventoryItem,
} from "../services/pharmacyManagementService";
import { idOf } from "../services/api";

const PharmacyContext = createContext(null);

export function PharmacyProvider({ children }) {
  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const currentPharmacy = await getMyPharmacy();
    const items = await getPharmacyInventory(idOf(currentPharmacy));
    setPharmacy(currentPharmacy);
    setInventory(items);
    return { pharmacy: currentPharmacy, inventory: items };
  };

  useEffect(() => {
    if (localStorage.getItem("token") && JSON.parse(localStorage.getItem("user") || "null")?.role === "pharmacy") {
      refresh().catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const addMedicine = async (medicine) => {
    const created = await addInventoryItem({
      medicineId: medicine.medicineId,
      quantity: Number(medicine.quantity),
      price: Number(medicine.price),
      availability: Boolean(medicine.availability),
    });
    const normalized = {
      ...created,
      id: idOf(created),
      medicineId: idOf(created.medicineId),
      medicineName: created.medicineId?.name || medicine.medicineName,
    };
    setInventory((current) => [...current, normalized]);
    return normalized;
  };

  const updateMedicine = async (id, data) => {
    const updated = await updateInventoryItem(id, data);
    const normalized = {
      ...updated,
      id: idOf(updated),
      medicineId: idOf(updated.medicineId),
      medicineName: updated.medicineId?.name || inventory.find((i) => String(i.id) === String(id))?.medicineName,
    };
    setInventory((current) => current.map((item) => String(item.id) === String(id) ? normalized : item));
    return normalized;
  };

  const removeMedicine = async (id) => {
    await removeInventoryItem(id);
    setInventory((current) => current.filter((item) => String(item.id) !== String(id)));
  };

  const availableMedicines = inventory.filter((item) => item.availability && Number(item.quantity) > 0).length;
  const totalStock = inventory.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const lowStock = inventory.filter((item) => Number(item.quantity) > 0 && Number(item.quantity) <= 5).length;

  return (
    <PharmacyContext.Provider value={{
      pharmacy, inventory, loading, refresh, getMedicines,
      addMedicine, updateMedicine, removeMedicine,
      availableMedicines, totalStock, lowStock,
    }}>
      {children}
    </PharmacyContext.Provider>
  );
}

export function usePharmacy() {
  const context = useContext(PharmacyContext);
  if (!context) throw new Error("usePharmacy must be used inside PharmacyProvider");
  return context;
}
