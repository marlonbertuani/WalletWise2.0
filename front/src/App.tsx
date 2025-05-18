import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* outras rotas... */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;