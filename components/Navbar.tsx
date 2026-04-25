"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Menu, X, LogOut, BarChart2 } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white border-b-2 border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="font-extrabold text-2xl text-green-600 tracking-tight flex items-center gap-2">
            <span className="text-3xl">🧬</span> Sinh Học THPT
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-green-600 font-medium transition">Chủ đề</Link>

            {user ? (
              <>
                <Link href="/stats" className="text-gray-600 hover:text-green-600 font-medium transition flex items-center gap-1">
                  <BarChart2 size={18} /> Thống kê
                </Link>
                <div className="flex items-center gap-4 border-l-2 border-gray-100 pl-6">
                  <span className="font-bold text-gray-800">{user.displayName || "Học sinh"}</span>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition" title="Đăng xuất">
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <Link href="/login" className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-[0_4px_0_rgb(21,128,61)] hover:shadow-[0_2px_0_rgb(21,128,61)] hover:translate-y-[2px] transition-all">
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-2 shadow-lg">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-600">Chủ đề</Link>
          {user ? (
            <>
              <Link href="/stats" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-600">Thống kê</Link>
              <div className="px-3 py-2 text-green-600 font-bold border-t border-gray-100 mt-2">
                Chào, {user.displayName || "Học sinh"}
              </div>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50">
                Đăng xuất
              </button>
            </>
          ) : (
            <Link href="/login" className="block px-3 py-2 text-center rounded-xl text-base font-bold bg-green-500 text-white mt-4">
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}