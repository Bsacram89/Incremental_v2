import React, { useState, useCallback, useEffect } from 'react';
import { Search, Users, FileText, AlertTriangle, CheckCircle, TrendingUp, Download, Upload, RefreshCw, HelpCircle, Settings, X } from 'lucide-react';
import * as XLSX from 'xlsx';

const SistemaConciliacaoFuncionarios = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [arquivoAtual, setArquivoAtual] = useState(null);
  const [arquivoAnterior, setArquivoAnterior] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [processamentoStatus, setProcessamentoStatus] = useState('');
  const [processamentoProgresso, setProcessamentoProgresso] = useState(0);
  const [configSimilaridade, setConfigSimilaridade] = useState(60);
  const [configColunas, setConfigColunas] = useState({
    nomeAtual: '',
    nomeAnterior: '',
    empresaAtual: '',
    empresaAnterior: '',
    alocacaoAtual: '',
    alocacaoAnterior: ''
  });
  
  // Estados para dados processados
  const [dadosProcessados, setDadosProcessados] = useState(null);
  const [listaAtual, setListaAtual] = useState([]);
  const [listaAnterior, setListaAnterior] = useState([]);
  const [errosProcessamento, setErrosProcessamento] = useState([]);

  // Efeito para carregar configurações salvas
  useEffect(() => {
    try {
      const configSalva = localStorage.getItem('configConciliacao');
      if (configSalva) {
        const config = JSON.parse(configSalva);
        if (config.similaridade) setConfigSimilaridade(config.similaridade);
        if (config.colunas) setConfigColunas(config.colunas);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }, []);

  // Função para salvar configurações
  const salvarConfiguracoes = () => {
    try {
      localStorage.setItem('configConciliacao', JSON.stringify({
        similaridade: configSimilaridade,
        colunas: configColunas
      }));
      alert('Configurações salvas com sucesso!');
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Verifique o console para mais detalhes.');
    }
  };

  // Função para calcular similaridade entre strings
  const calcularSimilaridade = (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    const s1 = normalizarNome(str1);
    const s2 = normalizarNome(str2);
    
    if (s1 === s2) return 100;
    
    // Se uma string contém a outra
    if (s1.includes(s2) || s2.includes(s1)) {
      return 85;
    }
    
    // Calcular similaridade baseada em tokens
    const tokens1 = s1.split(/\s+/);
    const tokens2 = s2.split(/\s+/);
    
    // Verificar nomes compostos (primeiro + último nome)
    if (tokens1.length > 1 && tokens2.length > 1) {
      const primeiroUltimo1 = tokens1[0] + ' ' + tokens1[tokens1.length - 1];
      const primeiroUltimo2 = tokens2[0] + ' ' + tokens2[tokens2.length - 1];
      
      if (primeiroUltimo1 === primeiroUltimo2) {
        return 90;
      }
    }
    
    // Verificar iniciais + sobrenome
    if (tokens1.length > 1 && tokens2.length > 1) {
      const iniciais1 = tokens1.map(t => t[0]).join('');
      const iniciais2 = tokens2.map(t => t[0]).join('');
      
      if (iniciais1 === iniciais2) {
        return 75;
      }
    }
    
    // Verificar tokens comuns
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
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9\s]/g, '');
  };

  // Função para detectar cabeçalhos automaticamente
  const detectarCabecalhos = (cabecalhos) => {
    const resultado = {
      nome: '',
      empresa: '',
      alocacao: ''
    };
    
    // Detectar coluna de nome
    const colunasNome = cabecalhos.filter(c => 
      c && typeof c === 'string' && (
        c.toLowerCase().includes('nome') || 
        c.toLowerCase().includes('name') ||
        c.toLowerCase().includes('funcionario') ||
        c.toLowerCase().includes('colaborador')
      )
    );
    
    if (colunasNome.length > 0) {
      resultado.nome = colunasNome[0];
    }
    
    // Detectar coluna de empresa
    const colunasEmpresa = cabecalhos.filter(c => 
      c && typeof c === 'string' && (
        c.toLowerCase().includes('empresa') || 
        c.toLowerCase().includes('company') ||
        c.toLowerCase().includes('companhia')
      )
    );
    
    if (colunasEmpresa.length > 0) {
      resultado.empresa = colunasEmpresa[0];
    }
    
    // Detectar coluna de alocação
    const colunasAlocacao = cabecalhos.filter(c => 
      c && typeof c === 'string' && (
        c.toLowerCase().includes('aloca') || 
        c.toLowerCase().includes('location') ||
        c.toLowerCase().includes('local') ||
        c.toLowerCase().includes('setor')
      )
    );
    
    if (colunasAlocacao.length > 0) {
      resultado.alocacao = colunasAlocacao[0];
    }
    
    return resultado;
  };

  // Função para processar arquivo Excel/CSV
  const processarArquivo = async (arquivo) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            let dados = [];
            let cabecalhos = [];

            if (arquivo.name.toLowerCase().endsWith('.xlsx') || arquivo.name.toLowerCase().endsWith('.xls')) {
              // Processar arquivo Excel usando SheetJS
              const workbook = XLSX.read(data, { type: 'array' });
              const primeiraAba = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[primeiraAba];
              
              // Converter para JSON
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              
              if (jsonData.length === 0) {
                reject(new Error('Arquivo Excel vazio'));
                return;
              }
              
              // Processar cabeçalhos
              cabecalhos = jsonData[0].map(h => h ? h.toString().trim() : '');
              
              // Processar dados
              dados = jsonData.slice(1).map((linha, index) => {
                const objeto = {};
                
                cabecalhos.forEach((cabecalho, i) => {
                  if (cabecalho) {
                    objeto[cabecalho] = linha[i] !== undefined ? linha[i].toString() : '';
                  }
                });
                
                objeto._id = index;
                return objeto;
              });
              
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
            
            // Limpar dados vazios
            dados = dados.filter(obj => Object.values(obj).some(val => val && val !== ''));
            
            // Detectar cabeçalhos automaticamente
            const cabecalhosDetectados = detectarCabecalhos(cabecalhos);
            
            resolve({ 
              cabecalhos, 
              dados,
              cabecalhosDetectados
            });
          } catch (error) {
            reject(new Error(`Erro ao processar arquivo: ${error.message}`));
          }
        };
        
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        
        // Ler como ArrayBuffer para melhor compatibilidade
        reader.readAsArrayBuffer(arquivo);
      } catch (error) {
        reject(new Error(`Erro ao processar arquivo: ${error.message}`));
      }
    });
  };

  // Função para processar conciliação
  const processarConciliacao = async () => {
    if (!arquivoAtual || !arquivoAnterior) {
      alert('Por favor, selecione ambos os arquivos antes de processar.');
      return;
    }

    setIsProcessing(true);
    setProcessamentoStatus('Iniciando processamento...');
    setProcessamentoProgresso(5);
    setErrosProcessamento([]);
    
    try {
      // Processar ambos os arquivos
      setProcessamentoStatus('Processando arquivo atual...');
      setProcessamentoProgresso(10);
      const dadosAtual = await processarArquivo(arquivoAtual);
      
      setProcessamentoStatus('Processando arquivo anterior...');
      setProcessamentoProgresso(30);
      const dadosAnterior = await processarArquivo(arquivoAnterior);

      setListaAtual(dadosAtual.dados);
      setListaAnterior(dadosAnterior.dados);

      // Configurar colunas para comparação
      setProcessamentoStatus('Configurando colunas para comparação...');
      setProcessamentoProgresso(40);
      
      // Usar configurações salvas ou detectar automaticamente
      let camposNomeAtual = configColunas.nomeAtual;
      let camposNomeAnterior = configColunas.nomeAnterior;
      let campoEmpresaAtual = configColunas.empresaAtual;
      let campoEmpresaAnterior = configColunas.empresaAnterior;
      let campoAlocacaoAtual = configColunas.alocacaoAtual;
      let campoAlocacaoAnterior = configColunas.alocacaoAnterior;
      
      // Se não houver configurações salvas, detectar automaticamente
      if (!camposNomeAtual) {
        camposNomeAtual = dadosAtual.cabecalhosDetectados.nome || dadosAtual.cabecalhos[0];
      }
      
      if (!camposNomeAnterior) {
        camposNomeAnterior = dadosAnterior.cabecalhosDetectados.nome || dadosAnterior.cabecalhos[0];
      }
      
      if (!campoEmpresaAtual) {
        campoEmpresaAtual = dadosAtual.cabecalhosDetectados.empresa;
      }
      
      if (!campoEmpresaAnterior) {
        campoEmpresaAnterior = dadosAnterior.cabecalhosDetectados.empresa;
      }
      
      if (!campoAlocacaoAtual) {
        campoAlocacaoAtual = dadosAtual.cabecalhosDetectados.alocacao;
      }
      
      if (!campoAlocacaoAnterior) {
        campoAlocacaoAnterior = dadosAnterior.cabecalhosDetectados.alocacao;
      }

      // Processar análise de conciliação
      setProcessamentoStatus('Analisando correspondências...');
      setProcessamentoProgresso(50);
      
      const correspondenciasExatas = [];
      const nomesSimilares = [];
      const mudancasAlocacao = [];
      const mudancasEmpresa = [];
      const apenasAtual = [];
      const apenasAnterior = [...dadosAnterior.dados];
      const erros = [];

      // Analisar cada registro da lista atual
      setProcessamentoStatus('Processando registros...');
      
      dadosAtual.dados.forEach((regAtual, idx) => {
        // Atualizar progresso
        if (idx % 10 === 0) {
          const progresso = 50 + Math.floor((idx / dadosAtual.dados.length) * 40);
          setProcessamentoProgresso(progresso);
          setProcessamentoStatus(`Processando registro ${idx + 1} de ${dadosAtual.dados.length}...`);
        }
        
        try {
          const nomeAtual = regAtual[camposNomeAtual];
          
          if (!nomeAtual) {
            erros.push(`Registro sem nome na posição ${idx + 1} da lista atual`);
            apenasAtual.push(regAtual);
            return;
          }
          
          let melhorCorrespondencia = null;
          let melhorSimilaridade = 0;
          let correspondenciaExata = false;

          dadosAnterior.dados.forEach((regAnterior, index) => {
            try {
              const nomeAnterior = regAnterior[camposNomeAnterior];
              
              if (!nomeAnterior) {
                return;
              }
              
              const similaridade = calcularSimilaridade(nomeAtual, nomeAnterior);

              if (similaridade === 100) {
                correspondenciaExata = true;
                melhorCorrespondencia = { registro: regAnterior, index, similaridade };
                
                // Verificar mudanças de empresa
                if (campoEmpresaAtual && campoEmpresaAnterior) {
                  const empresaAtual = regAtual[campoEmpresaAtual];
                  const empresaAnterior = regAnterior[campoEmpresaAnterior];
                  
                  if (empresaAtual && empresaAnterior && 
                      normalizarNome(empresaAtual) !== normalizarNome(empresaAnterior)) {
                    mudancasEmpresa.push({
                      nome: nomeAtual,
                      empresaAnterior,
                      empresaNova: empresaAtual
                    });
                  }
                }

                // Verificar mudanças de alocação
                if (campoAlocacaoAtual && campoAlocacaoAnterior) {
                  const alocacaoAtual = regAtual[campoAlocacaoAtual];
                  const alocacaoAnterior = regAnterior[campoAlocacaoAnterior];
                  
                  if (alocacaoAtual && alocacaoAnterior && 
                      normalizarNome(alocacaoAtual) !== normalizarNome(alocacaoAnterior)) {
                    mudancasAlocacao.push({
                      nome: nomeAtual,
                      empresa: regAtual[campoEmpresaAtual] || '',
                      anterior: alocacaoAnterior,
                      nova: alocacaoAtual,
                      tipo: alocacaoAtual && alocacaoAnterior && 
                            (normalizarNome(alocacaoAtual) === normalizarNome(alocacaoAnterior))
                            ? 'Padronização' : 'Mudança Real'
                    });
                  }
                }
              } else if (similaridade > melhorSimilaridade && similaridade >= configSimilaridade) {
                melhorSimilaridade = similaridade;
                melhorCorrespondencia = { registro: regAnterior, index, similaridade };
              }
            } catch (error) {
              erros.push(`Erro ao processar comparação: ${error.message}`);
            }
          });

          if (correspondenciaExata) {
            correspondenciasExatas.push({
              atual: regAtual,
              anterior: melhorCorrespondencia.registro
            });
            // Remover da lista de "apenas anterior"
            apenasAnterior.splice(melhorCorrespondencia.index, 1);
          } else if (melhorCorrespondencia && melhorSimilaridade >= configSimilaridade) {
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
        } catch (error) {
          erros.push(`Erro ao processar registro ${idx + 1}: ${error.message}`);
        }
      });

      // Finalizar processamento
      setProcessamentoStatus('Finalizando processamento...');
      setProcessamentoProgresso(95);

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
          mudancasAlocacao: mudancasAlocacao.length,
          erros: erros.length
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
      setErrosProcessamento(erros);
      
      // Salvar configurações de colunas
      setConfigColunas({
        nomeAtual: camposNomeAtual,
        nomeAnterior: camposNomeAnterior,
        empresaAtual: campoEmpresaAtual,
        empresaAnterior: campoEmpresaAnterior,
        alocacaoAtual: campoAlocacaoAtual,
        alocacaoAnterior: campoAlocacaoAnterior
      });
      
      setProcessamentoProgresso(100);
      setProcessamentoStatus('Concluído!');
      
      alert(`Conciliação processada com sucesso!\n\n` +
            `Arquivo Atual: ${arquivoAtual.name} (${dadosAtual.dados.length} registros)\n` +
            `Arquivo Anterior: ${arquivoAnterior.name} (${dadosAnterior.dados.length} registros)\n\n` +
            `Correspondências exatas: ${correspondenciasExatas.length}\n` +
            `Nomes similares: ${nomesSimilares.length}\n` +
            `Mudanças de alocação: ${mudancasAlocacao.length}` +
            (erros.length > 0 ? `\n\nAtenção: ${erros.length} erros encontrados durante o processamento.` : ''));
      
      setShowUploadModal(false);
      
    } catch (error) {
      setErrosProcessamento([`Erro crítico: ${error.message}`]);
      alert(`Erro ao processar arquivos: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessamentoProgresso(0);
      setProcessamentoStatus('');
    }
  };

  // Função para simular atualização dos dados
  const atualizarDados = async () => {
    if (!dadosProcessados) {
      alert('Nenhum dado foi processado ainda. Por favor, importe os arquivos primeiro.');
      return;
    }

    setIsProcessing(true);
    setProcessamentoStatus('Atualizando dados...');
    setProcessamentoProgresso(50);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setUltimaAtualizacao(new Date().toLocaleString());
    setIsProcessing(false);
    setProcessamentoProgresso(0);
    setProcessamentoStatus('');
    
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
      } else if (format === 'excel') {
        // Criar workbook
        const wb = XLSX.utils.book_new();
        
        // Adicionar aba de resumo
        const resumoData = [
          ['Relatório de Conciliação de Funcionários'],
          ['Data de processamento', ultimaAtualizacao || new Date().toLocaleString()],
          [''],
          ['Resumo'],
          ['Total de registros na lista atual', dadosProcessados.resumo.totalAtual],
          ['Total de registros na lista anterior', dadosProcessados.resumo.totalAnterior],
          ['Correspondências exatas', dadosProcessados.resumo.correspondenciasExatas],
          ['Nomes similares', dadosProcessados.resumo.nomeSimilares],
          ['Apenas na lista atual', dadosProcessados.resumo.apenasAtual],
          ['Apenas na lista anterior', dadosProcessados.resumo.apenasAnterior],
          ['Mudanças de empresa', dadosProcessados.resumo.mudancasEmpresa],
          ['Mudanças de alocação', dadosProcessados.resumo.mudancasAlocacao]
        ];
        
        const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
        XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
        
        // Adicionar aba de mudanças de alocação
        if (dadosProcessados.mudancasAlocacao.length > 0) {
          const alocacaoData = [
            ['Nome', 'Empresa', 'Alocação Anterior', 'Nova Alocação', 'Tipo']
          ];
          
          dadosProcessados.mudancasAlocacao.forEach(item => {
            alocacaoData.push([
              item.nome || '',
              item.empresa || '',
              item.anterior || '',
              item.nova || '',
              item.tipo || ''
            ]);
          });
          
          const wsAlocacao = XLSX.utils.aoa_to_sheet(alocacaoData);
          XLSX.utils.book_append_sheet(wb, wsAlocacao, 'Mudanças de Alocação');
        }
        
        // Adicionar aba de nomes similares
        if (dadosProcessados.nomesSimilares.length > 0) {
          const similaresData = [
            ['Nome na Lista Atual', 'Nome na Lista Anterior', 'Similaridade (%)', 'Empresa', 'Status']
          ];
          
          dadosProcessados.nomesSimilares.forEach(item => {
            similaresData.push([
              item.nome1 || '',
              item.nome2 || '',
              item.similaridade || 0,
              item.empresa || '',
              item.status || ''
            ]);
          });
          
          const wsSimilares = XLSX.utils.aoa_to_sheet(similaresData);
          XLSX.utils.book_append_sheet(wb, wsSimilares, 'Nomes Similares');
        }
        
        // Adicionar aba de funcionários novos
        if (dadosProcessados.apenasAtual.length > 0) {
          const novosData = [
            ['Nome', 'Empresa', 'Alocação']
          ];
          
          dadosProcessados.apenasAtual.forEach(item => {
            novosData.push([
              item[dadosProcessados.campos.nomeAtual] || '',
              item[dadosProcessados.campos.empresaAtual] || '',
              item[dadosProcessados.campos.alocacaoAtual] || ''
            ]);
          });
          
          const wsNovos = XLSX.utils.aoa_to_sheet(novosData);
          XLSX.utils.book_append_sheet(wb, wsNovos, 'Funcionários Novos');
        }
        
        // Adicionar aba de funcionários removidos
        if (dadosProcessados.apenasAnterior.length > 0) {
          const removidosData = [
            ['Nome', 'Empresa', 'Alocação']
          ];
          
          dadosProcessados.apenasAnterior.forEach(item => {
            removidosData.push([
              item[dadosProcessados.campos.nomeAnterior] || '',
              item[dadosProcessados.campos.empresaAnterior] || '',
              item[dadosProcessados.campos.alocacaoAnterior] || ''
            ]);
          });
          
          const wsRemovidos = XLSX.utils.aoa_to_sheet(removidosData);
          XLSX.utils.book_append_sheet(wb, wsRemovidos, 'Funcionários Removidos');
        }
        
        // Exportar arquivo
        XLSX.writeFile(wb, `relatorio-conciliacao-${new Date().toISOString().split('T')[0]}.xlsx`);
      }
      
      alert(`Arquivo ${format.toUpperCase()} exportado com sucesso!`);
      setShowExportModal(false);
      
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert(`Erro ao exportar: ${error.message}`);
    }
  };

  // Função para filtrar dados
  const filtrarDados = useCallback((dados, termo) => {
    if (!termo || !dados) return dados;
    
    const termoLower = termo.toLowerCase();
    
    return dados.filter(item => 
      Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(termoLower)
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
        <div className="absolute top-3 right-3">
          <button 
            onClick={() => setShowUploadModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Importar Listas para Conciliação</h3>
          
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Lista Atual (Nova)</h4>
              <input
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
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
                accept=".csv,.txt,.xlsx,.xls"
                onChange={(e) => setArquivoAnterior(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {arquivoAnterior && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  ✓ {arquivoAnterior.name} selecionado
                </div>
              )}
            </div>
            
            {isProcessing && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{processamentoStatus}</span>
                  <span className="text-sm font-medium text-gray-700">{processamentoProgresso}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${processamentoProgresso}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={limparArquivos}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md hover:bg-gray-300"
            >
              Limpar
            </button>
            <button
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={processarConciliacao}
              disabled={!arquivoAtual || !arquivoAnterior || isProcessing}
              className={`px-4 py-2 text-white text-base font-medium rounded-md ${
                !arquivoAtual || !arquivoAnterior || isProcessing
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isProcessing ? 'Processando...' : 'Processar Conciliação'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente Modal de Exportação
  const ExportModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
        <div className="absolute top-3 right-3">
          <button 
            onClick={() => setShowExportModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Exportar Relatório</h3>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleExport('excel')}>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-2">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-medium text-gray-900">Excel (.xlsx)</h4>
                  <p className="text-sm text-gray-500">Exportar relatório completo em formato Excel</p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleExport('csv')}>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-medium text-gray-900">CSV</h4>
                  <p className="text-sm text-gray-500">Exportar mudanças de alocação em formato CSV</p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleExport('json')}>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-medium text-gray-900">JSON</h4>
                  <p className="text-sm text-gray-500">Exportar dados completos em formato JSON</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
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

  // Componente Modal de Ajuda
  const HelpModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-[700px] shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
        <div className="absolute top-3 right-3">
          <button 
            onClick={() => setShowHelpModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Ajuda do Sistema de Conciliação</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">Como usar o sistema</h4>
              <p className="text-sm text-gray-600">
                Este sistema permite comparar duas listas de funcionários para identificar correspondências, 
                mudanças de alocação, e funcionários novos ou removidos.
              </p>
            </div>
            
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">Importando arquivos</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
                <li>Clique no botão "Importar Listas" no cabeçalho</li>
                <li>Selecione o arquivo atual (nova lista de funcionários)</li>
                <li>Selecione o arquivo anterior (lista de referência)</li>
                <li>Clique em "Processar Conciliação"</li>
              </ol>
              <p className="text-sm text-gray-600 mt-2">
                Formatos suportados: Excel (.xlsx, .xls) e CSV (.csv, .txt)
              </p>
            </div>
            
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">Interpretando os resultados</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li><strong>Correspondências exatas:</strong> Funcionários com nomes idênticos em ambas as listas</li>
                <li><strong>Nomes similares:</strong> Possíveis correspondências que precisam de verificação manual</li>
                <li><strong>Mudanças de alocação:</strong> Funcionários que mudaram de setor/departamento</li>
                <li><strong>Mudanças de empresa:</strong> Funcionários que mudaram de empresa</li>
                <li><strong>Funcionários novos:</strong> Presentes apenas na lista atual</li>
                <li><strong>Funcionários removidos:</strong> Presentes apenas na lista anterior</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">Exportando relatórios</h4>
              <p className="text-sm text-gray-600">
                Clique no botão "Exportar Relatório" para salvar os resultados em formato Excel, CSV ou JSON.
              </p>
            </div>
            
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">Configurações</h4>
              <p className="text-sm text-gray-600">
                Acesse as configurações para ajustar o limiar de similaridade e configurar manualmente as colunas 
                de nome, empresa e alocação.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowHelpModal(false)}
              className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md hover:bg-blue-700"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente Modal de Configurações
  const SettingsModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
        <div className="absolute top-3 right-3">
          <button 
            onClick={() => setShowSettingsModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Configurações</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">Configurações de Similaridade</h4>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Limiar de similaridade:</span>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={configSimilaridade}
                  onChange={(e) => setConfigSimilaridade(parseInt(e.target.value))}
                  className="w-64"
                />
                <span className="text-sm font-medium text-gray-900 ml-2">{configSimilaridade}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Valores mais altos exigem maior similaridade entre nomes para considerar como possível correspondência.
              </p>
            </div>
            
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">Configurações de Colunas</h4>
              <p className="text-xs text-gray-500 mb-3">
                Configure manualmente os nomes das colunas a serem utilizadas na comparação.
                Deixe em branco para detecção automática.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coluna de Nome (Atual)
                  </label>
                  <input
                    type="text"
                    value={configColunas.nomeAtual}
                    onChange={(e) => setConfigColunas({...configColunas, nomeAtual: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: Nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coluna de Nome (Anterior)
                  </label>
                  <input
                    type="text"
                    value={configColunas.nomeAnterior}
                    onChange={(e) => setConfigColunas({...configColunas, nomeAnterior: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: Nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coluna de Empresa (Atual)
                  </label>
                  <input
                    type="text"
                    value={configColunas.empresaAtual}
                    onChange={(e) => setConfigColunas({...configColunas, empresaAtual: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: Empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coluna de Empresa (Anterior)
                  </label>
                  <input
                    type="text"
                    value={configColunas.empresaAnterior}
                    onChange={(e) => setConfigColunas({...configColunas, empresaAnterior: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: Empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coluna de Alocação (Atual)
                  </label>
                  <input
                    type="text"
                    value={configColunas.alocacaoAtual}
                    onChange={(e) => setConfigColunas({...configColunas, alocacaoAtual: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: Alocação"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coluna de Alocação (Anterior)
                  </label>
                  <input
                    type="text"
                    value={configColunas.alocacaoAnterior}
                    onChange={(e) => setConfigColunas({...configColunas, alocacaoAnterior: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: Alocação"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={salvarConfiguracoes}
              className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md hover:bg-blue-700"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Card de Estatística
  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className={`bg-white rounded-lg border-l-4 ${color} p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}>
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
                    <tr key={index} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
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
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowHelpModal(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full"
                title="Ajuda"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full"
                title="Configurações"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Listas
              </button>
              <button 
                onClick={atualizarDados}
                disabled={isProcessing || !dadosProcessados}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
                  isProcessing || !dadosProcessados
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isProcessing ? 'Atualizando...' : 'Atualizar Dados'}
              </button>
              <button 
                onClick={() => setShowExportModal(true)}
                disabled={!dadosProcessados}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
                  !dadosProcessados
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
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
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
              { id: 'alocacoes', name: 'Mudanças de Alocação', icon: AlertTriangle },
              { id: 'similares', name: 'Nomes Similares', icon: Search },
              { id: 'novos', name: 'Funcionários Novos', icon: Users },
              { id: 'removidos', name: 'Funcionários Removidos', icon: Users },
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
                      
                      {errosProcessamento.length > 0 && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-700">
                              <strong>Atenção:</strong> {errosProcessamento.length} erros encontrados durante o processamento. Verifique os detalhes no relatório completo.
                            </p>
                          </div>
                        </div>
                      )}
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
                    { header: 'Alocação Anterior', key: 'anterior' },
                    { header: 'Nova Alocação', key: 'nova' },
                    { 
                      header: 'Tipo', 
                      key: 'tipo',
                      render: (item) => (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.tipo === 'Padronização' 
                            ? 'bg-blue-100 text-blue-800' 
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
                    Possíveis correspondências que precisam de verificação manual
                  </p>
                </div>
                
                <DataTable
                  data={dadosProcessados.nomesSimilares}
                  columns={[
                    { header: 'Nome na Lista Atual', key: 'nome1' },
                    { header: 'Nome na Lista Anterior', key: 'nome2' },
                    { 
                      header: 'Similaridade', 
                      key: 'similaridade',
                      render: (item) => `${item.similaridade}%`
                    },
                    { header: 'Empresa', key: 'empresa' },
                    { 
                      header: 'Status', 
                      key: 'status',
                      render: (item) => (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.similaridade >= 80 
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
                  <h2 className="text-2xl font-bold text-gray-900">Funcionários Novos</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Funcionários presentes apenas na lista atual
                  </p>
                </div>
                
                <DataTable
                  data={dadosProcessados.apenasAtual}
                  columns={[
                    { 
                      header: 'Nome', 
                      key: dadosProcessados.campos.nomeAtual,
                      render: (item) => item[dadosProcessados.campos.nomeAtual] || 'N/A'
                    },
                    { 
                      header: 'Empresa', 
                      key: dadosProcessados.campos.empresaAtual,
                      render: (item) => item[dadosProcessados.campos.empresaAtual] || 'N/A'
                    },
                    { 
                      header: 'Alocação', 
                      key: dadosProcessados.campos.alocacaoAtual,
                      render: (item) => item[dadosProcessados.campos.alocacaoAtual] || 'N/A'
                    }
                  ]}
                  emptyMessage="Nenhum funcionário novo encontrado"
                />
              </div>
            )}

            {activeTab === 'removidos' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Funcionários Removidos</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Funcionários presentes apenas na lista anterior
                  </p>
                </div>
                
                <DataTable
                  data={dadosProcessados.apenasAnterior}
                  columns={[
                    { 
                      header: 'Nome', 
                      key: dadosProcessados.campos.nomeAnterior,
                      render: (item) => item[dadosProcessados.campos.nomeAnterior] || 'N/A'
                    },
                    { 
                      header: 'Empresa', 
                      key: dadosProcessados.campos.empresaAnterior,
                      render: (item) => item[dadosProcessados.campos.empresaAnterior] || 'N/A'
                    },
                    { 
                      header: 'Alocação', 
                      key: dadosProcessados.campos.alocacaoAnterior,
                      render: (item) => item[dadosProcessados.campos.alocacaoAnterior] || 'N/A'
                    }
                  ]}
                  emptyMessage="Nenhum funcionário removido encontrado"
                />
              </div>
            )}

            {activeTab === 'relatorio' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Relatório Completo</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Visão detalhada de todos os dados processados
                  </p>
                </div>
                
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Informações do Processamento
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Arquivo Atual</h4>
                        <p className="text-sm text-gray-900">{arquivoAtual?.name}</p>
                        <p className="text-xs text-gray-500">{dadosProcessados.resumo.totalAtual} registros</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Arquivo Anterior</h4>
                        <p className="text-sm text-gray-900">{arquivoAnterior?.name}</p>
                        <p className="text-xs text-gray-500">{dadosProcessados.resumo.totalAnterior} registros</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Data de Processamento</h4>
                        <p className="text-sm text-gray-900">{ultimaAtualizacao}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Configuração de Similaridade</h4>
                        <p className="text-sm text-gray-900">{configSimilaridade}%</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Resumo dos Resultados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Correspondências Exatas</h4>
                        <p className="text-lg font-medium text-gray-900">{dadosProcessados.resumo.correspondenciasExatas}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((dadosProcessados.resumo.correspondenciasExatas / dadosProcessados.resumo.totalAtual) * 100)}% do total
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Nomes Similares</h4>
                        <p className="text-lg font-medium text-gray-900">{dadosProcessados.resumo.nomeSimilares}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((dadosProcessados.resumo.nomeSimilares / dadosProcessados.resumo.totalAtual) * 100)}% do total
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Mudanças de Alocação</h4>
                        <p className="text-lg font-medium text-gray-900">{dadosProcessados.resumo.mudancasAlocacao}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((dadosProcessados.resumo.mudancasAlocacao / dadosProcessados.resumo.correspondenciasExatas) * 100)}% das correspondências
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Mudanças de Empresa</h4>
                        <p className="text-lg font-medium text-gray-900">{dadosProcessados.resumo.mudancasEmpresa}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((dadosProcessados.resumo.mudancasEmpresa / dadosProcessados.resumo.correspondenciasExatas) * 100)}% das correspondências
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Funcionários Novos</h4>
                        <p className="text-lg font-medium text-gray-900">{dadosProcessados.resumo.apenasAtual}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((dadosProcessados.resumo.apenasAtual / dadosProcessados.resumo.totalAtual) * 100)}% do total atual
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Funcionários Removidos</h4>
                        <p className="text-lg font-medium text-gray-900">{dadosProcessados.resumo.apenasAnterior}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((dadosProcessados.resumo.apenasAnterior / dadosProcessados.resumo.totalAnterior) * 100)}% do total anterior
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {errosProcessamento.length > 0 && (
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Erros de Processamento
                      </h3>
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                              {errosProcessamento.length} erros encontrados durante o processamento
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                              <ul className="list-disc pl-5 space-y-1">
                                {errosProcessamento.slice(0, 5).map((erro, index) => (
                                  <li key={index}>{erro}</li>
                                ))}
                                {errosProcessamento.length > 5 && (
                                  <li>... e mais {errosProcessamento.length - 5} erros</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Download className="-ml-1 mr-2 h-5 w-5" />
                    Exportar Relatório Completo
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-sm text-gray-500">
              Sistema de Conciliação de Funcionários v2.0
            </div>
            <div className="text-sm text-gray-500">
              {ultimaAtualizacao ? `Última atualização: ${ultimaAtualizacao}` : 'Nenhum dado processado'}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && <UploadModal />}
      {showExportModal && <ExportModal />}
      {showHelpModal && <HelpModal />}
      {showSettingsModal && <SettingsModal />}
    </div>
  );
};

export default SistemaConciliacaoFuncionarios;
