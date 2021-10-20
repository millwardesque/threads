-- THIS IS BROKEN
-- @TODO USE WITH ETL DATES

WITH store_statuses AS (
    SELECT
        store_view.store_id,
        account_status.status,
        account_status.last_update_event,
        account_status.created_at,
        CASE
            WHEN account.account_type_slug LIKE ('doordash%') THEN 'doordash'
            WHEN account.account_type_slug LIKE ('ubereats%') THEN 'ubereats'
            WHEN account.account_type_slug LIKE ('grubhub%') THEN 'grubhub'
            WHEN account.account_type_slug LIKE ('deliveroo%') THEN 'deliveroo'
            ELSE account.account_type_slug
        END AS ofo,
        DATE(account_status.created_at) AS ds,
        FIRST_VALUE(account_status.status) over (PARTITION BY store_view.store_id, DATE(account_status.created_at) ORDER BY account_status.created_at) AS earliest_status,
        LAST_VALUE(account_status.status) over (PARTITION BY store_view.store_id, DATE(account_status.created_at) ORDER BY account_status.created_at) AS latest_status,
        CASE WHEN (COUNT(CASE WHEN account_status.status = 'RETRIABLE' THEN 1 END) OVER (PARTITION BY store_view.store_id, DATE(account_status.created_at))) > 1 THEN 1 ELSE 0 END AS was_retriable,
        CASE WHEN (COUNT(CASE WHEN account_status.status = 'ACTIVE' THEN 1 END) OVER (PARTITION BY store_view.store_id, DATE(account_status.created_at))) > 1 THEN 1 ELSE 0 END AS was_active,
        CASE WHEN (COUNT(CASE WHEN account_status.status = 'SUSPENDED' THEN 1 END) OVER (PARTITION BY store_view.store_id, DATE(account_status.created_at))) > 1 THEN 1 ELSE 0 END AS was_suspended,
        CASE WHEN (COUNT(CASE WHEN account_status.status = 'SYSTEM_DISABLED' THEN 1 END) OVER (PARTITION BY store_view.store_id, DATE(account_status.created_at))) > 1 THEN 1 ELSE 0 END AS was_disabled,
        COUNT(*) OVER (PARTITION BY store_view.store_id, DATE(account_status.created_at)) AS changes,
        ROW_NUMBER() over (PARTITION BY store_view.store_id, DATE(account_status.created_at) ORDER BY account_status.created_at) AS row
    FROM
        hudi_ingest.processed.store_config_brand_view brand_view
        LEFT JOIN hudi_ingest.processed.store_config_store_view store_view ON brand_view.brand_id = store_view.brand_id
        LEFT JOIN store_config_postgres.public.account account ON CAST(account.owning_entity_id as VARCHAR) = store_view.store_id
        LEFT JOIN store_config_postgres.public.account_status_history account_status ON account.account_id = account_status.account_id
        LEFT JOIN hudi_ingest.scratch.facility_country_mapping country_mapping ON store_view.facility_id = country_mapping.facility_uuid
    WHERE 1=1
        AND brand_view.organization_id = 'ac56d23b-a6a2-4c49-8412-a0a0949fb5ef'
        AND store_view.is_active = true
        AND account_status.status != 'ONBOARDING'
        AND account_status.created_at > TIMESTAMP '2021-10-01 00:00:00 UTC'
        AND DATE(account_status.created_at) < DATE(NOW())
),
last_status_change AS (
    SELECT
        store_id,
        ds,
        MAX(row) as row
    FROM store_statuses
    GROUP BY 1, 2
),
daily_status_by_store AS (
    SELECT
        *
    FROM store_statuses
    INNER JOIN last_status_change last_change USING (store_id, ds, row)
)
SELECT
    ds,
    ofo,
    earliest_status,
    latest_status,
    was_retriable,
    was_active,
    was_suspended,
    was_disabled,
    AVG(changes) AS average_changes,
    SUM(changes) AS sum_changes,
    COUNT(*) AS count
FROM daily_status_by_store
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
ORDER BY ds, latest_status;