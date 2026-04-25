"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Topic, Question } from "@/lib/types";
import { UploadCloud, Sparkles, Save } from "lucide-react";

export default function ImportAIPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<Question[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      const snap = await getDocs(collection(db, "topics"));
      setTopics(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic)));
    };
    fetchTopics();
  }, []);

  const handleAnalyze = async () => {
    if (!file || !selectedTopic) return alert("Vui lòng chọn chủ đề và file!");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/import-questions", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPreviewData(data.questions);
    } catch (error: any) {
      alert("Lỗi phân tích: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDB = async () => {
    if (previewData.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/save-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: selectedTopic, questions: previewData })
      });
      const data = await res.json();
      if (data.success) {
        alert("Đã lưu thành công!");
        setPreviewData([]);
        setFile(null);
      }
    } catch (error) {
      alert("Lỗi lưu database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
        <Sparkles className="text-purple-500" size={32} /> Import Câu hỏi bằng AI
      </h1>

      <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block font-bold text-gray-700 mb-2">Chọn chủ đề</label>
            <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} className="w-full p-4 border-2 rounded-xl bg-gray-50 font-medium outline-none focus:border-purple-500">
              <option value="">-- Chọn chủ đề --</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-2">Upload File (PDF)</label>
            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full p-3 border-2 rounded-xl bg-gray-50 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200" />
          </div>
        </div>
        <button onClick={handleAnalyze} disabled={loading || !file || !selectedTopic} className="w-full bg-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-[0_4px_0_rgb(168,85,247)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(168,85,247)] transition-all disabled:opacity-50 flex justify-center items-center gap-2">
          {loading ? "AI đang đọc tài liệu..." : <><UploadCloud /> Phân tích bằng AI</>}
        </button>
      </div>

      {previewData.length > 0 && (
        <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Preview ({previewData.length} câu hỏi)</h2>
            <button onClick={handleSaveToDB} disabled={loading} className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_4px_0_rgb(21,128,61)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(21,128,61)] transition-all flex items-center gap-2">
              <Save size={20} /> Lưu tất cả vào Database
            </button>
          </div>

          <div className="space-y-4">
            {previewData.map((q, idx) => (
              <div key={idx} className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50">
                <div className="flex gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase">{q.type}</span>
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded">Độ khó: {q.difficulty}</span>
                </div>
                <p className="font-bold text-gray-800 mb-2">{idx + 1}. {q.content}</p>
                {q.type === "mc" && <div className="text-sm text-gray-600 mb-2">{q.options?.join(" | ")}</div>}
                <div className="text-sm font-medium text-green-600 mb-1">Đáp án: {JSON.stringify(q.correctAnswer)}</div>
                <div className="text-sm text-gray-500 italic">Giải thích: {q.explanation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}