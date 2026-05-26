"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const formData=new URLSearchParams();
  
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await fetch("https://chatroom-going-drew.ngrok-free.dev/auth/login", {
        method: "POST",
        headers:{"Content-Type":"application/x-www-form-urlencoded",},
        credentials:"include",
        body: formData.toString(),
    });


      const data = await res.json();

      if (!res.ok) {
        setError("Email ykn password dogoggora!");
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);

      if (data.role === "admin") router.push("/admin");
      else if (data.role === "teacher") router.push("/teacher");
      else if (data.role === "committee") router.push("/committee");
      else router.push("/student");

    } catch (err) {
      setError("Server waliin hin dubbanne!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">
          🎓 University System
        </h1>
        <p className="text-center text-gray-500 mb-6">Login godhi</p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:border-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:outline-none focus:border-blue-500"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <p className="text-center text-gray-500 mt-4 text-sm">
          Barataa haaraa?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Galmaa'i
          </a>
        </p>
      </div>
    </div>
  );
}