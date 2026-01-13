SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'weekly_reports';

SELECT * FROM pg_policies WHERE tablename = 'weekly_reports';
