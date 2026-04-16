import { useEffect, useState, useMemo } from "react";
import api from "../services/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;

  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // EDIT FIELDS
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedRole, setEditedRole] = useState("");

  const [editedStreet, setEditedStreet] = useState("");
  const [editedNumber, setEditedNumber] = useState("");
  const [editedNeighborhood, setEditedNeighborhood] = useState("");
  const [editedCity, setEditedCity] = useState("");

  // FILTERS
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterRole, setFilterRole] = useState("");

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchName = user.name
        ?.toLowerCase()
        .includes(filterName.toLowerCase());

      const matchEmail = user.email
        ?.toLowerCase()
        .includes(filterEmail.toLowerCase());

      const matchRole = filterRole ? user.role === filterRole : true;

      return matchName && matchEmail && matchRole;
    });
  }, [users, filterName, filterEmail, filterRole]);

  function startEdit(user: User) {
    setEditingId(user.id);

    setEditedName(user.name);
    setEditedEmail(user.email);
    setEditedRole(user.role);

    setEditedStreet(user.address?.street || "");
    setEditedNumber(user.address?.number || "");
    setEditedNeighborhood(user.address?.neighborhood || "");
    setEditedCity(user.address?.city || "");
  }

  function cancelEdit() {
    setEditingId(null);

    setEditedName("");
    setEditedEmail("");
    setEditedRole("");

    setEditedStreet("");
    setEditedNumber("");
    setEditedNeighborhood("");
    setEditedCity("");
  }

  async function saveEdit(id: number) {
    try {
      await api.put(`/users/${id}`, {
        name: editedName,
        email: editedEmail,
        role: editedRole,
        address: {
          street: editedStreet,
          number: editedNumber,
          neighborhood: editedNeighborhood,
          city: editedCity,
        },
      });

      alert("Usuário atualizado!");
      cancelEdit();
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert("Erro ao atualizar usuário");
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
            👥 Lista de Usuários
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
            placeholder="📧 Email..."
            className="border p-2 rounded"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">Todos perfis</option>
            <option value="ADMIN">ADMIN</option>
            <option value="CLIENT">CLIENT</option>
            <option value="DELIVERY">DELIVERY</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full border-collapse">

            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                <th className="p-3 border">ID</th>
                <th className="p-3 border">Nome</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Role</th>
                <th className="p-3 border">Rua</th>
                <th className="p-3 border">Número</th>
                <th className="p-3 border">Bairro</th>
                <th className="p-3 border">Cidade</th>
                <th className="p-3 border">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const isEditing = editingId === user.id;

                return (
                  <tr
                    key={user.id}
                    className={`transition-colors ${
                      isEditing
                        ? "bg-green-50 border-l-4 border-green-400"
                        : "hover:bg-gray-50"
                    }`}
                  >

                    {/* ID */}
                    <td className="p-3 border">{user.id}</td>

                    {/* NAME */}
                    <td className="p-3 border">
                      {isEditing ? (
                        <input
                          className="border p-1 w-full"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                        />
                      ) : (
                        user.name
                      )}
                    </td>

                    {/* EMAIL */}
                    <td className="p-3 border">
                      {isEditing ? (
                        <input
                          className="border p-1 w-full"
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                        />
                      ) : (
                        user.email
                      )}
                    </td>

                    {/* ROLE */}
                    <td className="p-3 border">
                      {isEditing ? (
                        <select
                          className="border p-1"
                          value={editedRole}
                          onChange={(e) => setEditedRole(e.target.value)}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="CLIENT">CLIENT</option>
                          <option value="DELIVERY">DELIVERY</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </td>

                    {/* STREET */}
                    <td className="p-3 border">
                      {isEditing ? (
                        <input
                          className="border p-1 w-full"
                          value={editedStreet}
                          onChange={(e) => setEditedStreet(e.target.value)}
                        />
                      ) : (
                        user.address?.street || "-"
                      )}
                    </td>

                    {/* NUMBER */}
                    <td className="p-3 border">
                      {isEditing ? (
                        <input
                          className="border p-1 w-full"
                          value={editedNumber}
                          onChange={(e) => setEditedNumber(e.target.value)}
                        />
                      ) : (
                        user.address?.number || "-"
                      )}
                    </td>

                    {/* NEIGHBORHOOD */}
                    <td className="p-3 border">
                      {isEditing ? (
                        <input
                          className="border p-1 w-full"
                          value={editedNeighborhood}
                          onChange={(e) => setEditedNeighborhood(e.target.value)}
                        />
                      ) : (
                        user.address?.neighborhood || "-"
                      )}
                    </td>

                    {/* CITY */}
                    <td className="p-3 border">
                      {isEditing ? (
                        <input
                          className="border p-1 w-full"
                          value={editedCity}
                          onChange={(e) => setEditedCity(e.target.value)}
                        />
                      ) : (
                        user.address?.city || "-"
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-3 border text-center">
                      {isEditing ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => saveEdit(user.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-semibold"
                          >
                            Salvar
                          </button>

                          <button
                            onClick={cancelEdit}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm font-semibold"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(user)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-semibold"
                        >
                          Editar
                        </button>
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