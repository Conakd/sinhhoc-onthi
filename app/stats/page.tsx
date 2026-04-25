"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Attempt, Topic } from "@/lib/types";
import { Target, Award, BookOpen, Clock } from "lucide-react";

export default function StatsPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [topicsMap, setTopicsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async (userId: string) => {
      try {
        // Lấy tên topics để map ID -> Name
        const topicsSnap = await getDocs(collection(db, "topics"));
        const tMap: Record<string, string> = {};
        topicsSnap.docs.forEach(doc => {
          tMap[doc.id] = doc.data().name;
        });
        setTopicsMap(tMap);

        // Lấy lịch sử làm bài
        const q = query(collection(db, "attempts"), where("userId", "==", userId));
        const attemptsSnap = await getDocs(q);
        const attemptsData = attemptsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attempt));

        // Sắp xếp mới nhất lên đầu
        attemptsData.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        setAttempts(attemptsData);
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchStats(user.uid);
      else window.location.href = "/login"; // Chưa đăng nhập thì đá về login
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center py-20 font-bold text-gray-500">Đang tải thống kê...</div>;

  // Tính toán Metrics
  const totalAttempts = attempts.length;
  const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => Math.round((a.score / a.totalQuestions) * 10))) : 0;
  const avgScore = attempts.length > 0
    ? (attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 10, 0) / totalAttempts).toFixed(1)
    : 0;
  const completedTopics = new Set(attempts.map(a => a.topicId)).size;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Thống kê học tập</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3"><Target size={24} /></div>
          <span className="text-3xl font-black text-gray-800">{totalAttempts}</span>
          <span className="text-sm font-bold text-gray-500 mt-1">Lượt làm bài</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-3"><Award size={24} /></div>
          <span className="text-3xl font-black text-gray-800">{avgScore}</span>
          <span className="text-sm font-bold text-gray-500 mt-1">Điểm trung bình (Hệ 10)</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-3"><Award size={24} /></div>
          <span className="text-3xl font-black text-gray-800">{highestScore}</span>
          <span className="text-sm font-bold text-gray-500 mt-1">Điểm cao nhất</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3"><BookOpen size={24} /></div>
          <span className="text-3xl font-black text-gray-800">{completedTopics}</span>
          <span className="text-sm font-bold text-gray-500 mt-1">Chủ đề đã học</span>
        </div>
      </div>

      {/* History Table */}
      <h2 className="text-xl font-extrabold text-gray-800 mb-4">Lịch sử làm bài</h2>
      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden">
        {attempts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">Bạn chưa làm bài thi nào. Hãy chọn một chủ đề để bắt đầu!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Chủ đề</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Điểm số</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Ngày làm</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Thời gian</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {attempts.map((attempt) => {
                  const date = new Date(attempt.completedAt);
                  const timeTaken = Math.round((date.getTime() - new Date(attempt.startedAt).getTime()) / 1000); // giây
                  const mins = Math.floor(timeTaken / 60);
                  const secs = timeTaken % 60;

                  return (
                    <tr key={attempt.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                        {topicsMap[attempt.topicId] || "Chủ đề không xác định"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-extrabold text-sm">
                          {attempt.score} / {attempt.totalQuestions}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                        {date.toLocaleDateString('vi-VN')} {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Clock size={16} /> {mins}p {secs}s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}