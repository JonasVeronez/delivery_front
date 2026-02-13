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
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState("");

  // =============================
  // FETCH DATA
  // =============================
  async function fetchProducts() {
    const response = await api.get("/products");
    setProducts(response.data);
  }

  async function fetchCategories() {
    const response = await api.get("/categories");
    setCategories(response.data);
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // =============================
  // CREATE PRODUCT
  // =============================
  async function handleCreateProduct() {
    try {
      const formData = new FormData();

      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price);
      formData.append("categoryId", newProduct.categoryId);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setNewProduct({
        name: "",
        description: "",
        price: "",
        categoryId: "",
      });

      setSelectedImage(null);

      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Erro ao criar produto");
    }
  }

  // =============================
  // CREATE CATEGORY
  // =============================
  async function handleCreateCategory() {
    try {
      await api.post("/categories", {
        name: newCategory,
      });

      setNewCategory("");
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert("Erro ao criar categoria");
    }
  }

  // =============================
  // DELETE PRODUCT
  // =============================
  async function handleDeleteProduct(id: number) {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    await api.delete(`/products/${id}`);
    fetchProducts();
  }

  // =============================
  // DELETE CATEGORY
  // =============================
  async function handleDeleteCategory(id: number) {
    if (!confirm("Deseja realmente excluir esta categoria?")) return;

    await api.delete(`/categories/${id}`);
    fetchCategories();
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Gerenciar Produtos</h1>

      {/* ============================= */}
      {/* NOVO PRODUTO */}
      {/* ============================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
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
            onChange={(e) => {
              if (e.target.files) {
                setSelectedImage(e.target.files[0]);
              }
            }}
          />

          <button
            onClick={handleCreateProduct}
            className="bg-green-600 text-white px-4 py-2 rounded col-span-2"
          >
            Criar Produto
          </button>
        </div>
      </div>

      {/* ============================= */}
      {/* NOVA CATEGORIA */}
      {/* ============================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
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

      {/* ============================= */}
      {/* LISTA DE PRODUTOS */}
      {/* ============================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Lista de Produtos</h2>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th>Imagem</th>
              <th>Nome</th>
              <th>Preço</th>
              <th>Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b">
                <td>
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </td>

                <td>{product.name}</td>

                <td>R$ {product.price.toFixed(2)}</td>

                <td>{product.categoryName}</td>

                <td>
                  <button
                    className="text-red-600"
                    onClick={() => handleDeleteProduct(product.id)}
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
  );
}
