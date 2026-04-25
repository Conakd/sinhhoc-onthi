// app/topic/[topicId]/[examSetId]/page.tsx
"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import QuizEngine from "@/components/QuizEngine";
import { Question, AnswerRecord } from "@/lib/types";

const shuffleArray = (array: any[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

interface PageProps {
    params: Promise<{ topicId: string; examSetId: string }>;
}

export default function ExamSetQuizPage({ params }: PageProps) {
    const { topicId, examSetId } = use(params);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startedAt, setStartedAt] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        if (!examSetId) return;

        const fetchQuestions = async () => {
            try {
                // Query câu hỏi theo examSetId
                const q = query(collection(db, "questions"), where("examSetId", "==", examSetId));
                const snap = await getDocs(q);
                const fetchedQs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));

                setQuestions(shuffleArray(fetchedQs));
                setStartedAt(new Date().toISOString());
            } catch (error) {
                console.error("Lỗi tải câu hỏi:", error);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) router.push("/login");
            else fetchQuestions();
        });

        return () => unsubscribe();
    }, [examSetId, router]);

    const handleSubmit = async (answers: AnswerRecord[], totalScore: number) => {
        setIsSubmitting(true);
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            const payload = {
                topicId,
                examSetId,
                score: totalScore,
                totalQuestions: questions.length,
                answers,
                startedAt,
                completedAt: new Date().toISOString()
            };

            const res = await fetch("/api/submit-attempt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                // Chuyển hướng sang trang kết quả mới
                router.push(`/topic/${topicId}/${examSetId}/result?attemptId=${data.attemptId}`);
            } else {
                alert("Có lỗi khi nộp bài: " + data.error);
            }
        } catch (error) {
            console.error("Lỗi nộp bài:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20 font-bold text-gray-500">Đang chuẩn bị đề thi...</div>;
    if (questions.length === 0) return <div className="text-center py-20 font-bold text-gray-500">Bộ đề này chưa có câu hỏi.</div>;

    return (
        <div className="py-6">
            <QuizEngine questions={questions} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
    );
}