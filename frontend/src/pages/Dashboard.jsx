import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import NetMovementModal from "../components/NetMovementModal";

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [bases, setBases] = useState([]);
  const [types, setTypes] = useState([]);
  const [filters, setFilters] = useState({
    baseId: "",
    equipmentTypeId: "",
    startDate: "",
    endDate: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [filters]);

  async function loadMasterData() {
    const [baseRes, typeRes] = await Promise.all([
      api.get("/master/bases"),
      api.get("/master/equipment-types")
    ]);

    setBases(baseRes.data);
    setTypes(typeRes.data);
  }

  async function loadMetrics() {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value)
      );

      const { data } = await api.get("/dashboard", { params });
      setMetrics(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load dashboard");
    }
  }

  const chartData = metrics
    ? [
        { name: "Opening", value: metrics.openingBalance },
        { name: "Net Movement", value: metrics.netMovement },
        { name: "Assigned", value: metrics.assigned },
        { name: "Expended", value: metrics.expended },
        { name: "Closing", value: metrics.closingBalance }
      ]
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-500">
          Inventory visibility for {user.baseName || "all bases"}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-4 mb-6 grid md:grid-cols-4 gap-3">
        {user.role === "ADMIN" && (
          <select
            className="border rounded-md px-3 py-2"
            value={filters.baseId}
            onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}
          >
            <option value="">All Bases</option>
            {bases.map((base) => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
          </select>
        )}

        <select
          className="border rounded-md px-3 py-2"
          value={filters.equipmentTypeId}
          onChange={(e) =>
            setFilters({ ...filters, equipmentTypeId: e.target.value })
          }
        >
          <option value="">All Equipment</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border rounded-md px-3 py-2"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />

        <input
          type="date"
          className="border rounded-md px-3 py-2"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {metrics && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Opening Balance" value={metrics.openingBalance} />
            <StatCard
              title="Net Movement"
              value={metrics.netMovement}
              onClick={() => setShowModal(true)}
            />
            <StatCard title="Assigned" value={metrics.assigned} />
            <StatCard title="Expended" value={metrics.expended} />
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mt-4">
            <div className="lg:col-span-2 bg-white border rounded-xl p-5">
              <h2 className="font-semibold mb-4">Inventory Summary</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-6">
              <p className="text-slate-400">Closing Balance</p>
              <p className="text-5xl font-bold mt-2">{metrics.closingBalance}</p>
              <p className="text-sm text-slate-400 mt-4">
                Opening + Net Movement - Assigned - Expended
              </p>

              <div className="mt-6 space-y-2 text-sm">
                <Link className="block bg-slate-800 p-2 rounded" to="/purchases">
                  Manage Purchases
                </Link>
                <Link className="block bg-slate-800 p-2 rounded" to="/transfers">
                  Manage Transfers
                </Link>
                {(user.role === "ADMIN" || user.role === "BASE_COMMANDER") && (
                  <Link className="block bg-slate-800 p-2 rounded" to="/assignments">
                    Assign / Expend
                  </Link>
                )}
              </div>
            </div>
          </div>

          {showModal && (
            <NetMovementModal
              metrics={metrics}
              onClose={() => setShowModal(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
