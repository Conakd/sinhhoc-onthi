// lib/types.ts
export interface Topic {
    id: string;
    name: string;
    description: string;
    icon: string;
    grade: "10" | "11" | "12";
    order: number;
    questionCount: number;
}

export interface ExamSet {
    id: string;
    topicId: string;
    name: string; // Ví dụ: "Bộ 1", "Đề thi thử Sở Hà Nội"
    order: number;
    questionCount: number;
    createdAt: string;
}

export interface Question {
    id: string;
    topicId: string;
    examSetId: string; // Thêm field này
    type: "mc" | "tf" | "short";
    content: string;
    imageUrl?: string; // Thêm field ảnh (optional)
    options?: string[];
    statements?: { a: string; b: string; c: string; d: string };
    correctAnswer: string | { a: boolean; b: boolean; c: boolean; d: boolean };
    explanation: string;
    difficulty: 1 | 2 | 3;
}

export interface AnswerRecord {
    questionId: string;
    questionContent: string;
    type: "mc" | "tf" | "short";
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
    scoreEarned: number;
    explanation: string;
}

export interface Attempt {
    id?: string;
    userId: string;
    topicId: string;
    examSetId: string; // Thêm field này để biết làm bộ đề nào
    score: number;
    totalQuestions: number;
    answers: AnswerRecord[];
    startedAt: string;
    completedAt: string;
}