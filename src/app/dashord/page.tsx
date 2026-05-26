"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tab, setTab] = useState("registrations");
  const [loading, setLoading] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "", code: "", teacher_id: ""
  });

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token") : "";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchRegistrations();
    fetchCourses();
  }, []);

  const fetchRegistrations = async () => {
    const res = await fetch(
      "https://chatroom-going-drew.ngrok-free.dev/admin/registrations?status=pending",
      { headers }
    );
    const data = await res.json();
    setRegistrations(data);
  };

  const fetchCourses = async () => {
    const res = await fetch("https://chatroom-going-drew.ngrok-free.dev/admin/courses", { headers });
    const data = await res.json();
    setCourses(data);
  };

  const approveStudent = async (id: string, classAssigned: string) => {
    await fetch(
      `https://chatroom-going-drew.ngrok-free.dev/admin/registrations/${id}/approve?class_assigned=${classAssigned}`,
      { method: "PATCH", headers }
    );
    fetchRegistrations();
  };

  const rejectStudent = async (id: string) => {
    const reason = prompt("Sababaa reject:");
    if (!reason) return;
    await fetch(
      `https://chatroom-going-drew.ngrok-free.dev/admin/registrations/${id}/reject?reason=${reason}`,
      { method: "PATCH", headers }
    );
    fetchRegistrations();
  };

  const createCourse = async () => {
    await fetch("https://chatroom-going-drew.ngrok-free.dev/admin/courses", {
      method: "POST",
      headers,
      body: JSON.stringify(newCourse),
    });
    setNewCourse({ name: "", code: "", teacher_id: "" });
    fetchCourses();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🎓 Admin Dashboard</h1>
         <button onClick={()=>router.push("/change-password")}
         className="bg-yellow-900 px-3 py-1 rounded-lg text-sm mr-2">
        Chenge-Password
        </button>
        <button
          onClick={() => { localStorage.clear(); router.push("/login"); }}
          className="bg-white text-blue-700 px-4 py-1 rounded-lg text-sm"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4">
        {["registrations", "courses"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-semibold capitalize ${
              tab === t
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border"
            }`}
          >
            {t === "registrations" ? "📋 Students" : "📚 Courses"}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* Registrations Tab */}
        {tab === "registrations" && (
          <div>
            <h2 className="text-lg font-bold mb-4">
              Pending Registrations ({registrations.length})
            </h2>
            {registrations.length === 0 ? (
              <p className="text-gray-500">Pending hin jiru</p>
            ) : (
              registrations.map((reg: any) => (
                <div
                  key={reg._id}
                  className="bg-white p-4 rounded-xl shadow mb-3"
                >
                  <p className="font-bold text-lg">{reg.full_name}</p>
                  <p className="text-gray-500 text-sm">{reg.email}</p>
                  <p className="text-gray-500 text-sm">
                    Course: {reg.course_id} | Dept: {reg.department}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approveStudent(reg._id, "A")}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      ✅ Approve Class A
                    </button>
                    <button
                      onClick={() => approveStudent(reg._id, "B")}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      ✅ Approve Class B
                    </button>
                    <button
                      onClick={() => rejectStudent(reg._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Courses Tab */}
        {tab === "courses" && (
          <div>
            <div className="bg-white p-4 rounded-xl shadow mb-4">
              <h2 className="font-bold mb-3">➕ Course Haaraa Uumi</h2>
              <input
                placeholder="Course Maqaa"
                value={newCourse.name}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, name: e.target.value })
                }
                className="w-full border rounded-lg p-2 mb-2"
              />
              <input
                placeholder="Course Code"
                value={newCourse.code}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, code: e.target.value })
                }
                className="w-full border rounded-lg p-2 mb-2"
              />
              <input
                placeholder="Teacher ID"
                value={newCourse.teacher_id}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, teacher_id: e.target.value })
                }
                className="w-full border rounded-lg p-2 mb-3"
              />
              <button
                onClick={createCourse}
                className="w-full bg-blue-600 text-white py-2 rounded-lg"
              >
                Uumi
              </button>
            </div>

            <h2 className="font-bold mb-3">📚 Courses ({courses.length})</h2>
            {courses.map((c: any) => (
              <div key={c._id} className="bg-white p-3 rounded-xl shadow mb-2">
                <p className="font-bold">{c.name}</p>
                <p className="text-gray-500 text-sm">Code: {c.code}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}