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
            console.log('[AuthContext] Fetching user profile for:', user.id, user.email);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('[AuthContext] Error fetching user profile:', error.message, error.code);

                // If profile doesn't exist, try to auto-create it
                if (error.code === 'PGRST116') {
                    console.log('[AuthContext] Profile not found. Attempting to auto-create for:', user.email);
                    try {
                        const newProfile = await createEmployee({
                            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                            email: user.email || '',
                            role: 'Comercial', // Default role
                            sector: 'Comercial', // Default sector
                            active: true
                        }, user.id);

                        if (newProfile) {
                            console.log('[AuthContext] Auto-created profile successfully:', newProfile.email);
                            return newProfile;
                        } else {
                            console.error('[AuthContext] Profile auto-creation returned null');
                            return null;
                        }
                    } catch (createError) {
                        console.error('[AuthContext] Failed to auto-create profile:', createError);
                        return null;
                    }
                }
                return null;
            }

            if (!data) {
                console.warn('[AuthContext] No profile found for user (data is null):', user.id);
                return null;
            }

            console.log('[AuthContext] User profile found for:', data.email, 'Role:', data.role);
            const userProfile = mapUserFromDB(data);

            // Fetch permissions: check for user-specific overrides first, then role defaults
            try {
                console.log('[AuthContext] Fetching permissions for:', user.id);
                const userPermissions = await getPermissionsByUser(user.id);
                if (userPermissions && userPermissions.length > 0) {
                    console.log('[AuthContext] Using user-specific permissions');
                    userProfile.permissions = userPermissions;
                } else {
                    console.log('[AuthContext] Fetching role permissions for:', userProfile.role);
                    const roles = await getRoles();
                    const role = roles.find(r => r.name === userProfile.role);
                    if (role) {
                        const rolePermissions = await getPermissionsByRole(role.id);
                        userProfile.permissions = rolePermissions;
                        console.log('[AuthContext] Role permissions loaded:', rolePermissions.length);
                    } else {
                        console.warn('[AuthContext] Role not found for permissions:', userProfile.role);
                    }
                }
            } catch (permError) {
                console.error('[AuthContext] Error fetching permissions:', permError);
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
            console.error('[AuthContext] UNEXPECTED error in fetchUser:', error);
            return null;
        }
    };

    const refreshUser = async () => {
        console.log('[AuthContext] Refreshing user context...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const user = await fetchUser(session.user);
            setCurrentUser(user);
        } else {
            console.log('[AuthContext] No active session found during refresh.');
            setCurrentUser(null);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            console.log('[AuthContext] Initializing auth state...');
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    console.log('[AuthContext] Initial session found for:', session.user.email);
                    const user = await fetchUser(session.user);
                    if (user && user.active === false) {
                        console.warn('[AuthContext] User is inactive. Revoking session.');
                        await signOut();
                    } else {
                        console.log('[AuthContext] Setting currentUser:', user?.email || 'EMPTY_PROFILE');
                        setCurrentUser(user);
                    }
                } else {
                    console.log('[AuthContext] No initial session found.');
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error('[AuthContext] Init auth error:', error);
            } finally {
                setLoading(false);
            }

            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('[AuthContext] Auth state event:', event);

                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                    if (session?.user) {
                        setLoading(true);
                        const user = await fetchUser(session.user);
                        if (user && user.active === false) {
                            console.warn('[AuthContext] User became inactive. Signing out.');
                            await signOut();
                        } else {
                            setCurrentUser(user);
                        }
                        setLoading(false);
                    }
                } else if (event === 'SIGNED_OUT') {
                    console.log('[AuthContext] User signed out');
                    setCurrentUser(null);
                    setLoading(false);
                } else {
                    // Fallback for other events
                    setLoading(false);
                }
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
