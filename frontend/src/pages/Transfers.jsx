import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Transfers() {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [types, setTypes] = useState([]);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    sourceBaseId: user.baseId || "",
    destinationBaseId: "",
    equipmentTypeId: "",
    quantity: ""
  });

  async function load() {
    const [basesRes, typesRes, transfersRes] = await Promise.all([
      api.get("/master/bases"),
      api.get("/master/equipment-types"),
      api.get("/transfers")
    ]);

    setBases(basesRes.data);
    setTypes(typesRes.data);
    setItems(transfersRes.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/transfers", form);
      setMessage("Transfer completed successfully.");
      setForm({ ...form, destinationBaseId: "", equipmentTypeId: "", quantity: "" });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Transfer failed.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Transfers</h1>
      <p className="text-slate-500 mb-6">
        Move stock between bases. The operation is atomic.
      </p>

      <form
        onSubmit={submit}
        className="bg-white border rounded-xl p-5 grid md:grid-cols-4 gap-3 mb-6"
      >
        {user.role === "ADMIN" ? (
          <select
            required
            className="border rounded-md px-3 py-2"
            value={form.sourceBaseId}
            onChange={(e) => setForm({ ...form, sourceBaseId: e.target.value })}
          >
            <option value="">Source base</option>
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
          value={form.destinationBaseId}
          onChange={(e) =>
            setForm({ ...form, destinationBaseId: e.target.value })
          }
        >
          <option value="">Destination base</option>
          {bases
            .filter((base) => String(base.id) !== String(form.sourceBaseId))
            .map((base) => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
        </select>

        <select
          required
          className="border rounded-md px-3 py-2"
          value={form.equipmentTypeId}
          onChange={(e) =>
            setForm({ ...form, equipmentTypeId: e.target.value })
          }
        >
          <option value="">Equipment</option>
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

        <button className="md:col-span-4 bg-blue-600 text-white rounded-md py-2">
          Complete Transfer
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
              <th className="text-left p-3">From</th>
              <th className="text-left p-3">To</th>
              <th className="text-left p-3">Equipment</th>
              <th className="text-left p-3">Quantity</th>
              <th className="text-left p-3">By</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">
                  {new Date(item.transferDate).toLocaleDateString()}
                </td>
                <td className="p-3">{item.sourceBase.name}</td>
                <td className="p-3">{item.destinationBase.name}</td>
                <td className="p-3">{item.equipmentType.name}</td>
                <td className="p-3 font-semibold">{item.quantity}</td>
                <td className="p-3">{item.initiatedBy.username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
