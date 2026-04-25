import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });

        // Chuyển file sang base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = buffer.toString("base64");

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
    Đây là file đề thi Sinh Học. Hãy trích xuất TẤT CẢ câu hỏi và trả về JSON array.
    Mỗi câu hỏi có cấu trúc:
    {
      "type": "mc" | "tf" | "short",
      "content": "nội dung câu hỏi",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."] (chỉ cho type mc, bỏ trống nếu type khác),
      "statements": {"a": "ý 1", "b": "ý 2", "c": "ý 3", "d": "ý 4"} (chỉ cho type tf, bỏ trống nếu type khác),
      "correctAnswer": "A" (cho mc) | {"a":true,"b":false,"c":true,"d":true} (cho tf) | "đáp án" (cho short),
      "explanation": "giải thích đáp án chi tiết",
      "difficulty": 1|2|3
    }
    Chỉ trả về JSON array thuần túy, không có markdown \`\`\`json, không có text nào khác.
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type // Thường là application/pdf
                }
            }
        ]);

        const responseText = result.response.text();

        // Clean up markdown nếu Gemini vẫn trả về ```json ... ```
        const cleanedText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        const questions = JSON.parse(cleanedText);

        return NextResponse.json({ questions });
    } catch (error: any) {
        console.error("Lỗi Gemini API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}