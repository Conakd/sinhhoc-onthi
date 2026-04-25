"use client";
import { useState } from "react";
import { Question, AnswerRecord } from "@/lib/types";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface QuizEngineProps {
  questions: Question[];
  onSubmit: (answers: AnswerRecord[], totalScore: number) => void;
  isSubmitting: boolean;
}

export default function QuizEngine({ questions, onSubmit, isSubmitting }: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [history, setHistory] = useState<AnswerRecord[]>([]);
  const [currentScoreEarned, setCurrentScoreEarned] = useState(0);

  if (!questions || questions.length === 0) return <p>Không có câu hỏi.</p>;

  const q = questions[currentIndex];

  // ĐỌC SUB-ITEMS AN TOÀN
  const rawSubItems = (q as any).subItems;
  const subItems = Array.isArray(rawSubItems) ? rawSubItems : [];

  // HÀM LẤY CORRECT ANSWER AN TOÀN CHO DẠNG TF
  const getTFCorrectAnswerObj = () => {
    if (!q.correctAnswer) return {};
    if (typeof q.correctAnswer === 'string') {
      try { return JSON.parse(q.correctAnswer); } catch (e) { return {}; }
    }
    return q.correctAnswer;
  };

  const isAnswerValid = () => {
    if (q.type === "mc" || q.type === "short") return !!userAnswer && String(userAnswer).trim() !== "";
    if (q.type === "tf") {
      if (subItems.length === 0) return false;
      // Phải chọn đủ số lượng ý (thường là 4)
      return userAnswer && Object.keys(userAnswer).length === subItems.length && !Object.values(userAnswer).includes(undefined);
    }
    return false;
  };

  const handleCheck = () => {
    let score = 0;
    let isCorrect = false;

    if (q.type === "mc") {
      const selectedLetter = String(userAnswer).trim().charAt(0).toUpperCase();
      const correctLetter = String(q.correctAnswer).trim().toUpperCase();

      isCorrect = selectedLetter === correctLetter;
      score = isCorrect ? 1 : 0;
    }
    else if (q.type === "short") {
      const normalize = (s: string) =>
        String(s)
          .toLowerCase()
          .replace(/[.,;:!?\-]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

      const normalizedUser = normalize(userAnswer || "");
      const normalizedCorrect = normalize(q.correctAnswer);

      isCorrect = normalizedUser === normalizedCorrect;
      score = isCorrect ? 1 : 0;
    }
    else if (q.type === "tf") {
      let correctCount = 0;
      const correctObj = getTFCorrectAnswerObj();

      subItems.forEach((item: any) => {
        const key = item.label; // 'a', 'b', 'c', 'd'
        // Ưu tiên lấy từ correctAnswer object, nếu không có thì lấy từ isCorrect của subItem
        const expectedVal = correctObj[key] !== undefined ? correctObj[key] : item.isCorrect;

        if (Boolean(userAnswer?.[key]) === Boolean(expectedVal)) {
          correctCount++;
        }
      });

      // Tính điểm: mỗi ý đúng được chia đều (ví dụ 4 ý -> 0.25đ/ý)
      score = correctCount * (1 / subItems.length);
      isCorrect = score === 1;
    }

    setCurrentScoreEarned(score);
    setHasChecked(true);

    setHistory(prev => [...prev, {
      questionId: q.id,
      questionContent: q.content,
      type: q.type,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      scoreEarned: score,
      explanation: q.explanation
    }]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer(null);
      setHasChecked(false);
    } else {
      const totalScore = history.reduce((sum, record) => sum + record.scoreEarned, 0);
      onSubmit(history, totalScore);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          ></div>
        </div>
        <span className="font-bold text-gray-500 whitespace-nowrap">{currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border-2 border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-blue-100 text-blue-700 text-xs font-extrabold px-2 py-1 rounded uppercase">
            {q.type === "mc" ? "Trắc nghiệm" : q.type === "tf" ? "Đúng / Sai" : "Trả lời ngắn"}
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
          {q.content}
        </h2>

        {q.imageUrl && (
          <div className="mt-4 mb-6">
            <img
              src={q.imageUrl}
              alt="Hình ảnh minh họa câu hỏi"
              className="max-w-full h-auto rounded-xl border-2 border-gray-100 shadow-sm"
            />
          </div>
        )}

        {q.type === "mc" && (
          <div className="mt-6 space-y-3">
            {q.options?.map((opt, idx) => {
              const isSelected = userAnswer === opt;
              const optLetter = String(opt).trim().charAt(0).toUpperCase();
              const correctLetter = String(q.correctAnswer).trim().toUpperCase();
              const isCorrectOpt = optLetter === correctLetter;

              let displayOpt = String(opt).trim();
              const prefixMatch = displayOpt.match(/^([A-D])[\.\)]\s*/i);
              if (prefixMatch) {
                const prefix = prefixMatch[0];
                const rest = displayOpt.slice(prefix.length);
                const restMatch = rest.match(new RegExp(`^${prefixMatch[1]}[\\.\\)]?\\s*`, 'i'));
                if (restMatch) {
                  displayOpt = prefix + rest.slice(restMatch[0].length);
                }
              }

              let btnClass = "border-gray-200 hover:bg-gray-50 text-gray-700";
              if (isSelected) btnClass = "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200";
              if (hasChecked) {
                if (isCorrectOpt) btnClass = "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200";
                else if (isSelected && !isCorrectOpt) btnClass = "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200";
                else btnClass = "border-gray-200 opacity-50";
              }

              return (
                <button
                  key={idx}
                  disabled={hasChecked}
                  onClick={() => setUserAnswer(opt)}
                  className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all break-words whitespace-normal ${btnClass}`}
                >
                  {displayOpt}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "tf" && (
          <div className="mt-6 space-y-4">
            {subItems.length > 0 ? (
              subItems.map((item: any) => {
                const key = item.label;
                const statement = item.content;
                const selectedVal = userAnswer?.[key];

                const correctObj = getTFCorrectAnswerObj();
                const correctVal = correctObj[key] !== undefined ? correctObj[key] : item.isCorrect;

                // LOGIC MÀU SẮC NÚT ĐÚNG
                let btnTrueClass = "bg-white border-gray-200 text-gray-500 hover:bg-gray-100";
                if (!hasChecked && selectedVal === true) {
                  btnTrueClass = "bg-green-500 border-green-600 text-white"; // Đang chọn Đúng -> Xanh lá
                }
                if (hasChecked) {
                  if (correctVal === true) btnTrueClass = "bg-green-500 border-green-600 text-white ring-2 ring-green-200";
                  else if (selectedVal === true && correctVal === false) btnTrueClass = "bg-red-500 border-red-600 text-white";
                  else btnTrueClass = "bg-gray-100 border-gray-200 text-gray-400 opacity-50";
                }

                // LOGIC MÀU SẮC NÚT SAI
                let btnFalseClass = "bg-white border-gray-200 text-gray-500 hover:bg-gray-100";
                if (!hasChecked && selectedVal === false) {
                  btnFalseClass = "bg-red-500 border-red-600 text-white"; // Đang chọn Sai -> Đỏ
                }
                if (hasChecked) {
                  if (correctVal === false) btnFalseClass = "bg-green-500 border-green-600 text-white ring-2 ring-green-200";
                  else if (selectedVal === false && correctVal === true) btnFalseClass = "bg-red-500 border-red-600 text-white";
                  else btnFalseClass = "bg-gray-100 border-gray-200 text-gray-400 opacity-50";
                }

                return (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border-2 border-gray-100 bg-gray-50 gap-4">
                    <span className="font-medium text-gray-800 flex-1 leading-relaxed">
                      <span className="font-bold text-blue-600 mr-2">{key.toUpperCase()}.</span>
                      {statement}
                    </span>
                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={hasChecked}
                        onClick={() => setUserAnswer({ ...userAnswer, [key]: true })}
                        className={`px-6 py-2.5 rounded-lg font-bold border-2 transition-all ${btnTrueClass}`}
                      >
                        Đúng
                      </button>
                      <button
                        disabled={hasChecked}
                        onClick={() => setUserAnswer({ ...userAnswer, [key]: false })}
                        className={`px-6 py-2.5 rounded-lg font-bold border-2 transition-all ${btnFalseClass}`}
                      >
                        Sai
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                Lỗi định dạng câu hỏi. Không tìm thấy dữ liệu các ý (subItems).
              </div>
            )}
          </div>
        )}

        {q.type === "short" && (
          <div className="mt-6">
            <input
              type="text"
              disabled={hasChecked}
              value={userAnswer || ""}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Nhập câu trả lời của bạn..."
              className={`w-full p-4 rounded-xl border-2 font-bold text-lg outline-none transition-all placeholder-gray-500 ${hasChecked
                  ? (currentScoreEarned === 1 ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700")
                  : "border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white"
                }`}
            />
            {!hasChecked && (
              <p className="text-sm text-gray-500 mt-2 italic">
                * Lưu ý: Không cần gõ dấu câu, chỉ cần đúng nội dung chính.
              </p>
            )}
            {hasChecked && currentScoreEarned === 0 && (
              <div className="mt-3 text-green-600 font-bold flex items-center gap-2">
                <CheckCircle size={20} /> Đáp án đúng: {String(q.correctAnswer)}
              </div>
            )}
          </div>
        )}
      </div>

      {hasChecked ? (
        <div className={`p-6 rounded-2xl border-2 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${currentScoreEarned === 1 ? "bg-green-50 border-green-200" : currentScoreEarned > 0 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"
          }`}>
          <div className="flex-1">
            <div className={`font-black text-xl flex items-center gap-2 mb-2 ${currentScoreEarned === 1 ? "text-green-600" : currentScoreEarned > 0 ? "text-yellow-600" : "text-red-600"
              }`}>
              {currentScoreEarned === 1 ? <><CheckCircle /> Tuyệt vời!</> : currentScoreEarned > 0 ? <><AlertCircle /> Đúng một phần (+{currentScoreEarned}đ)</> : <><XCircle /> Sai rồi!</>}
            </div>

            {q.explanation && q.explanation.trim() !== "" && (
              <div className="mt-3 p-4 bg-white/60 rounded-xl border border-gray-200/50">
                <p className="text-gray-800 font-medium leading-relaxed">
                  <span className="font-bold text-blue-700 mr-2">Giải thích:</span>
                  {q.explanation}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleNext} disabled={isSubmitting}
            className={`shrink-0 px-8 py-3 rounded-xl font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] transition-all ${currentScoreEarned === 1 ? "bg-green-500" : currentScoreEarned > 0 ? "bg-yellow-500" : "bg-red-500"
              }`}
          >
            {isSubmitting ? "Đang nộp..." : currentIndex === questions.length - 1 ? "Xem kết quả" : "Tiếp tục"}
          </button>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={handleCheck}
            disabled={!isAnswerValid()}
            className="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-[0_4px_0_rgb(59,130,246)] hover:shadow-[0_2px_0_rgb(59,130,246)] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-[4px]"
          >
            Kiểm tra
          </button>
        </div>
      )}
    </div>
  );
}