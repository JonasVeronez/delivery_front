import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import CreateProductPage from "./pages/CreateProductPage";
import HistoryPage from "./pages/HistoryPage"; // 👈 NOVO
import UsersPage from "./pages/UsersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rotas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Layout principal */}
        <Route path="/home" element={<Home />}>

          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/create" element={<CreateProductPage />} />
          
          {/* 👇 NOVA ROTA */}
          <Route path="history" element={<HistoryPage />} />
          <Route path="/home/users" element={<UsersPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;