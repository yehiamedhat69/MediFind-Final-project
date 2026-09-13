const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const { app } = require("../src/server");
const User = require("../src/models/user");
const Medicine = require("../src/models/medicine");
const Pharmacy = require("../src/models/Pharmacy");
const Inventory = require("../src/models/Inventory");
const Reservation = require("../src/models/Reservation");
const Notification = require("../src/models/Notification");

const register = async (username, email, password = "password123", role = "user") => {
  const res = await request(app).post("/api/auth/register")
    .send({ username, email, password, role });
  expect(res.status).toBe(201);
  return res.body.user;
};

const login = async (email, password = "password123") => {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.token;
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("MediFind API integration", () => {
  test("GET / returns API health message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("MediFind API is running");
  });

  describe("Authentication", () => {
    test("registers a user and defaults to user role", async () => {
      const user = await register("normaluser", "normal@example.com");
      expect(user.username).toBe("normaluser");
      expect(user.role).toBe("user");
    });

    test("rejects missing registration fields", async () => {
      const res = await request(app).post("/api/auth/register")
        .send({ username: "ab" });
      expect(res.status).toBe(400);
    });

    test("rejects duplicate email", async () => {
      await register("duplicate1", "duplicate@example.com");
      const res = await request(app).post("/api/auth/register")
        .send({ username: "duplicate2", email: "duplicate@example.com", password: "password123" });
      expect(res.status).toBe(409);
    });

    test("logs in with valid credentials", async () => {
      await register("loginuser", "login@example.com");
      const res = await request(app).post("/api/auth/login")
        .send({ email: "login@example.com", password: "password123" });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
    });

    test("rejects invalid credentials", async () => {
      await register("badlogin", "badlogin@example.com");
      const res = await request(app).post("/api/auth/login")
        .send({ email: "badlogin@example.com", password: "wrongpass" });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    test("rejects protected endpoint without token", async () => {
      const res = await request(app).get("/api/protected");
      expect(res.status).toBe(401);
    });

    test("accepts protected endpoint with valid token", async () => {
      await register("protecteduser", "protected@example.com");
      const token = await login("protected@example.com");
      const res = await request(app).get("/api/protected")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBeUndefined();
      expect(res.body.user.role).toBe("user");
    });
  });

  describe("User management", () => {
    test("gets and updates the current user profile", async () => {
      await register("profileuser", "profile@example.com");
      const token = await login("profile@example.com");

      let res = await request(app).get("/api/users/me")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("profile@example.com");
      expect(res.body.user.password).toBeUndefined();

      res = await request(app).patch("/api/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: "profileupdated" });
      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe("profileupdated");
    });

    test("blocks protected user fields", async () => {
      await register("protectedfields", "protectedfields@example.com");
      const token = await login("protectedfields@example.com");
      const res = await request(app).patch("/api/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ role: "admin" });
      expect(res.status).toBe(403);
    });
  });

  describe("Medicine management and search", () => {
    let token;
    beforeEach(async () => {
      await register("medicineuser", `medicine${Date.now()}@example.com`);
      token = await login(await User.findOne({ username: "medicineuser" }).then(u => u.email));
    });

    test("creates, retrieves, updates and deletes a medicine", async () => {
      let res = await request(app).post("/api/medicines")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Panadol", genericName: "Paracetamol", category: "Painkiller" });
      expect(res.status).toBe(201);
      const id = res.body.medicine._id;

      res = await request(app).get(`/api/medicines/${id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Panadol");

      res = await request(app).get("/api/medicines?name=pan&limit=5")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);

      res = await request(app).patch(`/api/medicines/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ category: "Analgesic" });
      expect(res.status).toBe(200);

      res = await request(app).delete(`/api/medicines/${id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    test("rejects invalid medicine pagination and unauthenticated access", async () => {
      let res = await request(app).get("/api/medicines");
      expect(res.status).toBe(401);

      res = await request(app).get("/api/medicines?page=0")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    test("searches medicine availability without authentication", async () => {
      const medicine = await Medicine.create({
        name: "Amoxicillin",
        genericName: "Amoxicillin",
        category: "Antibiotic",
      });
      const pharmacyUser = await register("searchpharmacy", "searchpharmacy@example.com", "password123", "pharmacy");
      const pharmacy = await Pharmacy.create({
        ownerId: pharmacyUser.id,
        name: "Test Pharmacy",
        address: "Cairo",
        location: { type: "Point", coordinates: [31.2357, 30.0444] }
      });
      await Inventory.create({
        pharmacyId: pharmacy._id, medicineId: medicine._id,
        quantity: 10, price: 50, availability: true
      });

      const res = await request(app).get("/api/search/medicine?name=amox");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].medicine.name).toBe("Amoxicillin");
    });
  });

  describe("Pharmacy and inventory", () => {
    let pharmacyToken, userToken, pharmacyId, medicineId;

    beforeEach(async () => {
      const pharmacyUser = await register("pharmacyowner", `pharm${Date.now()}@example.com`, "password123", "pharmacy");
      pharmacyToken = await login(pharmacyUser.email);

      const normalUser = await register("normalcustomer", `cust${Date.now()}@example.com`);
      userToken = await login(normalUser.email);

      const medicine = await Medicine.create({ name: "Vitamin C", category: "Vitamins" });
      medicineId = medicine._id.toString();

      const res = await request(app).post("/api/pharmacies")
        .set("Authorization", `Bearer ${pharmacyToken}`)
        .send({
          name: "Health Pharmacy",
          address: "Giza",
          phone: "01000000000",
          location: { type: "Point", coordinates: [31.1, 30.0] }
        });
      expect(res.status).toBe(201);
      pharmacyId = res.body.pharmacy._id;
    });

    test("blocks normal user from creating a pharmacy", async () => {
      const res = await request(app).post("/api/pharmacies")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Nope", address: "Giza" });
      expect(res.status).toBe(403);
    });

    test("creates and reads pharmacy inventory", async () => {
      let res = await request(app).post("/api/inventory")
        .set("Authorization", `Bearer ${pharmacyToken}`)
        .send({ medicineId, quantity: 20, price: 25 });
      expect(res.status).toBe(201);

      res = await request(app).get(`/api/inventory/pharmacy/${pharmacyId}`)
        .set("Authorization", `Bearer ${pharmacyToken}`);
      expect(res.status).toBe(200);
      expect(res.body.inventory).toHaveLength(1);
      expect(res.body.inventory[0].quantity).toBe(20);
    });

    test("rejects negative inventory quantity", async () => {
      const res = await request(app).post("/api/inventory")
        .set("Authorization", `Bearer ${pharmacyToken}`)
        .send({ medicineId, quantity: -1, price: 25 });
      expect(res.status).toBe(400);
    });

    test("prevents normal user from managing inventory", async () => {
      const res = await request(app).post("/api/inventory")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ medicineId, quantity: 1, price: 25 });
      expect(res.status).toBe(403);
    });
  });

  describe("Reservations and notifications", () => {
    let customerToken, pharmacyToken, customerId, pharmacyId, medicineId, inventoryId;

    beforeEach(async () => {
      const customer = await register("reservationcustomer", `reservation${Date.now()}@example.com`, "password123", "customer");
      customerToken = await login(customer.email);
      customerId = customer.id;

      const pharmacyUser = await register("reservationpharmacy", `reservationpharmacy${Date.now()}@example.com`, "password123", "pharmacy");
      pharmacyToken = await login(pharmacyUser.email);

      const medicine = await Medicine.create({ name: "Ibuprofen", genericName: "Ibuprofen", category: "Painkiller" });
      medicineId = medicine._id.toString();

      const pharmacy = await Pharmacy.create({
        ownerId: pharmacyUser.id,
        name: "Reservation Pharmacy",
        address: "Giza",
        location: { type: "Point", coordinates: [31.2, 30.05] }
      });
      pharmacyId = pharmacy._id.toString();

      const inventory = await Inventory.create({
        pharmacyId, medicineId, quantity: 5, price: 30, availability: true
      });
      inventoryId = inventory._id.toString();
    });

    test("creates reservation and notification and reduces inventory", async () => {
      const res = await request(app).post("/api/reservations")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ pharmacyId, medicineId, quantity: 2 });

      expect(res.status).toBe(201);
      expect(res.body.reservation.status).toBe("pending");

      const inventory = await Inventory.findById(inventoryId);
      expect(inventory.quantity).toBe(3);

      const notifications = await Notification.find({ userId: customerId });
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe("reservation_created");
    });

    test("rejects reservation when requested quantity exceeds stock", async () => {
      const res = await request(app).post("/api/reservations")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ pharmacyId, medicineId, quantity: 99 });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/available/i);
    });

    test("rejects unauthorized reservation creation", async () => {
      const res = await request(app).post("/api/reservations")
        .set("Authorization", `Bearer ${pharmacyToken}`)
        .send({ pharmacyId, medicineId, quantity: 1 });
      expect(res.status).toBe(403);
    });

    test("updates reservation status and creates notifications", async () => {
      const created = await request(app).post("/api/reservations")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ pharmacyId, medicineId, quantity: 2 });
      const reservationId = created.body.reservation._id;

      let res = await request(app).patch(`/api/reservations/${reservationId}/status`)
        .set("Authorization", `Bearer ${pharmacyToken}`)
        .send({ status: "rejected" });

      expect(res.status).toBe(200);

      const inventory = await Inventory.findById(inventoryId);
      expect(inventory.quantity).toBe(5);

      const notifications = await Notification.find({ userId: customerId });
      expect(notifications).toHaveLength(3);
      expect(notifications.map(n => n.type)).toEqual(
        expect.arrayContaining(["reservation_created", "medicine_available", "reservation_rejected"])
      );
    });

    test("gets own notifications and marks them as read", async () => {
      const notification = await Notification.create({
        userId: customerId,
        type: "test",
        message: "Test notification"
      });

      let res = await request(app).get("/api/notifications")
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);

      res = await request(app).patch(`/api/notifications/${notification._id}/read`)
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.notification.isRead).toBe(true);
    });

    test("does not expose another user's notification", async () => {
      const other = await register("othernotification", "othernotification@example.com");
      const notification = await Notification.create({
        userId: other.id,
        type: "private",
        message: "Private"
      });

      const res = await request(app).patch(`/api/notifications/${notification._id}/read`)
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(404);
    });
  });
});
