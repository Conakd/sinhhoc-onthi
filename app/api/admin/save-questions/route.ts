import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { topicId, questions } = body;
        if (!topicId || !questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
        }
        const batch = adminDb.batch();
        questions.forEach((q: any) => {
            const docRef = adminDb.collection("questions").doc();
            batch.set(docRef, {
                ...q,
                topicId,
                id: docRef.id
            });
        });
        const topicRef = adminDb.collection("topics").doc(topicId);
        batch.update(topicRef, {
            questionCount: FieldValue.increment(questions.length)
        });
        await batch.commit();
        return NextResponse.json({ success: true, count: questions.length });
    } catch (error: any) {
        console.error("Lỗi lưu database:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
