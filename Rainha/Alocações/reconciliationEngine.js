import { normalizeString, findBestMatch, areSimilar, cleanName } from './stringUtils.js';

/**
 * Motor principal de conciliação de funcionários
 */
export class ReconciliationEngine {
  constructor(options = {}) {
    this.options = {
      exactMatchThreshold: 1.0,
      similarMatchThreshold: options.similarMatchThreshold || 0.8,
      enableNameCleaning: options.enableNameCleaning !== false,
      enableNormalization: options.enableNormalization !== false,
      ...options
    };
  }

  /**
   * Executa a conciliação entre duas listas de funcionários
   */
  reconcile(list1, list2) {
    const results = {
      exactMatches: [],
      similarMatches: [],
      notFoundList1: [],
      notFoundList2: [],
      statistics: {}
    };

    // Preparar listas
    const preparedList1 = this.prepareList(list1, 'list1');
    const preparedList2 = this.prepareList(list2, 'list2');

    // Criar índices para busca rápida
    const list2Index = this.createSearchIndex(preparedList2);
    const matchedList2 = new Set();

    // Processar cada funcionário da lista 1
    for (const employee1 of preparedList1) {
      const match = this.findMatch(employee1, list2Index, preparedList2);
      
      if (match) {
        matchedList2.add(match.employee.id);
        
        if (match.type === 'exact') {
          results.exactMatches.push({
            list1: employee1,
            list2: match.employee,
            score: match.score,
            type: 'exact'
          });
        } else {
          results.similarMatches.push({
            list1: employee1,
            list2: match.employee,
            score: match.score,
            type: match.type
          });
        }
      } else {
        results.notFoundList1.push(employee1);
      }
    }

    // Encontrar funcionários da lista 2 que não foram correspondidos
    for (const employee2 of preparedList2) {
      if (!matchedList2.has(employee2.id)) {
        results.notFoundList2.push(employee2);
      }
    }

    // Calcular estatísticas
    results.statistics = this.calculateStatistics(results, preparedList1.length, preparedList2.length);

    return results;
  }

  /**
   * Prepara uma lista de funcionários para processamento
   */
  prepareList(list, listId) {
    return list.map((employee, index) => {
      let processedName = employee.name || employee.originalName || '';
      
      if (this.options.enableNameCleaning) {
        processedName = cleanName(processedName);
      }
      
      return {
        id: `${listId}_${index}`,
        originalName: employee.name || employee.originalName || '',
        processedName: processedName,
        normalizedName: this.options.enableNormalization ? normalizeString(processedName) : processedName,
        allocation: employee.allocation || null,
        row: employee.row || index,
        listId: listId,
        ...employee
      };
    });
  }

  /**
   * Cria índice de busca para otimizar correspondências
   */
  createSearchIndex(list) {
    const index = {
      exact: new Map(),
      normalized: new Map(),
      tokens: new Map()
    };

    for (const employee of list) {
      // Índice por nome exato
      const exactKey = employee.processedName.toLowerCase();
      if (!index.exact.has(exactKey)) {
        index.exact.set(exactKey, []);
      }
      index.exact.get(exactKey).push(employee);

      // Índice por nome normalizado
      const normalizedKey = employee.normalizedName;
      if (!index.normalized.has(normalizedKey)) {
        index.normalized.set(normalizedKey, []);
      }
      index.normalized.get(normalizedKey).push(employee);

      // Índice por tokens (palavras)
      const tokens = normalizedKey.split(' ').filter(token => token.length > 2);
      for (const token of tokens) {
        if (!index.tokens.has(token)) {
          index.tokens.set(token, []);
        }
        index.tokens.get(token).push(employee);
      }
    }

    return index;
  }

  /**
   * Encontra a melhor correspondência para um funcionário
   */
  findMatch(employee, index, fullList) {
    // 1. Buscar correspondência exata
    const exactMatches = index.exact.get(employee.processedName.toLowerCase()) || [];
    if (exactMatches.length > 0) {
      return {
        employee: exactMatches[0],
        score: 1.0,
        type: 'exact'
      };
    }

    // 2. Buscar correspondência normalizada
    const normalizedMatches = index.normalized.get(employee.normalizedName) || [];
    if (normalizedMatches.length > 0) {
      return {
        employee: normalizedMatches[0],
        score: 0.99,
        type: 'exact'
      };
    }

    // 3. Buscar correspondências similares usando tokens
    const candidates = this.getCandidatesFromTokens(employee, index);
    
    if (candidates.length === 0) {
      // Se não há candidatos por tokens, usar lista completa (mais lento)
      return this.findSimilarMatch(employee, fullList);
    }

    // Buscar melhor correspondência entre candidatos
    return this.findSimilarMatch(employee, candidates);
  }

  /**
   * Obtém candidatos baseados em tokens compartilhados
   */
  getCandidatesFromTokens(employee, index) {
    const tokens = employee.normalizedName.split(' ').filter(token => token.length > 2);
    const candidateMap = new Map();

    for (const token of tokens) {
      const tokenMatches = index.tokens.get(token) || [];
      for (const candidate of tokenMatches) {
        const count = candidateMap.get(candidate.id) || 0;
        candidateMap.set(candidate.id, count + 1);
      }
    }

    // Ordenar candidatos por número de tokens compartilhados
    const sortedCandidates = Array.from(candidateMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // Limitar a 20 melhores candidatos
      .map(([id]) => {
        // Encontrar o funcionário pelo ID
        for (const [, employees] of index.exact) {
          const found = employees.find(emp => emp.id === id);
          if (found) return found;
        }
        return null;
      })
      .filter(Boolean);

    return sortedCandidates;
  }

  /**
   * Encontra correspondência similar usando algoritmos de similaridade
   */
  findSimilarMatch(employee, candidates) {
    const candidateNames = candidates.map(c => c.processedName);
    const bestMatch = findBestMatch(
      employee.processedName, 
      candidateNames, 
      this.options.similarMatchThreshold
    );

    if (bestMatch) {
      const matchedEmployee = candidates.find(c => c.processedName === bestMatch.match);
      return {
        employee: matchedEmployee,
        score: bestMatch.score,
        type: bestMatch.type
      };
    }

    return null;
  }

  /**
   * Calcula estatísticas da conciliação
   */
  calculateStatistics(results, list1Count, list2Count) {
    const totalMatches = results.exactMatches.length + results.similarMatches.length;
    const matchRate = list1Count > 0 ? ((totalMatches / list1Count) * 100).toFixed(1) : 0;

    return {
      list1Count,
      list2Count,
      exactMatches: results.exactMatches.length,
      similarMatches: results.similarMatches.length,
      totalMatches,
      notFoundList1: results.notFoundList1.length,
      notFoundList2: results.notFoundList2.length,
      matchRate: parseFloat(matchRate),
      coverage: {
        list1: list1Count > 0 ? ((totalMatches / list1Count) * 100).toFixed(1) : 0,
        list2: list2Count > 0 ? ((totalMatches / list2Count) * 100).toFixed(1) : 0
      }
    };
  }

  /**
   * Gera relatório detalhado da conciliação
   */
  generateReport(results) {
    const report = {
      summary: results.statistics,
      exactMatchesData: results.exactMatches.map(match => ({
        'Nome Lista 1': match.list1.originalName,
        'Nome Lista 2': match.list2.originalName,
        'Alocação Lista 1': match.list1.allocation || 'N/A',
        'Alocação Lista 2': match.list2.allocation || 'N/A',
        'Score': match.score.toFixed(3),
        'Tipo': 'Exata'
      })),
      similarMatchesData: results.similarMatches.map(match => ({
        'Nome Lista 1': match.list1.originalName,
        'Nome Lista 2': match.list2.originalName,
        'Alocação Lista 1': match.list1.allocation || 'N/A',
        'Alocação Lista 2': match.list2.allocation || 'N/A',
        'Score': match.score.toFixed(3),
        'Tipo': 'Similar'
      })),
      notFoundData: [
        ...results.notFoundList1.map(emp => ({
          'Nome': emp.originalName,
          'Alocação': emp.allocation || 'N/A',
          'Lista': 'Lista 1',
          'Status': 'Não encontrado na Lista 2'
        })),
        ...results.notFoundList2.map(emp => ({
          'Nome': emp.originalName,
          'Alocação': emp.allocation || 'N/A',
          'Lista': 'Lista 2',
          'Status': 'Não encontrado na Lista 1'
        }))
      ]
    };

    return report;
  }
}

