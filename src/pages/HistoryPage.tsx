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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchName = order.customerName
        .toLowerCase()
        .includes(filterName.toLowerCase());

      const matchStatus = filterStatus
        ? order.status === filterStatus
        : true;

      const orderDate = new Date(order.createdAt);

      const matchStart = startDate
        ? orderDate >= new Date(startDate)
        : true;

      const matchEnd = endDate
        ? orderDate <= new Date(endDate + "T23:59:59")
        : true;

      return matchName && matchStatus && matchStart && matchEnd;
    });
  }, [orders, filterName, filterStatus, startDate, endDate]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterName, filterStatus, startDate, endDate]);

  function exportToCSV() {
    if (filteredOrders.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    const inicio = startDate || "Início dos registros";
    const fim = endDate || "Agora";

    const confirmExport = window.confirm(
      `Deseja exportar o relatório?\n\nPeríodo:\n${inicio} até ${fim}\n\nTotal de pedidos: ${filteredOrders.length}`
    );

    if (!confirmExport) return;

    const headers = [
      "Pedido",
      "Cliente",
      "Telefone",
      "Endereço",
      "Produtos",
      "Data",
      "Status",
      "Total",
    ];

    const rows = filteredOrders.map((order) => {
      const produtosConcatenados = order.items
        .map(
          (item) =>
            `${item.productName} x${item.quantity} (R$ ${item.subtotal.toFixed(2)})`
        )
        .join(" | ");

      const dataFormatada = new Date(order.createdAt)
        .toLocaleString()
        .replace(",", "");

      return [
        order.id,
        `"${order.customerName}"`,
        `"${order.customerPhone}"`,
        `"${order.street}, ${order.number} - ${order.neighborhood}"`,
        `"${produtosConcatenados}"`,
        `"${dataFormatada}"`,
        `"${translateStatus(order.status)}"`,
        order.totalAmount.toFixed(2),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.join(";"))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      `relatorio_pedidos_${Date.now()}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden">

        <div className="bg-gray-100 px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-center">
            📊 Histórico de Pedidos
          </h2>
        </div>

        <div className="p-6 grid grid-cols-4 gap-4 border-b bg-gray-50">
          <input
            placeholder="🔎 Cliente..."
            className="border p-2 rounded"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos status</option>
            <option value="CREATED">Criado</option>
            <option value="ACCEPTED">Aceito</option>
            <option value="OUT_FOR_DELIVERY">Saiu para entrega</option>
            <option value="DELIVERED">Entregue</option>
            <option value="CANCELLED">Cancelado</option>
          </select>

          <input
            type="date"
            className="border p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="border p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="p-4 flex justify-end">
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            📥 Exportar CSV
          </button>
        </div>

        {loading && (
          <p className="text-center p-6">Carregando histórico...</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200 text-sm uppercase">
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
                      {order.street}, {order.number} - {order.neighborhood}
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

        {/* 🔥 PAGINAÇÃO */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            ⬅️ Anterior
          </button>

          <span className="text-sm font-semibold">
            Página {currentPage} de {totalPages || 1}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, totalPages)
              )
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Próxima ➡️
          </button>
        </div>

      </div>
    </div>
  );
}