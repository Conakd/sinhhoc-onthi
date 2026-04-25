// app/topic/[topicId]/[examSetId]/result/page.tsx
"use client";
import { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Attempt } from "@/lib/types";
import Link from "next/link";
import { CheckCircle, XCircle, Trophy, ArrowLeft, RotateCcw } from "lucide-react";

interface PageProps {
    params: Promise<{ topicId: string; examSetId: string }>;
}

export default function ResultPage({ params }: PageProps) {
    const { topicId, examSetId } = use(params);
    const searchParams = useSearchParams();
    const attemptId = searchParams.get("attemptId");
    const router = useRouter();

    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!attemptId) return;
        const fetchAttempt = async () => {
            try {
                const docRef = doc(db, "attempts", attemptId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAttempt(docSnap.data() as Attempt);
                }
            } catch (error) {
                console.error("Lỗi tải kết quả:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttempt();
    }, [attemptId]);

    if (loading) return <div className="text-center py-20 font-bold text-gray-500">Đang tải kết quả...</div>;
    if (!attempt) return <div className="text-center py-20 font-bold text-red-500">Không tìm thấy kết quả bài làm.</div>;

    const score10 = ((attempt.score / attempt.totalQuestions) * 10).toFixed(1);
    const numScore = parseFloat(score10);

    let rank = { text: "Cần cố gắng", color: "text-red-500", bg: "bg-red-100" };
    if (numScore >= 9) rank = { text: "Xuất sắc", color: "text-yellow-500", bg: "bg-yellow-100" };
    else if (numScore >= 7) rank = { text: "Giỏi", color: "text-green-500", bg: "bg-green-100" };
    else if (numScore >= 5) rank = { text: "Khá", color: "text-blue-500", bg: "bg-blue-100" };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-gray-100 text-center mb-8">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${rank.bg} ${rank.color}`}>
                    <Trophy size={48} />
                </div>
                <h1 className="text-4xl font-black text-gray-800 mb-2">{score10} <span className="text-2xl text-gray-400">/ 10</span></h1>
                <div className={`inline-block px-4 py-1 rounded-full font-bold text-sm mb-6 ${rank.bg} ${rank.color}`}>
                    {rank.text}
                </div>
                <p className="text-gray-500 font-medium mb-8">
                    Bạn đã trả lời đúng {attempt.score} trên tổng số {attempt.totalQuestions} câu hỏi.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button onClick={() => router.push(`/topic/${topicId}/${examSetId}`)} className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_4px_0_rgb(59,130,246)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(59,130,246)] transition-all">
                        <RotateCcw size={20} /> Làm lại bộ này
                    </button>
                    <Link href={`/topic/${topicId}`} className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold shadow-[0_4px_0_rgb(209,213,219)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(209,213,219)] transition-all">
                        <ArrowLeft size={20} /> Về danh sách bộ đề
                    </Link>
                </div>
            </div>

            <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Chi tiết bài làm</h2>
            <div className="space-y-6">
                {attempt.answers.map((ans, idx) => (
                    <div key={idx} className={`p-6 rounded-2xl border-2 ${ans.scoreEarned === 1 ? "border-green-200 bg-green-50/30" : ans.scoreEarned > 0 ? "border-yellow-200 bg-yellow-50/30" : "border-red-200 bg-red-50/30"}`}>
                        <div className="flex items-start gap-3 mb-3">
                            <div className="mt-1">
                                {ans.scoreEarned === 1 ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Câu {idx + 1}: {ans.questionContent}</h3>
                                <div className="mt-2 text-sm font-medium text-gray-600">
                                    <span className="bg-white px-2 py-1 rounded border mr-2">Điểm: {ans.scoreEarned}</span>
                                    {ans.type === "tf" ? "Dạng: Đúng/Sai" : ans.type === "short" ? "Dạng: Trả lời ngắn" : "Dạng: Trắc nghiệm"}
                                </div>
                            </div>
                        </div>
                        <div className="ml-9 mt-4 p-4 bg-white rounded-xl border border-gray-100">
                            <p className="text-gray-700 font-medium"><span className="font-bold text-blue-600">Giải thích:</span> {ans.explanation}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}