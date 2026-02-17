import { useEffect, useState } from "react";
import api from "../services/api";

interface Category {
  id: number;
  name: string;
}

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
  const [categories, setCategories] = useState<Category[]>([]);

  // ================= CREATE PRODUCT =================
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
  });
  const [newImage, setNewImage] = useState<File | null>(null);

  // ================= CREATE CATEGORY =================
  const [newCategory, setNewCategory] = useState("");

  // ================= EDIT =================
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [editedImage, setEditedImage] = useState<File | null>(null);

  // ================= FETCH =================
  async function fetchProducts() {
    const res = await api.get("/products");
    setProducts(res.data);
  }

  async function fetchCategories() {
    const res = await api.get("/categories");
    setCategories(res.data);
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ================= CREATE PRODUCT =================
  async function handleCreateProduct() {
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("price", newProduct.price);
    formData.append("categoryId", newProduct.categoryId);
    formData.append("stock", newProduct.stock);

    if (newImage) formData.append("image", newImage);

    await api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setNewProduct({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      stock: "",
    });
    setNewImage(null);
    fetchProducts();
  }

  // ================= CREATE CATEGORY =================
  async function handleCreateCategory() {
    if (!newCategory) return;

    await api.post("/categories", { name: newCategory });
    setNewCategory("");
    fetchCategories();
  }

  // ================= DELETE CATEGORY =================
  async function handleDeleteCategory(id: number) {
    if (!confirm("Excluir categoria?")) return;

    await api.delete(`/categories/${id}`);
    fetchCategories();
  }

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

  // ================= DELETE PRODUCT =================
  async function handleDelete(id: number) {
    if (!confirm("Excluir produto?")) return;

    await api.delete(`/products/${id}`);
    fetchProducts();
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>

      {/* ================= NOVO PRODUTO ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Novo Produto</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Nome"
            className="border p-2 rounded"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Preço"
            className="border p-2 rounded"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Estoque"
            className="border p-2 rounded"
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: e.target.value })
            }
          />

          <textarea
            placeholder="Descrição"
            className="border p-2 rounded col-span-2"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          />

          <select
            className="border p-2 rounded"
            value={newProduct.categoryId}
            onChange={(e) =>
              setNewProduct({ ...newProduct, categoryId: e.target.value })
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
            className="border p-2 rounded col-span-2"
            onChange={(e) =>
              e.target.files && setNewImage(e.target.files[0])
            }
          />

          <button
            onClick={handleCreateProduct}
            className="bg-green-600 text-white px-4 py-2 rounded col-span-2"
          >
            Criar Produto
          </button>
        </div>
      </div>

      {/* ================= NOVA CATEGORIA ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Nova Categoria</h2>

        <div className="flex gap-4">
          <input
            placeholder="Nome da categoria"
            className="border p-2 rounded flex-1"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />

          <button
            onClick={handleCreateCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Criar
          </button>
        </div>

        <div className="mt-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex justify-between border-b py-2">
              <span>{cat.name}</span>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="text-red-600"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= LISTA PRODUTOS ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th>Imagem</th>
              <th>Nome</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const isEditing = editingId === product.id;

              return (
                <tr key={product.id} className="border-b">
                  <td>
                    {isEditing ? (
                      <input
                        type="file"
                        onChange={(e) =>
                          e.target.files &&
                          setEditedImage(e.target.files[0])
                        }
                      />
                    ) : (
                      product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          className="w-16 h-16 rounded"
                        />
                      )
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        className="border p-1 rounded"
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

                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        className="border p-1 rounded w-24"
                        value={editedProduct?.price || ""}
                        onChange={(e) =>
                          setEditedProduct({
                            ...editedProduct!,
                            price: Number(e.target.value),
                          })
                        }
                      />
                    ) : (
                      `R$ ${product.price.toFixed(2)}`
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        className="border p-1 rounded w-20"
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

                  <td>
                    {isEditing ? (
                      <textarea
                        className="border p-1 rounded"
                        value={editedProduct?.description || ""}
                        onChange={(e) =>
                          setEditedProduct({
                            ...editedProduct!,
                            description: e.target.value,
                          })
                        }
                      />
                    ) : (
                      product.description
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <select
                        className="border p-1 rounded"
                        value={editedProduct?.categoryId}
                        onChange={(e) =>
                          setEditedProduct({
                            ...editedProduct!,
                            categoryId: Number(e.target.value),
                          })
                        }
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      product.categoryName
                    )}
                  </td>

                  <td className="space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="bg-green-600 text-white px-2 py-1 rounded"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-400 text-white px-2 py-1 rounded"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
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
  );
}
