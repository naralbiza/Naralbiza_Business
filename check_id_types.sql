SELECT 
    table_name, 
    column_name, 
    data_type, 
    udt_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name LIKE '%id'
ORDER BY table_name, column_name;
