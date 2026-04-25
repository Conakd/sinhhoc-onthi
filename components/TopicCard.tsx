import Link from "next/link";
import { Topic } from "@/lib/types";

interface TopicCardProps {
  topic: Topic;
  progress?: number; // Phần trăm hoàn thành (0-100)
}

export default function TopicCard({ topic, progress }: TopicCardProps) {
  return (
    <Link href={`/topic/${topic.id}`}>
      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6 hover:border-green-400 hover:-translate-y-1 transition-all cursor-pointer h-full flex flex-col group">
        <div className="flex items-center justify-between mb-4">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
            {topic.icon}
          </div>
          <span className="bg-green-100 text-green-700 text-xs font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider">
            Lớp {topic.grade}
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-gray-800 mb-2">{topic.name}</h3>
        <p className="text-gray-500 text-sm font-medium flex-grow mb-4">{topic.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Trắc nghiệm</span>
          <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Đúng/Sai</span>
          <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Trả lời ngắn</span>
        </div>

        <div className="pt-4 border-t-2 border-gray-50">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-gray-600">📝 {topic.questionCount} câu hỏi</span>
            <span className={progress && progress > 0 ? "text-green-600" : "text-gray-400"}>
              {progress && progress > 0 ? `Đã làm ${progress}%` : "Chưa làm"}
            </span>
          </div>
          {/* Progress Bar Mini */}
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress || 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
}