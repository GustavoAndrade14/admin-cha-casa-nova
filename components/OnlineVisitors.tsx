'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Eye, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interface para o estado do Presence
interface PresenceState {
    [key: string]: PresenceEntry[];
}

// Interface para cada entrada do Presence
interface PresenceEntry {
    online_at: string;
    user_agent?: string;
    url?: string;
    role?: string;
}

// Interface para visitante processado
interface Visitor {
    id: string;
    online_at: string;
    user_agent?: string;
    url?: string;
    role?: string;
}

export function OnlineVisitors() {
    const [onlineCount, setOnlineCount] = useState(0);
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        // ID único para o admin
        const sessionId = `admin-${crypto.randomUUID()}`;


        const channel = supabase.channel('site-visitors', {
            config: {
                presence: {
                    key: sessionId,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState() as PresenceState;

                const visitorsList: Visitor[] = Object.entries(state)
                    .map(([key, value]) => ({
                        id: key,
                        online_at: value[0]?.online_at || new Date().toISOString(),
                        user_agent: value[0]?.user_agent,
                        url: value[0]?.url,
                        role: value[0]?.role,
                    }))
                    // Filtra o próprio admin da contagem
                    .filter((visitor) => visitor.id !== sessionId);

                setOnlineCount(visitorsList.length);
                setVisitors(visitorsList);
                setLastUpdate(new Date());

            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);

    // Calcular dispositivos
    const mobileCount = visitors.filter(v => v.user_agent?.includes('Mobile')).length;
    const desktopCount = visitors.filter(v => v.user_agent && !v.user_agent.includes('Mobile')).length;

    return (
        <Card className="bg-gray-900/80 border-yellow-400/30 mb-8">
            <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Visitantes no Site Agora
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Número principal */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-4xl font-bold text-yellow-400">{onlineCount}</div>
                        <p className="text-sm text-gray-500 mt-1">
                            pessoas online no site da lista de casamento
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-green-400">{mobileCount}</div>
                            <div className="text-xs text-gray-500">Mobile</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-blue-400">{desktopCount}</div>
                            <div className="text-xs text-gray-500">Desktop</div>
                        </div>
                    </div>
                </div>

                {/* Indicador de conexão */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Atualização em tempo real</span>
                    <span className="mx-1">•</span>
                    <span>Última atualização: {lastUpdate.toLocaleTimeString()}</span>
                </div>

                {/* Lista de visitantes (opcional) */}
                {onlineCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <details className="cursor-pointer">
                            <summary className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">
                                Ver detalhes dos visitantes ({onlineCount})
                            </summary>
                            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                                {visitors.map((visitor, idx) => (
                                    <div key={visitor.id} className="flex items-center justify-between p-2 rounded-lg bg-black/30 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            <span className="text-gray-300">Visitante {idx + 1}</span>
                                            {visitor.role === 'admin' && (
                                                <span className="text-xs text-purple-400">(Admin)</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(visitor.online_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}