export interface CategoryItem {
  id: string;
  category: string; // ex: "Refrigerantes"
  targetSpace: number; // Espaço Total da Categoria (metros)
  actualSpace: number; // Espaço Ypê (metros)
  ypeMetaPercent: number; // Meta Ypê Execução (%)
  shelfLevel: 'Superior' | 'Olhos' | 'Mãos' | 'Cintura' | 'Chão'; // Altura na gôndola
}

export interface AuditItem {
  id: string;
  question: string;
  weight: number;
  score: number; // 0 - 100
  notes: string;
}

export interface ExcelFormulaReference {
  description: string;
  excelFormula: string;
  sheetsFormula: string;
  columnsUsed: string;
  explanation: string;
}
