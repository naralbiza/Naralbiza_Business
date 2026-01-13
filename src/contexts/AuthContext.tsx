import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, insertUser, getPermissionsByRole, getPermissionsByUser, getRoles, createEmployee } from '../services/api';
import { User, ModulePermission, Page } from '../types';
import { mapUserFromDB } from '../services/api';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    isAdmin: boolean;
    hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'approve') => boolean;
    visibleModules: string[];
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async (user: SupabaseUser) => {
        try {
            console.log('[AuthContext] Fetching user profile for:', user.id);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('[AuthContext] Error fetching user profile:', error);

                // Check if error is "PGRST116" (JSON object requested, multiple (or no) rows returned)
                // The JS client might return a specific error object or code.
                // If we are here, it likely means the profile doesn't exist.

                console.log('[AuthContext] Attempting to auto-create profile for orphan user...');
                try {
                    const newProfile = await createEmployee({
                        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                        email: user.email || '',
                        role: 'Comercial', // Default role
                        sector: 'Comercial', // Default sector
                        active: true
                    }, user.id);

                    console.log('[AuthContext] Auto-created profile:', newProfile);
                    return newProfile;
                } catch (createError) {
                    console.error('[AuthContext] Failed to auto-create profile:', createError);
                    return null;
                }
            }

            if (!data) {
                console.warn('[AuthContext] No profile found for user (data is null):', user.id);
                return null;
            }

            console.log('[AuthContext] User profile found:', data);
            const userProfile = mapUserFromDB(data);

            // Fetch permissions: check for user-specific overrides first, then role defaults
            try {
                const userPermissions = await getPermissionsByUser(user.id);
                if (userPermissions && userPermissions.length > 0) {
                    userProfile.permissions = userPermissions;
                } else {
                    const roles = await getRoles();
                    const role = roles.find(r => r.name === userProfile.role);
                    if (role) {
                        const rolePermissions = await getPermissionsByRole(role.id);
                        userProfile.permissions = rolePermissions;
                    }
                }
            } catch (permError) {
                console.error('[AuthContext] Error fetching permissions, falling back to basic profile:', permError);
                // Try to at least get role permissions if user-specific fail
                try {
                    const roles = await getRoles();
                    const role = roles.find(r => r.name === userProfile.role);
                    if (role) {
                        const rolePermissions = await getPermissionsByRole(role.id);
                        userProfile.permissions = rolePermissions;
                    }
                } catch (roleErr) {
                    console.error('[AuthContext] Critical failure fetching role permissions:', roleErr);
                }
            }

            return userProfile;
        } catch (error) {
            console.error('[AuthContext] Error in fetchUser:', error);
            return null;
        }
    };

    const refreshUser = async () => {
        console.log('[AuthContext] Refreshing user...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const user = await fetchUser(session.user);
            setCurrentUser(user);
        } else {
            console.log('[AuthContext] No session found during refresh.');
            setCurrentUser(null);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            setLoading(true);
            console.log('[AuthContext] Initializing auth...');
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                console.log('[AuthContext] Session found:', session.user.id);
                const user = await fetchUser(session.user);
                if (user && user.active === false) {
                    console.warn('[AuthContext] User is inactive. Signing out.');
                    await signOut();
                } else {
                    setCurrentUser(user);
                }
            } else {
                console.log('[AuthContext] No initial session.');
                setCurrentUser(null);
            }
            setLoading(false);

            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('[AuthContext] Auth state changed:', event);
                if (session?.user) {
                    const user = await fetchUser(session.user);
                    if (user && user.active === false) {
                        console.warn('[AuthContext] User is inactive. Signing out.');
                        await signOut();
                    } else {
                        setCurrentUser(user);
                    }
                } else {
                    setCurrentUser(null);
                }
                setLoading(false);
            });

            return () => subscription.unsubscribe();
        };

        initAuth();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

    const hasPermission = (module: string, action: 'view' | 'create' | 'edit' | 'approve') => {
        if (!currentUser) return false;
        if (currentUser.role === 'Admin' || currentUser.role === 'CEO / Direção') return true;

        const permission = currentUser.permissions?.find(p => p.module === module);
        if (!permission) return false;

        switch (action) {
            case 'view': return permission.canView;
            case 'create': return permission.canCreate;
            case 'edit': return permission.canEdit;
            case 'approve': return permission.canApprove;
            default: return false;
        }
    };

    const visibleModules = React.useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'Admin' || currentUser.role === 'CEO / Direção') {
            return Object.values(Page);
        }
        return currentUser.permissions?.filter(p => p.canView).map(p => p.module) || [];
    }, [currentUser]);

    const value = {
        currentUser,
        loading,
        isAdmin: currentUser?.role === 'Admin' || currentUser?.role === 'CEO / Direção',
        hasPermission,
        visibleModules,
        signOut,
        refreshUser
    };

    // Real-time permission syncing
    useEffect(() => {
        if (!currentUser || !currentUser.id) return;

        console.log('[AuthContext] Setting up real-time permission syncing for user:', currentUser.id);

        // Subscribe to changes in the permissions table
        const channel = supabase
            .channel(`public:permissions:user:${currentUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'permissions'
                },
                (payload) => {
                    const changedPermission = payload.new as any;
                    const oldPermission = payload.old as any;

                    // Check if the change affects THIS user directly
                    const isUserOverride = (changedPermission?.user_id === currentUser.id) || (oldPermission?.user_id === currentUser.id);

                    // Or if it affects their role-based permissions
                    // We need the role ID, but we can just check if it matches the current permissions cached
                    const isRoleChange = currentUser.permissions?.some(p => p.id === (changedPermission?.id || oldPermission?.id));

                    if (isUserOverride || isRoleChange) {
                        console.log('[AuthContext] Relevant permission change detected, refreshing user profile...');
                        refreshUser();
                    }
                }
            )
            .subscribe((status) => {
                console.log('[AuthContext] Permission sync status:', status);
            });

        return () => {
            console.log('[AuthContext] Cleaning up permission sync...');
            supabase.removeChannel(channel);
        };
    }, [currentUser?.id, currentUser?.permissions]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
