import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderStatus from "./pages/OrderStatus.jsx";
import AdminLogin from "./pages/admin/Login.jsx";
import AdminLayout from "./pages/admin/Layout.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import AdminBankSettings from "./pages/admin/BankSettings.jsx";
import AdminServices from "./pages/admin/Services.jsx";
import AdminPixels from "./pages/admin/Pixels.jsx";
import AdminPricingSettings from "./pages/admin/PricingSettings.jsx";
import AdminPaymentMethods from "./pages/admin/PaymentMethods.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
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
        <Route path="services" element={<AdminServices />} />
        <Route path="bank" element={<AdminBankSettings />} />
        <Route path="pixels" element={<AdminPixels />} />
        <Route path="pricing" element={<AdminPricingSettings />} />
        <Route path="payment-methods" element={<AdminPaymentMethods />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
