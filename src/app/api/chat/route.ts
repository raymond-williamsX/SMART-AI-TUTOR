import { NextResponse } from "next/server";
import { getAIResponse } from "@/lib/chat/service";
import type { ChatMessage } from "@/lib/chat/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = (body?.messages ?? []) as ChatMessage[];

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const aiMessage = await getAIResponse(messages);

    return NextResponse.json({ message: aiMessage });
  } catch (error) {
  console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
