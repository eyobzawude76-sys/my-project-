"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// Result type
interface ResultType {
  course_id?: string;
  course_name?: string;
  average?: number;
  grade?: string;
}

export default function StudentPage() {
  const router = useRouter();

  // Type sirrii
  const [results, setResults] = useState<ResultType[]>([]);
  const [semester, setSemester] = useState("semester_1");
  const [name, setName] = useState("");

  // Token hordofuuf
  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : "";

  const fetchResults = useCallback(async () => {
    const token = getToken();

    if (!token) return;

    try {
      const res = await fetch(
        `https://new-backend-ev58.onrender.com/student/my-result?semester=${semester}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) {
        localStorage.clear();
        router.push("/login");
        return;
      }

      const data = await res.json();

      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [semester, router]);

  useEffect(() => {
    setName(localStorage.getItem("name") || "Barataa");
    fetchResults();
  }, [fetchResults]);

  const downloadResult = () => {
    const token = getToken();

    const url = `https://new-backend-ev58.onrender.com/student/download-result?semester=${semester}&token=${token}`;

    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-orange-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          👨‍🎓 Student Dashboard
        </h1>
  <button onClick={()=>router.push("/change-password")}
         className="bg-yellow-900 px-3 py-1 rounded-lg text-sm mr-2">
        Chenge-Password
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            router.push("/login");
          }}
          className="bg-white text-orange-600 px-4 py-1 rounded-lg text-sm"
        >
          Logout
        </button>
      </div>

      <div className="p-4">
        <div className="bg-white p-4 rounded-xl shadow mb-4">
          <p className="text-lg font-bold">
            Nagaatti, {name}! 👋
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow mb-4">
          <h2 className="font-bold mb-3">
            📊 Result Kee Ilaali
          </h2>

         <select
  value={semester}
  onChange={(e) => setSemester(e.target.value)}
  className="w-full border rounded-lg p-2 mb-3 text-black">
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
            onClick={fetchResults}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg mb-2 transition-colors"
          >
            Ilaali
          </button>

          <button
            onClick={downloadResult}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
          >
            📄 PDF Download
          </button>
        </div>

        {/* Results Display */}
        <div className="space-y-3">
          {results.length === 0 ? (
            <p className="text-gray-500 text-center bg-white p-4 rounded-xl shadow">
              Result hin argamne
            </p>
          ) : (
            results.map((r: ResultType, index: number) => (
              <div
                key={index}
                className="bg-white p-4 rounded-xl shadow border-l-4 border-orange-500"
              >
                <p className="font-bold text-gray-800">
                  Course: {r.course_id || r.course_name}
                </p>

                <div className="flex justify-between mt-2">
                  <p className="text-gray-600">
                    Average: {r.average}/100
                  </p>

                  <p
                    className={`font-bold ${
                      r.grade === "A"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    Grade: {r.grade}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}