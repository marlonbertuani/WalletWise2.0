import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Contas from "./components/ConsultarTodasContas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contas" element={<Contas />} />
        {/* outras rotas... */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;