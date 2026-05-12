alter table portfolio add column if not exists sort_order integer;

update portfolio
set sort_order = sub.rn
from (
  select id, row_number() over (order by created_at desc) - 1 as rn
  from portfolio
) sub
where portfolio.id = sub.id;
