import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

export interface Produto {
    id: number;
    name: string;
    price: string;
    image: string;
    link: string;
    pix_key: string;
    unavailable: boolean;
    created_at?: string;
}

export function useProdutos() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchProdutos = useCallback(async () => {
        // Cancelar requisição anterior se existir
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('https://cha-casa-nova-back.vercel.app/api/produtos', {
                signal: controller.signal
            });

            if (isMounted.current) {
                if (response.data.success) {
                    setProdutos(response.data.data);
                } else {
                    setError('Erro ao carregar produtos');
                }
            }
        } catch (err) {
            if (isMounted.current && !axios.isCancel(err)) {
                console.error('Erro ao buscar produtos:', err);
                setError('Não foi possível conectar ao servidor');
                toast.error('Erro de conexão', {
                    description: 'Não foi possível conectar ao servidor',
                });
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, []);

    const criarProduto = useCallback(async (produtoData: Omit<Produto, 'id' | 'created_at'>) => {
        const toastId = toast.loading('Criando produto...', {
            description: 'Aguarde enquanto salvamos o produto',
        });

        try {
            const response = await axios.post('https://cha-casa-nova-back.vercel.app/api/produtos', produtoData);

            if (response.data.success) {
                await fetchProdutos();
                toast.success('Produto criado!', {
                    id: toastId,
                    description: `${produtoData.name} foi adicionado com sucesso`,
                    icon: '🎁',
                    duration: 3000,
                });
                return response.data.data;
            }
        } catch (err) {
            console.error('Erro ao criar produto:', err);
            toast.error('Erro!', {
                id: toastId,
                description: 'Não foi possível criar o produto',
                duration: 4000,
            });
            return null;
        }
    }, [fetchProdutos]);

    const deletarProduto = useCallback(async (id: number, nomeProduto: string) => {
        const toastId = toast.loading('Deletando produto...', {
            description: `Removendo ${nomeProduto}`,
        });

        try {
            const response = await axios.delete(`https://cha-casa-nova-back.vercel.app/api/produtos/${id}`);

            if (response.data.success) {
                await fetchProdutos();
                toast.success('Produto removido!', {
                    id: toastId,
                    description: `${nomeProduto} foi removido da lista`,
                    icon: '🗑️',
                    duration: 3000,
                });
                return true;
            }
        } catch (err) {
            console.error('Erro ao deletar produto:', err);
            toast.error('Erro!', {
                id: toastId,
                description: 'Não foi possível remover o produto',
                duration: 4000,
            });
            return false;
        }
    }, [fetchProdutos]);

    const atualizarProduto = useCallback(async (id: number, produtoData: Partial<Produto>) => {
        const toastId = toast.loading('Atualizando produto...', {
            description: 'Salvando alterações',
        });

        try {
            const response = await axios.put(`https://cha-casa-nova-back.vercel.app/api/produtos/${id}`, produtoData);

            if (response.data.success) {
                await fetchProdutos();
                toast.success('Produto atualizado!', {
                    id: toastId,
                    description: 'As alterações foram salvas',
                    icon: '✏️',
                    duration: 3000,
                });
                return response.data.data;
            }
        } catch (err) {
            console.error('Erro ao atualizar produto:', err);
            toast.error('Erro!', {
                id: toastId,
                description: 'Não foi possível atualizar o produto',
                duration: 4000,
            });
            return null;
        }
    }, [fetchProdutos]);

    const toggleStatus = useCallback(async (id: number, currentStatus: boolean) => {
        const newStatus = !currentStatus;

        // Salvar estado atual para possível rollback
        const previousProdutos = [...produtos];

        // Optimistic update
        setProdutos(prevProdutos =>
            prevProdutos.map(produto =>
                produto.id === id
                    ? { ...produto, unavailable: newStatus }
                    : produto
            )
        );

        try {
            const response = await axios.patch(`https://cha-casa-nova-back.vercel.app/api/produtos/${id}/toggle`);

            if (response.data.success) {
                toast.success(`Status atualizado!`, {
                    description: `Produto agora está ${response.data.data.unavailable ? 'indisponível' : 'disponível'}`,
                    icon: response.data.data.unavailable ? '🔴' : '🟢',
                    duration: 3000,
                });
                return true;
            } else {
                // Rollback em caso de erro
                setProdutos(previousProdutos);
                throw new Error('Erro ao alterar status');
            }
        } catch (err) {
            console.error('Erro ao alternar status:', err);
            // Rollback para garantir consistência
            setProdutos(previousProdutos);
            toast.error('Erro!', {
                description: 'Não foi possível alterar o status do produto',
                duration: 4000,
            });
            return false;
        }
    }, [produtos]);

    const updateMultipleStatus = useCallback(async (updates: { id: number; unavailable: boolean }[]) => {
        const toastId = toast.loading('Atualizando produtos...', {
            description: 'Por favor, aguarde',
        });

        // Salvar estado atual
        const previousProdutos = [...produtos];

        try {
            const response = await axios.patch('https://cha-casa-nova-back.vercel.app/api/produtos/batch/atualizar', {
                updates
            });

            if (response.data.success) {
                // Recarregar dados do servidor para garantir consistência
                await fetchProdutos();
                toast.success('Sucesso!', {
                    id: toastId,
                    description: response.data.message,
                    duration: 3000,
                });
                return true;
            } else {
                // Rollback
                setProdutos(previousProdutos);
                throw new Error('Erro ao atualizar produtos');
            }
        } catch (err) {
            console.error('Erro ao atualizar múltiplos produtos:', err);
            // Rollback
            setProdutos(previousProdutos);
            toast.error('Erro!', {
                id: toastId,
                description: 'Não foi possível atualizar os produtos',
                duration: 4000,
            });
            return false;
        }
    }, [fetchProdutos, produtos]);

    useEffect(() => {
        isMounted.current = true;

        // Carregar produtos apenas uma vez na montagem
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProdutos();

        return () => {
            isMounted.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        produtos,
        loading,
        error,
        fetchProdutos,
        toggleStatus,
        updateMultipleStatus,
        criarProduto,
        deletarProduto,
        atualizarProduto,
    };
}