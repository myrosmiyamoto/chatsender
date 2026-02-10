"use client";

import { useState, useCallback, useRef } from "react";
import { getMsalInstance, SCOPES } from "@/lib/msal";
import AuthStatus from "./AuthStatus";
import ExcelUploader from "./ExcelUploader";
import RecipientTable from "./RecipientTable";
import MessageForm from "./MessageForm";
import SendProgress from "./SendProgress";
import type { Recipient, SendResultItem } from "@/types";

export default function ChatSender() {
  const [authenticated, setAuthenticated] = useState(false);
  const accessTokenRef = useRef<string | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [results, setResults] = useState<SendResultItem[]>([]);

  const handleAuthChange = useCallback((auth: boolean, token: string | null) => {
    setAuthenticated(auth);
    accessTokenRef.current = token;
  }, []);

  const getAccessToken = async (): Promise<string | null> => {
    // 既存のトークンが有効ならそのまま使う、期限切れならサイレントで再取得
    try {
      const msalInstance = await getMsalInstance();
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length === 0) return null;
      const result = await msalInstance.acquireTokenSilent({
        scopes: SCOPES,
        account: accounts[0],
      });
      accessTokenRef.current = result.accessToken;
      return result.accessToken;
    } catch {
      return null;
    }
  };

  const handleSend = async () => {
    if (!authenticated) {
      alert("先に認証を行ってください。");
      return;
    }
    if (recipients.length === 0) {
      alert("送信先の Excel をアップロードしてください。");
      return;
    }
    if (!message.trim()) {
      alert("メッセージを入力してください。");
      return;
    }

    const confirmed = window.confirm(
      `${recipients.length} 件の送信先にメッセージを送信します。よろしいですか？`
    );
    if (!confirmed) return;

    const token = await getAccessToken();
    if (!token) {
      alert("トークンの取得に失敗しました。再度ログインしてください。");
      return;
    }

    setSending(true);
    setTotal(recipients.length);
    setCompleted(0);
    setResults([]);

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipients, messageTemplate: message }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "送信中にエラーが発生しました");
        return;
      }

      setResults(data.results);
      setCompleted(data.results.length);
    } catch (e) {
      alert(`送信エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Teams チャット一括送信</h1>

      <AuthStatus onAuthChange={handleAuthChange} />
      <ExcelUploader onParsed={setRecipients} />
      <RecipientTable recipients={recipients} />
      <MessageForm value={message} onChange={setMessage} />

      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={sending || !authenticated || recipients.length === 0 || !message.trim()}
          className="rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "送信中..." : "一括送信"}
        </button>
      </div>

      <SendProgress
        sending={sending}
        total={total}
        completed={completed}
        results={results}
      />
    </div>
  );
}
