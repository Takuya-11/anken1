-- FAQs
create table public.faqs (
  id            uuid primary key default gen_random_uuid(),
  question      text not null,
  answer        text not null,
  is_active     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.faqs enable row level security;

-- 管理画面（認証済みユーザー）: 全操作可
create policy "auth users can manage faqs"
  on public.faqs for all
  to authenticated
  using (true)
  with check (true);

-- Webhook サーバー（service_role）: 読み取りのみ（RLS バイパスなので不要だが明示）


-- メニュー
create table public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  category      text not null,          -- 例: 'カット', 'カラー', 'パーマ'
  name          text not null,
  price         integer not null,       -- 円（税込）
  description   text,
  is_active     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.menu_items enable row level security;

create policy "auth users can manage menu_items"
  on public.menu_items for all
  to authenticated
  using (true)
  with check (true);


-- エスカレーションログ
create table public.escalation_logs (
  id              uuid primary key default gen_random_uuid(),
  line_user_id    text not null,
  message_text    text not null,
  escalated_at    timestamptz not null default now(),
  resolved_at     timestamptz
);

alter table public.escalation_logs enable row level security;

create policy "auth users can manage escalation_logs"
  on public.escalation_logs for all
  to authenticated
  using (true)
  with check (true);


-- updated_at を自動更新するトリガー
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

create trigger menu_items_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();


-- 初期データ（頻出 5 質問）
insert into public.faqs (question, answer, display_order) values
  ('営業時間', '営業時間は火〜土 10:00〜19:00、日曜 10:00〜18:00 です。月曜定休です。', 1),
  ('料金', '料金はメニュー表をご確認ください。カット ¥4,500〜、カラー ¥8,000〜、パーマ ¥10,000〜 となっております。', 2),
  ('予約', 'ご予約はお電話（下記番号）または LINE でのご連絡をお願いしております。', 3),
  ('パーマとカラーの同時施術', 'パーマとカラーの同日施術は承っております。ただし髪の状態によってお断りする場合がございます。ご来店前にご相談ください。', 4),
  ('駐車場', '店舗横に無料駐車場を 3 台分ご用意しております。', 5);
