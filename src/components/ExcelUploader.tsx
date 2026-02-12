"use client";

import { useCallback } from "react";
import type { Recipient } from "@/types";

interface Props {
  onParsed: (recipients: Recipient[]) => void;
}

export default function ExcelUploader({ onParsed }: Props) {
  const parseFile = useCallback(
    async (file: File) => {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        header: "A",
      });

      // 1行目はヘッダーなのでスキップ
      const recipients: Recipient[] = rows.slice(1).map((row) => ({
        studentId: String(row["A"] ?? "").trim(),
        name: String(row["B"] ?? "").trim(),
        colC: String(row["C"] ?? "").trim(),
        colD: String(row["D"] ?? "").trim(),
        colE: String(row["E"] ?? "").trim(),
      })).filter((r) => r.studentId !== "");

      onParsed(recipients);
    },
    [onParsed]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">送信先 Excel アップロード</h2>

      <div className="mb-3">
        <a
          href="/chatsender/template.xlsx"
          download
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          テンプレート Excel をダウンロード
        </a>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-gray-500 hover:border-blue-400 hover:text-blue-600"
      >
        <p className="mb-2 text-sm">
          Excel ファイルをドラッグ＆ドロップ、またはクリックして選択
        </p>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleChange}
          className="text-sm"
        />
      </div>
    </div>
  );
}
