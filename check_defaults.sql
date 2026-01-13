SELECT 
    table_name, 
    column_name, 
    column_default, 
    is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'id'
ORDER BY table_name;
