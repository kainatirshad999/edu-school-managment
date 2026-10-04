import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, BookOpen, Users, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

const roles = [
  { key: "admin", label: "Admin", icon: ShieldCheck },
  { key: "teacher", label: "Teacher", icon: BookOpen },
  { key: "student", label: "Student", icon: Users },
  { key: "parent", label: "Parent", icon: Heart },
];

export default function Login() {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email, password, role });
      navigate(`/${user.role}`);
      toast.success(`Welcome back, ${user.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-brand-500 to-brand-700 text-white p-12">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span className="bg-white/20 rounded-lg p-2">🎓</span> EduFlow
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4">Manage your school with confidence</h1>
          <p className="text-white/80 max-w-md">
            A complete platform for administrators, teachers, students, and parents.
          </p>
          <div className="flex gap-6 mt-8">
            <Stat label="Students" value="2,847" />
            <Stat label="Teachers" value="184" />
            <Stat label="Schools" value="12" />
          </div>
        </div>
        <p className="text-white/60 text-sm">© 2026 EduFlow. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-gray-500 mb-6">Select your role and sign in</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none"
              />
              <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-3">
                {showPass ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>

            <div className="bg-brand-50 text-brand-700 text-sm rounded-lg px-3 py-2">
              Signing in as <b className="capitalize">{role}</b>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>

            <p className="text-center text-sm text-gray-500">
              New school? <Link to="/register-school" className="text-brand-600 font-medium">Register School</Link>
            </p>
          </form>

          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-400 mb-2">SELECT ROLE</p>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const active = role === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    className={`flex items-center gap-2 border rounded-lg px-4 py-3 text-left transition ${
                      active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/10 rounded-lg px-4 py-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-white/70 text-xs">{label}</div>
    </div>
  );
}
