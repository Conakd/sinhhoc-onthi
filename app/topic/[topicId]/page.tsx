// app/topic/[topicId]/page.tsx
"use client";
import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { ExamSet, Topic } from "@/lib/types";
import { BookOpen, PlayCircle, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

export default function TopicPage({ params }: PageProps) {
  const { topicId } = use(params);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topicSnap = await getDoc(doc(db, "topics", topicId));
        if (topicSnap.exists()) setTopic({ id: topicSnap.id, ...topicSnap.data() } as Topic);

        const q = query(collection(db, "examSets"), where("topicId", "==", topicId));
        const setSnap = await getDocs(q);
        const setsData = setSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamSet));

        setsData.sort((a, b) => a.order - b.order);
        setExamSets(setsData);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [topicId]);

  if (loading) return <div className="text-center py-20 font-bold text-gray-500">Đang tải danh sách bộ đề...</div>;
  if (!topic) return <div className="text-center py-20 font-bold text-red-500">Không tìm thấy chủ đề.</div>;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold mb-6 transition-colors">
        <ArrowLeft size={20} /> Quay lại trang chủ
      </Link>

      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border-2 border-gray-100 flex items-center justify-center text-4xl">
          {topic.icon}
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-800">{topic.name}</h1>
          <p className="text-gray-500 font-medium mt-1">{topic.description}</p>
        </div>
      </div>

      <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
        <BookOpen className="text-blue-500" /> Danh sách bộ đề
      </h2>

      {examSets.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 text-center text-gray-500 font-medium">
          Chủ đề này hiện chưa có bộ đề nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {examSets.map((set) => (
            <div key={set.id} className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:border-blue-400 transition-all flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{set.name}</h3>
              <div className="mt-auto pt-4 border-t-2 border-gray-50 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">📝 {set.questionCount} câu hỏi</span>
                <Link
                  href={`/topic/${topicId}/${set.id}`}
                  className="bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-[0_4px_0_rgb(59,130,246)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(59,130,246)] transition-all flex items-center gap-2"
                >
                  <PlayCircle size={18} /> Bắt đầu làm
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}