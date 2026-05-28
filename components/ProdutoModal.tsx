'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, QrCode, ExternalLink, Gift, Sparkles } from 'lucide-react';
import { Produto } from '@/hooks/useProdutos';
import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

interface ProdutoModalProps {
    produto: Produto | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProdutoModal({ produto, open, onOpenChange }: ProdutoModalProps) {
    const [copied, setCopied] = useState(false);

    if (!produto) return null;

    const copyPixKey = () => {
        navigator.clipboard.writeText(produto.pix_key);
        setCopied(true);

        toast.success('Chave PIX copiada!', {
            description: 'Use esta chave para fazer a transferência',
            icon: '💳',
            duration: 3000,
            action: {
                label: 'OK',
                onClick: () => console.log('Copiado'),
            },
        });

        setTimeout(() => setCopied(false), 2500);
    };

    const copyProductLink = () => {
        navigator.clipboard.writeText(produto.link);
        toast.success('Link copiado!', {
            description: 'Link do produto copiado para área de transferência',
            icon: '🔗',
            duration: 2000,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-yellow-400/30 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display text-yellow-400 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Detalhes do Produto
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Informações completas do item selecionado
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status */}
                    <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                        <span className="text-gray-400">Status atual:</span>
                        <Badge variant={produto.unavailable ? "destructive" : "default"} className={produto.unavailable ? 'bg-red-600' : 'bg-green-600'}>
                            {produto.unavailable ? 'Indisponível' : 'Disponível'}
                        </Badge>
                    </div>

                    {/* Image */}
                    {produto.image && (
                        <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden">
                            <Image
                                src={produto.image}
                                alt={produto.name}
                                fill
                                className="object-contain p-4"
                            />
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <h3 className="text-sm text-gray-400 mb-1">Nome do Produto</h3>
                        <p className="text-lg font-semibold text-yellow-300">{produto.name}</p>
                    </div>

                    {/* Price */}
                    <div>
                        <h3 className="text-sm text-gray-400 mb-1">Preço</h3>
                        <p className="text-3xl font-bold text-yellow-400">{produto.price}</p>
                    </div>

                    {/* Link */}
                    <div>
                        <h3 className="text-sm text-gray-400 mb-2">Link do Produto</h3>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
                                onClick={() => window.open(produto.link, '_blank')}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir na Loja
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
                                onClick={copyProductLink}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Pix Key */}
                    <div>
                        <h3 className="text-sm text-gray-400 mb-2">Chave PIX</h3>
                        <div className="bg-black/50 rounded-lg p-3 border border-yellow-400/20">
                            <code className="text-yellow-400 text-sm break-all block mb-2 font-mono">
                                {produto.pix_key}
                            </code>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400"
                                onClick={copyPixKey}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Copiado!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copiar Chave PIX
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-gray-600 space-y-1 pt-4 border-t border-gray-700">
                        <p>ID: {produto.id}</p>
                        {produto.created_at && (
                            <p>Criado em: {new Date(produto.created_at).toLocaleDateString('pt-BR')}</p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}