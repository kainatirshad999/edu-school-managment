import { Outlet } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <input
            placeholder="Search students, classes..."
            className="w-96 max-w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          <div className="flex items-center gap-4">
            <Bell className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium">{user?.name}</span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
