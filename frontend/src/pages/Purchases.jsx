import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Purchases() {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [types, setTypes] = useState([]);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    baseId: user.baseId || "",
    equipmentTypeId: "",
    quantity: ""
  });

  async function load() {
    const [basesRes, typesRes, purchasesRes] = await Promise.all([
      api.get("/master/bases"),
      api.get("/master/equipment-types"),
      api.get("/purchases")
    ]);

    setBases(basesRes.data);
    setTypes(typesRes.data);
    setItems(purchasesRes.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/purchases", form);
      setMessage("Purchase added successfully.");
      setForm({ ...form, equipmentTypeId: "", quantity: "" });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add purchase.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Purchases</h1>
      <p className="text-slate-500 mb-6">Record incoming stock.</p>

      <form
        onSubmit={submit}
        className="bg-white border rounded-xl p-5 grid md:grid-cols-4 gap-3 mb-6"
      >
        {user.role === "ADMIN" ? (
          <select
            className="border rounded-md px-3 py-2"
            value={form.baseId}
            onChange={(e) => setForm({ ...form, baseId: e.target.value })}
          >
            <option value="">Select base</option>
            {bases.map((base) => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            className="border rounded-md px-3 py-2 bg-slate-100"
            value={user.baseName || "Assigned Base"}
            disabled
          />
        )}

        <select
          required
          className="border rounded-md px-3 py-2"
          value={form.equipmentTypeId}
          onChange={(e) =>
            setForm({ ...form, equipmentTypeId: e.target.value })
          }
        >
          <option value="">Select equipment</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>

        <input
          required
          min="1"
          type="number"
          placeholder="Quantity"
          className="border rounded-md px-3 py-2"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />

        <button className="bg-blue-600 text-white rounded-md px-4 py-2">
          Add Purchase
        </button>
      </form>

      {message && (
        <div className="bg-white border rounded-md p-3 mb-4">{message}</div>
      )}

      <div className="bg-white border rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Base</th>
              <th className="text-left p-3">Equipment</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Quantity</th>
              <th className="text-left p-3">Created By</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">
                  {new Date(item.purchaseDate).toLocaleDateString()}
                </td>
                <td className="p-3">{item.base.name}</td>
                <td className="p-3">{item.equipmentType.name}</td>
                <td className="p-3">{item.equipmentType.category}</td>
                <td className="p-3 font-semibold">{item.quantity}</td>
                <td className="p-3">{item.createdBy.username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
