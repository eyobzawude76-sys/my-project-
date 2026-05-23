"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [tab, setTab] = useState("registrations");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);

  const [newTeacher, setNewTeacher] = useState({
    full_name: "",
    email: "",
    password: "",
    department: "",
    level: "",
    year: 1,
  });

  const getToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("token") || "";
    return "";
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };

  useEffect(() => {
    fetchRegistrations();
    fetchCourses();
    fetchTeachers();
    fetchAllCourses();
  }, []);

  const fetchRegistrations = async () => {
    const res = await fetch(
      "https://new-backend-ev58.onrender.com/admin/registrations?status=pending",
      { headers }
    );
    const data = await res.json();
    setRegistrations(Array.isArray(data) ? data : []);
  };

  const fetchCourses = async () => {
    const res = await fetch("https://new-backend-ev58.onrender.com/admin/courses", { headers });
    const data = await res.json();
    setCourses(Array.isArray(data) ? data : []);
  };

  const fetchTeachers = async () => {
    const res = await fetch("https://new-backend-ev58.onrender.com/admin/teachers", { headers });
    const data = await res.json();
    setTeachers(Array.isArray(data) ? data : []);
  };

  const fetchAllCourses = async () => {
    const res = await fetch("https://new-backend-ev58.onrender.com/public/courses");
    const data = await res.json();
    setAllCourses(Array.isArray(data) ? data : []);
    const depts = [...new Set(data.map((c: any) => c.department))] as string[];
    setDepartments(depts);
  };

  const approveStudent = async (id: string, classAssigned: string) => {
    await fetch(
      `https://new-backend-ev58.onrender.com/admin/registrations/${id}/approve?class_assigned=${classAssigned}`,
      { method: "PATCH", headers }
    );
    setShowModal(false);
    fetchRegistrations();
  };

  const rejectStudent = async (id: string) => {
    if (!rejectReason) { alert("Sababaa galchi!"); return; }
    await fetch(
      `https://new-backend-ev58.onrender.com/admin/registrations/${id}/reject?reason=${rejectReason}`,
      { method: "PATCH", headers }
    );
    setShowModal(false);
    setRejectReason("");
    fetchRegistrations();
  };

  const createTeacher = async () => {
    if (!newTeacher.full_name || !newTeacher.email || !newTeacher.password ||
        !newTeacher.department || !newTeacher.level) {
      alert("Dirreewwan hunda guuti!");
      return;
    }

    const res = await fetch("https://new-backend-ev58.onrender.com/admin/teachers", {
      method: "POST",
      headers,
      body: JSON.stringify(newTeacher),
    });

    const data = await res.json();
    if (res.ok) {
      alert(`✅ Teacher uumame! Course: ${data.course_id}`);
      setNewTeacher({ full_name: "", email: "", password: "", department: "", level: "", year: 1 });
      fetchTeachers();
    } else {
      alert("❌ " + (data.detail || "Dogoggora!"));
    }
  };

  const handleLevelChange = (level: string) => {
    setNewTeacher({ ...newTeacher, level, department: "", year: 1 });
    const depts = [...new Set(
      allCourses.filter((c) => c.level === level).map((c) => c.department)
    )] as string[];
    setDepartments(depts);
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
          className="bg-white text-blue-700 px-4 py-1 rounded-lg text-sm">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {["registrations", "teachers", "courses"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap ${
              tab === t ? "bg-blue-600 text-white" : "bg-white text-gray-600 border"
            }`}>
            {t === "registrations" ? "📋 Students" :
             t === "teachers" ? "👨‍🏫 Teachers" : "📚 Courses"}
          </button>
        ))}
      </div>

      <div className="p-4">

        {/* ── REGISTRATIONS TAB ── */}
        {tab === "registrations" && (
          <div>
            <h2 className="text-lg font-bold mb-4">
              Pending Registrations ({registrations.length})
            </h2>
            {registrations.length === 0 ? (
              <p className="text-gray-500">Pending hin jiru</p>
            ) : (
              registrations.map((reg: any) => (
                <div key={reg._id} className="bg-white p-4 rounded-xl shadow mb-3">
                  <p className="font-bold text-lg">{reg.full_name}</p>
                  <div className="grid grid-cols-2 gap-1 text-sm text-gray-600 mt-1 mb-3">
                    <p>📧 {reg.email}</p>
                    <p>📱 {reg.phone}</p>
                    <p>🪪 {reg.national_id}</p>
                    <p>🎓 {reg.level}</p>
                    <p>📚 {reg.course_name || reg.course_id}</p>
                    <p>⏰ {reg.session}</p>
                    <p>🏫 {reg.department}</p>
                    <p>📅 Year {reg.year}</p>
                  </div>

                  {/* Documents */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="font-semibold text-gray-700 mb-2">📁 Documents:</p>
                    <div className="flex gap-2 flex-wrap">
                      {reg.national_id_photo ? (
                        <a href={`https://new-backend-ev58.onrender.com/${reg.national_id_photo.replace(/\\/g, '/')}`}
                          target="_blank"
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">
                          🪪 National ID
                        </a>
                      ) : null}
                      {reg.grade12_result ? (
                        <a href={`https://new-backend-ev58.onrender.com/${reg.grade12_result.replace(/\\/g, '/')}`}
                          target="_blank"
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">
                          📄 Kutaa 12
                        </a>
                      ) : null}
                      {reg.bank_receipt ? (
                        <a href={`https://new-backend-ev58.onrender.com/${reg.bank_receipt.replace(/\\/g, '/')}`}
                          target="_blank"
                          className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm">
                          🏦 Bank Receipt
                        </a>
                      ) : null}
                      {!reg.national_id_photo && !reg.grade12_result && !reg.bank_receipt && (
                        <p className="text-red-500 text-sm">⚠️ Documents hin upload godhamin</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {["A", "B", "C"].map((cls) => (
                      <button key={cls}
                        onClick={() => approveStudent(reg._id, cls)}
                        className={`text-white px-3 py-1 rounded-lg text-sm ${
                          cls === "A" ? "bg-green-500" :
                          cls === "B" ? "bg-blue-500" : "bg-purple-500"
                        }`}>
                        ✅ Class {cls}
                      </button>
                    ))}
                    <button
                      onClick={() => { setSelectedStudent(reg); setShowModal(true); }}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm">
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TEACHERS TAB ── */}
        {tab === "teachers" && (
          <div>
            {/* Teacher Uumi */}
            <div className="bg-white p-4 rounded-xl shadow mb-4">
              <h2 className="font-bold mb-4">➕ Teacher Haaraa Uumi</h2>

              <div className="mb-3">
                <label className="block text-gray-600 mb-1 font-semibold">👤 Maqaa</label>
                <input placeholder="Maqaa guutuu"
                  value={newTeacher.full_name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, full_name: e.target.value })}
                  className="w-full border rounded-lg p-2" />
              </div>

              <div className="mb-3">
                <label className="block text-gray-600 mb-1 font-semibold">📧 Email</label>
                <input placeholder="email@university.com"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  className="w-full border rounded-lg p-2" />
              </div>

              <div className="mb-3">
                <label className="block text-gray-600 mb-1 font-semibold">🔐 Password</label>
                <input type="password" placeholder="Password"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  className="w-full border rounded-lg p-2" />
              </div>

              <div className="mb-3">
                <label className="block text-gray-600 mb-1 font-semibold">🎓 Sadarkaa</label>
                <select value={newTeacher.level}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="w-full border rounded-lg p-2">
                  <option value="">Filadhu</option>
                  <option value="degree">Degree</option>
                  <option value="diploma">Diploma</option>
                </select>
              </div>

              {newTeacher.level && (
                <div className="mb-3">
                  <label className="block text-gray-600 mb-1 font-semibold">🏫 Department</label>
                  <select value={newTeacher.department}
                    onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
                    className="w-full border rounded-lg p-2">
                    <option value="">Department filadhu</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {newTeacher.department && (
                <div className="mb-4">
                  <label className="block text-gray-600 mb-1 font-semibold">📅 Year</label>
                  <select value={newTeacher.year}
                    onChange={(e) => setNewTeacher({ ...newTeacher, year: Number(e.target.value) })}
                    className="w-full border rounded-lg p-2">
                    {[1, 2, 3, 4, 5].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Course Preview */}
              {newTeacher.department && newTeacher.level && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-blue-700 font-semibold text-sm">
                    📚 Course: {newTeacher.department} - Year {newTeacher.year}
                    {allCourses.find(c =>
                      c.department === newTeacher.department &&
                      c.level === newTeacher.level &&
                      c.year === newTeacher.year
                    ) ? ` (${allCourses.find(c =>
                      c.department === newTeacher.department &&
                      c.level === newTeacher.level &&
                      c.year === newTeacher.year
                    )?.code})` : " - Course hin argamne!"}
                  </p>
                </div>
              )}

              <button onClick={createTeacher}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">
                ✅ Teacher Uumi
              </button>
            </div>

            {/* Teachers List */}
            <h2 className="font-bold mb-3">👨‍🏫 Teachers ({teachers.length})</h2>
            {teachers.length === 0 ? (
              <p className="text-gray-500">Teacher hin jiru</p>
            ) : (
              teachers.map((t: any) => (
                <div key={t._id} className="bg-white p-3 rounded-xl shadow mb-2">
                  <p className="font-bold">{t.full_name}</p>
                  <p className="text-gray-500 text-sm">📧 {t.email}</p>
                  <p className="text-gray-500 text-sm">
                    📚 {t.department} | Year {t.year} | Course: {t.course_id}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── COURSES TAB ── */}
        {tab === "courses" && (
          <div>
            <h2 className="font-bold mb-3">📚 Courses ({courses.length})</h2>
            {courses.map((c: any) => (
              <div key={c._id} className="bg-white p-3 rounded-xl shadow mb-2">
                <p className="font-bold">{c.name}</p>
                <p className="text-gray-500 text-sm">
                  Code: {c.code} | Level: {c.level} | Year: {c.year}
                </p>
                <p className="text-gray-500 text-sm">
                  Teacher: {c.teacher_id ? "✅ Assigned" : "❌ Hin jiru"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md mx-4">
            <h2 className="font-bold text-lg mb-2">❌ Reject Godhi</h2>
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">{selectedStudent.full_name}</span> reject godhuu barbaaddaa?
            </p>
            <textarea
              placeholder="Sababaa reject ibsi..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4 h-24" />
            <div className="flex gap-2">
              <button onClick={() => rejectStudent(selectedStudent._id)}
                className="w-1/2 bg-red-500 text-white py-2 rounded-lg font-semibold">
                ❌ Reject
              </button>
              <button onClick={() => { setShowModal(false); setRejectReason(""); }}
                className="w-1/2 bg-gray-200 text-gray-600 py-2 rounded-lg">
                Haqarsi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}