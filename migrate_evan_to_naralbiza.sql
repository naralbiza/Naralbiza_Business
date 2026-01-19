-- migrate_evan_to_naralbiza.sql
-- Purpose: Migrate all data ownership from "Evanilson Peso" to "Naralbiza Service" (naralbizaservice@gmail.com)

DO $$
DECLARE
    old_admin_id UUID;
    new_admin_id UUID;
    updated_count INTEGER;
BEGIN
    -- 1. Identify the Source User (Evanilson)
    -- Using ILIKE to find by name since we don't have the exact email in code
    -- We select the first match.
    SELECT id INTO old_admin_id 
    FROM auth.users 
    WHERE raw_user_meta_data->>'name' ILIKE '%Evanilson%' 
       OR raw_user_meta_data->>'full_name' ILIKE '%Evanilson%'
       OR email ILIKE '%evanilson%'
    LIMIT 1;

    -- Fallback to public.users if not found in auth (though they should be synced)
    IF old_admin_id IS NULL THEN
        SELECT id INTO old_admin_id FROM public.users WHERE name ILIKE '%Evanilson%' LIMIT 1;
    END IF;

    -- 2. Identify the Target User (Naralbiza Service)
    SELECT id INTO new_admin_id 
    FROM auth.users 
    WHERE email = 'naralbizaservice@gmail.com';

    -- Validation
    IF old_admin_id IS NULL THEN
        RAISE EXCEPTION 'Could not find user "Evanilson Peso". Please verify the name or email.';
    END IF;

    IF new_admin_id IS NULL THEN
        RAISE EXCEPTION 'Could not find target user "naralbizaservice@gmail.com". Please run create_fresh_admin_gmail.sql first.';
    END IF;

    RAISE NOTICE 'Migrating data from User ID: % (Evanilson) to User ID: % (Naralbiza)', old_admin_id, new_admin_id;

    -- 3. Perform Updates on all tables with user references
    
    -- Leads (owner_id)
    UPDATE public.leads SET owner_id = new_admin_id WHERE owner_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % leads.', updated_count;

    -- Lead Notes (author_id)
    UPDATE public.lead_notes SET author_id = new_admin_id WHERE author_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % lead notes.', updated_count;

    -- Taxes (responsible_id)
    UPDATE public.taxes SET responsible_id = new_admin_id WHERE responsible_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % taxes.', updated_count;

    -- Reports (employee_id)
    UPDATE public.reports SET employee_id = new_admin_id WHERE employee_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % reports.', updated_count;

    -- Notifications (user_id)
    UPDATE public.notifications SET user_id = new_admin_id WHERE user_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % notifications.', updated_count;

    -- Activities (actor_id)
    UPDATE public.activities SET actor_id = new_admin_id WHERE actor_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % activities.', updated_count;

    -- Goals (employee_id)
    UPDATE public.goals SET employee_id = new_admin_id WHERE employee_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % goals.', updated_count;

    -- Production Projects (responsible_id)
    UPDATE public.production_projects SET responsible_id = new_admin_id WHERE responsible_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % production projects (responsible).', updated_count;

    -- Production Projects (team_ids array) - Replace old ID with new ID in the array
    UPDATE public.production_projects 
    SET team_ids = array_replace(team_ids, old_admin_id, new_admin_id)
    WHERE old_admin_id = ANY(team_ids);
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % production projects (team member).', updated_count;

    -- Equipment (assigned_to)
    UPDATE public.equipment SET assigned_to = new_admin_id WHERE assigned_to = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % equipment items.', updated_count;

    -- SOPs (author_id)
    UPDATE public.sops SET author_id = new_admin_id WHERE author_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % SOPs.', updated_count;

    -- Editorial Content (responsible_id, author_id)
    UPDATE public.editorial_content SET responsible_id = new_admin_id WHERE responsible_id = old_admin_id;
    UPDATE public.editorial_content SET author_id = new_admin_id WHERE author_id = old_admin_id;
    
    -- Agenda Eventos (responsible_id)
    UPDATE public.agenda_eventos SET responsible_id = new_admin_id WHERE responsible_id = old_admin_id;
    
    -- Agenda Eventos (attendee_ids array)
    UPDATE public.agenda_eventos 
    SET attendee_ids = array_replace(attendee_ids, old_admin_id, new_admin_id)
    WHERE old_admin_id = ANY(attendee_ids);

    -- Transactions (responsible_id)
    UPDATE public.transactions SET responsible_id = new_admin_id WHERE responsible_id = old_admin_id;

    -- Team Members (employee_id)
    -- Handle constraints carefully, if new user is already in team, delete old, else update
    -- Here we try a simple update and ignore unique violations if any (though best to handle)
    BEGIN
        UPDATE public.team_members SET employee_id = new_admin_id WHERE employee_id = old_admin_id;
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'User already exists in some teams, removing old membership to avoid duplicates.';
        DELETE FROM public.team_members WHERE employee_id = old_admin_id;
    END;

    -- Permissions (user_id)
    UPDATE public.permissions SET user_id = new_admin_id WHERE user_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % permissions assignments.', updated_count;

    -- --- NEWLY IDENTIFIED TABLES ---

    -- Quality Checklists (created_by)
    UPDATE public.quality_checklists SET created_by = new_admin_id WHERE created_by = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % quality checklists.', updated_count;

    -- Client Approvals (requested_by)
    UPDATE public.client_approvals SET requested_by = new_admin_id WHERE requested_by = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % client approvals.', updated_count;

    -- Quality Revisions (author_id)
    -- Check if table exists as 'quality_revisions' or 'revisions'
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quality_revisions') THEN
        UPDATE public.quality_revisions SET author_id = new_admin_id WHERE author_id = old_admin_id;
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RAISE NOTICE 'Updated % quality revisions.', updated_count;
    END IF;

    -- Weekly Reports (employee_id)
    UPDATE public.weekly_reports SET employee_id = new_admin_id WHERE employee_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % weekly reports.', updated_count;

    -- Trainings (employee_id)
    UPDATE public.trainings SET employee_id = new_admin_id WHERE employee_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % trainings.', updated_count;

    -- Culture Feedback (employee_id)
    UPDATE public.culture_feedback SET employee_id = new_admin_id WHERE employee_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % culture feedback entries.', updated_count;

    -- Attendance Records (employee_id)
    UPDATE public.attendance_records SET employee_id = new_admin_id WHERE employee_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % attendance records.', updated_count;

    -- Users (supervisor_id)
    -- If Evanilson was anyone's supervisor, now Naralbiza Service is.
    UPDATE public.users SET supervisor_id = new_admin_id WHERE supervisor_id = old_admin_id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % users (supervisor assignment).', updated_count;


    -- FINAL DEACTIVATION OF OLD USER (Optional but recommended to prevent confusion)
    -- UPDATE public.users SET active = false WHERE id = old_admin_id;
    -- RAISE NOTICE 'Deactivated old user profile.';

    RAISE NOTICE 'Migration completed successfully.';

END $$;
