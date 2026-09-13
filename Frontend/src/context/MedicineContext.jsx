import { createContext, useContext, useEffect, useState } from "react";
import {
  getAllMedicines,
  addMedicine as apiAddMedicine,
  updateMedicine as apiUpdateMedicine,
  deleteMedicine,
} from "../services/medicineService";

const MedicineContext = createContext(null);

export function MedicineProvider({ children }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshMedicines = async () => {
    const data = await getAllMedicines();
    setMedicines(data);
    return data;
  };

  useEffect(() => {
    refreshMedicines().catch(() => setMedicines([])).finally(() => setLoading(false));
  }, []);

  const addMedicine = async (medicine) => {
    const created = await apiAddMedicine(medicine);
    setMedicines((current) => [...current, created]);
    return created;
  };

  const updateMedicine = async (id, updatedMedicine) => {
    const updated = await apiUpdateMedicine(id, updatedMedicine);
    setMedicines((current) => current.map((m) => String(m.id) === String(id) ? updated : m));
    return updated;
  };

  const removeMedicine = async (id) => {
    await deleteMedicine(id);
    setMedicines((current) => current.filter((m) => String(m.id) !== String(id)));
  };

  return (
    <MedicineContext.Provider value={{ medicines, loading, refreshMedicines, addMedicine, updateMedicine, removeMedicine }}>
      {children}
    </MedicineContext.Provider>
  );
}

export function useMedicine() {
  const context = useContext(MedicineContext);
  if (!context) throw new Error("useMedicine must be used inside MedicineProvider");
  return context;
}
