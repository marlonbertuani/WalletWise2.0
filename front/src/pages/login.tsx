// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !senha) {
      MySwal.fire({
        icon: "warning",
        title: "Dados incompletos!",
        text: "Por favor, forneça o nome de usuário e a senha.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const res = await fetch("http://192.168.0.15:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, senha }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("user_name", data.nome);
        navigate("/dashboard");
      } else {
        MySwal.fire({
          icon: "error",
          title: "Dados inválidos!",
          text: data.message || "Usuário ou senha incorreta!",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Erro de conexão",
        text: "Não foi possível conectar ao servidor.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-300 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <img src="/src/img/logo.png" alt="Logo" className="mx-auto w-20" />
          <h2 className="text-2xl font-bold text-indigo-600 mt-4">Wallet Wise</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nome de usuário
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              id="senha"
              className="mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}