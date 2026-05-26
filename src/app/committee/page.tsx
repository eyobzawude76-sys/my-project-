"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CommitteePage() {
  const router = useRouter();
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  // Hanga backend kee waliin wal simutti "y1_s1" goonee kaana
  const [semester, setSemester] = useState("y1_s1"); 
  const [calculating, setCalculating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || "";
    }
    return "";
  };

  useEffect(() => {
    const t = getToken();
    if (!t) { router.push("/login"); return; }
    fetchGrades();
    fetchStudents();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await fetch(
        "https://chatroom-going-drew.ngrok-free.dev/committee/pending-grades",
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      setGrades(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(
        "https://chatroom-going-drew.ngrok-free.dev/committee/all-students",
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  // Koomiteen yeroo eeyyamu (Approve) dabatumaan backend irratti calculate godha
  const approveGrade = async (id: string) => {
    try {
      const res = await fetch(`https://chatroom-going-drew.ngrok-free.dev/committee/grades/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        alert("✅ Qabxiin ragga'ee jira, result calculated!");
        fetchGrades();
        fetchStudents(); // Ragaa haaraa fidi
      }
    } catch (e) {
      console.error(e);
    }
  };

  const rejectGrade = async (id: string) => {
    const reason = prompt("Sababaa reject:");
    if (!reason) return;
    await fetch(
      `https://chatroom-going-drew.ngrok-free.dev/committee/grades/${id}/reject?reason=${reason}`,
      { method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` } }
    );
    fetchGrades();
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    setSelectedStudent(student || null);
  };

  // Button Calclulate sun backend irraa endpoint haaraa ijaaruun mannaa,
  // Grade tokko approve gochuun koodii backend kee isa ijaarre waliin akka deemu gooneera.
  const calculateResult = async () => {
    if (!selectedStudent) {
      alert("Student filadhu!");
      return;
    }
    if (!semester) {
      alert("Semester filadhu!");
      return;
    }

    setCalculating(true);
    setSuccessMsg("");

    try {
      // Barataa kanaaf grade pending ta'e barbaadi
      const student_id = selectedStudent.user_id || selectedStudent._id;
      const studentGrade = grades.find(g => g.student_id === student_id);

      if (!studentGrade) {
        alert("❌ Barataa kanaaf qabxiin 'Pending' ta'e hin argamne! Dursa barsiisaan galmeessu qaba.");
        setCalculating(false);
        return;
      }

      // Backend irratti daandii approve kee san waama
      const res = await fetch(
        `https://chatroom-going-drew.ngrok-free.dev/committee/grades/${studentGrade._id}/approve`,
        { method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` } }
      );

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`✅ ${selectedStudent.full_name} — Qabxiin ragga'ee jira, barataaf ni mul'ata!`);
        setSelectedStudent(null);
        fetchGrades();
        fetchStudents();
      } else {
        alert("❌ " + (data.detail || "Dogoggora!"));
      }
    } catch (e) {
      alert("❌ Server waliin hin dubbanne!");
    } finally {
      setCalculating(false);
    }
  };

  // Students year irratti sort godhi
  const sortedStudents = [...students].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.class_assigned < b.class_assigned) return -1;
    if (a.class_assigned > b.class_assigned) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">👥 Committee Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/change-password")}
            className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-lg text-sm">
            🔐 Password
          </button>
          <button
            onClick={() => { localStorage.clear(); router.push("/login"); }}
            className="bg-white text-purple-700 px-4 py-1 rounded-lg text-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="p-4">

        {/* ── Pending Grades ── */}
        <h2 className="font-bold mb-3">⏳ Pending Grades ({grades.length})</h2>
        {grades.length === 0 ? (
          <p className="text-gray-500 mb-6">Pending hin jiru</p>
        ) : (
          grades.map((g: any) => {
            const student = students.find(s =>
              s._id === g.student_id || s.user_id === g.student_id
            );
            return (
              <div key={g._id} className="bg-white p-4 rounded-xl shadow mb-3 border-l-4 border-purple-500">
                <div className="bg-purple-50 p-2 rounded-lg mb-3">
                  <p className="font-bold text-purple-800">
                    👨‍🎓 {student ? student.full_name : "Loading..."}
                  </p>
                  <div className="flex gap-4 text-sm text-purple-600">
                    <span>🏫 Class: {student ? student.class_assigned : "-"}</span>
                    <span>📚 {student ? student.department : "-"}</span>
                    <span>📅 Year: {student ? student.year : "-"}</span>
                  </div>
                </div>
                <p className="font-bold">Waliigala: {g.score}/{g.max_score || 100}</p>
                {g.description && (
                  <p className="text-gray-500 text-sm">{g.description}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => approveGrade(g._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    ✅ Approve
                  </button>
                  <button onClick={() => rejectGrade(g._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    ❌ Reject
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* ── Final Result Calculate ── */}
        <div className="bg-white p-4 rounded-xl shadow mt-4">
          <h2 className="font-bold mb-4">🧮 Final Result Calculate</h2>

          {successMsg && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 font-semibold">
              {successMsg}
            </div>
          )}

          {/* Student Dropdown */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1 font-semibold">
              👨‍🎓 Student Filadhu
            </label>
            <select
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full border rounded-lg p-2">
              <option value="">Student filadhu...</option>
              {sortedStudents.map((s: any) => (
                <option key={s._id} value={s._id}>
                  {s.full_name} | {s.department} | Year {s.year} | Class {s.class_assigned}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Student Info */}
          {selectedStudent && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="font-bold text-blue-800">{selectedStudent.full_name}</p>
              <div className="text-sm text-blue-600 mt-1">
                <p>📚 Course: {selectedStudent.course_name} ({selectedStudent.course_id})</p>
                <p>🏫 Department: {selectedStudent.department} | Year: {selectedStudent.year}</p>
                <p>⏰ Session: {selectedStudent.session} | Class: {selectedStudent.class_assigned}</p>
              </div>
            </div>
          )}

          {/* Semester */}
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full border rounded-lg p-2 mb-4">
            <option value="">Semester filadhu</option>
            <optgroup label="Year 1">
              <option value="y1_s1">Year 1 - Semester 1</option>
              <option value="y1_s2">Year 1 - Semester 2</option>
            </optgroup>
            <optgroup label="Year 2">
              <option value="y2_s1">Year 2 - Semester 1</option>
              <option value="y2_s2">Year 2 - Semester 2</option>
            </optgroup>
            <optgroup label="Year 3">
              <option value="y3_s1">Year 3 - Semester 1</option>
              <option value="y3_s2">Year 3 - Semester 2</option>
            </optgroup>
            <optgroup label="Year 4">
              <option value="y4_s1">Year 4 - Semester 1</option>
              <option value="y4_s2">Year 4 - Semester 2</option>
            </optgroup>
            <optgroup label="Year 5">
              <option value="y5_s1">Year 5 - Semester 1</option>
              <option value="y5_s2">Year 5 - Semester 2</option>
            </optgroup>
          </select>

          <button
            onClick={calculateResult}
            disabled={calculating || !selectedStudent}
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50">
            {calculating ? "Calculating..." : "🧮 Calculate"}
          </button>
        </div>
      </div>
    </div>
  );
}