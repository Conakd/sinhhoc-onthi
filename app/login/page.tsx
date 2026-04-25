"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getVietnameseError = (code: string) => {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Email hoặc mật khẩu không chính xác.";
      case "auth/invalid-email":
        return "Định dạng email không hợp lệ.";
      case "auth/too-many-requests":
        return "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.";
      default:
        return "Đã có lỗi xảy ra. Vui lòng thử lại.";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError(getVietnameseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border-2 border-gray-100 mt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">Đăng nhập</h2>
        <p className="text-gray-500 mt-2">Chào mừng bạn quay lại ôn luyện!</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm font-medium border border-red-100">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-0 focus:border-green-500 transition outline-none font-medium"
            placeholder="nhap@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-0 focus:border-green-500 transition outline-none font-medium"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold text-lg shadow-[0_4px_0_rgb(21,128,61)] hover:shadow-[0_2px_0_rgb(21,128,61)] hover:translate-y-[2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
      <p className="text-center text-gray-500 mt-8 font-medium">
        Chưa có tài khoản? <Link href="/register" className="text-green-600 font-bold hover:underline">Đăng ký ngay</Link>
      </p>
    </div>
  );
}