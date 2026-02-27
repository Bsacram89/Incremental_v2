// Utilitários para comparação e normalização de strings

/**
 * Normaliza uma string removendo acentos, convertendo para maiúsculas e removendo espaços extras
 */
export function normalizeString(str) {
  if (!str) return '';
  
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' '); // Remove espaços extras
}

/**
 * Calcula a distância de Levenshtein entre duas strings
 */
export function levenshteinDistance(str1, str2) {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  // Inicializar matriz
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Preencher matriz
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1      // deleção
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calcula a similaridade de Jaro-Winkler entre duas strings
 */
export function jaroWinklerSimilarity(str1, str2) {
  if (str1 === str2) return 1.0;
  
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0 || len2 === 0) return 0.0;
  
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  if (matchWindow < 0) return 0.0;
  
  const str1Matches = new Array(len1).fill(false);
  const str2Matches = new Array(len2).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Identificar matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    
    for (let j = start; j < end; j++) {
      if (str2Matches[j] || str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0.0;
  
  // Contar transposições
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }
  
  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0;
  
  // Calcular prefixo comum (até 4 caracteres)
  let prefix = 0;
  for (let i = 0; i < Math.min(len1, len2, 4); i++) {
    if (str1[i] === str2[i]) prefix++;
    else break;
  }
  
  return jaro + (0.1 * prefix * (1.0 - jaro));
}

/**
 * Calcula a similaridade baseada na distância de Levenshtein (0-1)
 */
export function levenshteinSimilarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  return 1.0 - (distance / maxLen);
}

/**
 * Encontra a melhor correspondência para uma string em uma lista
 */
export function findBestMatch(target, candidates, threshold = 0.8) {
  const normalizedTarget = normalizeString(target);
  let bestMatch = null;
  let bestScore = 0;
  
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeString(candidate);
    
    // Correspondência exata tem prioridade
    if (normalizedTarget === normalizedCandidate) {
      return {
        match: candidate,
        score: 1.0,
        type: 'exact'
      };
    }
    
    // Calcular similaridade usando Jaro-Winkler
    const jaroScore = jaroWinklerSimilarity(normalizedTarget, normalizedCandidate);
    const levenScore = levenshteinSimilarity(normalizedTarget, normalizedCandidate);
    
    // Usar a maior das duas pontuações
    const score = Math.max(jaroScore, levenScore);
    
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = candidate;
    }
  }
  
  if (bestMatch) {
    return {
      match: bestMatch,
      score: bestScore,
      type: bestScore >= 0.95 ? 'high' : bestScore >= 0.85 ? 'medium' : 'low'
    };
  }
  
  return null;
}

/**
 * Verifica se duas strings são similares o suficiente
 */
export function areSimilar(str1, str2, threshold = 0.8) {
  const normalized1 = normalizeString(str1);
  const normalized2 = normalizeString(str2);
  
  if (normalized1 === normalized2) return true;
  
  const jaroScore = jaroWinklerSimilarity(normalized1, normalized2);
  const levenScore = levenshteinSimilarity(normalized1, normalized2);
  
  return Math.max(jaroScore, levenScore) >= threshold;
}

/**
 * Remove variações comuns em nomes (sufixos de data, etc.)
 */
export function cleanName(name) {
  if (!name) return '';
  
  return name
    .toString()
    .trim()
    // Remove sufixos de data como " - 26/09"
    .replace(/\s*-\s*\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\s*$/g, '')
    // Remove espaços extras
    .replace(/\s+/g, ' ')
    .trim();
}

