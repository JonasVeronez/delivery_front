import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      navigate("/home");
    } catch {
      alert("Email ou senha inválidos");
    }
  }

  return (
    <AuthLayout
      title="Plataforma Delivery"
      subtitle="Faça login para continuar"
    >
      <div className="space-y-5">

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

        <PrimaryButton
          text="Entrar"
          onClick={handleLogin}
        />

      </div>

      <p className="text-center text-sm text-gray-500 mt-8">
        Não tem conta?{" "}
        <span
          className="text-green-600 cursor-pointer hover:underline font-medium"
          onClick={() => navigate("/register")}
        >
          Criar nova conta
        </span>
      </p>
      <p className="text-center text-xs text-gray-400 mt-6">
        © {new Date().getFullYear()} JVIOT Automation
      </p>

    </AuthLayout>
  );
}
