import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("admin@gatepass.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        console.log("email,password",email, password);
      const success = await login(email, password);
      console.log("token==========>",success)
      if (success) {
        localStorage.setItem("token", success);
        navigate("/dashboard");
      } else {
        toast.error("Invalid email or password");
      }
    } catch {
      toast.error("Login failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <section className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gate Pass System</h1>
          <p className="text-gray-600 mt-2">Visitor Management System</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600 space-y-2">
          
          
          
          <p className="font-semibold">Demo Credentials:</p>
         <button onClick={()=>{
          setPassword("admin123");
          setEmail("admin@gatepass.com");
         }}> <p>Admin: admin@gatepass.com / admin123</p></button>
          <button onClick={()=>{
          setPassword("guard123");
          setEmail("guard@gatepass.com");
         }}><p>Guard: guard@gatepass.com / guard123</p></button>
          <button onClick={()=>{
          setPassword("resident123");
          setEmail("resident@gatepass.com");
         }}><p>Resident: resident@gatepass.com / resident123</p></button>
        </div>
      </section>
    </div>
  );
};

export default Login;