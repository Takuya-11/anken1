# CLAUDE.md — anken1

美容室向け LINE Bot + AI 自動応答システムのクライアント案件。
1日10〜15件の LINE 問い合わせを Claude で自動応答する。
応答文はすべて日本語で生成すること。

## Phase 1 スコープ

- FAQ 自動応答（頻出5質問: 営業時間・料金・予約・施術・駐車場）
- エスカレーション通知（bot が答えられない質問 → オーナーの LINE へ push）
- 管理画面（FAQ / メニューをスマホで更新）
- お知らせ一斉配信（300人の友だちへ broadcast）

**スコープ外（Phase 2 以降）:** 予約機能・顧客カルテ・決済・多言語対応

## 技術スタック

| 層 | 技術 |
|---|---|
| フロント / API | Next.js (App Router) + Vercel |
| DB / Auth | Supabase（RLS 必須）+ Supabase Auth（マジックリンク） |
| AI | Claude API — `claude-sonnet-4-6` |
| LINE | LINE Messaging API (`@line/bot-sdk`) |

## 開発コマンド

```bash
npm run dev      # 開発サーバー (localhost:3000)
npm run build    # ビルド確認
npm run lint     # ESLint

# Webhook ローカルテスト（LINE から localhost に繋ぐ）
npx ngrok http 3000
# → LINE Developer Console の Webhook URL を ngrok の URL に変更する
```

環境変数は `.env.example` をコピーして `.env.local` に値を入れること。

> **Node.js v26 の注意**: `node_modules/.bin/next` がシンボリックリンクではなくコピーになるため
> `npm run *` は `node node_modules/next/dist/bin/next ...` で直接呼び出す形で回避済み（package.json に設定済み）。

## アーキテクチャメモ

- Webhook: `POST /api/webhook`
- LINE 署名検証は `validateSignature`（`@line/bot-sdk`）で必ず行う
- Claude 呼び出し前に Supabase から FAQ / メニューを取得してシステムプロンプトに注入
- エスカレーション = `pushMessage` でオーナーの LINE User ID へ直接送信

## コスト制約

- Claude API: 月500〜1,000円に収める（Sonnet 4.6 + prompt caching 活用）
- LINE 配信: 月200通まで無料 → ブロードキャストは月1〜2回想定
- Vercel / Supabase: 無料枠で完結させること

## セキュリティ注意事項

- `SUPABASE_SERVICE_ROLE_KEY` はサーバーサイド（API Routes）のみ使用。クライアントコードに渡すことを禁止
- `LINE_CHANNEL_SECRET` は環境変数のみ管理。コードへの直書き禁止
- Supabase の全テーブルで RLS を有効化すること
- 管理画面の認証は Supabase Auth マジックリンクのみ（パスワード認証は実装しない）
