import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Sidebar() {
  const navigate = useNavigate();

  const [storeOpen, setStoreOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // BUSCAR STATUS DA LOJA
  // =========================
  async function fetchStoreStatus() {
    try {
      const response = await api.get("/store/status");

      // ⚠️ backend retorna boolean direto
      setStoreOpen(response.data);

    } catch (error) {
      console.error("Erro ao buscar status da loja", error);
    }
  }

  // =========================
  // ABRIR LOJA (PUT)
  // =========================
  async function handleOpenStore() {
    try {
      setLoading(true);

      await api.put("/store/open"); // ✅ PUT

      await fetchStoreStatus();

    } catch (error) {
      console.error(error);
      alert("Erro ao abrir loja");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // FECHAR LOJA (PUT)
  // =========================
  async function handleCloseStore() {
    try {
      setLoading(true);

      await api.put("/store/close"); // ✅ PUT

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
      
      {/* PARTE SUPERIOR */}
      <div>
        <h1 className="text-xl font-bold text-green-600 mb-8">
          CA Delivery
        </h1>

        <button
          onClick={() => navigate("/home/orders")}
          className="mb-4 text-left hover:text-green-600 w-full"
        >
          📦 Pedidos
        </button>

        <button
          onClick={() => navigate("/home/products")}
          className="text-left hover:text-green-600 w-full"
        >
          🛒 Produtos
        </button>
      </div>

      {/* CONTROLE DA LOJA */}
      <div className="mt-10 pt-6 border-t">
        <h2 className="text-sm font-semibold mb-2 text-gray-500">
          STATUS DA LOJA
        </h2>

        {storeOpen !== null && (
          <div
            className={`mb-3 font-bold ${
              storeOpen ? "text-green-600" : "text-red-600"
            }`}
          >
            {storeOpen ? "🟢 Aberta" : "🔴 Fechada"}
          </div>
        )}

        <button
          onClick={handleOpenStore}
          disabled={loading || storeOpen === true}
          className={`w-full mb-2 py-2 rounded text-white ${
            storeOpen
              ? "bg-gray-400"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Processando..." : "Abrir Loja"}
        </button>

        <button
          onClick={handleCloseStore}
          disabled={loading || storeOpen === false}
          className={`w-full py-2 rounded text-white ${
            storeOpen === false
              ? "bg-gray-400"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Processando..." : "Fechar Loja"}
        </button>
      </div>
    </div>
  );
}
