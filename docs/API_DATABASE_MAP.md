# Database/API Map

| Endpoint | Main collection(s) |
|---|---|
| POST `/api/auth/register` | users |
| POST `/api/auth/login` | users |
| GET `/api/medicines` | medicines + inventory |
| GET `/api/medicines/:id` | medicines + inventory |
| GET `/api/pharmacies` | pharmacies |
| GET `/api/pharmacies/:id/inventory` | inventories + medicines |
| POST `/api/inventory` | inventories |
| PATCH `/api/inventory/:id` | inventories |
| POST `/api/reservations` | reservations + inventories |
| GET `/api/reservations` | reservations |
| PATCH `/api/reservations/:id/status` | reservations + notifications |
| GET `/api/notifications` | notifications |
