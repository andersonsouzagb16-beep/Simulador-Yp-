import { CategoryItem, AuditItem } from '../types';

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-1',
    category: 'Refrigerantes Cola Standard',
    targetSpace: 3.5,
    actualSpace: 3.2,
    ypeMetaPercent: 35.0,
    shelfLevel: 'Olhos'
  },
  {
    id: 'cat-2',
    category: 'Refrigerantes Cola Premium',
    targetSpace: 2.0,
    actualSpace: 1.8,
    ypeMetaPercent: 20.0,
    shelfLevel: 'Olhos'
  },
  {
    id: 'cat-3',
    category: 'Refrigerantes Guaraná',
    targetSpace: 2.2,
    actualSpace: 2.4,
    ypeMetaPercent: 15.0,
    shelfLevel: 'Mãos'
  },
  {
    id: 'cat-4',
    category: 'Refrigerantes Limão',
    targetSpace: 1.2,
    actualSpace: 1.5,
    ypeMetaPercent: 10.0,
    shelfLevel: 'Cintura'
  },
  {
    id: 'cat-5',
    category: 'Refrigerantes Laranja',
    targetSpace: 1.1,
    actualSpace: 1.1,
    ypeMetaPercent: 10.0,
    shelfLevel: 'Cintura'
  },
  {
    id: 'cat-6',
    category: 'Refrigerantes Zero/Diet',
    targetSpace: 1.5,
    actualSpace: 1.6,
    ypeMetaPercent: 8.0,
    shelfLevel: 'Superior'
  },
  {
    id: 'cat-7',
    category: 'Água Tônica / Outros',
    targetSpace: 0.5,
    actualSpace: 0.4,
    ypeMetaPercent: 2.0,
    shelfLevel: 'Chão'
  }
];

export const INITIAL_AUDIT: AuditItem[] = [
  {
    id: 'aud-1',
    question: 'Organização por Bloco de Marca (Planograma executado corretamente)',
    weight: 25,
    score: 85,
    notes: 'Algumas latas de Coca-Cola Zero misturadas com a Coca-Cola normal no nível dos olhos.'
  },
  {
    id: 'aud-2',
    question: 'Exibição de Preços (Todas as frentes possuem etiquetas legíveis e corretas)',
    weight: 20,
    score: 95,
    notes: 'Falta etiqueta de preço apenas no refrigerante Schweppes de 350ml.'
  },
  {
    id: 'aud-3',
    question: 'Abastecimento & Sem Rupturas (Gôndola sem buracos ou produtos zerados)',
    weight: 30,
    score: 70,
    notes: 'Ruptura pontual detectada na Pepsi de 2L. Espaço vazio coberto por frentes de Guaraná.'
  },
  {
    id: 'aud-4',
    question: 'Limpeza e Validade (Prateleiras limpas e produtos dentro do vencimento)',
    weight: 15,
    score: 100,
    notes: 'Gôndolas limpas, produtos organizados com FIFO (primeiro que vence, sai antes).'
  },
  {
    id: 'aud-5',
    question: 'Materiais de Merchandising (Uso correto de stoppers, cartazes e faixas de gôndola)',
    weight: 10,
    score: 80,
    notes: 'Stopper da Coca-Cola ok, necessita repor testeira promocional do Guaraná.'
  }
];
