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
  customerPhone: string;

  street: string;
  number: string;
  neighborhood: string;
  city: string;

  items: OrderItem[];
}

interface DeliveryPerson {
  id: number;
  name: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  async function fetchOrders() {
    setLoading(true);
    try {
      const response = await api.get("/orders");

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

  async function fetchDeliveryPersons() {
    try {
      const res = await api.get("/users/delivery-persons");
      setDeliveryPersons(res.data);
    } catch (e) {
      console.error("Erro ao buscar motoboys", e);
    }
  }

  async function updateStatus(id: number, newStatus: string) {
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      alert("Erro ao atualizar status");
    }
  }

  async function assignDelivery(orderId: number) {
    const deliveryId = selectedDelivery[orderId];

    if (!deliveryId) {
      alert("Selecione um motoboy");
      return;
    }

    try {
      await api.put(`/orders/assign-delivery/${orderId}/${deliveryId}`);
      fetchOrders();
    } catch (e) {
      alert("Erro ao atribuir motoboy");
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case "CREATED":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-800";
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
    fetchDeliveryPersons();
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
            <option value="OUT_FOR_DELIVERY">Em entrega</option>
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
          <div key={order.id} className="bg-white p-6 rounded-xl shadow-lg border">
            {/* HEADER */}
            <div className="flex justify-between mb-4">
              <div>
                <p className="font-semibold text-lg">Pedido #{order.id}</p>
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

            {/* CLIENTE */}
            <div className="mb-4 bg-gray-50 p-4 rounded-lg text-sm">
              <p><strong>Cliente:</strong> {order.customerName}</p>
              <p><strong>Email:</strong> {order.customerEmail}</p>
              <p><strong>CPF:</strong> {order.customerCpf}</p>
              <p><strong>Telefone:</strong> {order.customerPhone}</p>
              <p>
                <strong>Endereço:</strong>{" "}
                {order.street}, {order.number} - {order.neighborhood} - {order.city}
              </p>
            </div>

            {/* ITENS */}
            <div className="mb-4 border-t pt-3">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm mb-1">
                  <span>
                    {item.productName} x{item.quantity} (R$ {item.price.toFixed(2)} cada)
                  </span>
                  <span>R$ {item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <p className="font-semibold mb-4 text-right">
              Total: R$ {order.totalAmount.toFixed(2)}
            </p>

            {/* BOTÕES */}
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
                <div className="flex gap-2 items-center">
                  <select
                    className="border rounded-lg px-2 py-1"
                    onChange={(e) =>
                      setSelectedDelivery({
                        ...selectedDelivery,
                        [order.id]: Number(e.target.value),
                      })
                    }
                  >
                    <option value="">Selecionar motoboy</option>
                    {deliveryPersons.map((dp) => (
                      <option key={dp.id} value={dp.id}>
                        {dp.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => assignDelivery(order.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Entregar ao motoboy
                  </button>
                </div>
              )}

              {order.status === "OUT_FOR_DELIVERY" && (
                <button
                  onClick={() => updateStatus(order.id, "DELIVERED")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Entregue
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}