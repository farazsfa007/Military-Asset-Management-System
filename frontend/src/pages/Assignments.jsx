import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Assignments() {
  const { user } = useAuth();
  const [types, setTypes] = useState([]);
  const [data, setData] = useState({ assignments: [], expenditures: [] });
  const [message, setMessage] = useState("");
  const [assignment, setAssignment] = useState({
    baseId: user.baseId || "",
    equipmentTypeId: "",
    quantity: "",
    assignedTo: ""
  });
  const [expenditure, setExpenditure] = useState({
    baseId: user.baseId || "",
    equipmentTypeId: "",
    quantity: "",
    reason: ""
  });

  async function load() {
    const [typesRes, dataRes] = await Promise.all([
      api.get("/master/equipment-types"),
      api.get("/assignments")
    ]);

    setTypes(typesRes.data);
    setData(dataRes.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function submitAssignment(e) {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/assignments", assignment);
      setMessage("Assignment created.");
      setAssignment({
        ...assignment,
        equipmentTypeId: "",
        quantity: "",
        assignedTo: ""
      });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Assignment failed.");
    }
  }

  async function submitExpenditure(e) {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/assignments/expenditure", expenditure);
      setMessage("Expenditure recorded.");
      setExpenditure({
        ...expenditure,
        equipmentTypeId: "",
        quantity: "",
        reason: ""
      });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Expenditure failed.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Assignments & Expenditures</h1>
      <p className="text-slate-500 mb-6">
        Allocate stock to personnel/units and record consumed stock.
      </p>

      {message && (
        <div className="bg-white border rounded-md p-3 mb-4">{message}</div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <form
          onSubmit={submitAssignment}
          className="bg-white border rounded-xl p-5 space-y-3"
        >
          <h2 className="font-semibold">New Assignment</h2>

          <select
            required
            className="w-full border rounded-md px-3 py-2"
            value={assignment.equipmentTypeId}
            onChange={(e) =>
              setAssignment({ ...assignment, equipmentTypeId: e.target.value })
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
            className="w-full border rounded-md px-3 py-2"
            value={assignment.quantity}
            onChange={(e) =>
              setAssignment({ ...assignment, quantity: e.target.value })
            }
          />

          <input
            required
            placeholder="Assigned to"
            className="w-full border rounded-md px-3 py-2"
            value={assignment.assignedTo}
            onChange={(e) =>
              setAssignment({ ...assignment, assignedTo: e.target.value })
            }
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded-md">
            Create Assignment
          </button>
        </form>

        <form
          onSubmit={submitExpenditure}
          className="bg-white border rounded-xl p-5 space-y-3"
        >
          <h2 className="font-semibold">Record Expenditure</h2>

          <select
            required
            className="w-full border rounded-md px-3 py-2"
            value={expenditure.equipmentTypeId}
            onChange={(e) =>
              setExpenditure({
                ...expenditure,
                equipmentTypeId: e.target.value
              })
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
            className="w-full border rounded-md px-3 py-2"
            value={expenditure.quantity}
            onChange={(e) =>
              setExpenditure({ ...expenditure, quantity: e.target.value })
            }
          />

          <input
            required
            placeholder="Reason"
            className="w-full border rounded-md px-3 py-2"
            value={expenditure.reason}
            onChange={(e) =>
              setExpenditure({ ...expenditure, reason: e.target.value })
            }
          />

          <button className="w-full bg-slate-900 text-white py-2 rounded-md">
            Record Expenditure
          </button>
        </form>
      </div>

      <div className="bg-white border rounded-xl overflow-auto">
        <h2 className="font-semibold p-4 border-b">Assignment History</h2>

        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Equipment</th>
              <th className="text-left p-3">Quantity</th>
              <th className="text-left p-3">Assigned To</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.assignments.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">
                  {new Date(item.assignedDate).toLocaleDateString()}
                </td>
                <td className="p-3">{item.equipmentType.name}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">{item.assignedTo}</td>
                <td className="p-3">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="font-semibold p-4 border-y mt-4">Expenditure History</h2>

        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Equipment</th>
              <th className="text-left p-3">Quantity</th>
              <th className="text-left p-3">Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.expenditures.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">
                  {new Date(item.expendedDate).toLocaleDateString()}
                </td>
                <td className="p-3">{item.equipmentType.name}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">{item.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
