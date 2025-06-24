import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../utils/UserContext";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import apiHelper from "../utils/ApiHelper";
import PurchasePage from "./pages/purchase/PurchasePage";
import HomePage from "./pages/home/HomePage";
import SalePage from "./pages/purchase/SalePage";
import ItemPage from "./pages/item/ItemPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import TikTokPage from "./pages/dashboard/TiktokPage";

function App() {
  const { setUsername, setIsLoggedin } = useContext(UserContext);
  const [checked, setChecked] = useState(false);

useEffect(() => {
  const token = localStorage.getItem("wish-token");
  if (token) apiHelper.setToken(token);
  if (!token) {
    setChecked(true);
    return;
  }

  apiHelper
    .post("/auth/check-auth", { token })
    .then((res) => {
      if (res.condition) {
        setUsername(res.username);
        setIsLoggedin(true);
      }
    })
    .catch((err) => {
      const status = err?.response?.status;
      if (status === 401) {
        localStorage.removeItem("wish-token");
      }
    })
    .finally(() => setChecked(true));
}, []);


  if (!checked) return <div>Loading...</div>;

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/purchase" element={<PurchasePage />} />
        <Route path="/sale" element={<SalePage />} />
        <Route path="/item" element={<ItemPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tiktok" element={<TikTokPage />} />
      </Routes>
    </>
  );
}

export default App;
