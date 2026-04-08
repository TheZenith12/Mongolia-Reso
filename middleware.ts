import { NextRequest, NextResponse } from 'next/server';

// Middleware-г хялбарчилна - зөвхөн pass through
export async function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
