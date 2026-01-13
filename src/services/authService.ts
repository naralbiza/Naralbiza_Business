import { supabase } from '../lib/supabase';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { User, Employee, Team, ModulePermission, Role } from '../types';
import { withRetry } from '../utils/retry';

// --- Mappers ---
export const mapUserFromDB = (u: any): User => ({
    id: u.id,
    name: u.name,
    email: u.email,
    active: u.active,
    role: u.role,
    sector: u.sector,
    avatarUrl: u.avatar_url,
    permissions: [], // Populated separately if needed
    department: u.department,
    contractType: u.contract_type,
    admissionDate: u.admission_date,
    supervisorId: u.supervisor_id
});

export const mapEmployeeFromDB = mapUserFromDB;

// --- User Actions ---
export const getUsers = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }
        return data.map(mapUserFromDB);
    });
};

export const getEmployees = getUsers;

export const insertUser = async (user: Omit<User, 'id' | 'avatarUrl' | 'permissions'>) => {
    return withRetry(async () => {
        const dbUser = {
            name: user.name,
            email: user.email,
            role: user.role,
            sector: user.sector,
            active: user.active !== undefined ? user.active : true,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
            department: user.department,
            contract_type: user.contractType,
            admission_date: user.admissionDate,
            supervisor_id: user.supervisorId
        };
        const { data, error } = await supabase.from('users').insert(dbUser).select().single();
        if (error) throw error;
        return mapUserFromDB(data);
    });
};

export const createEmployee = async (employee: Omit<User, 'id' | 'avatarUrl' | 'permissions'>, userId?: string) => {
    return withRetry(async () => {
        const dbUser = {
            id: userId,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            sector: employee.sector,
            active: employee.active !== undefined ? employee.active : true,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random`,
            department: employee.department,
            contract_type: employee.contractType,
            admission_date: employee.admissionDate,
            supervisor_id: employee.supervisorId
        };
        const { data, error } = await supabase.from('users').insert(dbUser).select().single();
        if (error) throw error;
        return mapUserFromDB(data);
    });
};

export const updateUser = async (user: User) => {
    return withRetry(async () => {
        const { avatarUrl, permissions, ...rest } = user;
        const dbUser = {
            name: rest.name,
            role: rest.role,
            sector: rest.sector,
            email: rest.email,
            active: rest.active,
            avatar_url: avatarUrl,
            department: rest.department,
            contract_type: rest.contractType,
            admission_date: rest.admissionDate,
            supervisor_id: rest.supervisorId
        };
        const { data, error } = await supabase.from('users').update(dbUser).eq('id', user.id).select().single();
        if (error) throw error;
        return mapUserFromDB(data);
    });
};

export const updateEmployee = updateUser;

export const deleteUser = async (userId: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('users').update({ active: false }).eq('id', userId);
        if (error) throw error;
    });
};

export const deleteEmployee = deleteUser;

// --- Permissions Actions ---
export const getRoles = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('roles').select('*');
        if (error) throw error;
        return data as { id: string, name: string }[];
    });
};

export const getPermissionsByRole = async (roleId: string) => {
    return withRetry(async () => {
        let query = supabase.from('permissions').select('*').eq('role_id', roleId);
        const { data, error } = await query.is('user_id', null);

        if (error) {
            if (error.code === 'PGRST204' || error.message?.includes('user_id')) {
                const fallback = await supabase.from('permissions').select('*').eq('role_id', roleId);
                if (fallback.error) throw fallback.error;
                return fallback.data.map((p: any) => ({
                    id: p.id,
                    module: p.module,
                    canView: p.can_view,
                    canCreate: p.can_create,
                    canEdit: p.can_edit,
                    canApprove: p.can_approve,
                    roleId: p.role_id,
                    userId: null
                })) as ModulePermission[];
            }
            throw error;
        }

        return data.map((p: any) => ({
            id: p.id,
            module: p.module,
            canView: p.can_view,
            canCreate: p.can_create,
            canEdit: p.can_edit,
            canApprove: p.can_approve,
            roleId: p.role_id,
            userId: p.user_id
        })) as ModulePermission[];
    });
};

export const getPermissionsByUser = async (userId: string) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('permissions').select('*').eq('user_id', userId);
        if (error) {
            if (error.code === 'PGRST204' || error.message?.includes('user_id')) {
                return [] as ModulePermission[];
            }
            throw error;
        }
        return data.map((p: any) => ({
            id: p.id,
            module: p.module,
            canView: p.can_view,
            canCreate: p.can_create,
            canEdit: p.can_edit,
            canApprove: p.can_approve,
            roleId: p.role_id,
            userId: p.user_id
        })) as ModulePermission[];
    });
};

export const updatePermission = async (permission: ModulePermission) => {
    return withRetry(async () => {
        const { id, module, canView, canCreate, canEdit, canApprove } = permission;
        const dbPermission = {
            can_view: canView,
            can_create: canCreate,
            can_edit: canEdit,
            can_approve: canApprove
        };
        const { data, error } = await supabase.from('permissions').update(dbPermission).eq('id', id).select().single();
        if (error) throw error;
        return {
            id: data.id,
            module: data.module,
            canView: data.can_view,
            canCreate: data.can_create,
            canEdit: data.can_edit,
            canApprove: data.can_approve
        };
    });
};

export const createPermission = async (roleId: string | null, module: string, permissionData: Partial<ModulePermission>, userId: string | null = null) => {
    return withRetry(async () => {
        const { canView, canCreate, canEdit, canApprove } = permissionData;
        const dbPermission = {
            role_id: roleId,
            user_id: userId,
            module: module,
            can_view: canView || false,
            can_create: canCreate || false,
            can_edit: canEdit || false,
            can_approve: canApprove || false
        };
        const { data, error } = await supabase.from('permissions').insert(dbPermission).select().single();
        if (error) throw error;
        return {
            id: data.id,
            module: data.module,
            canView: data.can_view,
            canCreate: data.can_create,
            canEdit: data.can_edit,
            canApprove: data.can_approve,
            roleId: data.role_id,
            userId: data.user_id
        } as ModulePermission;
    });
};

// --- Teams Actions ---
export const getTeams = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('teams').select('*');
        if (error) throw error;

        const teams = data as any[];
        const { data: members, error: membersError } = await supabase.from('team_members').select('*');
        if (membersError) throw membersError;

        return teams.map(team => ({
            ...team,
            memberIds: members.filter((m: any) => m.team_id === team.id).map((m: any) => m.employee_id)
        })) as Team[];
    });
};

export const createTeam = async (team: Omit<Team, 'id'>) => {
    return withRetry(async () => {
        const { memberIds, ...teamData } = team;
        const { data, error } = await supabase.from('teams').insert(teamData).select().single();
        if (error) throw error;

        if (memberIds && memberIds.length > 0) {
            const members = memberIds.map(id => ({ team_id: data.id, employee_id: id }));
            const { error: memError } = await supabase.from('team_members').insert(members);
            if (memError) {
                await supabase.from('teams').delete().eq('id', data.id);
                throw memError;
            }
        }

        return { ...data, memberIds } as Team;
    });
};

// --- Auth Helper ---
export const createUser = async (email: string, password: string, employeeData: Omit<Employee, 'id' | 'avatarUrl' | 'notificationPreferences'>) => {
    const tempSupabase = createSupabaseClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: authData, error: authError } = await withRetry(async () => tempSupabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: employeeData.name,
                role: employeeData.role,
            }
        }
    }), 2);

    if (authError) {
        if (authError.message.includes('already registered')) {
            throw new Error('Este email já está cadastrado no sistema de autenticação.');
        }
        throw authError;
    }

    if (authData.user) {
        try {
            return await createEmployee({ ...employeeData, email, active: true }, authData.user.id);
        } catch (profileError) {
            throw new Error(`User created in Auth but failed to create Profile: ${profileError instanceof Error ? profileError.message : 'Unknown error'}`);
        }
    } else {
        throw new Error('User created but no user object returned from Supabase Auth.');
    }
};
