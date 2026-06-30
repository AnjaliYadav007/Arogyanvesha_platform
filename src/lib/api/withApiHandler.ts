import { NextRequest, NextResponse } from "next/server";

export function withApiHandler(handler: (req: NextRequest, context?: any) => Promise<Response>) {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      if (error.name === "AuthError") {
        return NextResponse.json({ code: "UNAUTHORIZED", message: error.message }, { status: 401 });
      }
      console.error("API route error:", error);
      return NextResponse.json(
        { code: "SERVER_ERROR", message: error.message || "An unexpected server error occurred." },
        { status: 500 }
      );
    }
  };
}
