import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Middleware cơ bản chặn truy cập nếu không có token (Sẽ được check kỹ hơn ở Layout)
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Trong thực tế, bạn nên dùng Firebase Session Cookies. 
        // Ở đây ta cho phép qua để Layout xử lý check Role chính xác từ Firestore.
        return NextResponse.next();
    }
}

export const config = {
    matcher: '/admin/:path*',
};