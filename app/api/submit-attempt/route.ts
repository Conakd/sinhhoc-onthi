// app/api/submit-attempt/route.ts
import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const body = await request.json();
        const { topicId, examSetId, score, totalQuestions, answers, startedAt, completedAt } = body;

        const attemptRef = adminDb.collection("attempts").doc();
        const attemptData = {
            id: attemptRef.id,
            userId,
            topicId,
            examSetId,
            score,
            totalQuestions,
            answers,
            startedAt,
            completedAt,
        };
        await attemptRef.set(attemptData);

        const userRef = adminDb.collection("users").doc(userId);
        await userRef.set({
            totalAttempts: FieldValue.increment(1),
            lastActive: new Date().toISOString()
        }, { merge: true });

        return NextResponse.json({ success: true, attemptId: attemptRef.id });
    } catch (error: any) {
        console.error("Lỗi submit attempt:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}