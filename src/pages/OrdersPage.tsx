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

  function translateStatus(status: string) {
    switch (status) {
      case "CREATED":
        return "Criado";
      case "ACCEPTED":
        return "Aceito";
      case "OUT_FOR_DELIVERY":
        return "Saiu para entrega";
      case "DELIVERED":
        return "Entregue";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  }

  // 🔥 NOVA DIVISÃO
  const ongoingOrders = orders.filter(order =>
    ["CREATED", "ACCEPTED"].includes(order.status)
  );

  const outForDeliveryOrders = orders.filter(order =>
    order.status === "OUT_FOR_DELIVERY"
  );

  const finishedOrders = orders.filter(order =>
    ["DELIVERED", "CANCELLED"].includes(order.status)
  );

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();

    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  function renderOrderCard(order: Order) {
    return (
      <div key={order.id} className="bg-white p-4 rounded-lg shadow border mb-4">

        <div className="mb-3 text-center">
          <p className="font-bold text-lg">
            Pedido #{order.id}
          </p>

          <p className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>

          <div className="flex justify-center mt-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(order.status)}`}
            >
              {translateStatus(order.status)}
            </span>
          </div>
        </div>

        <div className="text-sm mb-2">
          <p><strong>Cliente:</strong> {order.customerName}</p>
          <p><strong>Telefone:</strong> {order.customerPhone}</p>
          <p>
            <strong>Endereço:</strong>{" "}
            {order.street}, {order.number} - {order.neighborhood}
          </p>
        </div>

        <div className="border-t pt-2 text-sm">
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between">
              <span>{item.productName} x{item.quantity}</span>
              <span>R$ {item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <p className="font-semibold text-right mt-2">
          Total: R$ {order.totalAmount.toFixed(2)}
        </p>

        <div className="flex gap-2 mt-3 flex-wrap justify-center">
          {order.status === "CREATED" && (
            <>
              <button
                onClick={() => updateStatus(order.id, "ACCEPTED")}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Aceitar
              </button>

              <button
                onClick={() => updateStatus(order.id, "CANCELLED")}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Cancelar
              </button>
            </>
          )}

          {order.status === "ACCEPTED" && (
            <>
              <select
                className="border rounded px-2 py-1"
                onChange={(e) =>
                  setSelectedDelivery({
                    ...selectedDelivery,
                    [order.id]: Number(e.target.value),
                  })
                }
              >
                <option value="">Selecione um motoboy</option>
                {deliveryPersons.map((dp) => (
                  <option key={dp.id} value={dp.id}>
                    {dp.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => assignDelivery(order.id)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
              >
                Enviar
              </button>
            </>
          )}

          {order.status === "OUT_FOR_DELIVERY" && (
            <button
              onClick={() => updateStatus(order.id, "DELIVERED")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              Entregue
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <h1 className="text-3xl font-bold mb-8 text-center">
        📦 Pedidos
      </h1>

      {loading && <p className="text-center">Carregando pedidos...</p>}

      <div className="grid grid-cols-3 gap-6 h-full">

        {/* EM ANDAMENTO */}
        <div className="bg-white border-2 border-yellow-400 rounded-xl shadow-md flex flex-col overflow-hidden">
          <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-300 text-center">
            <h2 className="text-lg font-bold text-yellow-700">
              🟡 Em andamento ({ongoingOrders.length})
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-4">
            {ongoingOrders.length === 0 && (
              <p className="text-gray-500 text-center">Nenhum pedido em andamento.</p>
            )}
            {ongoingOrders.map(renderOrderCard)}
          </div>
        </div>

        {/* SAIU PARA ENTREGA */}
        <div className="bg-white border-2 border-purple-400 rounded-xl shadow-md flex flex-col overflow-hidden">
          <div className="bg-purple-50 px-4 py-3 border-b border-purple-300 text-center">
            <h2 className="text-lg font-bold text-purple-700">
              🛵 Saiu para entrega ({outForDeliveryOrders.length})
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-4">
            {outForDeliveryOrders.length === 0 && (
              <p className="text-gray-500 text-center">Nenhum pedido em entrega.</p>
            )}
            {outForDeliveryOrders.map(renderOrderCard)}
          </div>
        </div>

        {/* FINALIZADOS */}
        <div className="bg-white border-2 border-blue-400 rounded-xl shadow-md flex flex-col overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-300 text-center">
            <h2 className="text-lg font-bold text-blue-700">
              🔵 Finalizados ({finishedOrders.length})
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-4">
            {finishedOrders.length === 0 && (
              <p className="text-gray-500 text-center">Nenhum pedido finalizado.</p>
            )}
            {finishedOrders.map(renderOrderCard)}
          </div>
        </div>

      </div>
    </div>
  );
}