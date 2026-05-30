import React, { useState, useEffect } from 'react';
import { CategoryItem } from '../types';
import { 
  Database, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Settings, 
  Copy, 
  Check, 
  Terminal, 
  Info
} from 'lucide-react';
import { 
  fetchCategoriesFromSupabase, 
  syncCategoriesToSupabase, 
  testSupabaseConnection,
  supabaseUrl as initialUrl,
  supabaseAnonKey as initialKey,
  isUsingEnv
} from '../lib/supabaseClient';

interface SupabaseSyncPanelProps {
  categories: CategoryItem[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
}

export default function SupabaseSyncPanel({ categories, setCategories }: SupabaseSyncPanelProps) {
  // Configuration secrets
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('gondola_supabase_url') || initialUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem('gondola_supabase_key') || initialKey);
  const [showConfig, setShowConfig] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Operation indicators
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [actionLoading, setActionLoading] = useState<string | null>(null); // 'fetch', 'sync', 'test'
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Validate initial connection on mount if we have values
  useEffect(() => {
    if (supabaseUrl && supabaseAnonKey) {
      verifyConnection(supabaseUrl, supabaseAnonKey, true);
    }
  }, []);

  const verifyConnection = async (urlStr: string, keyStr: string, silent = false) => {
    if (!urlStr || !keyStr) return;
    if (!silent) {
      setIsConnecting(true);
      setAlertMsg(null);
    }
    const isOk = await testSupabaseConnection(urlStr, keyStr);
    setConnectionStatus(isOk ? 'connected' : 'error');
    if (!silent) {
      setIsConnecting(false);
      if (isOk) {
        setAlertMsg({ type: 'success', text: 'Conectado ao Supabase com sucesso!' });
      } else {
        setAlertMsg({ type: 'error', text: 'Não foi possível conectar. Verifique a URL e a Anon Key fornecidas.' });
      }
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('gondola_supabase_url', supabaseUrl);
    localStorage.setItem('gondola_supabase_key', supabaseAnonKey);
    verifyConnection(supabaseUrl, supabaseAnonKey);
  };

  const handleClearConfig = () => {
    if (confirm('Deseja realmente desconectar e esquecer as chaves personalizadas?')) {
      localStorage.removeItem('gondola_supabase_url');
      localStorage.removeItem('gondola_supabase_key');
      setSupabaseUrl(initialUrl);
      setSupabaseAnonKey(initialKey);
      setConnectionStatus('idle');
      setAlertMsg({ type: 'info', text: 'Credenciais personalizadas removidas.' });
    }
  };

  const handleSyncToSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setAlertMsg({ type: 'error', text: 'Por favor, configure as chaves do Supabase primeiro.' });
      setShowConfig(true);
      return;
    }

    setActionLoading('sync');
    setAlertMsg(null);
    try {
      const res = await syncCategoriesToSupabase(categories, supabaseUrl, supabaseAnonKey);
      if (res.success) {
        setAlertMsg({ type: 'success', text: res.message });
        setConnectionStatus('connected');
      } else {
        setAlertMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Houve um problema de rede ou permissões ao sincronizar.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleFetchFromSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setAlertMsg({ type: 'error', text: 'Por favor, configure as chaves do Supabase antes de carregar.' });
      setShowConfig(true);
      return;
    }

    if (!confirm('Esta ação substituirá a sua tabela local atual por todos os itens do Supabase. Deseja prosseguir?')) {
      return;
    }

    setActionLoading('fetch');
    setAlertMsg(null);
    try {
      const res = await fetchCategoriesFromSupabase(supabaseUrl, supabaseAnonKey);
      if (res.success && res.categories) {
        if (res.categories.length === 0) {
          setAlertMsg({ 
            type: 'info', 
            text: 'Conectado, mas nenhum registro foi encontrado na tabela "gondola_categories". Adicione categorias e sincronize para preenchê-la!' 
          });
        } else {
          setCategories(res.categories);
          setAlertMsg({ 
            type: 'success', 
            text: `Importação realizada com sucesso! Carregamos ${res.categories.length} categorias do Supabase.` 
          });
        }
        setConnectionStatus('connected');
      } else {
        if (res.error?.includes('relation') && res.error?.includes('does not exist')) {
          setAlertMsg({
            type: 'error',
            text: 'A tabela "gondola_categories" não foi encontrada. Clique no SQL Helper abaixo para criar a tabela no seu banco de dados Supabase.'
          });
        } else {
          setAlertMsg({ type: 'error', text: res.error || 'Erro desconhecido ao carregar.' });
        }
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Falha de comunicação.' });
    } finally {
      setActionLoading(null);
    }
  };

  const sqlQuery = `-- Crie a tabela no SQL Editor do seu painel Supabase:
CREATE TABLE public.gondola_categories (
    id text primary key,
    category text not null,
    target_space float8 default 0,
    actual_space float8 default 0,
    ype_meta_percent float8 default 0,
    shelf_level text default 'Olhos',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativar segurança de RLS (opcional, ou configurar leitura/escrita pública temporária)
ALTER TABLE public.gondola_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público irrestrito" 
ON public.gondola_categories 
FOR ALL 
USING (true) 
WITH CHECK (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      
      {/* Ribbon Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Integração Segura com Supabase
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sincronize e guarde o planograma simulado com nuvem durável em tempo real. Os dados ficam salvos em seu banco PostgreSQL.
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {connectionStatus === 'connected' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 animate-pulse">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Conectado
            </span>
          )}
          {connectionStatus === 'error' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              Falta Configurar
            </span>
          )}
          {connectionStatus === 'idle' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
              Desconectado
            </span>
          )}

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-all font-semibold"
          >
            <Settings size={13} />
            <span>Configurar</span>
          </button>
        </div>
      </div>

      {/* Notifications banner */}
      {alertMsg && (
        <div className={`p-4 rounded-lg flex items-start gap-2 text-xs leading-relaxed border ${
          alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          alertMsg.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {alertMsg.type === 'success' ? (
            <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : alertMsg.type === 'error' ? (
            <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
          )}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Configuration Credentials Drawer */}
      {showConfig && (
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Credenciais do Banco de Dados</h3>
            {isUsingEnv && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono font-bold">
                Carregado via .env
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed md:max-w-2xl">
            Insira os dados do seu projeto Supabase abaixo. As informações serão salvas localmente neste navegador com segurança e usadas para sync. 
            Você também pode definir <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no arquivo de variáveis de ambiente.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="sup-url" className="text-xs font-bold text-slate-700">Supabase API URL</label>
              <input
                id="sup-url"
                type="text"
                placeholder="https://your-project-id.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-300 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="sup-key" className="text-xs font-bold text-slate-700">Supabase Anon Key</label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1 focus:outline-none"
                >
                  {showKey ? <EyeOff size={11} /> : <Eye size={11} />}
                  <span>{showKey ? 'Ocultar Chave' : 'Mostrar Chave'}</span>
                </button>
              </div>
              <input
                id="sup-key"
                type={showKey ? 'text' : 'password'}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSaveConfig}
              disabled={isConnecting || !supabaseUrl || !supabaseAnonKey}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm shadow-indigo-100"
            >
              {isConnecting ? 'Verificando...' : 'Salvar e Testar Conexão'}
            </button>

            {localStorage.getItem('gondola_supabase_url') && (
              <button
                onClick={handleClearConfig}
                className="px-4 py-2 border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-lg transition-all cursor-pointer"
              >
                Esquecer Dados
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Operations Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Sync panel section (Write) */}
        <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <UploadCloud size={14} className="text-emerald-600" />
              <span>Sincronizar no Supabase (Salvar)</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pressione para enviar todas as categorias e modificações atualmente mostradas na gôndola. O Supabase gerenciará e atualizará os registros existentes de forma dinâmica.
            </p>
          </div>

          <button
            onClick={handleSyncToSupabase}
            disabled={actionLoading !== null || !supabaseUrl || !supabaseAnonKey}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            {actionLoading === 'sync' ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <UploadCloud size={14} />
            )}
            <span>Enviar Dados Locais para Nuvem</span>
          </button>
        </div>

        {/* Sync pull section (Read) */}
        <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <DownloadCloud size={14} className="text-indigo-600" />
              <span>Restaurar do Supabase (Carregar)</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Carrega todas as categorias salvas no seu banco do Supabase e substitui a tabela local. Perfeito para restaurar alterações após mudar de máquina ou sincronizar equipes.
            </p>
          </div>

          <button
            onClick={handleFetchFromSupabase}
            disabled={actionLoading !== null || !supabaseUrl || !supabaseAnonKey}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            {actionLoading === 'fetch' ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <DownloadCloud size={14} />
            )}
            <span>Carregar Dados da Nuvem para Gôndola</span>
          </button>
        </div>
      </div>

      {/* SQL Helper Section */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 text-slate-400">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 px-1.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
              <Terminal size={14} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">SQL Table Setup Helper</h4>
              <p className="text-[10px] text-slate-500">Crie a tabela no Supabase SQL Editor para ver funcionar imediatamente</p>
            </div>
          </div>
          
          <button
            onClick={copySqlToClipboard}
            className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded transition-all font-mono font-medium"
          >
            {copiedSql ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
          </button>
        </div>

        <div className="max-h-[160px] overflow-y-auto rounded bg-slate-950 p-3 text-[10px] font-mono leading-relaxed text-emerald-400/90 whitespace-pre-wrap select-all">
          {sqlQuery}
        </div>
      </div>

    </div>
  );
}
