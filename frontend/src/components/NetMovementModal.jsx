export default function NetMovementModal({ metrics, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Net Movement Breakdown</h2>
          <button onClick={onClose} className="text-slate-500 text-xl">
            ×
          </button>
        </div>

        <div className="space-y-3">
          <Row label="Purchases (+)" value={metrics.purchases} />
          <Row label="Transfers In (+)" value={metrics.transfersIn} />
          <Row label="Transfers Out (-)" value={metrics.transfersOut} />
          <hr />
          <Row label="Net Movement" value={metrics.netMovement} bold />
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-slate-900 text-white py-2 rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-lg" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
