import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { clinicService } from '@/services/clinicService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, Server, Database, Activity, CreditCard, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface StatusItem {
    id: string;
    name: string;
    status: 'pending' | 'ok' | 'error' | 'warning';
    message?: string;
    latency?: number;
    details?: any;
}

const HealthCheckPage = () => {
    const [items, setItems] = useState<StatusItem[]>([
        { id: 'supabase_conn', name: 'Supabase Connection', status: 'pending' },
        { id: 'env_vars', name: 'Environment Variables', status: 'pending' },
        { id: 'auth_service', name: 'Authentication Service', status: 'pending' },
        { id: 'db_clinics', name: 'Table: clinics', status: 'pending' },
        { id: 'db_agendamentos', name: 'Table: agendamentos', status: 'pending' },
        { id: 'db_profiles', name: 'Table: profiles', status: 'pending' },
        { id: 'service_clinics', name: 'Clinic Service', status: 'pending' },
        { id: 'stripe_backend', name: 'Stripe Backend', status: 'pending' },
    ]);
    const [running, setRunning] = useState(false);

    const runDiagnostics = async () => {
        setRunning(true);
        const updates = [...items].map(i => ({ ...i, status: 'pending' as const, message: undefined, latency: undefined }));
        setItems(updates);

        // Helper to update status
        const updateStatus = (id: string, status: 'ok' | 'error' | 'warning', message?: string, latency?: number, details?: any) => {
            setItems(prev => prev.map(item => item.id === id ? { ...item, status, message, latency, details } : item));
        };

        // 1. Environment Variables
        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
            if (supabaseUrl && supabaseKey) {
                updateStatus('env_vars', 'ok', 'Variables loaded');
            } else {
                updateStatus('env_vars', 'error', 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
            }
        } catch (e) {
            updateStatus('env_vars', 'error', 'Error checking env vars');
        }

        // 2. Supabase Connection & Auth
        const startAuth = performance.now();
        try {
            const { data, error } = await supabase.auth.getSession();
            const latency = Math.round(performance.now() - startAuth);
            if (error) throw error;
            updateStatus('auth_service', 'ok', 'Session check active', latency);
            updateStatus('supabase_conn', 'ok', 'Connected', latency);
        } catch (e: any) {
            updateStatus('auth_service', 'error', e.message);
            updateStatus('supabase_conn', 'error', 'Connection failed');
        }

        // 3. Database Tables
        const checkTable = async (table: string, id: string) => {
            const start = performance.now();
            try {
                const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
                const latency = Math.round(performance.now() - start);
                if (error) throw error;
                updateStatus(id, 'ok', `${count} records found`, latency);
            } catch (e: any) {
                console.error(`Error checking ${table}:`, e);
                updateStatus(id, 'error', `Access denied or table missing: ${e.message}`);
            }
        };

        await Promise.all([
            checkTable('clinics', 'db_clinics'),
            checkTable('agendamentos', 'db_agendamentos'),
            checkTable('profiles', 'db_profiles')
        ]);

        // 4. Clinic Service Logic
        const startService = performance.now();
        try {
            // Force a real fetch if possible, check internal structure
            const clinics = await clinicService.getAllClinics({ limit: 1 });
            const latency = Math.round(performance.now() - startService);

            // Heuristic to check if it's mock data (mock data usually has specific IDs)
            const isMock = clinics.some(c => c.id.startsWith('mock-'));

            if (isMock) {
                updateStatus('service_clinics', 'warning', 'Service returned Mock Data (Fallback active)', latency);
            } else if (clinics.length === 0) {
                updateStatus('service_clinics', 'warning', 'No clinics returned (but no error)', latency);
            } else {
                updateStatus('service_clinics', 'ok', 'Real data fetched', latency);
            }
        } catch (e: any) {
            updateStatus('service_clinics', 'error', e.message);
        }

        // 5. Stripe Backend
        const startStripe = performance.now();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            // Try to hit a health endpoint or a safe endpoint
            const res = await fetch(`${apiUrl}/health`).catch(() => null);
            const latency = Math.round(performance.now() - startStripe);

            if (res && res.ok) {
                updateStatus('stripe_backend', 'ok', 'Backend reachable', latency);
            } else {
                // Only mark as warning since backend might not be strictly required for all features
                updateStatus('stripe_backend', 'warning', 'Backend unreachable (Payments may fail)', latency);
            }
        } catch (e) {
            updateStatus('stripe_backend', 'warning', 'Backend check failed', 0);
        }

        setRunning(false);
        toast.success('Diagnostics completed');
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    const getIcon = (status: string) => {
        switch (status) {
            case 'ok': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default: return <Activity className="w-5 h-5 text-gray-400 animate-pulse" />;
        }
    };

    const getColor = (status: string) => {
        switch (status) {
            case 'ok': return 'bg-green-500/10 border-green-500/20 text-green-500';
            case 'error': return 'bg-red-500/10 border-red-500/20 text-red-500';
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
            default: return 'bg-gray-500/10 border-gray-500/20 text-gray-500';
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        System Diagnostics
                    </h1>
                    <p className="text-gray-400 mt-1">Real-time API and Database connection verification.</p>
                </div>
                <Button
                    onClick={runDiagnostics}
                    disabled={running}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${running ? 'animate-spin' : ''}`} />
                    Run Diagnostics
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                    <Card key={item.id} className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">
                                {item.name}
                            </CardTitle>
                            {getIcon(item.status)}
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col space-y-1">
                                {item.status === 'pending' ? (
                                    <span className="text-2xl font-bold text-gray-500">Checking...</span>
                                ) : (
                                    <>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-lg font-bold capitalize ${item.status === 'ok' ? 'text-green-400' :
                                                    item.status === 'error' ? 'text-red-400' : 'text-yellow-400'
                                                }`}>
                                                {item.status === 'ok' ? 'Mobile Ok' : item.status}
                                            </span>
                                            {item.latency !== undefined && (
                                                <Badge variant="outline" className="text-xs border-gray-700">
                                                    {item.latency}ms
                                                </Badge>
                                            )}
                                        </div>
                                        {item.message && (
                                            <p className="text-sm text-gray-400 mt-1">
                                                {item.message}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-400" />
                        <span>Connection Summary</span>
                    </CardTitle>
                    <CardDescription>
                        Overview of the current system health status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                                <div className="text-sm text-gray-400 mb-1">Database Mode</div>
                                <div className="font-medium text-white flex items-center gap-2">
                                    <Database className="w-4 h-4 text-blue-400" />
                                    Supabase PostgreSQL
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                                <div className="text-sm text-gray-400 mb-1">API Backend</div>
                                <div className="font-medium text-white flex items-center gap-2">
                                    <Server className="w-4 h-4 text-pink-400" />
                                    {items.find(i => i.id === 'stripe_backend')?.status === 'ok' ? 'Online' : 'Offline / Serverless'}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800">
                            <h3 className="text-sm font-medium text-gray-300 mb-2">Troubleshooting</h3>
                            <ul className="text-sm text-gray-400 space-y-1 list-disc pl-4">
                                <li>If <strong>Database Tables</strong> are failing, check your network connection and RLS policies in Supabase.</li>
                                <li>If <strong>Clinic Service</strong> shows "Mock Data", the application failed to fetch real clinics and is using fallback data.</li>
                                <li>If <strong>Stripe Backend</strong> is unreachable, payments will function in "Simulated" mode or fail. Ensure local backend is running if expected.</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HealthCheckPage;
