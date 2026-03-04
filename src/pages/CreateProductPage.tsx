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

  async function fetchCategories() {
    const res = await api.get("/categories");
    setCategories(res.data);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleCreateProduct() {
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
  }

  async function handleCreateCategory() {
    if (!newCategory) return;
    await api.post("/categories", { name: newCategory });
    setNewCategory("");
    fetchCategories();
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm("Deseja realmente excluir esta categoria?")) return;
    await api.delete(`/categories/${id}`);
    fetchCategories();
  }

  return (
    <div className="px-8 pt-2 pb-8 bg-gray-100 min-h-screen space-y-8">
      
      {/* CARDS LADO A LADO */}
      <div className="grid grid-cols-2 gap-8">

        {/* NOVO PRODUTO */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-bold mb-6 text-green-600">➕ Novo Produto</h2>

          <div className="space-y-4">
            <input
              placeholder="Nome"
              className="border p-2 rounded w-full"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
            />

            <textarea
              placeholder="Descrição"
              className="border p-2 rounded w-full"
              value={product.description}
              onChange={(e) =>
                setProduct({ ...product, description: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Preço"
              className="border p-2 rounded w-full"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: e.target.value })}
            />

            <input
              type="number"
              placeholder="Estoque"
              className="border p-2 rounded w-full"
              value={product.stock}
              onChange={(e) => setProduct({ ...product, stock: e.target.value })}
            />

            <select
              className="border p-2 rounded w-full"
              value={product.categoryId}
              onChange={(e) =>
                setProduct({ ...product, categoryId: e.target.value })
              }
            >
              <option value="">Selecione a categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="file"
              className="border p-2 rounded w-full"
              onChange={(e) =>
                e.target.files && setImage(e.target.files[0])
              }
            />

            <button
              onClick={handleCreateProduct}
              className="bg-green-600 text-white py-2 rounded w-full hover:bg-green-700 transition"
            >
              Criar Produto
            </button>
          </div>
        </div>

        {/* NOVA CATEGORIA */}
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col">
          <h2 className="text-xl font-bold mb-6 text-blue-600">🗂 Nova Categoria</h2>

          <div className="flex gap-4 mb-6">
            <input
              placeholder="Nome da categoria"
              className="border p-2 rounded flex-1"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button
              onClick={handleCreateCategory}
              className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
            >
              Criar
            </button>
          </div>

          {/* TABELA MODERNA DE CATEGORIAS COM MARGEM ESCURA */}
          <div className="overflow-x-auto border border-gray-600 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-50 text-blue-700 font-semibold">
                <tr>
                  <th className="p-3 border-b border-gray-600">ID</th>
                  <th className="p-3 border-b border-gray-600">Categoria</th>
                  <th className="p-3 border-b border-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-blue-50 transition">
                    <td className="p-3 border-b border-gray-600">{cat.id}</td>
                    <td className="p-3 border-b border-gray-600">{cat.name}</td>
                    <td className="p-3 border-b border-gray-600 space-x-2">
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}