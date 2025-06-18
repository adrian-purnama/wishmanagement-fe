import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiHelper from "../../../utils/ApiHelper";
import { UserContext } from "../../../utils/UserContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { setUsername, setIsLoggedin } = useContext(UserContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiHelper.post("/auth/login", form);
      if (res.condition) {
        localStorage.setItem("wish-token", res.token);
        apiHelper.setToken(res.token);
        setUsername(res.username);
        setIsLoggedin(true);
        toast.success("✅ Login successful!");
        navigate("/");
      } else {
        toast.error(res.message || "Login failed.");
      }
    } catch {
      toast.error("🚨 Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-gray-800 shadow-md rounded p-6"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Login</h2>
        <input
          className="block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 mb-3 rounded"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          className="block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 mb-4 rounded"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
