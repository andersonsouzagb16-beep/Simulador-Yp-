import React from 'react';
import { AuditItem } from '../types';
import { ShieldCheck, Info, RotateCcw, PenSquare, MessageSquareCode } from 'lucide-react';

interface AuditPanelProps {
  auditItems: AuditItem[];
  setAuditItems: React.Dispatch<React.SetStateAction<AuditItem[]>>;
  overallScore: number;
}

export default function AuditPanel({ auditItems, setAuditItems, overallScore }: AuditPanelProps) {

  // Atualizar a nota de uma pergunta
  const handleUpdateScore = (id: string, newScore: number) => {
    setAuditItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, score: Math.min(100, Math.max(0, newScore)) };
      }
      return item;
    }));
  };

  // Atualizar nota/observação específica
  const handleUpdateNotes = (id: string, notes: string) => {
    setAuditItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, notes };
      }
      return item;
    }));
  };

  // Resetar auditoria para padrão limpando anotações
  const handleResetAudit = () => {
    if (confirm('Tem certeza de que deseja zerar os pesos e observações de auditoria para os valores padrão?')) {
      setAuditItems(prev => prev.map(item => ({
        ...item,
        score: 100,
        notes: ''
      })));
    }
  };

  // Função para retornar cor baseada na nota do critério
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Alerta de Score Geral */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${
        overallScore >= 90 
          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
          : overallScore >= 75 
            ? 'bg-amber-50/50 border-amber-200 text-amber-900' 
            : 'bg-rose-50/50 border-rose-200 text-rose-900'
      }`}>
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
            overallScore >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-950">Auditoria Consolidada de Execução</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Esta nota reflete a conformidade operacional do ponto de venda no momento auditado. 
              Pesos profissionais são aplicados a cada critério.
            </p>
          </div>
        </div>

        <div className="text-center md:text-right shrink-0 bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-2xl font-black text-slate-900 block font-mono leading-none">{overallScore.toFixed(0)} / 100</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1 block">Score Ponderado</span>
        </div>
      </div>

      {/* Manual Operacional de Critérios */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 block mb-1">Como preencher a auditoria?</span>
          Mova o controle deslizante ou insira de 0 a 100 para quantificar a aderência de cada critério operacional. 
          Use a caixa de anotações para salvar as marcas com desvios, falhas e de ruptura. Estes registros serão enviados no Excel/CSV!
        </div>
      </div>

      {/* Checklist de Auditoria */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {auditItems.map((item) => (
          <div key={item.id} className="p-6 transition-colors hover:bg-slate-50/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              
              {/* Descrição e Peso */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-slate-900 text-sm">{item.question}</h4>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-[10px] uppercase">Peso: {item.weight}%</span>
                  <span className="text-indigo-600 font-semibold">Critério com impacto direto no giro de produto</span>
                </div>
              </div>

              {/* Slider de Score e Input de Nota */}
              <div className="flex items-center gap-4 w-full lg:w-auto shrink-0">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={item.score}
                  onChange={(e) => handleUpdateScore(item.id, parseInt(e.target.value))}
                  className="w-full md:w-44 accent-indigo-600 cursor-pointer"
                  id={`slider-score-${item.id}`}
                />
                
                {/* Nota Unitária */}
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={item.score}
                  onChange={(e) => handleUpdateScore(item.id, parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 text-center rounded font-mono text-xs font-bold text-slate-800 focus:outline-indigo-500 hover:bg-slate-100"
                  id={`number-score-${item.id}`}
                />

                <div className={`px-2.5 py-1 text-xs font-bold uppercase rounded border shrink-0 text-center min-w-16 font-mono ${getScoreColor(item.score)}`}>
                  {item.score}%
                </div>
              </div>

            </div>

            {/* Notas do Auditor */}
            <div className="mt-4 flex gap-3 items-start bg-slate-50/50 p-3 rounded-lg border border-slate-100">
              <div className="p-1 text-slate-400 shrink-0">
                <PenSquare size={14} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Anotações do Auditor / Desvios Encontrados</span>
                <input
                  type="text"
                  placeholder="Ex: Qual produto causou desvio ou necessita reposição urgente?"
                  value={item.notes}
                  onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                  className="w-full bg-transparent border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-indigo-500 py-1 text-xs text-slate-700 outline-none placeholder:text-slate-400/80"
                  id={`audit-notes-${item.id}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botões de Ação do Painel */}
      <div className="flex justify-between items-center bg-slate-50/50 p-4 border border-slate-150 rounded-xl">
        <span className="text-xs text-slate-500 italic">Preencha no final da auditoria operacional para validar a pesquisa.</span>
        <button
          onClick={handleResetAudit}
          className="flex items-center gap-1 px-4 py-2 text-xs border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-800 rounded-lg transition-colors font-medium shadow-sm"
          id="btn-reset-audit"
        >
          <RotateCcw size={13} />
          <span>Resetar / Limpar Auditoria</span>
        </button>
      </div>

      {/* Relatório Auxiliar */}
      <div className="bg-indigo-950 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg border border-indigo-900">
        <div className="z-10 relative space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-900 rounded-lg text-indigo-400">
              <MessageSquareCode size={18} />
            </div>
            <h4 className="font-bold text-sm tracking-wide">Como migrar este Score para o Google Sheets / Power BI?</h4>
          </div>
          
          <p className="text-xs text-indigo-200 leading-relaxed max-w-2xl">
            Para replicar esta auditoria no Excel, basta somar a multiplicação da <strong>nota pelo seu respectivo peso</strong> dividido por 100 em cada critério. A fórmula integrada é:
          </p>

          <div className="bg-indigo-900/60 p-3.5 rounded-lg border border-indigo-800 font-mono text-xs text-emerald-400 font-semibold select-all overflow-x-auto whitespace-nowrap">
            = (SOMA.PRODUTO(NotaCritérios; PesoCritérios) / 100)
          </div>

          <p className="text-[10px] text-indigo-300">
            No Excel em Português, use `SOMA.PRODUTO` selecionando a coluna de notas e a coluna de pesos correspondentes. No Google Sheets em Inglês, use `=SUMPRODUCT(Notes_Range, Weights_Range)/100`.
          </p>
        </div>

        {/* Fundo decorativo geométrico discreto */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-900/20 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
      </div>
    </div>
  );
}
