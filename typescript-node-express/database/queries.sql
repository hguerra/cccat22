select
  acc.account_id account__account_id,
  acc.name account__name,
  acc.email account__email,
  acc.document account__document,
  acc.password account__password,
  ass.asset_id asset__asset_id,
  ass.quantity asset__quantity
from
  ccca.account acc
  left join ccca.account_asset ass on acc.account_id = ass.account_id
where
  acc.account_id = '3cac0f69-fe27-4f45-92b0-189b118f6aea'
order by
  acc.account_id,
  ass.asset_id;
