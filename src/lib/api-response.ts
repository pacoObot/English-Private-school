import { NextResponse } from "next/server";

export function successResponse(data: any, meta?: any, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 400, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: code || "BAD_REQUEST",
      },
    },
    { status }
  );
}
