import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

export default function ParentFees() {
  const [data, setData] = useState(null);

  const load = async () => setData((await api.get("/fees/child-dues")).data.data);
  useEffect(() => { load(); }, []);

  if (!data) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Fees</h1>
      <h3 className="font-semibold text-sm text-gray-500 mb-2">PENDING / UPCOMING</h3>
      <div className="grid gap-3 mb-6">
        {data.dues.map((d) => {
          const balance = d.amountDue - d.concessionAmount - d.amountPaid;
          return (
            <div key={d._id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{d.feeStructure?.title}</div>
                <div className="text-xs text-gray-400 capitalize">{d.feeStructure?.frequency} · {d.status}</div>
              </div>
              <span className="font-semibold">Rs. {balance > 0 ? balance : 0}</span>
            </div>
          );
        })}
        {data.dues.length === 0 && <p className="text-gray-400">No fees due</p>}
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Payment is made from the student's account using the "Pay Now" button. Parents can track the status here.
      </p>

      <h3 className="font-semibold text-sm text-gray-500 mb-2">PAYMENT HISTORY</h3>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left"><tr><th className="px-4 py-3">Receipt #</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Mode</th><th className="px-4 py-3">Date</th></tr></thead>
          <tbody>
            {data.payments.map((p) => (
              <tr key={p._id} className="border-t border-gray-100">
                <td className="px-4 py-3">{p.receiptNumber}</td>
                <td className="px-4 py-3">Rs. {p.totalAmount}</td>
                <td className="px-4 py-3 capitalize">{p.mode}</td>
                <td className="px-4 py-3">{new Date(p.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {data.payments.length === 0 && <tr><td colSpan={4} className="text-center text-gray-400 py-8">No payments found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
