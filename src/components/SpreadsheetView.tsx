import React, { useMemo, useState } from 'react';
import { CategoryItem } from '../types';
import { Plus, Trash2, RotateCcw, Download } from 'lucide-react';

// Função utilitária para converter metros e centímetros digitados com ponto ou vírgula
const parseMetreOrCentimetre = (valueStr: string): number => {
  let cleanStr = valueStr.toLowerCase().trim();
  
  // Verifica se termina com 'cm' ou 'm'
  const isCm = cleanStr.endsWith('cm');
  const isM = cleanStr.endsWith('m') && !cleanStr.endsWith('cm');
  
  // Limpa sufixos
  cleanStr = cleanStr.replace('cm', '').replace('m', '').trim();
  
  // Substitui vírgula por ponto para conversão JS
  cleanStr = cleanStr.replace(',', '.');
  
  const parsed = parseFloat(cleanStr);
  if (isNaN(parsed)) return 0;
  
  if (isCm) {
    return parsed / 100; // Ex: "150cm" -> 1.5 metros
  }
  if (isM) {
    return parsed; // Ex: "1.5m" -> 1.5 metros
  }
  
  // Se for um valor inteiro maior ou igual a 10 sem separador decimal (ex: 150, 80, 45),
  // assumimos que foi digitado em centímetros, dividindo por 100 para converter em metros.
  const hasSeparator = cleanStr.includes('.');
  if (!hasSeparator && parsed >= 10) {
    return parsed / 100; 
  }
  
  return parsed;
};

interface MeterInputProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  id?: string;
}

function MeterInput({ value, onChange, className, id }: MeterInputProps) {
  const [localValue, setLocalValue] = React.useState<string>('');
  const [isFocused, setIsFocused] = React.useState(false);

  // Sincroniza o valor vindo das props quando não está focado
  React.useEffect(() => {
    if (!isFocused) {
      // Exibe formatado em metros com vírgula, ex: 1,50
      setLocalValue(value.toFixed(2).replace('.', ','));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setLocalValue(rawVal);
    
    // Atualiza o pai em tempo real se for um número válido para manter a reatividade de outros campos
    const parsed = parseMetreOrCentimetre(rawVal);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseMetreOrCentimetre(localValue);
    onChange(parsed);
    // Formata o valor final para o padrão com vírgula ao perder o foco (ex: 1,50)
    setLocalValue(parsed.toFixed(2).replace('.', ','));
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      className={className}
      id={id}
      placeholder="0,00"
    />
  );
}

interface PercentInputProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  id?: string;
}

function PercentInput({ value, onChange, className, id }: PercentInputProps) {
  const [localValue, setLocalValue] = React.useState<string>('');
  const [isFocused, setIsFocused] = React.useState(false);

  // Sincroniza o valor vindo das props quando não está focado
  React.useEffect(() => {
    if (!isFocused) {
      // Exibe formatado em porcentagem com vírgula, ex: 15,5
      setLocalValue(value.toFixed(1).replace('.', ','));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setLocalValue(rawVal);
    
    // Substitui vírgula por ponto para conversão JS
    const cleanStr = rawVal.replace('%', '').replace(',', '.').trim();
    const parsed = parseFloat(cleanStr);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const cleanStr = localValue.replace('%', '').replace(',', '.').trim();
    let parsed = parseFloat(cleanStr);
    if (isNaN(parsed) || parsed < 0) parsed = 0;
    onChange(parsed);
    // Formata o valor final para o padrão com vírgula ao perder o foco (ex: 15,5)
    setLocalValue(parsed.toFixed(1).replace('.', ','));
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      className={className}
      id={id}
      placeholder="0,0"
    />
  );
}

interface SpreadsheetViewProps {
  categories: CategoryItem[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
  onReset: () => void;
  onExport: () => void;
}

export default function SpreadsheetView({
  categories,
  setCategories,
  onReset,
  onExport
}: SpreadsheetViewProps) {

  // Função auxiliar para formatar a falta de espaço de forma clara e automática:
  // Mostra em centímetros se for menor que 1 metro (ex: 70cm), e em metros se for 1 metro ou mais (ex: 1,50m).
  const formatMissingSpaceAuto = (missing: number): string => {
    if (missing <= 0) return '0,00m';
    if (missing < 1.0) {
      return `${Math.round(missing * 100)}cm`;
    }
    return `${missing.toFixed(2).replace('.', ',')}m`;
  };

  // Totais para cálculos de Share e Falta
  const totals = useMemo(() => {
    let target = 0;
    let actual = 0;
    let ypeMeta = 0;
    let missing = 0;
    categories.forEach(c => {
      target += c.targetSpace || 0;
      actual += c.actualSpace || 0;
      ypeMeta += c.ypeMetaPercent || 0;
      const required = (c.targetSpace || 0) * ((c.ypeMetaPercent || 0) / 100);
      missing += Math.max(0, required - (c.actualSpace || 0));
    });
    return { target, actual, ypeMeta, missing };
  }, [categories]);

  // Adicionar uma nova linha de categoria
  const handleAddRow = () => {
    const newItem: CategoryItem = {
      id: `cat-${Date.now()}`,
      category: 'Nova Categoria',
      targetSpace: 1.0,
      actualSpace: 1.0,
      ypeMetaPercent: 15.0,
      shelfLevel: 'Olhos'
    };
    setCategories([...categories, newItem]);
  };

  // Remover uma linha
  const handleRemoveRow = (id: string) => {
    if (categories.length <= 1) {
      alert('Sua gôndola deve conter pelo menos uma categoria registrada para manter a integridade dos cálculos.');
      return;
    }
    setCategories(categories.filter(c => c.id !== id));
  };

  // Atualizar campo específico de uma linha
  const handleUpdateCell = (id: string, field: keyof CategoryItem, value: any) => {
    setCategories(prev => prev.map(item => {
      if (item.id === id) {
        let parsedValue = value;
        
        // Conversão de números se necessário
        if (field === 'targetSpace' || field === 'actualSpace') {
          parsedValue = typeof value === 'number' ? value : parseMetreOrCentimetre(String(value));
        } else if (field === 'ypeMetaPercent') {
          // Aceita vírgula ou ponto, substitui vírgula por ponto para o JS
          const strVal = String(value).replace(',', '.');
          parsedValue = parseFloat(strVal);
          if (isNaN(parsedValue)) parsedValue = 0;
        }
        
        return { ...item, [field]: parsedValue };
      }
      return item;
    }));
  };

  // Formatar percentual para o Português
  const formatPercent = (val: number) => {
    return (val * 100).toFixed(1) + '%';
  };

  // Determinar status de execução do espaço
  const getExecutionStatus = (actual: number, target: number, ypeMetaPercent: number) => {
    if (!target || target === 0) return { label: 'Incompleto', color: 'bg-slate-100 text-slate-800 border-slate-205', desc: 'Falta configurar espaço total' };
    const execPrct = (actual / target) * 100;
    if (execPrct >= ypeMetaPercent) {
      return { 
        label: 'Bateu', 
        color: 'bg-emerald-50 text-emerald-850 border-emerald-200 hover:bg-emerald-100 font-bold',
        desc: `Bateu! O percentual de execução (${execPrct.toFixed(1)}%) atingiu ou superou a Meta Ypê (${ypeMetaPercent.toFixed(1)}%).`
      };
    } else {
      return { 
        label: 'Não Bateu', 
        color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 font-extrabold',
        desc: `Não Bateu! O percentual de execução (${execPrct.toFixed(1)}%) está abaixo da Meta Ypê (${ypeMetaPercent.toFixed(1)}%).`
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabela de Planograma / Gôndola */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-semibold tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">Ref</th>
                <th className="py-3 px-4 min-w-[200px]">Categoria</th>
                <th className="py-3 px-4 w-32 text-center">Espaço Total da Categoria</th>
                <th className="py-3 px-4 w-32 text-center">Espaço Ypê</th>
                <th className="py-3 px-4 w-32 text-center text-rose-700 bg-rose-50/50 font-bold select-none">
                  Falta
                </th>
                <th className="py-3 px-4 w-32 text-center">Meta Ypê Execução %</th>
                <th className="py-3 px-4 w-28 text-center">Execução %</th>
                <th className="py-3 px-4 w-36 text-center">Status de Espaço</th>
                <th className="py-3 px-2 w-12 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {categories.map((item, index) => {
                const rowIndex = index + 2; // Linha 1 são os cabeçalhos no Excel
                
                // Cálculos locais das fórmulas
                const requiredYpeSpace = (item.targetSpace || 0) * ((item.ypeMetaPercent || 0) / 100);
                const missingSpace = Math.max(0, requiredYpeSpace - (item.actualSpace || 0));
                const executionPrct = item.targetSpace > 0 ? (item.actualSpace / item.targetSpace) : 0;
                const status = getExecutionStatus(item.actualSpace, item.targetSpace, item.ypeMetaPercent);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Linha de Referência do Excel */}
                    <td className="py-3 px-4 text-center font-mono text-slate-400 select-none bg-slate-50/50">
                      {rowIndex}
                    </td>

                    {/* Categoria */}
                    <td className="p-2 border-r border-slate-100">
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => handleUpdateCell(item.id, 'category', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent hover:bg-slate-100/50 focus:bg-white focus:ring-1 focus:ring-slate-300 focus:outline-none rounded transition-colors font-medium text-slate-900"
                        id={`input-cat-${item.id}`}
                      />
                    </td>

                    {/* Espaço Total da Categoria */}
                    <td className="p-2 border-r border-slate-100 text-center">
                      <MeterInput
                        value={item.targetSpace}
                        onChange={(val) => handleUpdateCell(item.id, 'targetSpace', val)}
                        className="w-20 px-2 py-1 text-center bg-transparent hover:bg-slate-100/50 focus:bg-white focus:ring-1 focus:ring-slate-300 focus:outline-none rounded transition-colors font-mono"
                        id={`input-target-${item.id}`}
                      />
                    </td>

                    {/* Espaço Ypê */}
                    <td className="p-2 border-r border-slate-100 text-center">
                      <MeterInput
                        value={item.actualSpace}
                        onChange={(val) => handleUpdateCell(item.id, 'actualSpace', val)}
                        className="w-20 px-2 py-1 text-center bg-transparent hover:bg-slate-100/50 focus:bg-white focus:ring-1 focus:ring-slate-300 focus:outline-none rounded transition-colors font-mono text-indigo-600 font-extrabold"
                        id={`input-actual-${item.id}`}
                      />
                    </td>

                    {/* FÓRMULARIO: Falta */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-rose-600 bg-rose-50/15 border-r border-slate-100 select-none">
                      {formatMissingSpaceAuto(missingSpace)}
                    </td>

                    {/* EDITÁVEL: Meta Ypê Execução % */}
                    <td className="p-1 px-4 border-r border-slate-100 text-center bg-indigo-50/5">
                      <div className="flex items-center justify-center gap-1">
                        <PercentInput
                          value={item.ypeMetaPercent}
                          onChange={(val) => handleUpdateCell(item.id, 'ypeMetaPercent', val)}
                          className="w-16 px-1.5 py-1 text-center bg-transparent hover:bg-slate-100/50 focus:bg-white focus:ring-1 focus:ring-indigo-300 focus:outline-none rounded transition-colors font-mono font-extrabold text-indigo-600"
                          id={`input-ype-meta-${item.id}`}
                        />
                        <span className="text-xs font-mono text-indigo-500 font-medium">%</span>
                      </div>
                    </td>

                    {/* FÓRMULARIO: Execução % */}
                    <td className={`py-3 px-4 text-center font-mono select-none border-r border-slate-100 font-extrabold ${
                        (executionPrct * 100) >= (item.ypeMetaPercent || 0)
                          ? 'text-emerald-600 bg-emerald-50'
                          : 'text-rose-600 bg-rose-50'
                      }`}
                    >
                      {formatPercent(executionPrct)}
                    </td>

                    {/* FÓRMULARIO: Status Automático */}
                    <td className="py-2 px-3 border-r border-slate-100 text-center">
                      <div className={`px-2.5 py-1 text-xs border rounded-full font-semibold inline-block transition-colors ${status.color}`}>
                        {status.label}
                      </div>
                    </td>

                    {/* Botão Deletar */}
                    <td className="py-3 px-2 text-center text-slate-400">
                      <button
                        onClick={() => handleRemoveRow(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                        title="Remover linha"
                        id={`btn-remove-${item.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela com Ações de Linha */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleAddRow}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
              id="btn-add-row"
            >
              <Plus size={16} />
              <span>Adicionar Categoria</span>
            </button>

            {/* Restaurar Padrões */}
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs border border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-all font-semibold shadow-sm cursor-pointer"
              title="Restaurar dados iniciais padrão"
              id="header-btn-reset"
            >
              <RotateCcw size={13} className="text-slate-500" />
              <span>Restaurar Exemplo</span>
            </button>

            {/* Baixar Tabela */}
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-sm shadow-emerald-100 cursor-pointer"
              title="Exportar para Excel e Google Sheets"
              id="header-btn-export"
            >
              <Download size={13} />
              <span>Exportar para Excel</span>
            </button>
          </div>
          
          <div className="flex gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block border border-emerald-600"></span>
              <span>Bateu (Execução % &ge; Meta Ypê)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block border border-rose-600"></span>
              <span>Não Bateu (Execução % &lt; Meta Ypê)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
