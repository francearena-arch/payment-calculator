-- Existing project: run this migration BEFORE deploying version 4.1.
-- Idempotent. Existing rows stay NULL = Not recorded. No prices are changed.
begin;
alter table public.pcc_cases add column if not exists industry text;
do $$ begin
 if not exists (select 1 from pg_constraint where conname='pcc_cases_industry_check' and conrelid='public.pcc_cases'::regclass) then
  alter table public.pcc_cases add constraint pcc_cases_industry_check
   check(industry is null or industry in ('Gastro','Hospitality','Beauty & Cosmetics','Health Services','Specialty Retail','Other','Unknown'));
 end if;
end $$;
create index if not exists pcc_cases_reporting_idx on public.pcc_cases(purpose,industry,quote_date);
commit;
