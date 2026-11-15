# anken1 — 美容室向け LINE bot + AI 自動応答

## プロジェクト概要

美容室オーナーからの依頼。LINE 公式アカウント（友だち 300 人）に届く
1日 10〜15 件の問い合わせを AI で自動応答するシステムを構築する。

## 技術スタック

| 層 | 技術 | 備考 |
|---|---|---|
| フロント / API | Next.js + Vercel | 無料枠で完結 |
| DB | Supabase | 無料枠 / RLS でセキュリティ確保 |
| AI | Claude API (Sonnet 4.6) | 自然な日本語応答 |
| LINE 連携 | LINE Messaging API | 既存の公式アカウントをそのまま活用 |
| 管理画面認証 | Supabase Auth (マジックリンク) | スマホ対応 |

## システム構成

```
LINE Messaging API
      ↓ Webhook
Next.js API Route (POST /api/webhook)
      ↓
  Claude API ← Supabase（FAQ / メニュー DB）
      ↓
  Reply Message（無料・無制限）

エスカレーション時:
  Push Message → オーナーの LINE へ直接通知（3円/件）
```

## セットアップ

```bash
npm install
cp .env.example .env.local   # 値を入力する
npm run dev
```

## ディレクトリ構成

```
anken1/
├── CLAUDE.md             # Claude Code 向けガイド
├── README.md
├── requirements.md       # ヒアリング結果・スコープ定義
├── proposal.md           # クライアント向け提案書
├── .env.example          # 環境変数テンプレート
└── src/
    └── app/
        ├── api/
        │   └── webhook/  # LINE Webhook エンドポイント
        └── admin/        # 管理画面
```

## ロードマップ

### Phase 1（本案件）
- FAQ 自動応答（頻出 5 質問）
- エスカレーション通知（オーナー LINE へ）
- 管理画面（FAQ / メニュー更新）
- お知らせ一斉配信

### Phase 2（将来提案）
- 予約機能（カレンダー連携・空き状況自動応答）
- リピーター向けパーソナライズ応答
