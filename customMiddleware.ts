import { NextRequest, NextResponse } from 'next/server';

export default function customMiddleware(req: NextRequest, event: any) {
  const url = req.nextUrl;
  // Your custom logic here
  return NextResponse.next();
}
