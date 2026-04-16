import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [storeOpen, setStoreOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const [openProducts, setOpenProducts] = useState(true);

  const isExact = (path: string) => location.pathname === path;

  async function fetchStoreStatus() {
    try {
      const response = await api.get("/store/status");
      setStoreOpen(response.data);
    } catch (error) {
      console.error("Erro ao buscar status", error);
    }
  }

  async function handleOpenStore() {
    try {
      setLoading(true);
      await api.post("/store/open");
      await fetchStoreStatus();
    } catch (error) {
      alert("Erro ao abrir loja");
    } finally {
      setLoading(false);
    }
  }

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
      alert("Erro ao fechar loja");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStoreStatus();
  }, []);

  // 🎨 CORES DINÂMICAS
  const bgColor = storeOpen ? "bg-green-50" : "bg-red-50";
  const hoverColor = storeOpen
    ? "hover:bg-green-100 hover:text-green-700"
    : "hover:bg-red-100 hover:text-red-700";
  const activeColor = storeOpen
    ? "bg-green-600 text-white"
    : "bg-red-600 text-white";
  const titleColor = storeOpen ? "text-green-700" : "text-red-700";
  const borderColor = storeOpen ? "border-green-200" : "border-red-200";

  return (
    <>
      {/* 🔥 ANIMAÇÃO PULSANTE */}
      <style>
        {`
          @keyframes pulseSoft {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.06); }
          }

          .pulse-soft {
            animation: pulseSoft 1.5s infinite ease-in-out;
          }
        `}
      </style>

      <div className={`w-64 ${bgColor} shadow-lg p-6 flex flex-col justify-between`}>
        
        {/* MENU */}
        <div>
          <h1 className={`text-xl font-bold mb-8 ${titleColor}`}>
            CA Delivery
          </h1>

          {/* PEDIDOS */}
          <button
            onClick={() => navigate("/home/orders")}
            className={`mb-3 w-full text-left px-3 py-2 rounded-lg transition ${
              isExact("/home/orders") ? activeColor : hoverColor
            }`}
          >
            📦 Pedidos
          </button>

          {/* PRODUTOS */}
          <div className="mb-3">
            <button
              onClick={() => setOpenProducts(!openProducts)}
              className={`w-full text-left px-3 py-2 rounded-lg transition flex justify-between items-center ${
                location.pathname.includes("/home/products")
                  ? activeColor
                  : hoverColor
              }`}
            >
              <span>🛒 Produtos</span>
              <span>{openProducts ? "▲" : "▼"}</span>
            </button>

            {openProducts && (
              <div className="ml-4 mt-2 flex flex-col gap-2">

                <button
                  onClick={() => navigate("/home/products")}
                  className={`text-left px-3 py-2 rounded transition ${
                    isExact("/home/products")
                      ? storeOpen
                        ? "bg-green-200 text-green-900"
                        : "bg-red-200 text-red-900"
                      : hoverColor
                  }`}
                >
                  📋 Lista de Produtos
                </button>

                <button
                  onClick={() => navigate("/home/products/create")}
                  className={`text-left px-3 py-2 rounded transition ${
                    isExact("/home/products/create")
                      ? storeOpen
                        ? "bg-green-200 text-green-900"
                        : "bg-red-200 text-red-900"
                      : hoverColor
                  }`}
                >
                  ➕ Novo Produto
                </button>

              </div>
            )}
          </div>

          {/* HISTÓRICO */}
          <button
            onClick={() => navigate("/home/history")}
            className={`mb-3 w-full text-left px-3 py-2 rounded-lg transition ${
              isExact("/home/history") ? activeColor : hoverColor
            }`}
          >
            📊 Histórico de Pedidos
          </button>

          {/* USUÁRIOS */}
          <button
            onClick={() => navigate("/home/users")}
            className={`mb-3 w-full text-left px-3 py-2 rounded-lg transition ${
              isExact("/home/users") ? activeColor : hoverColor
            }`}
          >
            👥 Usuários
          </button>
        </div>

        {/* CONTROLE DA LOJA */}
        <div className={`mt-10 pt-6 border-t ${borderColor}`}>
          <h2 className={`text-sm font-semibold mb-2 ${titleColor}`}>
            STATUS DA LOJA
          </h2>

          <div
            className={`mb-4 font-bold ${
              storeOpen ? "text-green-700" : "text-red-600"
            }`}
          >
            {storeOpen ? "🟢 Aberta" : "🔴 Fechada"}
          </div>

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
              className={`w-full py-2 rounded text-white bg-green-600 hover:bg-green-700 transition ${
                !storeOpen ? "pulse-soft" : ""
              }`}
            >
              {loading ? "Processando..." : "Abrir Loja"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}