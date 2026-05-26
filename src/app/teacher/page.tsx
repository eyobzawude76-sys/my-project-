"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeacherPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [tab, setTab] = useState("students");
  const [gradeSemester, setGradeSemester] = useState("y1_s1");
  const [gradeForm, setGradeForm] = useState({
    student_id: "",
    assignment: "",
    assignment_total: "30",
    quiz: "",
    quiz_total: "20",
    final: "",
    final_total: "50",
  });

  const getToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    fetchStudents();
    fetchGrades();
  }, []);

  const fetchStudents = async () => {
    const res = await fetch("https://chatroom-going-drew.ngrok-free.dev/teacher/my-students", {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setStudents(Array.isArray(data) ? data : []);
  };

  const fetchGrades = async () => {
    const res = await fetch("https://chatroom-going-drew.ngrok-free.dev/teacher/my-grades", {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setGrades(Array.isArray(data) ? data : []);
  };

  const getTotal = () => {
    return (Number(gradeForm.assignment) || 0) +
           (Number(gradeForm.quiz) || 0) +
           (Number(gradeForm.final) || 0);
  };

  const getMaxTotal = () => {
    return Number(gradeForm.assignment_total) +
           Number(gradeForm.quiz_total) +
           Number(gradeForm.final_total);
  };

  const submitGrade = async () => {
    if (!gradeForm.student_id) {
      alert("Student filadhu!");
      return;
    }

    // Barataa filatame list keessaa baasi
    const selectedStudent = students.find(s => s._id === gradeForm.student_id);

    const assignment = Number(gradeForm.assignment);
    const quiz = Number(gradeForm.quiz);
    const final = Number(gradeForm.final);
    const total = assignment + quiz + final;
    const maxTotal = getMaxTotal();

    if (assignment > Number(gradeForm.assignment_total)) {
      alert(`Assignment qabxiin ${gradeForm.assignment_total} ol ta'uu hin danda'u!`);
      return;
    }
    if (quiz > Number(gradeForm.quiz_total)) {
      alert(`Quiz qabxiin ${gradeForm.quiz_total} ol ta'uu hin danda'u!`);
      return;
    }
    if (final > Number(gradeForm.final_total)) {
      alert(`Final qabxiin ${gradeForm.final_total} ol ta'uu hin danda'u!`);
      return;
    }

    const res = await fetch("https://chatroom-going-drew.ngrok-free.dev/teacher/grades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      // Backend kee waliin akka wal-simuuf id-wwan lamaaninuu dabarsina
      body: JSON.stringify({
        student_id: gradeForm.student_id, 
        user_id: selectedStudent?.user_id || "", 
        score: total,
        max_score: maxTotal,
        assignment_score: assignment,
        quiz_score: quiz,
        final_score: final,
        assessment_type: "full",
        semester: gradeSemester,
        description: `Assignment:${assignment}/${gradeForm.assignment_total}, Quiz:${quiz}/${gradeForm.quiz_total}, Final:${final}/${gradeForm.final_total}`
      }),
    });

    if (res.ok) {
      alert(`✅ Qabxii galmeeffame!\nWaliigala: ${total}/${maxTotal}`);
      setGradeForm({
        student_id: "",
        assignment: "",
        assignment_total: "30",
        quiz: "",
        quiz_total: "20",
        final: "",
        final_total: "50",
      });
      fetchGrades();
    } else {
      const err = await res.json();
      alert("❌ " + (err.detail || "Dogoggora!"));
    }
  };

  const semesterOptions = (
    <>
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
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">👨‍🏫 Teacher Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/change-password")}
            className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-lg text-sm">
            🔐 Password
          </button>
          <button
            onClick={() => { localStorage.clear(); router.push("/login"); }}
            className="bg-white text-green-700 px-4 py-1 rounded-lg text-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-4">
        {["students", "grades", "add-grade"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              tab === t ? "bg-green-600 text-white" : "bg-white text-gray-600 border"
            }`}>
            {t === "students" ? "👨‍🎓 Students" :
             t === "grades" ? "📊 Grades" : "➕ Qabxii"}
          </button>
        ))}
      </div>

      <div className="p-4">

        {/* Students Tab */}
        {tab === "students" && (
          <div>
            <h2 className="font-bold mb-3">Students ({students.length})</h2>
            {students.length === 0 ? (
              <p className="text-gray-500">Student hin jiru</p>
            ) : (
              students.map((s: any) => (
                <div key={s._id} className="bg-white p-3 rounded-xl shadow mb-2">
                  <p className="font-bold">{s.full_name}</p>
                  <p className="text-gray-500 text-sm">
                    Class: {s.class_assigned} | {s.department} | Year: {s.year}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Grades Tab */}
        {tab === "grades" && (
          <div>
            <h2 className="font-bold mb-3">Grades ({grades.length})</h2>
            {grades.length === 0 ? (
              <p className="text-gray-500">Grade hin jiru</p>
            ) : (
              grades.map((g: any) => {
                const student = students.find(s =>
                  s._id === g.student_id || s.user_id === g.student_id
                );
                return (
                  <div key={g._id} className="bg-white p-3 rounded-xl shadow mb-2">
                    <p className="font-bold">
                      {student ? student.full_name : g.student_id}
                    </p>
                    <p className="text-gray-600">
                      Waliigala: {g.score}/{g.max_score || 100}
                    </p>
                    <p className="text-gray-500 text-sm">{g.description}</p>
                    <p className="text-gray-500 text-sm">
                      📅 Semester: {g.semester || "-"}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      g.status === "approved" ? "bg-green-100 text-green-600" :
                      g.status === "rejected" ? "bg-red-100 text-red-600" :
                      "bg-yellow-100 text-yellow-600"}`}>
                      {g.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Add Grade Tab */}
        {tab === "add-grade" && (
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-bold mb-4">➕ Qabxii Galmeessi</h2>

            {/* Student */}
            <div className="mb-4">
              <label className="block text-gray-600 mb-1 font-semibold">👨‍🎓 Student</label>
              <select
                value={gradeForm.student_id}
                onChange={(e) => setGradeForm({ ...gradeForm, student_id: e.target.value })}
                className="w-full border rounded-lg p-2">
                <option value="">Student filadhu</option>
                {students.map((s: any) => (
                  <option key={s._id} value={s._id}>
                    {s.full_name} - Class {s.class_assigned}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div className="mb-4">
              <label className="block text-gray-600 mb-1 font-semibold">📅 Semester</label>
              <select
                value={gradeSemester}
                onChange={(e) => setGradeSemester(e.target.value)}
                className="w-full border rounded-lg p-2">
                {semesterOptions}
              </select>
            </div>

            {/* Assignment */}
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <label className="block text-blue-700 font-bold mb-2">
                📝 Assignment (/{gradeForm.assignment_total})
              </label>
              <div className="flex gap-2">
                <input type="number" placeholder="Qabxii"
                  value={gradeForm.assignment}
                  onChange={(e) => setGradeForm({ ...gradeForm, assignment: e.target.value })}
                  className="w-2/3 border rounded-lg p-2" />
                <input type="number" placeholder="Max"
                  value={gradeForm.assignment_total}
                  onChange={(e) => setGradeForm({ ...gradeForm, assignment_total: e.target.value })}
                  className="w-1/3 border rounded-lg p-2" />
              </div>
            </div>

            {/* Quiz */}
            <div className="bg-purple-50 p-3 rounded-lg mb-3">
              <label className="block text-purple-700 font-bold mb-2">
                📋 Quiz (/{gradeForm.quiz_total})
              </label>
              <div className="flex gap-2">
                <input type="number" placeholder="Qabxii"
                  value={gradeForm.quiz}
                  onChange={(e) => setGradeForm({ ...gradeForm, quiz: e.target.value })}
                  className="w-2/3 border rounded-lg p-2" />
                <input type="number" placeholder="Max"
                  value={gradeForm.quiz_total}
                  onChange={(e) => setGradeForm({ ...gradeForm, quiz_total: e.target.value })}
                  className="w-1/3 border rounded-lg p-2" />
              </div>
            </div>

            {/* Final */}
            <div className="bg-red-50 p-3 rounded-lg mb-4">
              <label className="block text-red-700 font-bold mb-2">
                📚 Final Exam (/{gradeForm.final_total})
              </label>
              <div className="flex gap-2">
                <input type="number" placeholder="Qabxii"
                  value={gradeForm.final}
                  onChange={(e) => setGradeForm({ ...gradeForm, final: e.target.value })}
                  className="w-2/3 border rounded-lg p-2" />
                <input type="number" placeholder="Max"
                  value={gradeForm.final_total}
                  onChange={(e) => setGradeForm({ ...gradeForm, final_total: e.target.value })}
                  className="w-1/3 border rounded-lg p-2" />
              </div>
            </div>

            {/* Total Preview */}
            <div className="bg-green-50 p-3 rounded-lg mb-4 text-center">
              <p className="text-green-700 font-bold text-lg">
                Waliigala: {getTotal()}/{getMaxTotal()}
              </p>
              <p className="text-gray-500 text-sm">
                Assignment: {gradeForm.assignment || 0}/{gradeForm.assignment_total} |
                Quiz: {gradeForm.quiz || 0}/{gradeForm.quiz_total} |
                Final: {gradeForm.final || 0}/{gradeForm.final_total}
              </p>
            </div>

            <button onClick={submitGrade}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold">
              ✅ Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}