// app/page.tsx (admin)
'use client';

import { useState } from 'react';
import { useProdutos, Produto } from '@/hooks/useProdutos';
import { ProdutoCard } from '@/components/ProdutoCard';
import { ProdutoForm } from '@/components/ProdutoForm';
import { StatsCards } from '@/components/StatsCards';
import { Button } from '@/components/ui/button';
import { RefreshCw, Heart, Gift, Sparkles, Plus } from 'lucide-react';
import { toast } from 'sonner';

type ProdutoFormData = Omit<Produto, 'id' | 'created_at'>;

export default function AdminPage() {
  const {
    produtos,
    loading,
    error,
    fetchProdutos,
    toggleStatus,
    criarProduto,
    deletarProduto,
    atualizarProduto
  } = useProdutos();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduto(null);
    setFormOpen(true);
  };

  const handleSave = async (produtoData: ProdutoFormData) => {
    if (editingProduto) {
      await atualizarProduto(editingProduto.id, produtoData);
    } else {
      await criarProduto(produtoData);
    }
  };

  const handleDelete = async (id: number, nome: string) => {
    await deletarProduto(id, nome);
  };

  const handleRefresh = async () => {
    const toastId = toast.loading('Atualizando produtos...', {
      description: 'Buscando dados do servidor',
    });

    await fetchProdutos();

    toast.success('Produtos atualizados!', {
      id: toastId,
      description: `${produtos.length} itens carregados`,
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
          <p className="text-yellow-400">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">❌ {error}</p>
          <Button onClick={handleRefresh} className="bg-yellow-400 text-black hover:bg-yellow-500">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg text-white">
      {/* Header */}
      <header className="border-b border-yellow-400/20 bg-black/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center animate-pulse">
                <Gift className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h1 className="font-display text-2xl text-yellow-400 shimmer-text">Painel Admin</h1>
                <p className="text-xs text-gray-500">Chá de Casa Nova - Gustavo & Mirela</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-yellow-400 fill-yellow-400 floating" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 animate-fade-in-up">
          <StatsCards produtos={produtos} />
        </div>

        {/* Botão Adicionar */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={handleAddNew}
            className="bg-yellow-400 text-black hover:bg-yellow-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl text-yellow-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Gerenciar Produtos
            </h2>
            <p className="text-sm text-gray-500">
              {produtos.filter(p => !p.unavailable).length} disponíveis • {produtos.filter(p => p.unavailable).length} indisponíveis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtos.map((produto) => (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                onToggleStatus={toggleStatus}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-yellow-400/20 py-6 text-center">
        <div className="gold-line w-24 mx-auto mb-4" />
        <p className="text-gray-600 text-sm">
          © 2026 Chá de Casa Nova - Painel Administrativo
        </p>
      </footer>

      {/* Form Modal */}
      <ProdutoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        produto={editingProduto}
        onSave={handleSave}
        isEditing={!!editingProduto}
      />
    </div>
  );
}