// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import TopicCard from "@/components/TopicCard";
import { Topic, Attempt } from "@/lib/types";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (userId?: string) => {
      try {
        // 1. Lấy danh sách Topics từ Firestore
        const topicsSnap = await getDocs(collection(db, "topics"));
        const topicsData = topicsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
        topicsData.sort((a, b) => a.order - b.order);
        setTopics(topicsData);

        // 2. Lấy lịch sử làm bài để tính % hoàn thành
        if (userId) {
          const q = query(collection(db, "attempts"), where("userId", "==", userId));
          const attemptsSnap = await getDocs(q);

          const progressMap: Record<string, number> = {};
          attemptsSnap.docs.forEach(doc => {
            const data = doc.data() as Attempt;
            const percent = Math.round((data.score / data.totalQuestions) * 100);
            if (!progressMap[data.topicId] || percent > progressMap[data.topicId]) {
              progressMap[data.topicId] = percent;
            }
          });
          setUserProgress(progressMap);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      fetchData(user?.uid);
    });

    return () => unsubscribe();
  }, []);

  const totalQuestions = topics.reduce((sum, t) => sum + (t.questionCount || 0), 0);

  if (loading) return <div className="text-center py-20 font-bold text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="pb-12">
      <div className="bg-green-600 rounded-3xl p-8 md:p-12 text-white mb-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Ôn Thi Sinh Học THPT <br /> Luyện Đề Chất Lượng Cao
          </h1>
          <p className="text-green-100 text-lg font-medium mb-6">
            Hệ thống câu hỏi bám sát cấu trúc đề thi thật. Tích hợp AI giải thích chi tiết từng câu.
          </p>
          <div className="flex gap-4 font-bold">
            <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">📚 {topics.length} Chủ đề</div>
            <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">🎯 {totalQuestions} Câu hỏi</div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-green-500 rounded-full opacity-50 blur-3xl"></div>
      </div>

      <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Lộ trình học tập</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map(topic => (
          <TopicCard
            key={topic.id}
            topic={topic}
            progress={userProgress[topic.id] || 0}
          />
        ))}
      </div>
    </div>
  );
}