// src/App.jsx
import Transaction from "./components/transactions/Transaction";
import TRANSACTION_DATA from "./api/mock_data";

function App() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">
        {" "}
        {/* 👈 */}
        Mijn Budget App
      </h1>
      {TRANSACTION_DATA.map((t) => (
        <Transaction {...t} key={t.id} />
      ))}
    </div>
  );
}
