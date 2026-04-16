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

  const uniqueCategories = [...new Set(products.map((p) => p.categoryName))];

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

      if (editedImage) {
        formData.append("image", editedImage);
      }

      await api.put(`/products/${editedProduct.id}`, formData);

      alert("Produto atualizado!");
      cancelEdit();
      fetchProducts();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar produto");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Deseja excluir?")) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert("Erro ao deletar");
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 p-0">
      <div className="bg-white rounded-xl shadow-md border flex flex-col h-full overflow-hidden">

        {/* HEADER */}
        <div className="bg-gray-400 px-6 py-3 border-b shadow">
          <h2 className="text-lg font-bold text-center">
            📦 Lista de Produtos
          </h2>
        </div>

        {/* FILTERS */}
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
            <option value="">Todas categorias</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}
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
                const lowStock = product.stock < 5;

                return (
                  <tr
                    key={product.id}
                    className={`transition-colors ${
                      isEditing
                        ? "bg-blue-50 border-l-4 border-blue-400"
                        : lowStock
                        ? "bg-red-50"
                        : "hover:bg-gray-50"
                    }`}
                  >

                    {/* IMAGE */}
                    <td className="p-3 border">
                      <div className="flex flex-col gap-2">
                        <img
                          src={
                            product.imageUrl ||
                            "https://via.placeholder.com/100"
                          }
                          className="w-16 h-16 object-contain rounded"
                        />

                        {isEditing && (
                          <input
                            type="file"
                            onChange={(e) =>
                              setEditedImage(e.target.files?.[0] || null)
                            }
                          />
                        )}
                      </div>
                    </td>

                    {/* NAME */}
                    <td className="p-3 border">
                      {isEditing ? (
                        <input
                          className="border p-1 w-full"
                          value={editedProduct?.name || ""}
                          onChange={(e) =>
                            setEditedProduct((prev) =>
                              prev
                                ? { ...prev, name: e.target.value }
                                : prev
                            )
                          }
                        />
                      ) : (
                        product.name
                      )}
                    </td>

                    {/* PRICE */}
                    <td className="p-3 border">
                      {isEditing ? (
                        <input
                          type="number"
                          className="border p-1 w-full"
                          value={editedProduct?.price || 0}
                          onChange={(e) =>
                            setEditedProduct((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    price: Number(e.target.value),
                                  }
                                : prev
                            )
                          }
                        />
                      ) : (
                        `R$ ${product.price.toFixed(2)}`
                      )}
                    </td>

                    {/* STOCK */}
                    <td className="p-3 border">
                      <span className={lowStock ? "text-red-600 font-bold" : ""}>
                        {isEditing ? (
                          <input
                            type="number"
                            className="border p-1 w-full"
                            value={editedProduct?.stock || 0}
                            onChange={(e) =>
                              setEditedProduct((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      stock: Number(e.target.value),
                                    }
                                  : prev
                              )
                            }
                          />
                        ) : (
                          product.stock
                        )}
                      </span>
                    </td>

                    {/* CATEGORY */}
                    <td className="p-3 border">
                      {product.categoryName}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-3 border text-center">
                      {isEditing ? (
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={saveEdit}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-semibold transition"
                          >
                            Salvar
                          </button>

                          <button
                            onClick={cancelEdit}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm font-semibold transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => startEdit(product)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-semibold transition"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => handleDelete(product.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-semibold transition"
                          >
                            Excluir
                          </button>
                        </div>
                      )}
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