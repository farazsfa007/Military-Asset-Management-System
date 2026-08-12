export default function StatCard({ title, value, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="text-left bg-white rounded-xl shadow-sm border p-5 w-full hover:shadow-md transition"
    >
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
    </button>
  );
}
