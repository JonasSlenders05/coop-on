# H2 oefeningen

## Stap 1: ontwerp ERD
```
[Event] 
*id
naam 
locatie 
startDatum 
eindDatum 

[Customer] 
*id 
voorNaam 
achterNaam 
email 
telefoon 

[Wallet] 
*id 
waarde 
status 
gemaaktOp
+customerId 
+eventId 

[Transaction] 
*id 
datum 
aantalBonnen 
+walletId 
+vendorId 

[Verkoper] 
*id 
standNaam
voorNaam 
achterNaam 
email 
telefoon  

Event 1--* Wallet Customer 
1--* Wallet 
Wallet 1--* Transaction 
Verkoper 1--* Transaction
```

**Resultaat:**

<img src="image.png" alt="alt" width="500">

## Stap 2: endpoints definiëren
### Event

| Methode | Endpoint | Beschrijving |
|----------|-----------|---------------|
| GET | `/api/events` | Alle events ophalen |
| GET | `/api/events/:id` | Eén event ophalen |
| POST | `/api/events` | Nieuw event aanmaken |
| PUT | `/api/events/:id` | Event bijwerken |
| DELETE | `/api/events/:id` | Event verwijderen |
| GET | `/api/events/:id/customers` | Alle klanten voor een event |
| GET | `/api/events/:id/vendors` | Alle verkopers voor een event |

---

### Customer
| Methode | Endpoint | Beschrijving |
|----------|-----------|---------------|
| GET | `/api/customers` | Alle klanten ophalen |
| GET | `/api/customers/:id` | Eén klant ophalen |
| POST | `/api/customers` | Nieuwe klant aanmaken |
| PUT | `/api/customers/:id` | Klant bijwerken |
| DELETE | `/api/customers/:id` | Klant verwijderen |
| GET | `/api/customers/:id/bons` | Alle bonnetjes van klant |
| GET | `/api/customers/:id/transactions` | Alle transacties van klant |
| POST | `/api/customers/:id/bons` | Bonnetjes aankopen voor klant |

---

### Vendor
| Methode | Endpoint | Beschrijving |
|----------|-----------|---------------|
| GET | `/api/vendors` | Alle verkopers ophalen |
| GET | `/api/vendors/:id` | Eén verkoper ophalen |
| POST | `/api/vendors` | Nieuwe verkoper aanmaken |
| PUT | `/api/vendors/:id` | Verkoper bijwerken |
| DELETE | `/api/vendors/:id` | Verkoper verwijderen |
| GET | `/api/vendors/:id/transactions` | Transacties ontvangen door verkoper |

---

### Bon
| Methode | Endpoint | Beschrijving |
|----------|-----------|---------------|
| GET | `/api/bons` | Alle bonnetjes ophalen |
| GET | `/api/bons/:id` | Eén bonnetje ophalen |
| POST | `/api/bons` | Nieuw bonnetje aanmaken (handmatig of aankoop) |
| PUT | `/api/bons/:id` | Bonstatus wijzigen (bv. 'gebruikt') |
| DELETE | `/api/bons/:id` | Bon verwijderen / ongeldig maken |
| GET | `/api/bons/:id/transactions` | Transacties waarin dit bonnetje is gebruikt |

---

### Transaction
| Methode | Endpoint | Beschrijving |
|----------|-----------|---------------|
| GET | `/api/transactions` | Alle transacties ophalen |
| GET | `/api/transactions/:id` | Eén transactie ophalen |
| POST | `/api/transactions` | Nieuwe transactie aanmaken (betaling uitvoeren) |
| PUT | `/api/transactions/:id` | Transactie bijwerken (bv. status) |
| DELETE | `/api/transactions/:id` | Transactie verwijderen |
| GET | `/api/transactions/:id/bons` | Bonnetjes binnen de transactie ophalen |

---

### TransactionBon
| Methode | Endpoint | Beschrijving |
|----------|-----------|---------------|
| GET | `/api/transaction-bons` | Alle koppelingen ophalen |
| GET | `/api/transaction-bons/:transactionId/:bonId` | Eén specifieke koppeling |
| POST | `/api/transaction-bons` | Nieuwe koppeling toevoegen (bon gebruiken in transactie) |
| DELETE | `/api/transaction-bons/:transactionId/:bonId` | Koppeling verwijderen |



