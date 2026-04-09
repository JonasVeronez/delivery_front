import { useEffect, useState, useMemo } from "react";
import api from "../services/api";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  categoryName: string;
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [editedImage, setEditedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [filterName, setFilterName] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchName = product.name
          ?.toLowerCase()
          .includes(filterName.toLowerCase());

        const matchStock = filterStock
          ? product.stock >= Number(filterStock)
          : true;

        const matchCategory = filterCategory
          ? product.categoryName === filterCategory
          : true;

        return matchName && matchStock && matchCategory;
      })
      .sort((a, b) => a.stock - b.stock);
  }, [products, filterName, filterStock, filterCategory]);

  const uniqueCategories = [
    ...new Set(products.map((p) => p.categoryName)),
  ];

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditedProduct({ ...product });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditedProduct(null);
    setEditedImage(null);
  }

  async function saveEdit() {
    if (!editedProduct) return;

    try {
      const formData = new FormData();
      formData.append("name", editedProduct.name);
      formData.append("description", editedProduct.description);
      formData.append("price", String(editedProduct.price));
      formData.append("categoryId", String(editedProduct.categoryId));
      formData.append("stock", String(editedProduct.stock));

      if (editedImage) formData.append("image", editedImage);

      await api.put(`/products/${editedProduct.id}`, formData);

      alert("Produto atualizado!");
      cancelEdit();
      fetchProducts();
    } catch {
      alert("Erro ao salvar produto");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Deseja excluir?")) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      alert("Erro ao deletar");
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 p-0">

      <div className="bg-white rounded-xl shadow-md border flex flex-col h-full overflow-hidden">

        {/* HEADER FIXO */}
        <div className="bg-gray-400 px-6 py-3 border-b shadow">
          <h2 className="text-lg font-bold text-center">
            📦 Lista de Produtos
          </h2>
        </div>

        {/* FILTROS FIXOS */}
        <div className="p-2 grid grid-cols-3 gap-3 border-b bg-gray-50">
          <input
            placeholder="🔎 Nome..."
            className="border p-2 rounded"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />

          <input
            type="number"
            placeholder="📦 Estoque mínimo"
            className="border p-2 rounded"
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Todas</option>
            {uniqueCategories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* TABELA COM SCROLL */}
        <div className="flex-1 overflow-y-auto">

          <table className="w-full border-collapse">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                <th className="p-3 border">Imagem</th>
                <th className="p-3 border">Nome</th>
                <th className="p-3 border">Preço</th>
                <th className="p-3 border">Estoque</th>
                <th className="p-3 border">Categoria</th>
                <th className="p-3 border">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const isEditing = editingId === product.id;

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 ${
                      product.stock === 0
                        ? "bg-red-200"
                        : product.stock < 5
                        ? "bg-red-100"
                        : ""
                    }`}
                  >
                    <td className="p-3 border">
                      <div className="w-16 h-16 flex items-center justify-center bg-white border rounded">
                        <img
                          src={product.imageUrl || "https://via.placeholder.com/100"}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </td>

                    <td className="p-3 border">{product.name}</td>

                    <td className="p-3 border">
                      R$ {product.price.toFixed(2)}
                    </td>

                    <td className="p-3 border font-bold">
                      {product.stock}
                    </td>

                    <td className="p-3 border">
                      {product.categoryName}
                    </td>

                    <td className="p-3 border space-x-3">
                      <button
                        onClick={() => startEdit(product)}
                        className="text-blue-600"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600"
                      >
                        Excluir
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}