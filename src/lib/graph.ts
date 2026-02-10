interface SendChatResult {
  chatId: string;
  messageId: string;
}

const EMAIL_DOMAIN = "@myros365.onmicrosoft.com";

export function buildEmail(studentId: string): string {
  return `${studentId}${EMAIL_DOMAIN}`;
}

export function replacePlaceholders(
  template: string,
  colC: string,
  colD: string,
  colE: string
): string {
  return template
    .replace(/\{C\}/g, colC)
    .replace(/\{D\}/g, colD)
    .replace(/\{E\}/g, colE);
}

export async function sendChatMessage(
  accessToken: string,
  recipientEmail: string,
  content: string
): Promise<SendChatResult> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  // 自分の情報を取得
  const meRes = await fetch("https://graph.microsoft.com/v1.0/me", { headers });
  if (!meRes.ok) {
    throw new Error(`/me 取得失敗: ${meRes.status} ${await meRes.text()}`);
  }

  const meData = (await meRes.json()) as { id: string; userPrincipalName?: string };
  const myId = meData.id;
  const myUpn = meData.userPrincipalName ?? "";

  // 自分自身への送信かどうかを判定
  const isSelf =
    recipientEmail.toLowerCase() === myUpn.toLowerCase() ||
    recipientEmail === myId;

  const members: Record<string, unknown>[] = [
    {
      "@odata.type": "#microsoft.graph.aadUserConversationMember",
      roles: ["owner"],
      "user@odata.bind": `https://graph.microsoft.com/v1.0/users('${myId}')`,
    },
  ];

  if (!isSelf) {
    members.push({
      "@odata.type": "#microsoft.graph.aadUserConversationMember",
      roles: ["owner"],
      "user@odata.bind": `https://graph.microsoft.com/v1.0/users('${recipientEmail}')`,
    });
  }

  // チャット作成
  const chatRes = await fetch("https://graph.microsoft.com/v1.0/chats", {
    method: "POST",
    headers,
    body: JSON.stringify({ chatType: "oneOnOne", members }),
  });

  if (!chatRes.ok) {
    throw new Error(`チャット作成失敗: ${chatRes.status} ${await chatRes.text()}`);
  }

  const chatJson = (await chatRes.json()) as { id?: string };
  const chatId = chatJson.id;
  if (!chatId) {
    throw new Error(`chat_id を取得できませんでした`);
  }

  // メッセージ送信
  const msgRes = await fetch(
    `https://graph.microsoft.com/v1.0/chats/${chatId}/messages`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        body: { contentType: "html", content },
      }),
    }
  );

  if (msgRes.status !== 201) {
    throw new Error(`メッセージ送信失敗: ${msgRes.status} ${await msgRes.text()}`);
  }

  const msgJson = (await msgRes.json()) as { id?: string };
  return {
    chatId,
    messageId: msgJson.id ?? "",
  };
}
