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
publicRole
privateRole

[Vendor]
*id
boothName
+userId

[Organiser]
*id
organisation
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
active
createdAt
+userId
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

## Users
| Method | Endpoint | Description | ADMIN | USER | CUSTOMER | ORGANISER | VENDOR | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| GET | `/api/users` | Get all users | ✔️ | | | | | ✅ |
| GET | `/api/users/:id` | Get one user by ID (supports `me`) | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✅ |
| PUT | `/api/users/:id` | Update a user (supports `me`) | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✅ |
| POST | `/api/users` | Register user (public) | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✅ |
| DELETE | `/api/users/:id` | Delete a user (supports `me`) | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✅ |
| GET | `/api/users/:id/wallets` | Get all wallets from user (supports `me`) | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✅ |


---

## Session
| Method | Endpoint | Description | ADMIN | USER | CUSTOMER | ORGANISER | VENDOR | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| POST | `/api/sessions` | Login as user | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✅ |

---

## EventController
| Method | Endpoint | Description | ADMIN | USER | CUSTOMER | ORGANISER | VENDOR | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| GET | `/api/events` | Get all events | ✔️ | | | | | ✅ |
| GET | `/api/events/:id` | Get one event by ID | ✔️ | ✔️ | | | | ✅ |
| POST | `/api/events` | Create a new event | ✔️ | | | ✔️ | | ✅ |
| PUT | `/api/events/:id` | Update an event | ✔️ | | | ✔️ | | ✅ |
| DELETE | `/api/events/:id` | Delete an event | ✔️ | | | ✔️ | | ✅ |
| GET | `/api/events/:id/wallets` | Get all wallets for this event | ✔️ | | | ✔️ | | ✅ |
| GET | `/api/events/:id/transactions` | Get transactions for this event | ✔️ | | | ✔️ | | ✅ |


---

## OrganiserController
| Method | Endpoint | Description | ADMIN | USER | CUSTOMER | ORGANISER | VENDOR | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| GET | `/api/organisers` | Get all organisers | ✔️ | | | | | ✅ |
| GET | `/api/organisers/:id` | Get one organiser by ID (supports `me`) | ✔️ | | | ✔️ | | ✅ |
| PUT | `/api/organisers/:id` | Update organiser (supports `me`) | ✔️ | | | ✔️ | | ✅ |
| GET | `/api/organisers/:id/events`| Get all events of this organiser (supports `me`) | ✔️ | | | ✔️ | | ✅ |

---

## WalletController
| Method | Endpoint | Description | ADMIN | USER | CUSTOMER | ORGANISER | VENDOR | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| GET | `/api/wallets` | Get all wallets | ✔️ | | | | | ✅ |
| GET | `/api/wallets/:id` | Get one wallet by ID | ✔️ | ✔️ | | | | ✅ |
| POST | `/api/wallets` | Create a new wallet | ✔️ | ✔️ | | | | ✅ |
| PUT | `/api/wallets/:id` | Update wallet | ✔️ | ✔️ | | | | ✅ |
| DELETE | `/api/wallets/:id` | Delete a wallet | ✔️ | ✔️ | | | | ✅ |
| GET | `/api/wallets/:id/transactions`| Get transactions for this wallet | ✔️ | ✔️ | | | | ✅ |
| POST | `/api/wallets/:id/purchase-tokens` | Purchase tokens (checkout) | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✅ |


---

## TransactionController
| Method | Endpoint | Description | ADMIN | USER | CUSTOMER | ORGANISER | VENDOR | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| GET | `/api/transactions` | Get all transactions | ✔️ | | | | | ✅ |
| GET | `/api/transactions/:id` | Get one transaction by ID | ✔️ | ✔️ | | | | ✅ |
| POST | `/api/transactions` | Create a transaction (Payment) | ✔️ | ✔️ | | | | ✅ |
| PUT | `/api/transactions/:id` | Update a transaction | ✔️ | | | | | ✅ |
| DELETE | `/api/transactions/:id` | Delete a transaction | ✔️ | | | | | ✅ |


---

## VendorController
| Method | Endpoint | Description | ADMIN | USER | CUSTOMER | ORGANISER | VENDOR | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| GET | `/api/vendors` | Get all vendors | ✔️ | | | | | ✅ |
| GET | `/api/vendors/:id` | Get one vendor by userID | ✔️ | ✔️ | | | | ✅ |
| PUT | `/api/vendors/:id` | Update vendor info (supports `me`) | ✔️ | | | | ✔️ | ✅ |
| GET | `/api/vendors/:id/transactions`| Get transactions for this vendor (supports `me`) | ✔️ | | | | ✔️ | ✅ |






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
    * neen verborgen houden voor niet-user

-   `roles` exposen bij GET users?
    * ja

-   Wallet `state` veranderen naar `active`
    * ja

-   Transaction maken vanuit `wallet` of `transaction`
    * vanuit wallet

-   Is PUT (update) `transaction` nodig?
    * nee

-   Moeten PUT requests ook een NotFoundException werpen?


```JSON
{
  "id": 4,
  "firstname": "Mario",
  "lastname": "Pizza",
  "email": "mario@pizza.be",
  "phonenumber": "+32484750987",
  "roles": ["vendor"],
  "vendor": {
    "boothName": "Mario's Pizza"
  },
  "organiser": null,
  "wallets": null
}
```
