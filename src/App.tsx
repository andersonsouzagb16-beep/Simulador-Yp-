import React, { useState, useEffect } from 'react';
import { INITIAL_CATEGORIES } from './data/initialData';
import { CategoryItem } from './types';
import SpreadsheetView from './components/SpreadsheetView';

export default function App() {
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem('gondola_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Sincronizar com localStorage
  useEffect(() => {
    localStorage.setItem('gondola_categories', JSON.stringify(categories));
  }, [categories]);

  // Resetar todos os dados para o padrão original de fábrica
  const handleResetToDefaults = () => {
    if (confirm('Atenção: Isso excluirá todas as modificações que você fez e restaurará o planograma simulado original. Deseja prosseguir?')) {
      setCategories(INITIAL_CATEGORIES);
    }
  };

  // Exportar dados da gôndola direto para CSV formatado para Excel PT-BR
  const handleExportCSV = () => {
    // Definimos 'sep=;' na primeira linha para evitar que o Excel em Português aglomere
    // as colunas, forçando-o a dividir por ponto-e-vírgula imediatamente.
    let csvContent = "sep=;\n";
    csvContent += "PLANOGRAMA DE EXECUTADO E SHARE DE GONDOLA\n";
    csvContent += `Data de Exportacao:;${new Date().toLocaleDateString('pt-BR')}\n\n`;
    
    // Cabeçalhos frentes de espaço de prateleiras
    csvContent += "Categoria;Espaco Total da Categoria (m);Espaco Ype (m);Falta (m);Meta Ype Execucao %;Execucao %;Status de Ocupacao;Formula Excel Recomendada\n";

    // Calcular somas totais de espaço
    const totalTarget = categories.reduce((acc, c) => acc + (c.targetSpace || 0), 0);
    const totalActual = categories.reduce((acc, c) => acc + (c.actualSpace || 0), 0);

    categories.forEach((item, idx) => {
      const excelRow = idx + 2; // Cabeçalho está na Linha 1 no Excel
      const requiredYpeSpace = (item.targetSpace || 0) * ((item.ypeMetaPercent || 0) / 100);
      const missingVal = Math.max(0, requiredYpeSpace - (item.actualSpace || 0));
      const ypeMetaVal = item.ypeMetaPercent || 0;
      const execPrct = item.targetSpace > 0 ? (item.actualSpace / item.targetSpace) * 100 : 0;

      // Status
      const status = execPrct >= ypeMetaVal ? "Bateu" : "Não Bateu";

      // Formatação compatível com ponto decimal em Português (virgula decimal)
      const fmtTarget = String(item.targetSpace || 0).replace(".", ",");
      const fmtActual = String(item.actualSpace || 0).replace(".", ",");
      const fmtMissing = missingVal.toFixed(1).replace(".", ",") + "m";
      const fmtYpeMeta = ypeMetaVal.toFixed(1).replace(".", ",") + "%";
      const fmtExecPrct = execPrct.toFixed(1).replace(".", ",") + "%";

      csvContent += `"${item.category}";${fmtTarget};${fmtActual};${fmtMissing};${fmtYpeMeta};${fmtExecPrct};"${status}";"=SE((B${excelRow}*E${excelRow})>C${excelRow};(B${excelRow}*E${excelRow})-C${excelRow};0)"\n`;
    });

    // Linha de Totais da Planilha
    const fmtTotalTarget = String(totalTarget).replace(".", ",");
    const fmtTotalActual = String(totalActual).replace(".", ",");
    const totalMissing = categories.reduce((acc, c) => {
      const required = (c.targetSpace || 0) * ((c.ypeMetaPercent || 0) / 100);
      return acc + Math.max(0, required - (c.actualSpace || 0));
    }, 0);
    const fmtTotalMissing = totalMissing.toFixed(1).replace(".", ",") + "m";
    const totalYpeMeta = categories.reduce((acc, c) => acc + (c.ypeMetaPercent || 0), 0);
    const fmtTotalYpeMeta = totalYpeMeta.toFixed(1).replace(".", ",") + "%";
    const totalExecPercent = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
    const fmtTotalExecPrct = totalExecPercent.toFixed(1).replace(".", ",") + "%";

    csvContent += `TOTAIS DA GONDOLA;${fmtTotalTarget};${fmtTotalActual};${fmtTotalMissing};${fmtTotalYpeMeta};${fmtTotalExecPrct};;"=SOMA(D2:D${categories.length + 1})"\n\n`;

    // Criar download seguro adicionando o BOM (Byte Order Mark) do UTF-8 para o Excel reconhecer acentos (á, õ, etc.)
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Planograma_Gondola_Ype_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-6">
        
        {/* Banner de Referência do Planograma */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 block animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700 font-mono tracking-wider uppercase">Simulador de Metas Ypê Execução</span>
            </div>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-mono leading-none font-bold">Distribuição de Espaço</span>
          </div>
          <div className="relative aspect-[16/8] md:aspect-[32/10] w-full bg-slate-50 flex items-center justify-center p-4">
            <img 
              src="https://i.ibb.co/tMqMjpHv/images-22.jpg" 
              alt="Planograma de Referência Ypê" 
              className="w-full h-full object-contain rounded-lg max-h-[350px]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Render only Spreadsheet View directly */}
        <div className="animate-fade-in">
          <SpreadsheetView 
            categories={categories} 
            setCategories={setCategories}
            onReset={handleResetToDefaults}
            onExport={handleExportCSV}
          />
        </div>

      </main>

      {/* Footer information bar */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left font-mono">
          <div>
            <span>© Gôndola Pro - Simulador De Espaço Ypê Execução</span>
            <span className="hidden md:inline mx-2">|</span>
            <span className="text-slate-500 italic block sm:inline mt-1 sm:mt-0">Dados salvos de forma offline e local com total segurança</span>
          </div>
          <div className="text-slate-500 font-mono text-[10px]">
            <span>Exporte clicando acima para fatiar seus dados no Excel real</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
