import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";

export default function Register() {
  const navigate = useNavigate();

  // ================= USER =================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("CLIENT"); // 🔥 NOVO

  // ================= ADDRESS =================
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");

  async function handleRegister() {
    try {
      if (!name || !email || !password || !cpf || !phone) {
        alert("Preencha todos os campos obrigatórios");
        return;
      }

      await api.post("/auth/register", {
        name,
        email,
        password,
        cpf,
        phone,
        role, // 🔥 NOVO
        address: {
          street,
          number,
          neighborhood,
          city,
        },
      });

      alert("Usuário criado com sucesso!");
      navigate("/");
    } catch (error: any) {
      console.log(error);
      alert(error.response?.data || "Erro ao cadastrar usuário");
    }
  }

  return (
    <AuthLayout
      title="Criar Conta"
      subtitle="Preencha seus dados para começar"
    >
      <div className="space-y-6">

        {/* ================= DADOS PESSOAIS ================= */}
        <div className="bg-gray-50 p-4 rounded-xl border">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">
            Dados pessoais
          </h3>

          <div className="space-y-4">

            <FormInput
              label="Nome"
              placeholder="Seu nome completo"
              onChange={(e) => setName(e.target.value)}
            />

            <FormInput
              label="Email"
              type="email"
              placeholder="seu@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />

            <FormInput
              label="Senha"
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />

            <FormInput
              label="CPF"
              placeholder="000.000.000-00"
              onChange={(e) => setCpf(e.target.value)}
            />

            <FormInput
              label="Telefone"
              type="tel"
              placeholder="(35) 99999-9999"
              onChange={(e) => setPhone(e.target.value)}
            />

            {/* 🔥 ROLE SELECT */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tipo de usuário
              </label>

              <select
                className="w-full mt-1 border p-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="CLIENT">Cliente</option>
                <option value="DELIVERY">Entregador</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

          </div>
        </div>

        {/* ================= ENDEREÇO ================= */}
        <div className="bg-gray-50 p-4 rounded-xl border">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">
            Endereço
          </h3>

          <div className="space-y-4">

            <FormInput
              label="Rua"
              placeholder="Rua"
              onChange={(e) => setStreet(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Número"
                placeholder="Nº"
                onChange={(e) => setNumber(e.target.value)}
              />

              <FormInput
                label="Bairro"
                placeholder="Bairro"
                onChange={(e) => setNeighborhood(e.target.value)}
              />
            </div>

            <FormInput
              label="Cidade"
              placeholder="Cidade"
              onChange={(e) => setCity(e.target.value)}
            />

          </div>
        </div>

        {/* ================= BOTÃO ================= */}
        <PrimaryButton
          text="Cadastrar"
          onClick={handleRegister}
        />

      </div>

      {/* LOGIN */}
      <p className="text-center text-sm text-gray-500 mt-8">
        Já tem conta?{" "}
        <span
          className="text-green-600 cursor-pointer hover:underline font-medium"
          onClick={() => navigate("/")}
        >
          Fazer login
        </span>
      </p>

      {/* FOOTER */}
      <p className="text-center text-xs text-gray-400 mt-6">
        © {new Date().getFullYear()} JVIOT Automation
      </p>

    </AuthLayout>
  );
}