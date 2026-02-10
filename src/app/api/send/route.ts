import { NextResponse } from "next/server";
import { buildEmail, replacePlaceholders, sendChatMessage } from "@/lib/graph";
import type { SendRequest, SendResultItem } from "@/types";

export async function POST(request: Request) {
  try {
    // クライアントから渡された Bearer トークンを取得
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "未認証です。先にログインしてください。" },
        { status: 401 }
      );
    }
    const accessToken = authHeader.slice(7);

    const body = (await request.json()) as SendRequest;
    const { recipients, messageTemplate } = body;

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: "送信先が指定されていません。" },
        { status: 400 }
      );
    }

    if (!messageTemplate) {
      return NextResponse.json(
        { error: "メッセージが入力されていません。" },
        { status: 400 }
      );
    }

    const results: SendResultItem[] = [];

    for (const recipient of recipients) {
      const email = buildEmail(recipient.studentId);
      const content = replacePlaceholders(
        messageTemplate,
        recipient.colC,
        recipient.colD,
        recipient.colE
      );

      try {
        const result = await sendChatMessage(accessToken, email, content);
        results.push({
          studentId: recipient.studentId,
          email,
          success: true,
          chatId: result.chatId,
        });
      } catch (e) {
        results.push({
          studentId: recipient.studentId,
          email,
          success: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }

      // レート制限対策: 500ms 待機
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "送信中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
