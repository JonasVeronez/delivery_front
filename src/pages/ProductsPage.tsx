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

  // ================= FILTROS =================
  const [filterName, setFilterName] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // ================= FETCH =================
  async function fetchProducts() {
    const res = await api.get("/products");
    setProducts(res.data);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= FILTRAGEM =================
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchName = product.name
        .toLowerCase()
        .includes(filterName.toLowerCase());

      const matchStock = filterStock
        ? product.stock >= Number(filterStock)
        : true;

      const matchCategory = filterCategory
        ? product.categoryName === filterCategory
        : true;

      return matchName && matchStock && matchCategory;
    });
  }, [products, filterName, filterStock, filterCategory]);

  const uniqueCategories = [
    ...new Set(products.map((p) => p.categoryName)),
  ];

  // ================= EDIT =================
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

    const formData = new FormData();
    formData.append("name", editedProduct.name);
    formData.append("description", editedProduct.description);
    formData.append("price", String(editedProduct.price));
    formData.append("categoryId", String(editedProduct.categoryId));
    formData.append("stock", String(editedProduct.stock));

    if (editedImage) formData.append("image", editedImage);

    await api.put(`/products/${editedProduct.id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    cancelEdit();
    fetchProducts();
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir produto?")) return;

    await api.delete(`/products/${id}`);
    fetchProducts();
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden">

        {/* HEADER */}
        <div className="bg-gray-100 px-6 py-4 border-b-2 border-gray-300">
          <h2 className="text-lg font-bold text-gray-800 text-center">
            📦 Lista de Produtos
          </h2>
        </div>

        {/* FILTROS */}
        <div className="p-6 grid grid-cols-3 gap-6 border-b border-gray-300 bg-gray-50">

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-700">
              🔎 Filtrar por Nome
            </label>
            <input
              placeholder="Digite o nome..."
              className="border p-2 rounded"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-700">
              📦 Estoque Mínimo
            </label>
            <input
              type="number"
              placeholder="Quantidade mínima"
              className="border p-2 rounded"
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-700">
              🗂 Categoria
            </label>
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

        </div>

        {/* TABELA */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">

            <thead className="bg-gray-200 text-gray-700 text-sm uppercase">
              <tr>
                <th className="p-3 border border-gray-300">Imagem</th>
                <th className="p-3 border border-gray-300">Nome</th>
                <th className="p-3 border border-gray-300">Preço</th>
                <th className="p-3 border border-gray-300">Estoque</th>
                <th className="p-3 border border-gray-300">Categoria</th>
                <th className="p-3 border border-gray-300">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const isEditing = editingId === product.id;

                return (
                  <tr key={product.id} className="hover:bg-gray-50">

                    <td className="p-3 border border-gray-300">
                      {isEditing ? (
                        <input
                          type="file"
                          onChange={(e) =>
                            e.target.files && setEditedImage(e.target.files[0])
                          }
                        />
                      ) : (
                        product.imageUrl && (
                          <div className="w-16 h-16 flex items-center justify-center bg-white border rounded">
                            <img
                              src={product.imageUrl}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        )
                      )}
                    </td>

                    <td className="p-3 border border-gray-300">
                      {isEditing ? (
                        <input
                          className="border p-1 rounded w-full"
                          value={editedProduct?.name || ""}
                          onChange={(e) =>
                            setEditedProduct({
                              ...editedProduct!,
                              name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        product.name
                      )}
                    </td>

                    <td className="p-3 border border-gray-300">
                      {isEditing ? (
                        <input
                          type="number"
                          className="border p-1 rounded w-full"
                          value={editedProduct?.price || ""}
                          onChange={(e) =>
                            setEditedProduct({
                              ...editedProduct!,
                              price: Number(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <>R$ {product.price.toFixed(2)}</>
                      )}
                    </td>

                    <td className="p-3 border border-gray-300">
                      {isEditing ? (
                        <input
                          type="number"
                          className="border p-1 rounded w-full"
                          value={editedProduct?.stock || ""}
                          onChange={(e) =>
                            setEditedProduct({
                              ...editedProduct!,
                              stock: Number(e.target.value),
                            })
                          }
                        />
                      ) : (
                        product.stock
                      )}
                    </td>

                    <td className="p-3 border border-gray-300">
                      {product.categoryName}
                    </td>

                    <td className="p-3 border border-gray-300 space-x-3">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="text-green-600 font-semibold hover:underline"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 font-semibold hover:underline"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(product)}
                            className="text-blue-600 font-semibold hover:underline"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 font-semibold hover:underline"
                          >
                            Excluir
                          </button>
                        </>
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