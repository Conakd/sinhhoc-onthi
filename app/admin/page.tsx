"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Topic } from "@/lib/types";
import Link from "next/link";
import { Plus, Edit, Trash2, Sparkles, List } from "lucide-react";

export default function AdminDashboard() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", icon: "🧬", grade: "12", order: 1 });

  const fetchTopics = async () => {
    const snap = await getDocs(collection(db, "topics"));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
    setTopics(data.sort((a, b) => a.order - b.order));
    setLoading(false);
  };

  useEffect(() => { fetchTopics(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "topics"), { ...formData, questionCount: 0 });
    setShowForm(false);
    fetchTopics();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa chủ đề này?")) {
      await deleteDoc(doc(db, "topics", id));
      fetchTopics();
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-800">Quản lý Chủ đề</h1>
        <div className="flex gap-4">
          <Link href="/admin/import" className="bg-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_4px_0_rgb(168,85,247)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(168,85,247)] transition-all flex items-center gap-2">
            <Sparkles size={20} /> Import AI
          </Link>
          <button onClick={() => setShowForm(!showForm)} className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_4px_0_rgb(21,128,61)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(21,128,61)] transition-all flex items-center gap-2">
            <Plus size={20} /> Thêm chủ đề
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border-2 border-gray-100 mb-8 grid grid-cols-2 gap-4">
          <input type="text" placeholder="Tên chủ đề" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="p-3 border-2 rounded-xl" />
          <input type="text" placeholder="Mô tả" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="p-3 border-2 rounded-xl" />
          <input type="text" placeholder="Icon (Emoji)" required value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="p-3 border-2 rounded-xl" />
          <select value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value as any })} className="p-3 border-2 rounded-xl">
            <option value="10">Lớp 10</option><option value="11">Lớp 11</option><option value="12">Lớp 12</option>
          </select>
          <input type="number" placeholder="Thứ tự" required value={formData.order} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} className="p-3 border-2 rounded-xl" />
          <button type="submit" className="bg-blue-500 text-white font-bold rounded-xl">Lưu</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topics.map(topic => (
          <div key={topic.id} className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-4xl">{topic.icon}</span>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(topic.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18} /></button>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1">{topic.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{topic.description}</p>
            <div className="flex justify-between items-center pt-4 border-t-2 border-gray-50">
              <span className="text-sm font-bold text-gray-600">{topic.questionCount} câu hỏi</span>
              <button className="text-blue-500 font-bold text-sm flex items-center gap-1 hover:underline"><List size={16} /> Xem câu hỏi</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}