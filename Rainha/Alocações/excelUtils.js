import * as XLSX from 'xlsx';

/**
 * Lê um arquivo Excel e retorna os dados como array de objetos
 */
export function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Pegar a primeira planilha
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        resolve({
          sheetName: firstSheetName,
          data: jsonData,
          workbook: workbook
        });
      } catch (error) {
        reject(new Error('Erro ao processar arquivo Excel: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Detecta automaticamente a coluna que contém os nomes
 */
export function detectNameColumn(data) {
  if (!data || data.length < 2) return null;
  
  const headers = data[0];
  
  // Palavras-chave que indicam coluna de nomes
  const nameKeywords = [
    'nome', 'name', 'funcionario', 'funcionário', 'employee',
    'pessoa', 'colaborador', 'trabalhador'
  ];
  
  // Procurar por header que contenha palavras-chave
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]?.toString().toLowerCase() || '';
    
    for (const keyword of nameKeywords) {
      if (header.includes(keyword)) {
        return {
          index: i,
          name: headers[i],
          confidence: 'high'
        };
      }
    }
  }
  
  // Se não encontrou por palavra-chave, procurar pela coluna com mais texto
  let bestColumn = null;
  let maxTextLength = 0;
  
  for (let col = 0; col < headers.length; col++) {
    let totalTextLength = 0;
    let textCount = 0;
    
    // Analisar algumas linhas para determinar qual coluna tem mais texto
    for (let row = 1; row < Math.min(data.length, 10); row++) {
      const cell = data[row][col];
      if (cell && typeof cell === 'string' && cell.trim().length > 5) {
        totalTextLength += cell.length;
        textCount++;
      }
    }
    
    const avgLength = textCount > 0 ? totalTextLength / textCount : 0;
    
    if (avgLength > maxTextLength && avgLength > 10) {
      maxTextLength = avgLength;
      bestColumn = {
        index: col,
        name: headers[col] || `Coluna ${col + 1}`,
        confidence: 'medium'
      };
    }
  }
  
  return bestColumn;
}

/**
 * Detecta automaticamente a coluna que contém as alocações/departamentos
 */
export function detectAllocationColumn(data) {
  if (!data || data.length < 2) return null;
  
  const headers = data[0];
  
  // Palavras-chave que indicam coluna de alocação
  const allocationKeywords = [
    'alocacao', 'alocação', 'allocation', 'departamento', 'department',
    'setor', 'sector', 'unidade', 'unit', 'local', 'location',
    'area', 'divisao', 'divisão'
  ];
  
  // Procurar por header que contenha palavras-chave
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]?.toString().toLowerCase() || '';
    
    for (const keyword of allocationKeywords) {
      if (header.includes(keyword)) {
        return {
          index: i,
          name: headers[i],
          confidence: 'high'
        };
      }
    }
  }
  
  // Se não encontrou, tentar detectar pela segunda coluna mais comum após nomes
  return null;
}

/**
 * Extrai lista de funcionários de dados Excel
 */
export function extractEmployeeList(data, nameColumnIndex, allocationColumnIndex = null) {
  if (!data || data.length < 2) return [];
  
  const employees = [];
  
  // Começar da linha 1 (pular header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    if (!row || !row[nameColumnIndex]) continue;
    
    const name = row[nameColumnIndex]?.toString().trim();
    if (!name) continue;
    
    const employee = {
      name: name,
      originalName: name,
      row: i,
      allocation: allocationColumnIndex !== null ? row[allocationColumnIndex]?.toString().trim() : null
    };
    
    employees.push(employee);
  }
  
  return employees;
}

/**
 * Exporta dados para Excel
 */
export function exportToExcel(data, filename = 'conciliacao_resultado.xlsx') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Resultado');
  
  // Baixar arquivo
  XLSX.writeFile(wb, filename);
}

/**
 * Cria relatório de conciliação em formato Excel
 */
export function createReconciliationReport(results) {
  const wb = XLSX.utils.book_new();
  
  // Aba de resumo
  const summary = [
    ['Métrica', 'Valor'],
    ['Total de funcionários - Lista 1', results.list1Count],
    ['Total de funcionários - Lista 2', results.list2Count],
    ['Correspondências exatas', results.exactMatches],
    ['Correspondências similares', results.similarMatches],
    ['Não encontrados - Lista 1', results.notFoundList1],
    ['Não encontrados - Lista 2', results.notFoundList2],
    ['Taxa de correspondência', `${results.matchRate}%`]
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo');
  
  // Aba de correspondências exatas
  if (results.exactMatchesData && results.exactMatchesData.length > 0) {
    const exactWs = XLSX.utils.json_to_sheet(results.exactMatchesData);
    XLSX.utils.book_append_sheet(wb, exactWs, 'Correspondências Exatas');
  }
  
  // Aba de correspondências similares
  if (results.similarMatchesData && results.similarMatchesData.length > 0) {
    const similarWs = XLSX.utils.json_to_sheet(results.similarMatchesData);
    XLSX.utils.book_append_sheet(wb, similarWs, 'Correspondências Similares');
  }
  
  // Aba de não encontrados
  if (results.notFoundData && results.notFoundData.length > 0) {
    const notFoundWs = XLSX.utils.json_to_sheet(results.notFoundData);
    XLSX.utils.book_append_sheet(wb, notFoundWs, 'Não Encontrados');
  }
  
  return wb;
}

