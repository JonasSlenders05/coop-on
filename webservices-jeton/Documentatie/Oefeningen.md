# H2 oefeningen

## Stap 1: ontwerp ERD
```
[User]
*id
firstname
lastname
email
phonenumber
passwordHash
roles

[Vendor]
*id
boothName
+userId

[Organiser]
*id
+userId

[Event]
*id
name
location
startDate
endDate
+organiserId

[Wallet]
*id
value
state
createdAt
+customerId
+eventId

[Transaction]
*id
date
amount
+walletId
+vendorId

User 1--1 Vendor
User 1--1 Organiser
Organiser 1--* Event
Event 1--* Wallet
User 1--* Wallet
Wallet 1--* Transaction
Vendor 1--* Transaction

```

**Resultaat:**

<img src="image.png" alt="alt" width="500">

## Stap 2: endpoints definiëren

# 🧩 API Endpoints — Coop On Project

## Users
| Method | Endpoint | Description | Werkt |
|--------|-----------|--------------|-----|
| GET | /api/users | Get all users | ✅ |
| GET | /api/users/:id | Get one user by ID | ✅ | 
| PUT | /api/users/:id | Update a user | ✅ |
| POST | /api/users | Add user | ✅ |
| DELETE | /api/users/:id | Delete a user | ✅ |

### Navragen
| Method | Endpoint | Description | Werkt |
|--------|-----------|--------------|-----|
| GET | /api/users/:id/vendors | Get vendor profile for this user (if role = vendor) | ❌ |
| GET | /api/users/:id/organiser | Get organiser profile for this user (if role = organiser) | ❌ |
| GET | /api/users/:id/wallets | Get all wallets belonging to this user (if role = customer) | ❌ |

---
## Session
| Method | Endpoint | Description | Werkt |
|--------|-----------|--------------|-----|
| POST | /api/sessions/ Login as user |  ✅ |
---

## Events
| Method | Endpoint | Description | Werkt |
|--------|-----------|--------------|-----|
| GET | /api/events | Get all events | ✅ |
| GET | /api/events/:id | Get one event by ID | ✅ |
| POST | /api/events | Create a new event (requires organiserId) | ✅ |
| PUT | /api/events/:id | Update an event | ✅ |
| DELETE | /api/events/:id | Delete an event | ✅ | 
| GET | /api/events/:id/wallets | Get all wallets for this event | ❓ | (moet value verborgen zijn)
| GET | /api/events/:id/organiser | Get organiser for this event | ❓ |

---

## Wallets
| Method | Endpoint | Description | Werkt |
|--------|-----------|--------------|-----|
| GET | /api/wallets | Get all wallets | ✅ |
| GET | /api/wallets/:id | Get one wallet by ID | ✅ |
| POST | /api/wallets | Create a new wallet | ✅ |
| PUT | /api/wallets/:id | Update wallet (value, state...) | ✅ |
| DELETE | /api/wallets/:id | Delete a wallet | ✅ |
| GET | /api/wallets/:id/transactions | Get all transactions for this wallet | ✅ |
| POST | /api/wallets/:id/transactions | Create a transaction | ❓ |

---

## Transactions
| Method | Endpoint | Description  Werkt |
|--------|-----------|--------------|-----|
| GET | /api/transactions | Get all transactions | ✅ |
| GET | /api/transactions/:id | Get one transaction by ID | ✅ |
| POST | /api/transactions | Create a transaction | ✅ |
| PUT | /api/transactions/:id | Update a transaction | ❓ |
| DELETE | /api/transactions/:id | Delete a transaction | ✅ |

---

## Vendors
| Method | Endpoint | Description | Werkt |
|--------|-----------|--------------|-----|
| GET | /api/vendors | Get all vendors | ✅ |
| GET | /api/vendors/:id | Get one vendor by userID | ✅ |
| PUT | /api/vendors/:id | Update vendor info | ✅ |
| DELETE | /api/vendors/:id | Delete a vendor | ❓ |
| GET | /api/vendors/:id/transactions | Get all transactions for this vendor | ✅ |

---

## Organisers
| Method | Endpoint | Description | Werkt |
|--------|-----------|--------------|-----|
| GET | /api/organisers | Get all organisers | ✅ |
| GET | /api/organisers/:id | Get one organiser by ID | ✅ |
| PUT | /api/organisers/:id | Update organiser | ✅ |
| DELETE | /api/organisers/:id | Delete organiser | ❓ |
| GET | /api/organisers/:id/events | Get all events created by this organiser | ✅ |

---

# Extra functional endpoints (optioneel)
| Method | Endpoint | Description |
|--------|-----------|--------------|
| POST | /api/wallets/:id/topup | Add tokens to a wallet |
| POST | /api/wallets/:id/spend | Spend tokens |
| GET | /api/events/:id/summary | Get event summary (wallets, value, etc.) |
| GET | /api/vendors/:id/summary | Get vendor earnings summary |







## Vragen:

-   Moeten best de id's megegeven worden of het volledige object:
``` JSON
{
    "id": 1,
    "value": 50,
    "state": true,
    "createdAt": "2025-11-16T09:28:16.000Z",
    "userId": 1,
    "eventId": 1,
    "user": {
        "id": 1,
        "firstname": "Tom",
        "lastname": "Devries",
        "email": "tomdevries@coop-on.be"
    }
},

// of
{
    "id": 1,
    "value": 50,
    "state": true,
    "createdAt": "2025-11-16T09:28:16.000Z",
    "userId": 1,
    "eventId": 1,
    "userId": 1
}
```

-   Wallet value meegeven bij GET wallets calls?

-   `roles` exposen bij GET users?

-   Wallet `state` veranderen naar `active`

-   Transaction maken vanuit `wallet` of `transaction` 

-   Is PUT (update) `transaction` nodig? 