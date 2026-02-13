import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-white shadow-lg p-6 flex flex-col">
      <h1 className="text-xl font-bold text-green-600 mb-8">
        CA Delivery
      </h1>

      <button
        onClick={() => navigate("/home/orders")}
        className="mb-4 text-left hover:text-green-600"
      >
        📦 Pedidos
      </button>

      <button
        onClick={() => navigate("/home/products")}
        className="text-left hover:text-green-600"
      >
        🛒 Produtos
      </button>
    </div>
  );
}
