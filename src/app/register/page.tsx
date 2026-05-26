"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [registeredToken, setRegisteredToken] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    national_id: "",
    department: "",
    course_id: "",
    course_name: "",
    level: "",
    session: "",
    semester: "semester_1",
    year: 1,
  });

  const [files, setFiles] = useState<{
    national_id_photo: File | null;
    grade12_result: File | null;
    bank_receipt: File | null;
  }>({
    national_id_photo: null,
    grade12_result: null,
    bank_receipt: null,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("https://chatroom-going-drew.ngrok-free.dev/public/courses");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  // Level yoo jijjiiramu departments filter godhi
  const handleLevelChange = (level: string) => {
    setForm({ ...form, level, department: "", course_id: "", course_name: "", year: 1 });
    const depts = [...new Set(
      courses
        .filter((c) => c.level === level)
        .map((c) => c.department)
    )] as string[];
    setDepartments(depts);
  };

  // Department yoo jijjiiramu course_id automatically set godhi
  const handleDepartmentChange = (dept: string) => {
    const course = courses.find(
      (c) => c.department === dept && c.level === form.level && c.year === form.year
    );
    setForm({
      ...form,
      department: dept,
      course_id: course ? course.code : "",
      course_name: course ? course.name : dept,
    });
  };

  // Year yoo jijjiiramu course_id automatically update godhi
  const handleYearChange = (year: number) => {
    const course = courses.find(
      (c) => c.department === form.department && c.level === form.level && c.year === year
    );
    setForm({
      ...form,
      year,
      course_id: course ? course.code : "",
      course_name: course ? course.name : form.department,
    });
  };

  const handleStep1 = async () => {
    setLoading(true);
    setError("");

    if (!form.full_name || !form.email || !form.password ||
        !form.phone || !form.national_id || !form.department ||
        !form.level || !form.session) {
      setError("Dirreewwan hunda guuti!");
      setLoading(false);
      return;
    }

    try {
      const userRes = await fetch("https://chatroom-going-drew.ngrok-free.dev/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          role: "student",
        }),
      });

      if (!userRes.ok) {
        const err = await userRes.json();
        setError(err.detail || "Account uumuu hin dandeenye!");
        setLoading(false);
        return;
      }

      const userData = await userRes.json();

      const stuRes = await fetch("https://chatroom-going-drew.ngrok-free.dev/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          national_id: form.national_id,
          department: form.department,
          course_id: form.course_id,
          course_name: form.course_name,
          level: form.level,
          session: form.session,
          semester: form.semester,
          year: form.year,
          user_id: userData.id,
        }),
      });

      if (!stuRes.ok) {
        setError("Registration hin hojjetne!");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("username", form.email);
      formData.append("password", form.password);
      const loginRes = await fetch("https://chatroom-going-drew.ngrok-free.dev/auth/login", {
        method: "POST",
        body: formData,
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        setRegisteredToken(loginData.access_token);
      }

      setStep(2);
    } catch {
      setError("Server waliin hin dubbanne!");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    setLoading(true);
    setError("");

    if (!files.national_id_photo || !files.grade12_result || !files.bank_receipt) {
      setError("Files sadanuu upload godhi!");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("national_id_photo", files.national_id_photo);
      formData.append("grade12_result", files.grade12_result);
      formData.append("bank_receipt", files.bank_receipt);

      const res = await fetch(
        `https://chatroom-going-drew.ngrok-free.dev/student/upload-documents?email=${encodeURIComponent(form.email)}`,
        { method: "POST", body: formData }
      );

      if (res.ok) {
        alert("✅ Galmaa'uu fi documents hunda milkaa'inaan ergameera! document kee yeroo ammaa sakatta'amaa jira sa'aatii 24 keessatti  deebiin isaa  email kee irratti siif ergamma email kee keessatti sanduuqa spam hordofi.");
        router.push("/login");
      } else {
        setError("Documents upload hin hojjetne!");
      }
    } catch {
      setError("Server waliin hin dubbanne!");
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center py-10">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">

        <h1 className="text-2xl font-bold text-blue-700 mb-2 text-center">
          🎓 Student Registration
        </h1>

        {/* Steps */}
        <div className="flex justify-center gap-4 mb-6">
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
            step === 1 ? "bg-blue-600 text-white" : "bg-green-500 text-white"}`}>
            {step === 1 ? "1" : "✅"} Maalummaa
          </div>
          <div className="flex items-center text-gray-400">→</div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
            step === 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
            2 Documents
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-1 font-semibold">👤 Maqaa Guutuu</label>
              <input type="text" placeholder="Maqaa fi Abba maqaa"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 mb-1 font-semibold">📧 Email</label>
              <input type="email" placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 mb-1 font-semibold">🔐 Password</label>
              <input type="password" placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 mb-1 font-semibold">📱 Bilbila</label>
              <input type="text" placeholder="09xxxxxxxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 mb-1 font-semibold">🪪 National ID</label>
              <input type="text" placeholder="National ID lakkoofsa"
                value={form.national_id}
                onChange={(e) => setForm({ ...form, national_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3" />
            </div>

            {/* Level */}
            <div className="mb-4">
              <label className="block text-gray-600 mb-1 font-semibold">🎓 Sadarkaa</label>
              <select value={form.level} onChange={(e) => handleLevelChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3">
                <option value="">Sadarkaa filadhu</option>
                <option value="degree">Degree</option>
                <option value="diploma">Diploma</option>
              </select>
            </div>

            {/* Department */}
            {form.level && (
              <div className="mb-4">
                <label className="block text-gray-600 mb-1 font-semibold">🏫 Department</label>
                <select value={form.department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3">
                  <option value="">Department filadhu</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Year */}
            {form.department && (
              <div className="mb-4">
                <label className="block text-gray-600 mb-1 font-semibold">📅 Year</label>
                <select value={form.year}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-3">
                  {[1, 2, 3, 4, 5].map((y) => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Course ID Preview */}
            {form.course_id && (
              <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-700 font-semibold">
                  📚 Course: {form.course_name} ({form.course_id})
                </p>
              </div>
            )}

            {/* Session */}
            {form.department && (
              <div className="mb-6">
                <label className="block text-gray-600 mb-1 font-semibold">⏰ Session</label>
                <select value={form.session}
                  onChange={(e) => setForm({ ...form, session: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3">
                  <option value="">Session filadhu</option>
                  <option value="Regular">Regular</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
            )}

            <button onClick={handleStep1} disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              {loading ? "Loading..." : "Itti Fufii →"}
            </button>

            <p className="text-center text-gray-500 mt-4 text-sm">
              Account qabdaa?{" "}
              <a href="/login" className="text-blue-600 hover:underline">Login</a>
            </p>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <div className="bg-green-50 p-3 rounded-lg mb-6 text-center">
              <p className="text-green-700 font-semibold">✅ Maalummaa galmeeffame!</p>
              <p className="text-green-600 text-sm">Amma documents sadanuu upload godhi</p>
            </div>

            {[
              { key: "national_id_photo", label: "🪪 National ID Photo", id: "national_id" },
              { key: "grade12_result", label: "📄 Result Kutaa 12", id: "grade12" },
              { key: "bank_receipt", label: "🏦 Bank Receipt (Kafaltii)", id: "bank_receipt" },
            ].map((field) => (
              <div key={field.key} className="mb-4">
                <label className="block text-gray-600 mb-1 font-semibold">{field.label}</label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  (files as any)[field.key] ? "border-green-500 bg-green-50" : "border-gray-300"
                }`}>
                  <input type="file" accept="image/*,.pdf"
                    onChange={(e) => setFiles({ ...files, [field.key]: e.target.files?.[0] || null })}
                    className="hidden" id={field.id} />
                  <label htmlFor={field.id} className="cursor-pointer">
                    {(files as any)[field.key] ? (
                      <p className="text-green-600 font-semibold">✅ {(files as any)[field.key].name}</p>
                    ) : (
                      <p className="text-gray-500">📸 Click godhi upload godhuu</p>
                    )}
                  </label>
                </div>
              </div>
            ))}

            <button onClick={handleStep2} disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
              {loading ? "Uploading..." : "✅ Galmaa'i fi Submit"}
            </button>

            <button onClick={() => setStep(1)}
              className="w-full mt-2 bg-gray-200 text-gray-600 py-2 rounded-lg text-sm">
              ← Duubatti
            </button>
          </div>
        )}
      </div>
    </div>
  );
}