-- check_types.sql
SELECT 
    table_name, 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND (
      (table_name = 'leads' AND column_name = 'owner_id')
   OR (table_name = 'users' AND column_name = 'id')
   OR (table_name = 'production_projects' AND column_name = 'responsible_id')
   OR (table_name = 'reports' AND column_name = 'employee_id')
  );
