import { useEffect, useState } from "react";
import api from "../services/api";

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;

  customerName: string;
  customerEmail: string;
  customerCpf: string;

  street: string;
  number: string;
  neighborhood: string;
  city: string;

  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  async function fetchOrders() {
    setLoading(true);
    try {
      const response = await api.get("/orders");

      // Ordenar do mais recente para o mais antigo
      const sorted = response.data.sort(
        (a: Order, b: Order) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setOrders(sorted);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, newStatus: string) {
    try {
      await api.put(`/orders/${id}/status`, {
        status: newStatus,
      });

      fetchOrders();
    } catch (error) {
      alert("Erro ao atualizar status");
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case "CREATED":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "DELIVERED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  const filteredOrders =
    filter === "ALL"
      ? orders
      : orders.filter((order) => order.status === filter);

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pedidos</h1>

        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="ALL">Todos</option>
            <option value="CREATED">Criados</option>
            <option value="ACCEPTED">Aceitos</option>
            <option value="DELIVERED">Entregues</option>
            <option value="CANCELLED">Cancelados</option>
          </select>

          <button
            onClick={fetchOrders}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
          >
            Atualizar
          </button>
        </div>
      </div>

      {loading && <p>Carregando pedidos...</p>}

      {!loading && filteredOrders.length === 0 && (
        <p className="text-gray-500">Nenhum pedido encontrado.</p>
      )}

      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-6 rounded-xl shadow-lg border"
          >
            {/* Header */}
            <div className="flex justify-between mb-4">
              <div>
                <p className="font-semibold text-lg">
                  Pedido #{order.id}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            {/* Cliente */}
            <div className="mb-4 bg-gray-50 p-4 rounded-lg text-sm">
              <p><strong>Cliente:</strong> {order.customerName}</p>
              <p><strong>Email:</strong> {order.customerEmail}</p>
              <p><strong>CPF:</strong> {order.customerCpf}</p>
              <p>
                <strong>Endereço:</strong>{" "}
                {order.street}, {order.number} -{" "}
                {order.neighborhood} - {order.city}
              </p>
            </div>

            {/* Itens */}
            <div className="mb-4 border-t pt-3">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm mb-1"
                >
                  <span>
                    {item.productName} x{item.quantity}
                  </span>
                  <span>R$ {item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <p className="font-semibold mb-4 text-right">
              Total: R$ {order.totalAmount.toFixed(2)}
            </p>

            {/* Botões */}
            <div className="flex gap-3">
              {order.status === "CREATED" && (
                <>
                  <button
                    onClick={() => updateStatus(order.id, "ACCEPTED")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Aceitar
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, "CANCELLED")}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                </>
              )}

              {order.status === "ACCEPTED" && (
                <button
                  onClick={() => updateStatus(order.id, "DELIVERED")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Entregar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
