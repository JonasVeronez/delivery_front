import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [cpf, setCpf] = useState("");

  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");

  async function handleRegister() {
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        cpf,
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
      console.log("ERRO COMPLETO:", error);
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);

      alert(error.response?.data || "Erro ao cadastrar usuário");
    }
  }

  return (
    <AuthLayout
      title="Criar Conta"
      subtitle="Preencha os dados para se cadastrar"
    >
      <div className="space-y-5">

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
          placeholder="Seu CPF"
          onChange={(e) => setCpf(e.target.value)}
        />

        <FormInput
          label="Rua"
          placeholder="Rua"
          onChange={(e) => setStreet(e.target.value)}
        />

        <FormInput
          label="Número"
          placeholder="Número"
          onChange={(e) => setNumber(e.target.value)}
        />

        <FormInput
          label="Bairro"
          placeholder="Bairro"
          onChange={(e) => setNeighborhood(e.target.value)}
        />

        <FormInput
          label="Cidade"
          placeholder="Cidade"
          onChange={(e) => setCity(e.target.value)}
        />

        <PrimaryButton
          text="Cadastrar"
          onClick={handleRegister}
        />

      </div>

      <p className="text-center text-sm text-gray-500 mt-8">
        Já tem conta?{" "}
        <span
          className="text-green-600 cursor-pointer hover:underline font-medium"
          onClick={() => navigate("/")}
        >
          Fazer login
        </span>
      </p>

      <p className="text-center text-xs text-gray-400 mt-6">
        © {new Date().getFullYear()} JVIOT Automation
      </p>

    </AuthLayout>
  );
}
