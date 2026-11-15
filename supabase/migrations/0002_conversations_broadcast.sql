-- 全会話ログ
create table conversations (
  id          uuid        primary key default gen_random_uuid(),
  line_user_id text       not null,
  user_message text       not null,
  bot_answer  text        not null,
  confidence  text        not null check (confidence in ('高', '中', '低')),
  created_at  timestamptz not null default now()
);
alter table conversations enable row level security;
create policy "service role only" on conversations using (false);

-- 一斉配信履歴
create table broadcast_logs (
  id           uuid        primary key default gen_random_uuid(),
  message_text text        not null,
  sent_at      timestamptz not null default now()
);
alter table broadcast_logs enable row level security;
create policy "service role only" on broadcast_logs using (false);
