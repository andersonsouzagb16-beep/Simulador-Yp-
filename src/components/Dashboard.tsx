import React, { useMemo, useState } from 'react';
import { CategoryItem } from '../types';
import { Calendar, LayoutGrid, Award, Percent, TrendingUp, AlertCircle, Sparkles, Building2, Eye, ShieldAlert } from 'lucide-react';

interface DashboardProps {
  categories: CategoryItem[];
  auditScore: number;
}

export default function Dashboard({ categories, auditScore }: DashboardProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Cálculos de KPIs fundamentais
  const stats = useMemo(() => {
    let totalTarget = 0;
    let totalActual = 0;
    let bateuCount = 0;
    let naoBateuCount = 0;

    categories.forEach(item => {
      totalTarget += item.targetSpace || 0;
      totalActual += item.actualSpace || 0;

      const ratio = item.targetSpace > 0 ? (item.actualSpace / item.targetSpace) * 100 : 0;
      if (ratio >= (item.ypeMetaPercent || 0)) {
        bateuCount++;
      } else {
        naoBateuCount++;
      }
    });

    const executionPercentage = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

    // Calcular o Desvio Médio de Share Absoluto (uma métrica super profissional de Trade)
    // Mede o quão distante estamos dos acordos de share contratados
    let totalAbsShareDeviation = 0;
    categories.forEach(item => {
      const targetPrct = totalTarget > 0 ? (item.targetSpace / totalTarget) : 0;
      const actualPrct = totalActual > 0 ? (item.actualSpace / totalActual) : 0;
      totalAbsShareDeviation += Math.abs(actualPrct - targetPrct);
    });
    // Multiplicamos por 100 para transformar em pontos percentuais (p.p.), e dividimos por 2 porque as compensações se anulam mutuamente
    const shareComplianceIndex = Math.max(0, 100 - (totalAbsShareDeviation / 2) * 100);

    return {
      totalTarget,
      totalActual,
      bateuCount,
      naoBateuCount,
      executionPercentage,
      shareComplianceIndex,
      categoryCount: categories.length
    };
  }, [categories]);

  // Agrupamento por prateleiras (shelf levels) para o visualizador físico
  const shelfProducts = useMemo(() => {
    const shelves = {
      'Superior': [] as CategoryItem[],
      'Olhos': [] as CategoryItem[],
      'Mãos': [] as CategoryItem[],
      'Cintura': [] as CategoryItem[],
      'Chão': [] as CategoryItem[]
    };

    categories.forEach(item => {
      const level = item.shelfLevel || 'Mãos';
      if (shelves[level]) {
        shelves[level].push(item);
      } else {
        shelves['Mãos'].push(item);
      }
    });

    return shelves;
  }, [categories]);

  // Lista de cores elegantes por produto para os gráficos e layout
  const getColorForIndex = (index: number) => {
    const colors = [
      'bg-indigo-500 border-indigo-600 text-indigo-50 hover:bg-indigo-600',
      'bg-emerald-500 border-emerald-600 text-emerald-50 hover:bg-emerald-600',
      'bg-sky-500 border-sky-600 text-sky-50 hover:bg-sky-600',
      'bg-amber-500 border-amber-600 text-amber-50 hover:bg-amber-600',
      'bg-rose-500 border-rose-600 text-rose-50 hover:bg-rose-600',
      'bg-violet-500 border-violet-600 text-violet-50 hover:bg-violet-600',
      'bg-teal-500 border-teal-600 text-teal-50 hover:bg-teal-600',
      'bg-slate-500 border-slate-600 text-slate-50 hover:bg-slate-600'
    ];
    return colors[index % colors.length];
  };

  const getSvgColorForIndex = (index: number, type: 'target' | 'actual') => {
    const pallete = [
      { target: '#818cf8', actual: '#4f46e5' }, // Indigo
      { target: '#34d399', actual: '#059669' }, // Emerald
      { target: '#38bdf8', actual: '#0284c7' }, // Sky
      { target: '#fbbf24', actual: '#d97706' }, // Amber
      { target: '#f87171', actual: '#dc2626' }, // Rose
      { target: '#c084fc', actual: '#7c3aed' }, // Violet
      { target: '#2dd4bf', actual: '#0d9488' }, // Teal
      { target: '#94a3b8', actual: '#475569' }  // Slate
    ];
    const picked = pallete[index % pallete.length];
    return type === 'target' ? picked.target : picked.actual;
  };

  return (
    <div className="space-y-8">
      {/* Grade superior de KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Espaço Linear Ocupado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <LayoutGrid size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-400 block tracking-wider uppercase">Espaço Ypê vs Total Planejado</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold font-sans text-slate-900">{stats.totalActual.toFixed(1)}m</span>
              <span className="text-xs text-slate-400 font-mono">de {stats.totalTarget.toFixed(1)}m planejados</span>
            </div>
            {/* Barra de progresso */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, stats.totalTarget > 0 ? (stats.totalActual / stats.totalTarget) * 100 : 0)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 2: Execução de Margem de Planograma */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Percent size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-400 block tracking-wider uppercase">Taxa de Execução</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-900">{stats.executionPercentage.toFixed(1)}%</span>
              <span className={`text-xs font-semibold px-1.5 py-0.2 rounded font-mono ${
                stats.naoBateuCount === 0 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {stats.naoBateuCount === 0 ? 'Bateu Tudo!' : `${stats.bateuCount} de ${stats.categoryCount} Bateu`}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Conformidade total do espaço em relação as frentes contratadas.</span>
          </div>
        </div>

        {/* KPI 3: Conformidade de Share Acordado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
            <TrendingUp size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-400 block tracking-wider uppercase">Aderência ao Share</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-slate-900">{stats.shareComplianceIndex.toFixed(1)}%</span>
              <span className="text-xs text-slate-400">de acerto</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-violet-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${stats.shareComplianceIndex}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 4: Nota de Auditoria Operacional */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Award size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-400 block tracking-wider uppercase">Auditoria de Gôndola</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-slate-900">{auditScore.toFixed(0)}/100</span>
              <span className={`text-[10px] font-semibold px-1 rounded ${
                auditScore >= 90 ? 'bg-emerald-50 text-emerald-700' : auditScore >= 75 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {auditScore >= 90 ? 'Excelente' : auditScore >= 75 ? 'Moderado' : 'Crítico'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Calculado dinamicamente via painel de auditoria.</span>
          </div>
        </div>
      </div>

      {/* Alertas de Gôndola (Rupturas ou Desvios de Prateleira) */}
      {stats.naoBateuCount > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Ações Corretivas Necessárias Detectadas!</h4>
              <p className="text-xs text-slate-600 mt-1">
                Existe(m) <strong className="text-rose-950 font-bold">{stats.naoBateuCount} categoria(s) que Não Bateu(aram)</strong> a Meta Ypê de Execução ideal neste ponto de venda. É necessário negociar mais frentes ou remanejar o espaço físico.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg font-mono">
              {stats.naoBateuCount} Não Bateu
            </span>
            <span className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg font-mono">
              {stats.bateuCount} Bateu
            </span>
          </div>
        </div>
      )}

      {/* Seção Principal de Gráficos e Visualizador */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Gráfico de Comparação de Share Alvo vs Real (SVG Custom) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Share de Gôndola: Total Planejado x Espaço Ypê</h3>
              <p className="text-xs text-slate-500 mt-0.5">O percentual ideal do Espaço Total da Categoria versus o Espaço Ypê executado na prateleira.</p>
            </div>
            {/* Legenda */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-indigo-400 rounded-sm"></span>
                <span className="text-slate-500">Planejado</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-indigo-700 rounded-sm"></span>
                <span className="text-slate-500">Espaço Ypê</span>
              </div>
            </div>
          </div>

          {/* Gráfico SVG Customizado */}
          <div className="relative pt-2">
            <svg viewBox="0 0 600 240" className="w-full h-auto">
              {/* Linhas de grade horizonal */}
              {[0, 25, 50, 75, 100].map((v) => {
                const y = 180 - (v * 1.5);
                return (
                  <g key={v} className="opacity-10">
                    <line x1="50" y1={y} x2="570" y2={y} stroke="black" strokeWidth="1" strokeDasharray="3" />
                    <text x="15" y={y + 4} className="font-mono text-[9px] fill-slate-500 font-semibold">{v}%</text>
                  </g>
                );
              })}

              {/* Desenhar as Barras Compartilhadas */}
              {categories.map((item, idx) => {
                const targetPctVal = stats.totalTarget > 0 ? (item.targetSpace / stats.totalTarget) * 100 : 0;
                const actualPctVal = stats.totalActual > 0 ? (item.actualSpace / stats.totalActual) * 100 : 0;

                // Coordenadas calculadas
                const groupWidth = 60;
                const gap = 15;
                const x = 60 + idx * (groupWidth + gap);
                
                // Altura da barra (limitado no range gráfico)
                const barWidth = 18;
                const targetBarHeight = targetPctVal * 1.5;
                const actualBarHeight = actualPctVal * 1.5;
                
                const targetY = 180 - targetBarHeight;
                const actualY = 180 - actualBarHeight;

                const colorTarget = getSvgColorForIndex(idx, 'target');
                const colorActual = getSvgColorForIndex(idx, 'actual');

                const isHovered = hoveredCategory === item.id;

                return (
                  <g 
                    key={item.id}
                    onMouseEnter={() => setHoveredCategory(item.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className="cursor-pointer transition-opacity duration-200"
                    style={{ opacity: hoveredCategory && !isHovered ? 0.35 : 1 }}
                  >
                    {/* Barra Target */}
                    <rect 
                      x={x} 
                      y={targetY} 
                      width={barWidth} 
                      height={Math.max(2, targetBarHeight)} 
                      fill={colorTarget}
                      rx="3"
                    />
                    {/* Barra Actual */}
                    <rect 
                      x={x + barWidth + 3} 
                      y={actualY} 
                      width={barWidth} 
                      height={Math.max(2, actualBarHeight)} 
                      fill={colorActual}
                      rx="3"
                    />

                    {/* Rótulo da Categoria */}
                    <text 
                      x={x + barWidth} 
                      y="200" 
                      textAnchor="middle" 
                      className="font-sans text-[9px] fill-slate-700 font-semibold"
                      transform={`rotate(-15, ${x + barWidth}, 200)`}
                    >
                      {item.category.length > 10 ? item.category.substring(0, 10) + '..' : item.category}
                    </text>

                    {/* Exibir desvio flutuante se for o maior */}
                    {isHovered && (
                      <g>
                        {/* Fundo do tooltip */}
                        <rect x={Math.max(10, x - 50)} y="10" width="140" height="42" fill="#0f172a" rx="6" />
                        {/* Textos */}
                        <text x={Math.max(10, x - 50) + 10} y="24" className="font-sans text-[10px] fill-white font-bold">{item.category}</text>
                        <text x={Math.max(10, x - 50) + 10} y="34" className="font-sans text-[8px] fill-slate-300">
                          Planejado: {targetPctVal.toFixed(1)}% | Ypê: {actualPctVal.toFixed(1)}%
                        </text>
                        <text x={Math.max(10, x - 50) + 10} y="44" className={`font-mono text-[8px] font-bold ${actualPctVal - targetPctVal >= 0 ? 'fill-emerald-400' : 'fill-rose-400'}`}>
                          Desvio: {(actualPctVal - targetPctVal).toFixed(1)} p.p.
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              
              {/* Rodapé da Gôndola */}
              <line x1="45" y1="180" x2="570" y2="180" stroke="#cbd5e1" strokeWidth="2" />
            </svg>
          </div>

          {/* Dica para o Analista */}
          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex items-center gap-2.5 text-xs text-indigo-900">
            <Sparkles size={16} className="text-indigo-600 grow-0 shrink-0" />
            <span>
              Ao pairar o mouse sobre as barras você verá a diferença de <strong>ponto percentual (p.p.)</strong> contratado versus o auditado. Use isso para negociar espaço adicional!
            </span>
          </div>
        </div>

        {/* Visualizador de Gôndola Virtual Física Tridimensional */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                  <Eye size={18} className="text-indigo-600" />
                  Gôndola Simulação 3D
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Visualização física proporcional de como as frentes estão dispostas no ponto de venda (PDV).</p>
              </div>
            </div>

            {/* A representação da Gôndola */}
            <div className="bg-slate-100 border-4 border-slate-700/80 rounded-xl p-3 shadow-inner my-6 space-y-4">
              {/* Iterando as Prateleiras de cima para baixo */}
              {(['Superior', 'Olhos', 'Mãos', 'Cintura', 'Chão'] as const).map((level) => {
                const shelfItems = shelfProducts[level] || [];
                const totalLevelActual = shelfItems.reduce((acc, c) => acc + (c.actualSpace || 0), 0);

                return (
                  <div key={level} className="relative">
                    {/* Indicador de nível da prateleira */}
                    <div className="flex justify-between text-[9px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">
                      <span>Nível: {level}</span>
                      <span>{totalLevelActual > 0 ? `${totalLevelActual.toFixed(1)}m Alocado` : 'Prateleira Vazia'}</span>
                    </div>

                    {/* Canaleta Física */}
                    <div className="min-h-12 bg-slate-200/60 rounded border border-slate-300 p-1 flex items-end gap-1 relative overflow-hidden">
                      {shelfItems.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 italic">
                          Disponível para Merchandising / Rupturas
                        </div>
                      ) : (
                        shelfItems.map((item) => {
                          // Calcular largura percentual com base no espaço
                          const totalActualSpace = stats.totalActual || 1;
                          const widthPercentage = Math.max(15, (item.actualSpace / totalActualSpace) * 100 * 2.5);
                          
                          // Achar a cor da lista
                          const itemIndexInCategories = categories.findIndex(c => c.id === item.id);
                          const color = getColorForIndex(itemIndexInCategories === -1 ? 0 : itemIndexInCategories);

                          return (
                            <div 
                              key={item.id} 
                              className={`h-9 rounded border flex flex-col justify-center items-center p-1 text-[9px] font-bold overflow-hidden shadow-sm transition-all truncate select-none shrink-0 ${color}`}
                              style={{ width: `${widthPercentage}%` }}
                              title={`${item.category} (${item.actualSpace.toFixed(2)}m)`}
                            >
                              <span className="block truncate w-full text-center leading-none text-white">{item.category}</span>
                              <span className="text-[8px] opacity-90 font-mono mt-0.5">{item.actualSpace.toFixed(1)}m</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {/* Aparador de Metal da Prateleira */}
                    <div className="bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 h-2.5 rounded-b-md shadow-sm border-t border-white" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
            *Dica: Para ajustar as categorias na simulação física da prateleira (Gôndola), edite o nível de prateleira ou crie uma coluna correspondente no Excel.
          </div>
        </div>

      </div>
    </div>
  );
}
