import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-black/5 animate-pulse rounded ${className}`} />
);

export const SkeletonLoader: React.FC = () => {
    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* Sidebar Skeleton */}
            <div className="w-72 bg-black border-r border-brand-gold/20 hidden md:flex flex-col p-4 space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                    <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
                    <Skeleton className="w-32 h-6 bg-white/10" />
                </div>
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                            <Skeleton className="w-6 h-6 bg-white/10" />
                            <Skeleton className="w-24 h-4 bg-white/10" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col ml-0">
                {/* Header Skeleton */}
                <div className="h-16 bg-white border-b border-brand-gold/20 flex items-center justify-between px-6">
                    <Skeleton className="w-48 h-8" />
                    <div className="flex items-center space-x-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-10 h-10 rounded-full" />
                    </div>
                </div>

                {/* Dashboard Content Skeleton */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-brand-gold/10 space-y-3">
                                <div className="flex justify-between items-start">
                                    <Skeleton className="w-24 h-4" />
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                </div>
                                <Skeleton className="w-32 h-8" />
                                <Skeleton className="w-16 h-4" />
                            </div>
                        ))}
                    </div>

                    {/* Charts Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-gold/10 h-80">
                            <div className="flex justify-between mb-4">
                                <Skeleton className="w-40 h-6" />
                                <Skeleton className="w-20 h-6" />
                            </div>
                            <div className="flex items-end justify-between h-56 space-x-2">
                                {[...Array(12)].map((_, i) => (
                                    <Skeleton key={i} className={`w-full rounded-t-sm h-${Math.floor(Math.random() * 5 + 4) * 8}`} />
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-gold/10 h-80 space-y-4">
                            <Skeleton className="w-48 h-6 mb-4" />
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="w-32 h-4" />
                                            <Skeleton className="w-24 h-3" />
                                        </div>
                                    </div>
                                    <Skeleton className="w-16 h-6" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
