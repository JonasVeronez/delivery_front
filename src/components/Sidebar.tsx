import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [storeOpen, setStoreOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // ===== ACTIVE EXATO =====
  const isExact = (path: string) => location.pathname === path;

  // =========================
  // BUSCAR STATUS
  // =========================
  async function fetchStoreStatus() {
    try {
      const response = await api.get("/store/status");
      setStoreOpen(response.data);
    } catch (error) {
      console.error("Erro ao buscar status", error);
    }
  }

  // =========================
  // ABRIR LOJA
  // =========================
  async function handleOpenStore() {
    try {
      setLoading(true);
      await api.post("/store/open");
      await fetchStoreStatus();
    } catch (error) {
      console.error(error);
      alert("Erro ao abrir loja");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // FECHAR LOJA (COM CONFIRMAÇÃO)
  // =========================
  async function handleCloseStore() {
    const confirmClose = window.confirm(
      "Tem certeza que deseja fechar a loja?"
    );

    if (!confirmClose) return;

    try {
      setLoading(true);
      await api.post("/store/close");
      await fetchStoreStatus();
    } catch (error) {
      console.error(error);
      alert("Erro ao fechar loja");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStoreStatus();
  }, []);

  return (
    <div className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between">
      {/* MENU */}
      <div>
        <h1 className="text-xl font-bold text-green-600 mb-8">
          CA Delivery
        </h1>

        {/* PEDIDOS */}
        <button
          onClick={() => navigate("/home/orders")}
          className={`mb-3 w-full text-left px-3 py-2 rounded-lg transition ${
            isExact("/home/orders")
              ? "bg-green-600 text-white"
              : "hover:bg-green-50 hover:text-green-600"
          }`}
        >
          📦 Pedidos
        </button>

        {/* PRODUTOS */}
        <button
          onClick={() => navigate("/home/products")}
          className={`mb-3 w-full text-left px-3 py-2 rounded-lg transition ${
            isExact("/home/products")
              ? "bg-green-600 text-white"
              : "hover:bg-green-50 hover:text-green-600"
          }`}
        >
          🛒 Produtos
        </button>

        {/* NOVO PRODUTO */}
        <button
          onClick={() => navigate("/home/products/create")}
          className={`mb-3 w-full text-left px-3 py-2 rounded-lg transition ${
            isExact("/home/products/create")
              ? "bg-green-600 text-white"
              : "hover:bg-green-50 hover:text-green-600"
          }`}
        >
          ➕ Novo Produto
        </button>
      </div>

      {/* CONTROLE DA LOJA */}
      <div className="mt-10 pt-6 border-t">
        <h2 className="text-sm font-semibold mb-2 text-gray-500">
          STATUS DA LOJA
        </h2>

        <div
          className={`mb-4 font-bold ${
            storeOpen ? "text-green-600" : "text-red-600"
          }`}
        >
          {storeOpen ? "🟢 Aberta" : "🔴 Fechada"}
        </div>

        {/* BOTÃO DINÂMICO (UM OU OUTRO) */}
        {storeOpen ? (
          <button
            onClick={handleCloseStore}
            disabled={loading}
            className="w-full py-2 rounded text-white bg-red-600 hover:bg-red-700 transition"
          >
            {loading ? "Processando..." : "Fechar Loja"}
          </button>
        ) : (
          <button
            onClick={handleOpenStore}
            disabled={loading}
            className="w-full py-2 rounded text-white bg-green-600 hover:bg-green-700 transition"
          >
            {loading ? "Processando..." : "Abrir Loja"}
          </button>
        )}
      </div>
    </div>
  );
}