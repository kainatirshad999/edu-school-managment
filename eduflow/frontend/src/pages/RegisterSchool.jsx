import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterSchool() {
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/school/register/start", form);
      toast.success("OTP sent (check your email or the server console)");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/school/register/verify", { email: form.email, code: otp });
      localStorage.setItem("eduflow_token", data.token);
      localStorage.setItem("eduflow_user", JSON.stringify(data.user));
      toast.success("School verified! Welcome to EduFlow.");
      navigate("/admin");
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-1">Register your school</h2>
        <p className="text-gray-500 mb-6">Step {step} of 2</p>

        {step === 1 ? (
          <form onSubmit={startRegistration} className="space-y-4">
            <Input label="School Name" name="name" value={form.name} onChange={handleChange} required />
            <Input label="School Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <Input label="Address" name="address" value={form.address} onChange={handleChange} />
            <button
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-lg disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <Input label="Enter OTP" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            <button
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-lg disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered? <Link to="/login" className="text-brand-600 font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input {...props} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-400 outline-none" />
    </div>
  );
}
