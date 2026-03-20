import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import api from "../services/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  async function fetchUser() {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuário", error);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  return (
    <div className="flex h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        {/* 🔥 HEADER */}
        <div className="bg-green-50 shadow px-6 py-4 flex justify-between items-center border-b">

          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Bem-vindo 👋 ,{user ? user.name : "Carregando..."}
            </h2>

          </div>

          <div className="flex items-center gap-4">

            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                {user?.email}
              </p>

              <p className="text-xs text-gray-400">
                {user?.role}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Sair
            </button>

          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 p-8 overflow-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
}