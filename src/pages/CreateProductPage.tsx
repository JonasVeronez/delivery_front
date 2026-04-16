import { useEffect, useState } from "react";
import api from "../services/api";

interface Category {
  id: number;
  name: string;
}

export default function CreateProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [image, setImage] = useState<File | null>(null);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
  });

  const [newCategory, setNewCategory] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");

  const [loading, setLoading] = useState(false);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleCreateProduct() {
    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("price", product.price);
      formData.append("categoryId", product.categoryId);
      formData.append("stock", product.stock);

      if (image) formData.append("image", image);

      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Produto criado com sucesso!");

      setProduct({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        stock: "",
      });

      setImage(null);
    } catch (e) {
      console.error(e);
      alert("Erro ao criar produto");
    }
  }

  async function handleCreateCategory() {
    if (!newCategory) return;

    try {
      await api.post("/categories", { name: newCategory });
      setNewCategory("");
      fetchCategories();
    } catch (e) {
      console.error(e);
      alert("Erro ao criar categoria");
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditedName(cat.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditedName("");
  }

  async function saveEdit(id: number) {
    try {
      await api.put(`/categories/${id}`, {
        name: editedName,
      });

      cancelEdit();
      fetchCategories();
    } catch (e) {
      console.error(e);
      alert("Erro ao editar categoria");
    }
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm("Deseja realmente excluir esta categoria?")) return;

    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir categoria");
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 p-0">

      <div className="bg-white rounded-xl shadow-md border flex flex-col h-full overflow-hidden">

        <div className="bg-gray-400 px-6 py-3 border-b shadow">
          <h2 className="text-lg font-bold text-center">
            ➕ Criar Produto & 🗂 Categorias
          </h2>
        </div>

        <div className="flex flex-1 gap-6 p-4 overflow-hidden">

          {/* PRODUCT */}
          <div className="w-1/2 bg-white rounded-xl border p-6 overflow-auto">
            <h2 className="text-xl font-bold mb-6 text-green-600">
              ➕ Novo Produto
            </h2>

            <div className="space-y-4">

              <input className="border p-2 w-full rounded"
                placeholder="Nome"
                value={product.name}
                onChange={(e) =>
                  setProduct({ ...product, name: e.target.value })
                }
              />

              <textarea className="border p-2 w-full rounded"
                placeholder="Descrição"
                value={product.description}
                onChange={(e) =>
                  setProduct({ ...product, description: e.target.value })
                }
              />

              <input className="border p-2 w-full rounded"
                placeholder="Preço"
                type="number"
                value={product.price}
                onChange={(e) =>
                  setProduct({ ...product, price: e.target.value })
                }
              />

              <input className="border p-2 w-full rounded"
                placeholder="Estoque"
                type="number"
                value={product.stock}
                onChange={(e) =>
                  setProduct({ ...product, stock: e.target.value })
                }
              />

              <select className="border p-2 w-full rounded"
                value={product.categoryId}
                onChange={(e) =>
                  setProduct({ ...product, categoryId: e.target.value })
                }
              >
                <option value="">Selecione categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input type="file"
                className="border p-2 w-full rounded"
                onChange={(e) =>
                  e.target.files && setImage(e.target.files[0])
                }
              />

              <button
                onClick={handleCreateProduct}
                className="bg-green-600 text-white p-2 w-full rounded font-semibold"
              >
                Criar Produto
              </button>

            </div>
          </div>

          {/* CATEGORY */}
          <div className="w-1/2 bg-white rounded-xl border p-6 flex flex-col overflow-hidden">

            <h2 className="text-xl font-bold mb-4 text-blue-600">
              🗂 Categorias
            </h2>

            <div className="flex gap-2 mb-4">
              <input
                className="border p-2 flex-1 rounded"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nova categoria"
              />

              <button
                onClick={handleCreateCategory}
                className="bg-blue-600 text-white px-4 rounded"
              >
                Criar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border rounded">

              <table className="w-full">

                <thead className="bg-gray-200 sticky top-0">
                  <tr>
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">Nome</th>
                    <th className="p-2 border">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((cat) => {
                    const isEditing = editingId === cat.id;

                    return (
                      <tr
                        key={cat.id}
                        className={isEditing ? "bg-blue-50" : "hover:bg-gray-50"}
                      >
                        <td className="p-2 border">{cat.id}</td>

                        <td className="p-2 border">
                          {isEditing ? (
                            <input
                              className="border p-1 w-full"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                            />
                          ) : (
                            cat.name
                          )}
                        </td>

                        <td className="p-2 border text-center">
                          {isEditing ? (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => saveEdit(cat.id)}
                                className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                              >
                                Salvar
                              </button>

                              <button
                                onClick={cancelEdit}
                                className="bg-gray-300 px-2 py-1 rounded text-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => startEdit(cat)}
                                className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                              >
                                Editar
                              </button>

                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="bg-red-600 text-white px-2 py-1 rounded text-sm"
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
      </div>
    </div>
  );
}