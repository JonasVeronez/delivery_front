import { useEffect, useState, useMemo } from "react";
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

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  function toggleExpand(id: number) {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  }

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
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  function translateStatus(status: string) {
    switch (status) {
      case "CREATED": return "Criado";
      case "ACCEPTED": return "Aceito";
      case "OUT_FOR_DELIVERY": return "Saiu para entrega";
      case "DELIVERED": return "Entregue";
      case "CANCELLED": return "Cancelado";
      default: return status;
    }
  }

  function exportToCSV() {
    if (filteredOrders.length === 0) return;

    const headers = ["Pedido","Cliente","Telefone","Endereço","Produtos","Data","Status","Total"];

    const rows = filteredOrders.map((order) => {
      const produtos = order.items
        .map((i) => `${i.productName} x${i.quantity} (R$ ${i.subtotal.toFixed(2)})`)
        .join(" | ");

      return [
        order.id,
        order.customerName,
        order.customerPhone,
        `${order.street}, ${order.number}`,
        produtos,
        new Date(order.createdAt).toLocaleString(),
        translateStatus(order.status),
        order.totalAmount.toFixed(2),
      ];
    });

    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio.csv";
    link.click();
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchName = order.customerName.toLowerCase().includes(filterName.toLowerCase());
      const matchStatus = filterStatus ? order.status === filterStatus : true;

      const date = new Date(order.createdAt);

      const matchStart = startDate ? date >= new Date(startDate) : true;
      const matchEnd = endDate ? date <= new Date(endDate + "T23:59:59") : true;

      return matchName && matchStatus && matchStart && matchEnd;
    });
  }, [orders, filterName, filterStatus, startDate, endDate]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  return (
      <div className="h-[calc(100vh-80px)] mt-[10px] bg-gray-100 flex flex-col">
    
        <div className="px-2 pt-2 h-full flex flex-col">

        {/* CONTAINER PRINCIPAL */}
        <div className="flex flex-col flex-1 bg-white rounded-xl shadow-md border overflow-hidden">

          {/* HEADER FIXO */}
          <div className="bg-gray-700 text-white px-6 py-4 flex-shrink-0">
            <h2 className="text-lg font-bold text-center">
              📊 Histórico de Pedidos
            </h2>
          </div>

          {/* FILTROS FIXOS */}
          <div className="p-4 flex gap-3 border-b bg-gray-100 flex-shrink-0 overflow-x-auto">

            <input
              placeholder="Cliente..."
              className="border p-2 rounded w-40"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />

            <select
              className="border p-2 rounded w-40"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Status</option>
              <option value="CREATED">Criado</option>
              <option value="ACCEPTED">Aceito</option>
              <option value="OUT_FOR_DELIVERY">Entrega</option>
              <option value="DELIVERED">Entregue</option>
              <option value="CANCELLED">Cancelado</option>
            </select>

            <input type="date" className="border p-2 rounded" onChange={(e)=>setStartDate(e.target.value)} />
            <input type="date" className="border p-2 rounded" onChange={(e)=>setEndDate(e.target.value)} />

            {/* 🔥 EMPURRA PRA DIREITA */}
            <div className="ml-auto">
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold whitespace-nowrap"
              >
                📥 Exportar CSV
              </button>
            </div>
          </div>

          {/* 🔥 ÁREA SCROLL */}
          <div className="flex-1 overflow-y-auto">

            <table className="w-full border-collapse">

              {/* HEADER FIXO DA TABELA */}
              <thead className="bg-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="p-3 border">Pedido</th>
                  <th className="p-3 border">Cliente</th>
                  <th className="p-3 border">Telefone</th>
                  <th className="p-3 border">Endereço</th>
                  <th className="p-3 border">Data</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Total</th>
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.map((order) => (
                  <>
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <td className="p-3 border font-bold">#{order.id}</td>
                      <td className="p-3 border">{order.customerName}</td>
                      <td className="p-3 border">{order.customerPhone}</td>
                      <td className="p-3 border text-sm">
                        {order.street}, {order.number}
                      </td>
                      <td className="p-3 border">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 border">
                        {translateStatus(order.status)}
                      </td>
                      <td className="p-3 border font-semibold">
                        R$ {order.totalAmount.toFixed(2)}
                      </td>
                    </tr>

                    {expandedOrderId === order.id && (
                      <tr>
                        <td colSpan={7} className="p-4 bg-gray-50 border">
                          {order.items.map((item) => (
                            <div key={item.productId} className="flex justify-between mt-2">
                              <span>{item.productName} x{item.quantity}</span>
                              <span>R$ {item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>

          </table>
        </div>

        {/* PAGINAÇÃO FIXA */}
        <div className="flex justify-between items-center p-3 border-t bg-gray-50 flex-shrink-0">
          <button onClick={()=>setCurrentPage(p=>Math.max(p-1,1))}>⬅️</button>
          <span>Página {currentPage} de {totalPages || 1}</span>
          <button onClick={()=>setCurrentPage(p=>Math.min(p+1,totalPages))}>➡️</button>
        </div>

      </div>
    </div>
       </div>
    
  );
}