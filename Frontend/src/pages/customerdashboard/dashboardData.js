export const customerName = "Ahmed";

export const stats = [
  { id: "active", value: 3, label: "Active Reservations", tone: "active" },
  { id: "completed", value: 1, label: "Completed", tone: "completed" },
  { id: "cancelled", value: 0, label: "Cancelled", tone: "cancelled" },
];

export const reservations = [
  {
    id: 1,
    name: "Panadol 500mg",
    quantity: "2 Boxes",
    pharmacy: "El Nour Pharmacy",
    price: "30 EGP",
    status: "Pending",
    thumb: { fill: "#e8f4fc", stroke: "#94c4e0", labelFill: "#0077b6", label: "P" },
  },
  {
    id: 2,
    name: "Brufen 400mg",
    quantity: "1 Box",
    pharmacy: "Al Nahda Pharmacy",
    price: "35 EGP",
    status: "Confirmed",
    thumb: { fill: "#fce8e8", stroke: "#e09494", labelFill: "#c1121f", label: "B" },
  },
  {
    id: 3,
    name: "Panadol Extra",
    quantity: "1 Box",
    pharmacy: "Life Care Pharmacy",
    price: "45 EGP",
    status: "Completed",
    thumb: { fill: "#e8f4fc", stroke: "#94c4e0", labelFill: "#023e8a", label: "PE" },
  },
];
