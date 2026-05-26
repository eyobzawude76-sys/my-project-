"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const getToken = () => localStorage.getItem("token") || "";
  const getRole = () => localStorage.getItem("role") || "";

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!form.old_password || !form.new_password || !form.confirm_password) {
      setError("Dirreewwan hunda guuti!");
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setError("Password haaraa wal hin simne!");
      return;
    }

    if (form.new_password.length < 6) {
      setError("Password haaraa character 6 ol ta'uu qaba!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://new-backend-ev58.onrender.com/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          old_password: form.old_password,
          new_password: form.new_password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("✅ Password milkiin jijjiirrame!");
        setForm({ old_password: "", new_password: "", confirm_password: "" });
        setTimeout(() => {
          const role = getRole();
          if (role === "admin") router.push("/admin");
          else if (role === "teacher") router.push("/teacher");
          else if (role === "committee") router.push("/committee");
          else router.push("/student");
        }, 2000);
      } else {
        setError(data.detail || "Dogoggora!");
      }
    } catch {
      setError("Server waliin hin dubbanne!");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const role = getRole();
    if (role === "admin") router.push("/admin");
    else if (role === "teacher") router.push("/teacher");
    else if (role === "committee") router.push("/committee");
    else router.push("/student");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          🔐 Password Jijjiiri
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Password haaraa galchi
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Old Password */}
        <div className="mb-4">
          <label className="block text-gray-600 mb-1 font-semibold">
            🔑 Password Durii
          </label>
          <input type="password"
            placeholder="Password duraa galchi"
            value={form.old_password}
            onChange={(e) => setForm({ ...form, old_password: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500" />
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-gray-600 mb-1 font-semibold">
            🔐 Password Haaraa
          </label>
          <input type="password"
            placeholder="Password haaraa galchi"
            value={form.new_password}
            onChange={(e) => setForm({ ...form, new_password: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500" />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-gray-600 mb-1 font-semibold">
            ✅ Password Haaraa Mirkaneessi
          </label>
          <input type="password"
            placeholder="Password haaraa irra deebi'i galchi"
            value={form.confirm_password}
            onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500" />
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3">
          {loading ? "Loading..." : "🔐 Jijjiiri"}
        </button>

        <button onClick={handleBack}
          className="w-full bg-gray-200 text-gray-600 py-2 rounded-lg text-sm">
          ← Duubatti
        </button>
      </div>
    </div>
  );
}