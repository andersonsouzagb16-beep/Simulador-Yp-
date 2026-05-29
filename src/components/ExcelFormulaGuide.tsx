import React, { useState } from 'react';
import { Copy, Check, FileSpreadsheet, Calculator, MessageSquare, AlertCircle } from 'lucide-react';

interface FormulaCode {
  id: string;
  title: string;
  excelFormula: string;
  sheetsFormula: string;
  purpose: string;
  usage: string;
}

export default function ExcelFormulaGuide() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [useSheets, setUseSheets] = useState<boolean>(false);

  const formulas: FormulaCode[] = [
    {
      id: 'formula-share',
      title: '1. Meta Ypê de Execução % (Meta de Gôndola)',
      excelFormula: 'Valor de Entrada Direta (ex: 35%)',
      sheetsFormula: 'Manual Input (ex: 35%)',
      purpose: 'Define a meta estratégica customizada e editável para a representação ou execução de cada categoria na gôndola.',
      usage: 'Esta é uma célula de entrada de dados no simulador e na planilha. No Excel/Sheets, insira o número desejado diretamente na coluna F2 de acordo com sua estratégia.'
    },
    {
      id: 'formula-exec',
      title: '2. Percentual de Execução de Espaço',
      excelFormula: '=C2/B2',
      sheetsFormula: '=C2/B2',
      purpose: 'Determina a eficiência de entrega do espaço físico da gôndola de cada categoria em relação ao total planejado.',
      usage: 'Insira na coluna F2 (Execução %) dividindo o Espaço Ypê (C2) pelo Espaço Total da Categoria (B2). Formate a célula no Excel com o estilo "Porcentagem %". Se o resultado for igual ou superior à Meta Ypê (E2), as metas serão atingidas.'
    },
    {
      id: 'formula-status',
      title: '3. Sistema Automático de Status (Alerta de Espaço)',
      excelFormula: '=SE(F2>=E2; "Bateu"; "Não Bateu")',
      sheetsFormula: '=IF(F2>=E2, "Bateu", "Não Bateu")',
      purpose: 'Avalia se o percentual de Execução da categoria (F2) atingiu ou superou a Meta Ypê de Execução % (E2).',
      usage: 'Insira na coluna G2 e arraste. Retorna "Bateu" se o percentual executado for suficiente para bater a Meta Ypê, ou "Não Bateu" caso contrário. Você pode usar uma "Formatação Condicional" no Excel vinculada a estes termos para pintar as células automaticamente!'
    },
    {
      id: 'formula-desvio',
      title: '4. Cálculo de Falta em Metros (Déficit de Gôndola)',
      excelFormula: '=SE((B2*E2)>C2; (B2*E2)-C2; 0)',
      sheetsFormula: '=IF((B2*E2)>C2, (B2*E2)-C2, 0)',
      purpose: 'Calcula o espaço de gôndola em metros que falta para que a marca Ypê atinja sua meta percentual estratégica baseada no espaço total da categoria.',
      usage: 'Insira na coluna D2. Se o espaço meta exigido (Espaço Total B2 multiplicado pela Meta E2) for maior que o Espaço Ypê (C2) atual auditado, retorna a diferença em metros. Se o objetivo do espaço já foi atingido ou superado, retorna 0,00m.'
    },
    {
      id: 'formula-audit',
      title: '5. Calculador de Score Geral de Auditoria Ponderada',
      excelFormula: '=(A12*25 + B12*20 + C12*30 + D12*15 + E12*10)/100',
      sheetsFormula: '=(A12*25 + B12*20 + C12*30 + D12*15 + E12*10)/100',
      purpose: 'Pondera a nota de auditoria do PDV pelos pesos ideais e de impacto de cada critério.',
      usage: 'Aplique em uma célula única para obter o Score Geral. Substitua A12 até E12 pelas células contendo a nota de cada um dos 5 critérios!'
    }
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-600" size={20} />
            Biblioteca de Fórmulas Prontas de Trade Marketing
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Veja as fórmulas profissionais que estruturam planilhas inteligentes. Selecione sua plataforma preferida.
          </p>
        </div>

        {/* Toggle Excel / Sheets */}
        <div className="bg-slate-100 p-1 rounded-lg flex shrink-0">
          <button
            onClick={() => setUseSheets(false)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              !useSheets ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
            id="toggle-formula-excel"
          >
            Excel (Português)
          </button>
          <button
            onClick={() => setUseSheets(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              useSheets ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
            id="toggle-formula-sheets"
          >
            Google Sheets (Sintaxe EN)
          </button>
        </div>
      </div>

      {/* Cartões de Fórmulas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formulas.map((item) => {
          const activeFormula = useSheets ? item.sheetsFormula : item.excelFormula;
          const isCopied = copiedId === item.id;

          return (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-950 text-sm tracking-tight">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.purpose}</p>

                {/* Código da Fórmula Copiável */}
                <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl border border-slate-900 font-mono text-xs font-bold my-4 flex items-center justify-between gap-3 relative group">
                  <span className="truncate select-all">{activeFormula}</span>
                  <button
                    onClick={() => handleCopy(item.id, activeFormula)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-md transition-colors grow-0 shrink-0"
                    title="Copiar fórmula para Área de Transferência"
                    id={`btn-copy-formula-${item.id}`}
                  >
                    {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Uso */}
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Calculator size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                <span className="text-[10.5px] text-slate-600 font-sans leading-relaxed">
                  <strong className="text-indigo-950">Como usar:</strong> {item.usage}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explicação de Referência Absoluta */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow shadow-inner">
        <h4 className="font-bold text-sm text-white flex items-center gap-2">
          <AlertCircle className="text-indigo-400" size={16} />
          Por que fixar células com o cifrão ($)? (Referência Absoluta)
        </h4>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Ao arrastar fórmulas no Excel a partir do canto da célula, as referências se movem relativamente de forma automática.
          Se escrevemos <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[10.5px]">=D2/SOMA(D2:D8)</code> na linha 2, ao arrastá-la para a linha 3 ela mudará erroneamente para <code className="bg-slate-950 px-1.5 py-0.5 rounded text-rose-300 font-mono text-[10.5px]">=D3/SOMA(D3:D9)</code>!
        </p>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Para que o total permaneça fiel de <strong>D2 até D8</strong> em todas as linhas, inserimos a cifrão antes do número da linha: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-400 font-mono text-[10.5px]">D$2:D$8</code>. Agora, você pode preencher toda a sua planilha em 1 segundo arrastando a coluna!
        </p>
      </div>
    </div>
  );
}
