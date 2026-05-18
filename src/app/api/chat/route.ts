import { NextResponse } from "next/server";
import { getAIResponse } from "@/lib/chat/service";
import type { ChatMessage } from "@/lib/chat/types";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const body: unknown = await req.json();
    const messages = (body as { messages?: ChatMessage[] })?.messages;

    console.info("[chat] request received", {
      requestId,
      hasMessages: Array.isArray(messages),
      messageCount: Array.isArray(messages) ? messages.length : 0,
    });

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "INVALID_REQUEST",
            message: "messages must be an array",
          },
        },
        { status: 400 }
      );
    }

    const lastUserMessage = [...messages].reverse().find((message) => message?.role === "user" && message?.content?.trim());

    if (!lastUserMessage) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "EMPTY_MESSAGE",
            message: "A user message is required before generating a response.",
          },
        },
        { status: 400 }
      );
    }

    const aiMessage = await getAIResponse(messages);

    console.info("[chat] response generated", {
      requestId,
      assistantMessageLength: aiMessage.content.length,
    });

    return NextResponse.json({
      success: true,
      requestId,
      data: {
        message: aiMessage,
      },
    });
  } catch (error) {
    console.error("[chat] request failed", {
      requestId,
      error,
    });

    return NextResponse.json(
      {
        success: false,
        requestId,
        error: {
          code: "SERVER_ERROR",
          message: "Unable to generate a tutor response right now.",
        },
      },
      { status: 500 }
    );
  }
}
