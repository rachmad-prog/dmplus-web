import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderStatus from "./pages/OrderStatus.jsx";
import AdminLogin from "./pages/admin/Login.jsx";
import AdminLayout from "./pages/admin/Layout.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import AdminBankSettings from "./pages/admin/BankSettings.jsx";
import AdminPixels from "./pages/admin/Pixels.jsx";
import NotFound from "./pages/NotFound.jsx";
import { api } from "./lib/api.js";
import { injectPixels } from "./lib/injectPixels.js";

export default function App() {
  useEffect(() => {
    api.getPixels().then(injectPixels).catch(() => {});
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/checkout/:slug" element={<Checkout />} />
      <Route path="/status/:invoiceNumber" element={<OrderStatus />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOrders />} />
        <Route path="bank" element={<AdminBankSettings />} />
        <Route path="pixels" element={<AdminPixels />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
