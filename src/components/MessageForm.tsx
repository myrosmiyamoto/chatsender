"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function MessageForm({ value, onChange }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">メッセージ入力</h2>

      <div className="mb-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
        <p className="font-medium">プレースホルダー:</p>
        <ul className="mt-1 list-inside list-disc">
          <li><code className="rounded bg-yellow-100 px-1">{"{C}"}</code> → C列の値に置換</li>
          <li><code className="rounded bg-yellow-100 px-1">{"{D}"}</code> → D列の値に置換</li>
          <li><code className="rounded bg-yellow-100 px-1">{"{E}"}</code> → E列の値に置換</li>
        </ul>
        <p className="mt-1">HTML タグも使用可能です（例: <code className="rounded bg-yellow-100 px-1">{"<br>"}</code> で改行）</p>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="メッセージを入力してください..."
        className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
