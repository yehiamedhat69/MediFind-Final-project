# MediFind — Database Task

This folder contains the initial MongoDB/Mongoose database implementation for MediFind: Medicine Availability & Reservation Platform.

## Main collections

- `users` — customer, pharmacy and admin accounts.
- `pharmacies` — pharmacy profile and owner reference.
- `medicines` — global medicine information shared by pharmacies.
- `inventories` — pharmacy-specific medicine quantity, price and availability.
- `reservations` — customer reservations and their status.
- `notifications` — user notifications related to reservations/events.

## Important design decision

`Medicine` is not the same as `Inventory`.

- Medicine answers: **What is this medicine?**
- Inventory answers: **What does Pharmacy X currently have?**

The compound unique index on `inventories` prevents duplicate records for the same pharmacy + medicine pair.

## Relationships

- User 1:N Reservation
- User 1:N Notification
- User 1:1 Pharmacy (one pharmacy profile per pharmacy account)
- Pharmacy 1:N Inventory
- Medicine 1:N Inventory
- Pharmacy 1:N Reservation
- Medicine 1:N Reservation
- Reservation 1:N Notification
- Pharmacy M:N Medicine through Inventory

## Notes

MongoDB does not use SQL foreign-key constraints. References are implemented with Mongoose `ObjectId` fields and `ref`, while uniqueness, validation and indexes enforce database-level/application-level integrity.

The backend should hash passwords before storing real users. The seed file uses placeholder passwords only for local testing and must not be used as production credentials.
