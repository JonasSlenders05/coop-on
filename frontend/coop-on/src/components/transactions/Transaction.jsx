// src/components/transaction/Transaction.jsx
export default function Transaction({ user, amount, place }) {
  // 👈2
  return (
    <div className="bg-amber-800 text-amber-100 border rounded-lg text-center">
      {" "}
      {/* 👈 1*/}
      {user.name} gaf €{amount} uit bij {place.name}
    </div>
  );
}
