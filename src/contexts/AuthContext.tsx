import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, createEmployee } from '../services/api';
import { Employee } from '../types';
import { mapEmployeeFromDB } from '../services/api';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
    currentUser: Employee | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async (user: User) => {
        try {
            console.log('[AuthContext] Fetching user profile for:', user.id);
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('user_id', user.id)
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
                        position: 'Staff',
                        role: 'Sales', // Default role
                        isAdmin: false, // Default to false, manual promotion required
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
            return mapEmployeeFromDB(data);
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

    const value = {
        currentUser,
        loading,
        isAdmin: currentUser?.isAdmin || false,
        signOut,
        refreshUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
