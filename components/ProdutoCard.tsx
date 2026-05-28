'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { Produto } from '@/hooks/useProdutos';
import { toast } from 'sonner';

interface ProdutoCardProps {
    produto: Produto;
    onToggleStatus: (id: number, status: boolean) => void;
}

export function ProdutoCard({ produto, onToggleStatus }: ProdutoCardProps) {
    const handleToggle = async () => {
        const newStatus = !produto.unavailable;
        const statusText = newStatus ? 'indisponível' : 'disponível';

        const toastId = toast.loading(`Alterando status...`, {
            description: `${produto.name} será marcado como ${statusText}`,
        });

        await onToggleStatus(produto.id, produto.unavailable);
        toast.dismiss(toastId);
    };

    return (
        <Card className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/10 border ${produto.unavailable
                ? 'border-red-500/30 bg-gray-900/50'
                : 'border-yellow-400/30 bg-gray-900/80'
            }`}>
            <div className="relative">
                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                    <Badge
                        variant={produto.unavailable ? "destructive" : "default"}
                        className={`${produto.unavailable ? 'bg-red-600' : 'bg-green-600'
                            } text-white shadow-lg text-sm px-3 py-1`}
                    >
                        {produto.unavailable ? 'Indisponível' : 'Disponível'}
                    </Badge>
                </div>

                {/* Image */}
                <div className="relative w-full h-56 bg-gray-800 flex items-center justify-center overflow-hidden group">
                    {produto.image ? (
                        <Image
                            src={produto.image}
                            alt={produto.name}
                            fill
                            className={`object-contain p-4 transition-transform duration-300 group-hover:scale-105 ${produto.unavailable ? 'opacity-50' : ''
                                }`}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center text-yellow-400/50 gap-2">
                            <ShoppingBag className="w-12 h-12" />
                            <span className="text-xs">Sem imagem</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <CardContent className="p-4 space-y-4">
                    {/* Title & Price */}
                    <div>
                        <h3 className={`font-semibold text-base mb-2 line-clamp-2 ${produto.unavailable ? 'text-gray-400 line-through' : 'text-yellow-300'
                            }`}>
                            {produto.name}
                        </h3>
                        <p className={`text-2xl font-bold ${produto.unavailable ? 'text-gray-500' : 'text-yellow-400'
                            }`}>
                            {produto.price}
                        </p>
                    </div>

                    {/* Botão Comprar */}
                    <Button
                        size="lg"
                        className="w-full bg-yellow-400 text-black hover:bg-yellow-500 text-base py-6 h-auto font-semibold"
                        onClick={() => window.open(produto.link, '_blank')}
                    >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Ver na Loja
                    </Button>

                    {/* Status Toggle - Versão Centralizada e Maior */}
                    <div className="flex flex-col items-center justify-center pt-4 pb-2 border-t border-gray-700">
                        <span className="text-xs text-gray-500 mb-3">Status do Produto</span>

                        <div className="flex items-center justify-center gap-6 w-full">
                            {/* Disponível */}
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${!produto.unavailable ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                                <span className={`text-sm font-medium ${!produto.unavailable ? 'text-green-400' : 'text-gray-500'}`}>
                                    Disponível
                                </span>
                            </div>

                            {/* Toggle Button */}
                            <button
                                role="switch"
                                aria-checked={produto.unavailable}
                                aria-label={`Alternar status do produto para ${produto.unavailable ? 'disponível' : 'indisponível'}`}
                                onClick={handleToggle}
                                className={`
                                    relative inline-flex h-12 w-20 items-center rounded-full
                                    transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-900
                                    active:scale-95
                                    ${produto.unavailable
                                        ? 'bg-red-600 focus:ring-red-500'
                                        : 'bg-green-600 focus:ring-green-500'
                                    }
                                `}
                            >
                                <span
                                    className={`
                                        inline-block h-9 w-9 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out
                                        ${produto.unavailable ? 'translate-x-10' : 'translate-x-1'}
                                    `}
                                />
                            </button>

                            {/* Indisponível */}
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${produto.unavailable ? 'bg-red-400 animate-pulse' : 'bg-gray-600'}`} />
                                <span className={`text-sm font-medium ${produto.unavailable ? 'text-red-400' : 'text-gray-500'}`}>
                                    Indisponível
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}