"use client";

import { useState, useEffect } from "react";
import { getMsalInstance, SCOPES } from "@/lib/msal";
import type { AccountInfo } from "@azure/msal-browser";

interface Props {
  onAuthChange: (authenticated: boolean, accessToken: string | null) => void;
}

export default function AuthStatus({ onAuthChange }: Props) {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 初回マウント時にキャッシュからサイレント認証を試みる
  useEffect(() => {
    (async () => {
      try {
        const msalInstance = await getMsalInstance();
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const result = await msalInstance.acquireTokenSilent({
            scopes: SCOPES,
            account: accounts[0],
          });
          setAccount(accounts[0]);
          onAuthChange(true, result.accessToken);
        } else {
          onAuthChange(false, null);
        }
      } catch {
        onAuthChange(false, null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const msalInstance = await getMsalInstance();
      const result = await msalInstance.loginPopup({ scopes: SCOPES });
      if (result.account) {
        setAccount(result.account);
        onAuthChange(true, result.accessToken);
      }
    } catch (e) {
      console.error("Login failed:", e);
      alert("認証に失敗しました。ポップアップがブロックされていないか確認してください。");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const msalInstance = await getMsalInstance();
      await msalInstance.logoutPopup();
      setAccount(null);
      onAuthChange(false, null);
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">認証状態</h2>
        <p className="text-sm text-gray-500">認証状態を確認中...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">認証状態</h2>

      {account ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
            認証済み: {account.username}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            ログアウト
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center gap-2 text-yellow-700">
            <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" />
            未認証
          </div>
          <button
            onClick={handleLogin}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Microsoft アカウントでログイン
          </button>
        </div>
      )}
    </div>
  );
}
