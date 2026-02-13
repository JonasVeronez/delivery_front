import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
