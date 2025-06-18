import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiHelper from "../../../utils/ApiHelper";
import { UserContext } from "../../../utils/UserContext";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const { setUsername, setIsLoggedin } = useContext(UserContext);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiHelper.post("/auth/register", form);
      if (res.condition) {
        localStorage.setItem("wish-token", res.token);
        apiHelper.setToken(res.token);
        setUsername(res.username);
        setIsLoggedin(true);
        toast.success("🎉 Registration successful!");
        navigate("/");
      } else {
        toast.error(res.message || "Registration failed.");
      }
    } catch {
      toast.error("🚨 Registration failed. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <input
        className="block w-full border p-2 mb-3"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
      />
      <input
        className="block w-full border p-2 mb-3"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />
      <input
        className="block w-full border p-2 mb-3"
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Register
      </button>
      <h1 className="font-bold text-red-400">Registration is closed, contact Administrator for further info</h1>
    </form>
  );
};

export default RegisterPage;
