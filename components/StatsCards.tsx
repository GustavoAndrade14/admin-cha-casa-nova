'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, PackageX, TrendingUp, DollarSign } from 'lucide-react';
import { Produto } from '@/hooks/useProdutos';

interface StatsCardsProps {
    produtos: Produto[];
}

export function StatsCards({ produtos }: StatsCardsProps) {
    const total = produtos.length;
    const disponiveis = produtos.filter(p => !p.unavailable).length;
    const indisponiveis = produtos.filter(p => p.unavailable).length;

    const totalValue = produtos.reduce((sum, p) => {
        const price = parseFloat(p.price.replace('R$', '').replace(',', '.').trim());
        return sum + (isNaN(price) ? 0 : price);
    }, 0);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gray-900/80 border-yellow-400/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total de Itens</CardTitle>
                    <Package className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-400">{total}</div>
                    <p className="text-xs text-gray-500">itens na lista</p>
                </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-green-500/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Disponíveis</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">{disponiveis}</div>
                    <p className="text-xs text-gray-500">itens disponíveis para presente</p>
                </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-red-500/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Indisponíveis</CardTitle>
                    <PackageX className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-500">{indisponiveis}</div>
                    <p className="text-xs text-gray-500">itens já comprados</p>
                </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-yellow-400/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Valor Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-400">
                        {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    <p className="text-xs text-gray-500">soma de todos os itens</p>
                </CardContent>
            </Card>
        </div>
    );
}