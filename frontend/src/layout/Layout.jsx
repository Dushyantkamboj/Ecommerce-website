import { Outlet } from "react-router-dom";
import Navbar from "../component/Navbar";
import Sidebar from "../component/Sidebar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <Navbar />

      {/* Sidebar and Main Content */}
      <div className="flex gap-5 p-5 min-w-20 border-r">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Child Components */}
        <main className="min-w-0 flex-1 rounded-xl bg-white p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

