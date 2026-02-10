"use client";

import type { Recipient } from "@/types";

interface Props {
  recipients: Recipient[];
}

export default function RecipientTable({ recipients }: Props) {
  if (recipients.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        送信先一覧 ({recipients.length} 件)
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">学籍番号 (A列)</th>
              <th className="px-4 py-2">氏名 (B列)</th>
              <th className="px-4 py-2">C列</th>
              <th className="px-4 py-2">D列</th>
              <th className="px-4 py-2">E列</th>
            </tr>
          </thead>
          <tbody>
            {recipients.map((r, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                <td className="px-4 py-2 font-mono">{r.studentId}</td>
                <td className="px-4 py-2">{r.name || "-"}</td>
                <td className="px-4 py-2">{r.colC || "-"}</td>
                <td className="px-4 py-2">{r.colD || "-"}</td>
                <td className="px-4 py-2">{r.colE || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
