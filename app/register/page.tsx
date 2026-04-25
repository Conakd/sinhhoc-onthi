"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp.");
    }
    if (formData.password.length < 6) {
      return setError("Mật khẩu phải có ít nhất 6 ký tự.");
    }

    setLoading(true);
    try {
      // 1. Tạo user trong Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Cập nhật tên hiển thị
      await updateProfile(user, { displayName: formData.name });

      // 3. Lưu thông tin vào Firestore collection "users"
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: formData.name,
        email: formData.email,
        role: "student",
        createdAt: new Date().toISOString()
      });

      router.push("/");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") setError("Email này đã được sử dụng.");
      else setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border-2 border-gray-100 mt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">Tạo tài khoản</h2>
        <p className="text-gray-500 mt-2">Bắt đầu hành trình chinh phục điểm 9+</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm font-medium border border-red-100">{error}</div>}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
          <input
            type="text" required
            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 outline-none font-medium"
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
          <input
            type="email" required
            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 outline-none font-medium"
            placeholder="nhap@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu</label>
          <input
            type="password" required
            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 outline-none font-medium"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Xác nhận mật khẩu</label>
          <input
            type="password" required
            value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 outline-none font-medium"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold text-lg shadow-[0_4px_0_rgb(21,128,61)] hover:shadow-[0_2px_0_rgb(21,128,61)] hover:translate-y-[2px] transition-all mt-6"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>
      <p className="text-center text-gray-500 mt-6 font-medium">
        Đã có tài khoản? <Link href="/login" className="text-green-600 font-bold hover:underline">Đăng nhập</Link>
      </p>
    </div>
  );
}