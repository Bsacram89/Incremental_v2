import React, { useState, useCallback } from 'react';
import { Search, Users, FileText, AlertTriangle, CheckCircle, TrendingUp, Download, Upload } from 'lucide-react';

const SistemaConciliacaoFuncionarios = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [arquivoAtual, setArquivoAtual] = useState(null);
  const [arquivoAnterior, setArquivoAnterior] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  
  // Estados para dados processados
  const [dadosProcessados, setDadosProcessados] = useState(null);
  const [listaAtual, setListaAtual] = useState([]);
  const [listaAnterior, setListaAnterior] = useState([]);

  // Função para calcular similaridade entre strings
  const calcularSimilaridade = (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 100;
    
    // Se uma string contém a outra
    if (s1.includes(s2) || s2.includes(s1)) {
      return 85;
    }
    
    // Calcular similaridade baseada em tokens
    const tokens1 = s1.split(/\s+/);
    const tokens2 = s2.split(/\s+/);
    
    const tokensComuns = tokens1.filter(token => 
      tokens2.some(t => t.includes(token) || token.includes(t))
    );
    
    const similaridade = (tokensComuns.length / Math.max(tokens1.length, tokens2.length)) * 100;
    return Math.round(similaridade);
  };

  // Função para normalizar nome
  const normalizarNome = (nome) => {
    if (!nome) return '';
    return nome.toUpperCase()
      .replace(/\s+/g, ' ')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Função para processar arquivo Excel/CSV
  const processarArquivo = async (arquivo) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          let dados = [];
          let cabecalhos = [];

          if (arquivo.name.toLowerCase().includes('.xlsx') || arquivo.name.toLowerCase().includes('.xls')) {
            // Processar arquivo Excel usando SheetJS (simulado)
            // Em uma implementação real, você usaria a biblioteca XLSX
            alert('Para processar arquivos Excel, é necessário converter para CSV primeiro.\n\nPor favor, exporte seu arquivo Excel como CSV e tente novamente.');
            reject(new Error('Formato Excel não suportado diretamente'));
            return;
          } else {
            // Processar arquivo CSV
            const text = new TextDecoder('utf-8').decode(data);
            const linhas = text.split('\n').filter(linha => linha.trim());
            
            if (linhas.length === 0) {
              reject(new Error('Arquivo vazio'));
              return;
            }
            
            // Detectar separador
            const primeiraLinha = linhas[0];
            let separador = ',';
            if (primeiraLinha.includes(';')) separador = ';';
            else if (primeiraLinha.includes('\t')) separador = '\t';
            
            // Processar cabeçalhos
            cabecalhos = primeiraLinha.split(separador).map(h => h.trim().replace(/"/g, ''));
            
            // Processar dados
            dados = linhas.slice(1).map((linha, index) => {
              const valores = linha.split(separador).map(v => v.trim().replace(/"/g, ''));
              const objeto = {};
              
              cabecalhos.forEach((cabecalho, i) => {
                objeto[cabecalho] = valores[i] || '';
              });
              
              objeto._id = index;
              return objeto;
            });
          }
          
          resolve({ cabecalhos, dados });
        } catch (error) {
          reject(new Error(`Erro ao processar arquivo: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      
      // Ler como ArrayBuffer para melhor compatibilidade
      reader.readAsArrayBuffer(arquivo);
    });
  };

  // Função para processar conciliação
  const processarConciliacao = async () => {
    if (!arquivoAtual || !arquivoAnterior) {
      alert('Por favor, selecione ambos os arquivos antes de processar.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Processar ambos os arquivos
      const [dadosAtual, dadosAnterior] = await Promise.all([
        processarArquivo(arquivoAtual),
        processarArquivo(arquivoAnterior)
      ]);

      setListaAtual(dadosAtual.dados);
      setListaAnterior(dadosAnterior.dados);

      // Detectar campos de nome automaticamente
      const camposNomeAtual = dadosAtual.cabecalhos.find(c => 
        c.toLowerCase().includes('nome') || c.toLowerCase().includes('name')
      ) || dadosAtual.cabecalhos[0];
      
      const camposNomeAnterior = dadosAnterior.cabecalhos.find(c => 
        c.toLowerCase().includes('nome') || c.toLowerCase().includes('name')
      ) || dadosAnterior.cabecalhos[0];

      // Processar análise de conciliação
      const correspondenciasExatas = [];
      const nomesSimilares = [];
      const mudancasAlocacao = [];
      const mudancasEmpresa = [];
      const apenasAtual = [];
      const apenasAnterior = [...dadosAnterior.dados];

      // Detectar campos de empresa e alocação
      const campoEmpresaAtual = dadosAtual.cabecalhos.find(c => 
        c.toLowerCase().includes('empresa') || c.toLowerCase().includes('company')
      );
      const campoAlocacaoAtual = dadosAtual.cabecalhos.find(c => 
        c.toLowerCase().includes('aloca') || c.toLowerCase().includes('location')
      );
      const campoEmpresaAnterior = dadosAnterior.cabecalhos.find(c => 
        c.toLowerCase().includes('empresa') || c.toLowerCase().includes('company')
      );
      const campoAlocacaoAnterior = dadosAnterior.cabecalhos.find(c => 
        c.toLowerCase().includes('aloca') || c.toLowerCase().includes('location')
      );

      // Analisar cada registro da lista atual
      dadosAtual.dados.forEach(regAtual => {
        const nomeAtual = regAtual[camposNomeAtual];
        let melhorCorrespondencia = null;
        let melhorSimilaridade = 0;
        let correspondenciaExata = false;

        dadosAnterior.dados.forEach((regAnterior, index) => {
          const nomeAnterior = regAnterior[camposNomeAnterior];
          const similaridade = calcularSimilaridade(nomeAtual, nomeAnterior);

          if (similaridade === 100) {
            correspondenciaExata = true;
            melhorCorrespondencia = { registro: regAnterior, index, similaridade };
            
            // Verificar mudanças
            if (campoEmpresaAtual && campoEmpresaAnterior) {
              const empresaAtual = regAtual[campoEmpresaAtual];
              const empresaAnterior = regAnterior[campoEmpresaAnterior];
              if (empresaAtual !== empresaAnterior) {
                mudancasEmpresa.push({
                  nome: nomeAtual,
                  empresaAnterior,
                  empresaNova: empresaAtual
                });
              }
            }

            if (campoAlocacaoAtual && campoAlocacaoAnterior) {
              const alocacaoAtual = regAtual[campoAlocacaoAtual];
              const alocacaoAnterior = regAnterior[campoAlocacaoAnterior];
              if (alocacaoAtual !== alocacaoAnterior) {
                mudancasAlocacao.push({
                  nome: nomeAtual,
                  empresa: regAtual[campoEmpresaAtual] || '',
                  anterior: alocacaoAnterior,
                  nova: alocacaoAtual,
                  tipo: alocacaoAtual && alocacaoAnterior && 
                        (alocacaoAtual.replace(/[áéíóú]/gi, 'aeiou') === alocacaoAnterior.replace(/[áéíóú]/gi, 'aeiou'))
                        ? 'Padronização' : 'Mudança Real'
                });
              }
            }
          } else if (similaridade > melhorSimilaridade && similaridade >= 60) {
            melhorSimilaridade = similaridade;
            melhorCorrespondencia = { registro: regAnterior, index, similaridade };
          }
        });

        if (correspondenciaExata) {
          correspondenciasExatas.push({
            atual: regAtual,
            anterior: melhorCorrespondencia.registro
          });
          // Remover da lista de "apenas anterior"
          apenasAnterior.splice(melhorCorrespondencia.index, 1);
        } else if (melhorCorrespondencia && melhorSimilaridade >= 60) {
          nomesSimilares.push({
            nome1: nomeAtual,
            nome2: melhorCorrespondencia.registro[camposNomeAnterior],
            similaridade: melhorSimilaridade,
            empresa: regAtual[campoEmpresaAtual] || '',
            status: melhorSimilaridade >= 80 ? 'Provável mesmo funcionário' : 'Verificar manualmente'
          });
          // Remover da lista de "apenas anterior"
          apenasAnterior.splice(melhorCorrespondencia.index, 1);
        } else {
          apenasAtual.push(regAtual);
        }
      });

      // Preparar dados processados
      const novosDadosProcessados = {
        resumo: {
          totalAtual: dadosAtual.dados.length,
          totalAnterior: dadosAnterior.dados.length,
          correspondenciasExatas: correspondenciasExatas.length,
          nomeSimilares: nomesSimilares.length,
          apenasAtual: apenasAtual.length,
          apenasAnterior: apenasAnterior.length,
          mudancasEmpresa: mudancasEmpresa.length,
          mudancasAlocacao: mudancasAlocacao.length
        },
        correspondenciasExatas,
        nomesSimilares,
        mudancasAlocacao,
        mudancasEmpresa,
        apenasAtual,
        apenasAnterior,
        campos: {
          nomeAtual: camposNomeAtual,
          nomeAnterior: camposNomeAnterior,
          empresaAtual: campoEmpresaAtual,
          empresaAnterior: campoEmpresaAnterior,
          alocacaoAtual: campoAlocacaoAtual,
          alocacaoAnterior: campoAlocacaoAnterior
        }
      };

      setDadosProcessados(novosDadosProcessados);
      setUltimaAtualizacao(new Date().toLocaleString());
      
      alert(`Conciliação processada com sucesso!\n\n` +
            `Arquivo Atual: ${arquivoAtual.name} (${dadosAtual.dados.length} registros)\n` +
            `Arquivo Anterior: ${arquivoAnterior.name} (${dadosAnterior.dados.length} registros)\n\n` +
            `Correspondências exatas: ${correspondenciasExatas.length}\n` +
            `Nomes similares: ${nomesSimilares.length}\n` +
            `Mudanças de alocação: ${mudancasAlocacao.length}`);
      
      setShowUploadModal(false);
      
    } catch (error) {
      alert(`Erro ao processar arquivos: ${error.message}`);
    }
    
    setIsProcessing(false);
  };

  // Função para simular atualização dos dados
  const atualizarDados = async () => {
    if (!dadosProcessados) {
      alert('Nenhum dado foi processado ainda. Por favor, importe os arquivos primeiro.');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUltimaAtualizacao(new Date().toLocaleString());
    setIsProcessing(false);
    alert('Dados atualizados com sucesso!');
  };

  // Função para exportar dados
  const handleExport = (format) => {
    if (!dadosProcessados) {
      alert('Nenhum dado para exportar. Processe os arquivos primeiro.');
      return;
    }

    try {
      if (format === 'json') {
        const data = {
          metadados: {
            dataProcessamento: ultimaAtualizacao,
            totalRegistrosAtual: dadosProcessados.resumo.totalAtual,
            totalRegistrosAnterior: dadosProcessados.resumo.totalAnterior
          },
          resumo: dadosProcessados.resumo,
          mudancasAlocacao: dadosProcessados.mudancasAlocacao,
          nomesSimilares: dadosProcessados.nomesSimilares,
          funcionariosNovos: dadosProcessados.apenasAtual.map(item => ({
            nome: item[dadosProcessados.campos.nomeAtual] || 'N/A',
            empresa: item[dadosProcessados.campos.empresaAtual] || 'N/A',
            alocacao: item[dadosProcessados.campos.alocacaoAtual] || 'N/A'
          })),
          funcionariosRemovidos: dadosProcessados.apenasAnterior.map(item => ({
            nome: item[dadosProcessados.campos.nomeAnterior] || 'N/A',
            empresa: item[dadosProcessados.campos.empresaAnterior] || 'N/A',
            alocacao: item[dadosProcessados.campos.alocacaoAnterior] || 'N/A'
          }))
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const exportFileDefaultName = `relatorio-conciliacao-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', url);
        linkElement.setAttribute('download', exportFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        URL.revokeObjectURL(url);
        
      } else if (format === 'csv') {
        if (dadosProcessados.mudancasAlocacao.length === 0) {
          alert('Nenhuma mudança de alocação para exportar.');
          return;
        }
        
        const csvHeader = 'Nome,Empresa,Alocacao_Anterior,Nova_Alocacao,Tipo\n';
        const csvData = dadosProcessados.mudancasAlocacao.map(item => 
          `"${item.nome || ''}","${item.empresa || ''}","${item.anterior || ''}","${item.nova || ''}","${item.tipo || ''}"`
        ).join('\n');
        
        const csvContent = csvHeader + csvData;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const exportFileDefaultName = `mudancas-alocacao-${new Date().toISOString().split('T')[0]}.csv`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', url);
        linkElement.setAttribute('download', exportFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        URL.revokeObjectURL(url);
      }
      
      alert(`Arquivo ${format.toUpperCase()} exportado com sucesso!`);
      setShowExportModal(false);
      
    } catch (error) {
      alert(`Erro ao exportar: ${error.message}`);
    }
  };

  // Função para filtrar dados
  const filtrarDados = useCallback((dados, termo) => {
    if (!termo || !dados) return dados;
    return dados.filter(item => 
      Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(termo.toLowerCase())
      )
    );
  }, []);

  // Função para limpar arquivos
  const limparArquivos = () => {
    setArquivoAtual(null);
    setArquivoAnterior(null);
  };

  // Componente Modal de Upload
  const UploadModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Importar Listas para Conciliação</h3>
          
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Lista Atual (Nova)</h4>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => setArquivoAtual(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {arquivoAtual && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  ✓ {arquivoAtual.name} selecionado
                </div>
              )}
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Lista Anterior (Referência)</h4>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => setArquivoAnterior(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {arquivoAnterior && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  ✓ {arquivoAnterior.name} selecionado
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Recomendação:</strong> Para arquivos Excel (.xlsx/.xls), exporte-os como CSV primeiro.
                <br />
                <strong>Formatos aceitos:</strong> CSV com separadores vírgula, ponto-e-vírgula ou tab.
                <br />
                <strong>Codificação:</strong> UTF-8 para melhor compatibilidade com acentos.
              </p>
            </div>
          </div>

          <div className="flex justify-between space-x-4 mt-6">
            <button
              onClick={limparArquivos}
              className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 transition-colors"
            >
              Limpar
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={processarConciliacao}
                disabled={!arquivoAtual || !arquivoAnterior || isProcessing}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  (!arquivoAtual || !arquivoAnterior || isProcessing)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isProcessing ? 'Processando...' : 'Processar Conciliação'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente Modal de Export
  const ExportModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Exportar Relatório</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 mb-4">
              Escolha o formato para exportar os dados da análise:
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('json')}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Exportar como JSON (Dados Completos)
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                Exportar como CSV (Mudanças de Alocação)
              </button>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowExportModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Card de Estatística
  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className={`bg-white rounded-lg border-l-4 ${color} p-6 shadow-sm`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value || 0}</dd>
            {description && <dd className="text-xs text-gray-400 mt-1">{description}</dd>}
          </dl>
        </div>
      </div>
    </div>
  );

  // Componente de Tabela
  const DataTable = ({ data, columns, emptyMessage = "Nenhum dado encontrado" }) => {
    const dadosFiltrados = filtrarDados(data, searchTerm);
    
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Resultados ({dadosFiltrados?.length || 0})
            </h3>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <div className="flex rounded-md shadow-sm">
                <div className="relative flex-grow focus-within:z-10">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {!dadosFiltrados || dadosFiltrados.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">{emptyMessage}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dadosFiltrados.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {columns.map((column, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm">
                          {column.render ? column.render(item) : item[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                Sistema de Conciliação de Funcionários
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Listas
              </button>
              <button 
                onClick={atualizarDados}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
                  isProcessing 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {isProcessing ? 'Atualizando...' : 'Atualizar Dados'}
              </button>
              <button 
                onClick={() => setShowExportModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
              { id: 'alocacoes', name: 'Mudanças de Alocação', icon: AlertTriangle },
              { id: 'similares', name: 'Nomes Similares', icon: Search },
              { id: 'novos', name: 'Funcionários Novos', icon: Users },
              { id: 'relatorio', name: 'Relatório Completo', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!dadosProcessados ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum dado processado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Importe os arquivos de funcionários para começar a análise de conciliação.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="-ml-1 mr-2 h-5 w-5" />
                Importar Arquivos
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard de Conciliação</h2>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Análise comparativa dos arquivos importados
                    </p>
                    {ultimaAtualizacao && (
                      <div className="text-xs text-gray-400">
                        Última atualização: {ultimaAtualizacao}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status da Conciliação */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Status da Conciliação
                        </h3>
                        <p className="text-sm text-gray-500">
                          Processamento concluído em {ultimaAtualizacao}
                        </p>
                      </div>
                      <div className="flex space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round((dadosProcessados.resumo.correspondenciasExatas / dadosProcessados.resumo.totalAtual) * 100)}%
                          </div>
                          <div className="text-xs text-gray-500">Taxa de Correspondência</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {dadosProcessados.resumo.nomeSimilares}
                          </div>
                          <div className="text-xs text-gray-500">Similares para Revisão</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {dadosProcessados.resumo.mudancasAlocacao}
                          </div>
                          <div className="text-xs text-gray-500">Mudanças Detectadas</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Atual"
                    value={dadosProcessados.resumo.totalAtual}
                    icon={Users}
                    color="border-blue-500"
                    description="Registros na lista atual"
                  />
                  <StatCard
                    title="Total Anterior"
                    value={dadosProcessados.resumo.totalAnterior}
                    icon={Users}
                    color="border-green-500"
                    description="Registros na lista anterior"
                  />
                  <StatCard
                    title="Correspondências Exatas"
                    value={dadosProcessados.resumo.correspondenciasExatas}
                    icon={CheckCircle}
                    color="border-green-500"
                    description="Nomes idênticos encontrados"
                  />
                  <StatCard
                    title="Nomes Similares"
                    value={dadosProcessados.resumo.nomeSimilares}
                    icon={Search}
                    color="border-yellow-500"
                    description="Possíveis duplicatas"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Apenas na Atual"
                    value={dadosProcessados.resumo.apenasAtual}
                    icon={AlertTriangle}
                    color="border-red-500"
                    description="Funcionários novos"
                  />
                  <StatCard
                    title="Apenas na Anterior"
                    value={dadosProcessados.resumo.apenasAnterior}
                    icon={AlertTriangle}
                    color="border-orange-500"
                    description="Funcionários removidos"
                  />
                  <StatCard
                    title="Mudanças de Empresa"
                    value={dadosProcessados.resumo.mudancasEmpresa}
                    icon={TrendingUp}
                    color="border-purple-500"
                    description="Transferências identificadas"
                  />
                  <StatCard
                    title="Mudanças de Alocação"
                    value={dadosProcessados.resumo.mudancasAlocacao}
                    icon={TrendingUp}
                    color="border-indigo-500"
                    description="Realocações identificadas"
                  />
                </div>

                {/* Ações Recomendadas */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Ações Recomendadas
                    </h3>
                    <div className="space-y-3">
                      {dadosProcessados.resumo.nomeSimilares > 0 && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-700">
                              <strong>Verificar nomes similares:</strong> {dadosProcessados.resumo.nomeSimilares} possíveis duplicatas encontradas que precisam de revisão manual.
                            </p>
                          </div>
                        </div>
                      )}
                      {dadosProcessados.resumo.mudancasAlocacao > 0 && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <TrendingUp className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-700">
                              <strong>Revisar mudanças de alocação:</strong> {dadosProcessados.resumo.mudancasAlocacao} funcionários com mudanças de alocação identificadas.
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Users className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-700">
                            <strong>Atualizar registros:</strong> {dadosProcessados.resumo.apenasAtual + dadosProcessados.resumo.apenasAnterior} funcionários encontrados apenas em uma das listas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'alocacoes' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Mudanças de Alocação</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Funcionários que mudaram de alocação entre as listas
                  </p>
                </div>
                
                <DataTable
                  data={dadosProcessados.mudancasAlocacao}
                  columns={[
                    { header: 'Nome', key: 'nome' },
                    { header: 'Empresa', key: 'empresa' },
                    { 
                      header: 'Alocação Anterior', 
                      key: 'anterior',
                      render: (item) => (
                        <span className="text-red-600 font-medium">{item.anterior}</span>
                      )
                    },
                    { 
                      header: 'Nova Alocação', 
                      key: 'nova',
                      render: (item) => (
                        <span className="text-green-600 font-medium">{item.nova}</span>
                      )
                    },
                    { 
                      header: 'Tipo', 
                      key: 'tipo',
                      render: (item) => (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.tipo === 'Padronização' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.tipo}
                        </span>
                      )
                    }
                  ]}
                  emptyMessage="Nenhuma mudança de alocação encontrada"
                />
              </div>
            )}

            {activeTab === 'similares' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Nomes Similares</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Possíveis duplicatas que precisam de verificação manual
                  </p>
                </div>
                
                <DataTable
                  data={dadosProcessados.nomesSimilares}
                  columns={[
                    { header: 'Nome Lista Atual', key: 'nome1' },
                    { header: 'Nome Lista Anterior', key: 'nome2' },
                    { 
                      header: 'Similaridade', 
                      key: 'similaridade',
                      render: (item) => (
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${item.similaridade}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.similaridade}%</span>
                        </div>
                      )
                    },
                    { header: 'Empresa', key: 'empresa' },
                    { 
                      header: 'Status', 
                      key: 'status',
                      render: (item) => (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Provável mesmo funcionário' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      )
                    }
                  ]}
                  emptyMessage="Nenhum nome similar encontrado"
                />
              </div>
            )}

            {activeTab === 'novos' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Funcionários Novos/Removidos</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Funcionários que aparecem em apenas uma das listas
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Apenas na Lista Atual (Novos)</h3>
                    <DataTable
                      data={dadosProcessados.apenasAtual.map(item => ({
                        nome: item[dadosProcessados.campos.nomeAtual] || 'N/A',
                        empresa: item[dadosProcessados.campos.empresaAtual] || 'N/A',
                        alocacao: item[dadosProcessados.campos.alocacaoAtual] || 'N/A'
                      }))}
                      columns={[
                        { header: 'Nome', key: 'nome' },
                        { header: 'Empresa', key: 'empresa' },
                        { header: 'Alocação', key: 'alocacao' }
                      ]}
                      emptyMessage="Nenhum funcionário novo encontrado"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Apenas na Lista Anterior (Removidos)</h3>
                    <DataTable
                      data={dadosProcessados.apenasAnterior.map(item => ({
                        nome: item[dadosProcessados.campos.nomeAnterior] || 'N/A',
                        empresa: item[dadosProcessados.campos.empresaAnterior] || 'N/A',
                        alocacao: item[dadosProcessados.campos.alocacaoAnterior] || 'N/A'
                      }))}
                      columns={[
                        { header: 'Nome', key: 'nome' },
                        { header: 'Empresa', key: 'empresa' },
                        { header: 'Alocação', key: 'alocacao' }
                      ]}
                      emptyMessage="Nenhum funcionário removido encontrado"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'relatorio' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Relatório Completo</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Resumo executivo da análise de conciliação
                  </p>
                </div>
                
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="prose max-w-none">
                      <h3>Análise de Conciliação de Funcionários</h3>
                      
                      <h4>Resumo Executivo</h4>
                      <p>
                        A análise comparou duas listas de funcionários, identificando {dadosProcessados.resumo.correspondenciasExatas} correspondências exatas 
                        entre {dadosProcessados.resumo.totalAtual} funcionários na lista atual e {dadosProcessados.resumo.totalAnterior} na lista anterior.
                      </p>
                      
                      <h4>Principais Descobertas</h4>
                      <ul>
                        <li><strong>Correspondências Exatas:</strong> {dadosProcessados.resumo.correspondenciasExatas} funcionários encontrados em ambas as listas com nomes idênticos.</li>
                        <li><strong>Nomes Similares:</strong> {dadosProcessados.resumo.nomeSimilares} pares de nomes similares que podem representar o mesmo funcionário.</li>
                        <li><strong>Funcionários Novos:</strong> {dadosProcessados.resumo.apenasAtual} funcionários apenas na lista atual.</li>
                        <li><strong>Funcionários Removidos:</strong> {dadosProcessados.resumo.apenasAnterior} funcionários apenas na lista anterior.</li>
                        <li><strong>Mudanças Identificadas:</strong> {dadosProcessados.resumo.mudancasEmpresa} mudanças de empresa e {dadosProcessados.resumo.mudancasAlocacao} mudanças de alocação.</li>
                      </ul>
                      
                      <h4>Metodologia</h4>
                      <p>
                        O sistema utiliza algoritmos de similaridade de strings para identificar correspondências entre nomes, 
                        considerando variações de grafia, acentuação e ordem dos nomes. A similaridade é calculada com base na 
                        sobreposição de tokens e subsequências comuns.
                      </p>
                      
                      <h4>Recomendações</h4>
                      <ol>
                        <li><strong>Verificação Manual:</strong> Revisar os {dadosProcessados.resumo.nomeSimilares} casos de nomes similares para confirmar se são o mesmo funcionário.</li>
                        <li><strong>Atualização de Registros:</strong> Padronizar a grafia dos nomes e códigos de unidades.</li>
                        <li><strong>Validação de Mudanças:</strong> Confirmar as {dadosProcessados.resumo.mudancasAlocacao} mudanças de alocação identificadas.</li>
                        <li><strong>Processo de Conciliação:</strong> Implementar processo regular de conciliação entre sistemas.</li>
                      </ol>
                      
                      <h4>Próximos Passos</h4>
                      <p>
                        Recomenda-se a criação de um processo automatizado de conciliação e a definição de padrões 
                        para nomenclatura de funcionários e códigos de unidades organizacionais.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showUploadModal && <UploadModal />}
      {showExportModal && <ExportModal />}
    </div>
  );
};

export default SistemaConciliacaoFuncionarios;