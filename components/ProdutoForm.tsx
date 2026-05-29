'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Image as ImageIcon, X } from 'lucide-react';

import { Produto } from '@/hooks/useProdutos';

type ProdutoFormData = Omit<Produto, 'id' | 'created_at'>;

interface ProdutoFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    produto?: Produto | null;
    onSave: (produtoData: ProdutoFormData) => Promise<void>;
    isEditing?: boolean;
}

interface FormErrors {
    name?: string;
    price?: string;
    link?: string;
    pix_key?: string;
    image?: string;
}

// Componente interno que contém toda a lógica do formulário
function ProdutoFormInner({
    initialData,
    onSave,
    onSuccess,
    isEditing,
}: {
    initialData: ProdutoFormData;
    onSave: (data: ProdutoFormData) => Promise<void>;
    onSuccess: () => void;
    isEditing: boolean;
}) {
    const [formData, setFormData] = useState<ProdutoFormData>(initialData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome do produto é obrigatório';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
        }

        if (!formData.price.trim()) {
            newErrors.price = 'Preço é obrigatório';
        } else if (!/^R?\$?\s?\d+(?:[.,]\d{2})?$/.test(formData.price.trim())) {
            newErrors.price = 'Formato inválido. Use R$ 99,90 ou 99.90';
        }

        if (!formData.link.trim()) {
            newErrors.link = 'Link do produto é obrigatório';
        } else if (!isValidUrl(formData.link)) {
            newErrors.link = 'URL inválida. Use http:// ou https://';
        }

        if (!formData.pix_key.trim()) {
            newErrors.pix_key = 'Chave PIX é obrigatória';
        } else if (formData.pix_key.length < 10) {
            newErrors.pix_key = 'Chave PIX parece muito curta';
        }

        if (formData.image && !isValidUrl(formData.image) && !formData.image.startsWith('/')) {
            newErrors.image = 'URL inválida. Use uma URL completa ou caminho relativo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (url: string): boolean => {
        if (url.startsWith('/')) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const formatPrice = (value: string): string => {
        let cleaned = value.replace(/[^\d,.]/g, '');
        cleaned = cleaned.replace(',', '.');
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }
        const number = parseFloat(cleaned);
        if (!isNaN(number)) {
            return `R$ ${number.toFixed(2).replace('.', ',')}`;
        }
        return value;
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formatted = formatPrice(rawValue);
        setFormData({ ...formData, price: formatted });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await onSave(formData);
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
                <Label htmlFor="name" className="text-gray-300">
                    Nome do Produto <span className="text-red-400">*</span>
                </Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={() => validateForm()}
                    placeholder="Ex: Liquidificador Mondial L-99"
                    className={`mt-1 bg-gray-800 border-gray-700 text-white focus:border-yellow-400 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    disabled={loading}
                    required
                />
                {errors.name && (
                    <p id="name-error" className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.name}
                    </p>
                )}
            </div>

            {/* Preço */}
            <div>
                <Label htmlFor="price" className="text-gray-300">
                    Preço <span className="text-red-400">*</span>
                </Label>
                <Input
                    id="price"
                    value={formData.price}
                    onChange={handlePriceChange}
                    onBlur={() => validateForm()}
                    placeholder="R$ 172,00"
                    className={`mt-1 bg-gray-800 border-gray-700 text-white focus:border-yellow-400 ${errors.price ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                    aria-invalid={!!errors.price}
                    disabled={loading}
                    required
                />
                {errors.price && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.price}
                    </p>
                )}
            </div>

            {/* Imagem */}
            <div>
                <Label htmlFor="image" className="text-gray-300">
                    URL da Imagem
                </Label>
                <div className="flex gap-3 mt-1">
                    <div className="flex-1">
                        <Input
                            id="image"
                            value={formData.image}
                            onChange={(e) => {
                                setFormData({ ...formData, image: e.target.value });
                                setImageError(false);
                            }}
                            onBlur={() => validateForm()}
                            placeholder="/produtos/liquidificador.png"
                            className={`bg-gray-800 border-gray-700 text-white focus:border-yellow-400 ${errors.image ? 'border-red-500' : ''
                                }`}
                            disabled={loading}
                        />
                        {errors.image && (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.image}
                            </p>
                        )}
                    </div>
                    {formData.image && (
                        <div className="relative w-16 h-16 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex-shrink-0 group">
                            {!imageError ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                    onError={handleImageError}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                    <ImageIcon className="w-6 h-6 text-gray-500" />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, image: '' })}
                                className="absolute top-0 right-0 p-0.5 bg-red-600 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3 text-white" />
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    URL completa (https://...) ou caminho relativo (/imagem.png)
                </p>
            </div>

            {/* Link da Loja */}
            <div>
                <Label htmlFor="link" className="text-gray-300">
                    Link do Produto <span className="text-red-400">*</span>
                </Label>
                <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    onBlur={() => validateForm()}
                    placeholder="https://www.mercadolivre.com.br/..."
                    className={`mt-1 bg-gray-800 border-gray-700 text-white focus:border-yellow-400 ${errors.link ? 'border-red-500' : ''
                        }`}
                    aria-invalid={!!errors.link}
                    disabled={loading}
                    required
                />
                {errors.link && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.link}
                    </p>
                )}
            </div>

            {/* Chave PIX */}
            <div>
                <Label htmlFor="pix_key" className="text-gray-300">
                    Chave PIX <span className="text-red-400">*</span>
                </Label>
                <Textarea
                    id="pix_key"
                    value={formData.pix_key}
                    onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                    onBlur={() => validateForm()}
                    placeholder="00020101021126330014br.gov.bcb.pix..."
                    className={`mt-1 bg-gray-800 border-gray-700 text-white focus:border-yellow-400 font-mono text-xs ${errors.pix_key ? 'border-red-500' : ''
                        }`}
                    rows={3}
                    aria-invalid={!!errors.pix_key}
                    disabled={loading}
                    required
                />
                {errors.pix_key ? (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.pix_key}
                    </p>
                ) : (
                    <p className="text-xs text-gray-500 mt-1">
                        Copie a chave PIX completa do seu aplicativo bancário (código copia e cola)
                    </p>
                )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div>
                    <Label className="text-gray-300">Status do Produto</Label>
                    <p className="text-xs text-gray-500">
                        {formData.unavailable
                            ? 'Produto ficará oculto na loja'
                            : 'Produto disponível para compra'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-sm ${!formData.unavailable ? 'text-green-400' : 'text-gray-500'}`}>
                        Disponível
                    </span>
                    <Switch
                        checked={formData.unavailable}
                        onCheckedChange={(checked) => setFormData({ ...formData, unavailable: checked })}
                        className="data-[state=checked]:bg-red-600"
                        disabled={loading}
                    />
                    <span className={`text-sm ${formData.unavailable ? 'text-red-400' : 'text-gray-500'}`}>
                        Indisponível
                    </span>
                </div>
            </div>

            {/* Aviso de campos obrigatórios */}
            <Alert className="bg-blue-900/30 border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-xs text-blue-300">
                    Todos os campos marcados com <span className="text-red-400">*</span> são obrigatórios
                </AlertDescription>
            </Alert>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onSuccess}
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500 transition-colors font-medium"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        isEditing ? 'Salvar Alterações' : 'Adicionar Produto'
                    )}
                </Button>
            </div>
        </form>
    );
}

// Componente principal
export function ProdutoForm({
    open,
    onOpenChange,
    produto,
    onSave,
    isEditing = false,
}: ProdutoFormProps) {
    // Gera uma key única baseada no produto e no estado de edição
    // Isso força o React a recriar o componente interno quando o modal abre com dados diferentes
    const formKey = `${isEditing ? 'edit' : 'new'}-${produto?.id || 'empty'}-${open ? 'open' : 'closed'}`;

    // Prepara os dados iniciais
    const getInitialData = (): ProdutoFormData => {
        if (produto && isEditing) {
            return {
                name: produto.name,
                price: produto.price,
                image: produto.image || '',
                link: produto.link,
                pix_key: produto.pix_key,
                unavailable: produto.unavailable,
            };
        }
        return {
            name: '',
            price: '',
            image: '',
            link: '',
            pix_key: '',
            unavailable: false,
        };
    };

    const handleSuccess = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-yellow-400/30 text-white sm:rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display text-yellow-400 flex items-center gap-2">
                        {isEditing ? '✏️ Editar Produto' : '🎁 Adicionar Novo Produto'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Preencha todos os campos obrigatórios marcados com <span className="text-red-400">*</span>
                    </DialogDescription>
                </DialogHeader>

                {/* O componente interno é recriado quando a key muda */}
                <ProdutoFormInner
                    key={formKey}
                    initialData={getInitialData()}
                    onSave={onSave}
                    onSuccess={handleSuccess}
                    isEditing={isEditing}
                />
            </DialogContent>
        </Dialog>
    );
}