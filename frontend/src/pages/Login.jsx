import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({
    username: "admin_user",
    password: "AdminPass123!"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl p-7 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-slate-900">
          Military Asset Management
        </h1>
        <p className="text-slate-500 mt-1 mb-6">Secure system login</p>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          className="w-full border rounded-md px-3 py-2 mb-4"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          className="w-full border rounded-md px-3 py-2 mb-5"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-md"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="mt-5 text-xs text-slate-500 space-y-1">
          <p>Admin: admin_user / AdminPass123!</p>
          <p>Commander: commander_alpha / CommandPass123!</p>
          <p>Logistics: logistics_officer / LogisticsPass123!</p>
        </div>
      </form>
    </div>
  );
}
