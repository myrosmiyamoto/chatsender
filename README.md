# Microsoft Graph API チャット送信プログラム Web アプリ

## 概要

既存の Microsoft Graph API を使ったチャット送信プログラムを Web アプリ化する。

## 1. 技術スタック

- **UI**: React、Tailwind CSS
- **バックエンド**: Next.js（App Router）
- **認証**: MSAL Browser（クライアントサイド、ポップアップ認証）
- **Excel パース**: SheetJS（クライアントサイド）
- **インフラ**: Docker + Docker Compose + nginx（リバースプロキシ / HTTPS）

## 2. ウェブアプリの機能

- チャットの送信内容をフォームから入力できるようにする。
- 送信相手のリストは Excel ファイル（template.xlsx）から取得する。
- A 列にある学籍番号に「@myros365.onmicrosoft.com」を付けて、送信先のアドレスを指定する。
- B 列は氏名（任意）。表示用で送信内容には使用しない。
- C・D・E 列には、受信者ごとに異なる個別のメッセージ内容を入れる。
  メッセージ内のプレースホルダー `{C}`、`{D}`、`{E}` がそれぞれの値に置換される。
- テンプレートの Excel ファイル（template.xlsx）をダウンロードできるようにする。
- 認証は各ユーザーのブラウザ上で行う（Microsoft ポップアップ認証）。
  複数ユーザーがそれぞれ独立して使用可能。

## 3. Azure AD アプリ登録の設定

- **アプリの種類**: パブリック クライアント / SPA
- **SPA リダイレクト URI**: アクセス元のブラウザ URL を登録する。
  - 開発: `http://localhost:3000/chatsender`
  - 本番: `https://<サーバーIP>/chatsender`
- **API のアクセス許可**: `Chat.ReadWrite`、`User.Read`

## 4. 起動方法

### 開発

```bash
cd webapp && bun install && bun run dev
```

→ http://localhost:3000/chatsender

### Docker（本番）

```bash
cd webapp && docker compose up --build -d
```

→ https://\<サーバーIP\>/chatsender

## 5. 環境変数

`webapp/.env.local` または `webapp/.env` に設定する。

```env
NEXT_PUBLIC_TENANT_ID=<テナントID>
NEXT_PUBLIC_CLIENT_ID=<クライアントID>
```

> **注意**
> - `NEXT_PUBLIC_` プレフィックスはクライアントサイドで参照するために必須。
> - Docker の場合、ビルド時に埋め込まれるため変更後は再ビルドが必要。

## 6. 本番デプロイ（Ubuntu）

1. Docker をインストールする：
   ```bash
   # 必要なパッケージをインストール
   sudo apt update
   sudo apt install -y ca-certificates curl gnupg

   # Docker 公式 GPG キーを追加
   sudo install -m 0755 -d /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   sudo chmod a+r /etc/apt/keyrings/docker.gpg

   # リポジトリを追加
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
     $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
     sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

   # Docker Engine と Docker Compose をインストール
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

   # 現在のユーザーを docker グループに追加（sudo なしで実行可能にする）
   sudo usermod -aG docker $USER
   newgrp docker
   ```
2. webapp フォルダをサーバーにコピーする。
2. 自己署名証明書を生成する：
   ```bash
   mkdir certs
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout certs/server.key -out certs/server.crt -subj "/CN=chat-sender"
   ```
3. `docker compose up --build -d` で起動する。
4. nginx が HTTPS (443) で受けて、内部の Next.js (3000) にプロキシする。
5. basePath が `/chatsender` に設定されているため、
   すべてのページ・API・静的ファイルは `/chatsender` 以下で動作する。
