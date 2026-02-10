"use client";

import type { SendResultItem } from "@/types";

interface Props {
  sending: boolean;
  total: number;
  completed: number;
  results: SendResultItem[];
}

export default function SendProgress({ sending, total, completed, results }: Props) {
  if (!sending && results.length === 0) return null;

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">送信状況</h2>

      {sending && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-sm text-gray-600">
            <span>送信中...</span>
            <span>{completed} / {total}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!sending && results.length > 0 && (
        <div className="mb-4 flex gap-4 text-sm">
          <span className="text-green-700">成功: {successCount}</span>
          <span className="text-red-700">失敗: {failCount}</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">学籍番号</th>
                <th className="px-4 py-2">メール</th>
                <th className="px-4 py-2">結果</th>
                <th className="px-4 py-2">詳細</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-2 font-mono">{r.studentId}</td>
                  <td className="px-4 py-2 text-xs">{r.email}</td>
                  <td className="px-4 py-2">
                    {r.success ? (
                      <span className="text-green-600">成功</span>
                    ) : (
                      <span className="text-red-600">失敗</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {r.success ? r.chatId : r.error}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
