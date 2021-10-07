SELECT
  order_created_date as ds,
  country_code,
  country_name,
  region,
  ofo,
  is_cancelled,
  brand_name,
  AVG(subtotal_usd) as average_subtotal_usd,
  SUM(subtotal_usd) as sum_subtotal_usd,
  COUNT(*) as orders
FROM hudi_ingest.analytics_views.future_foods_customer_orders
WHERE
  order_created_date > DATE '${start_date}'
  AND order_created_date < DATE '${start_date}' + INTERVAL '${days_to_fetch}' DAY
  AND organization_name IS NOT NULL
GROUP BY 1, 2, 3, 4, 5, 6, 7
ORDER BY 1, 2, 3, 4, 5, 6, 7;