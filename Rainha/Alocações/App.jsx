import React, { useState, useCallback } from 'react';
import { Users, FileText, Download, Play, BarChart3, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUpload from './components/FileUpload';
import StatisticsCard from './components/StatisticsCard';
import ResultsTable from './components/ResultsTable';
import ConfigPanel from './components/ConfigPanel';
import { readExcelFile, detectNameColumn, detectAllocationColumn, extractEmployeeList, createReconciliationReport } from './utils/excelUtils';
import { ReconciliationEngine } from './utils/reconciliationEngine';
import * as XLSX from 'xlsx';
import './App.css';

function App() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    similarMatchThreshold: 0.8,
    enableNameCleaning: true,
    enableNormalization: true
  });

  const resetConfig = useCallback(() => {
    setConfig({
      similarMatchThreshold: 0.8,
      enableNameCleaning: true,
      enableNormalization: true
    });
  }, []);

  const processFiles = useCallback(async () => {
    if (!file1 || !file2) {
      setError('Por favor, selecione ambos os arquivos Excel');
      return;
    }

    setProcessing(true);
    setError(null);
    setResults(null);

    try {
      // Ler arquivos Excel
      const [data1, data2] = await Promise.all([
        readExcelFile(file1),
        readExcelFile(file2)
      ]);

      // Detectar colunas de nomes
      const nameColumn1 = detectNameColumn(data1.data);
      const nameColumn2 = detectNameColumn(data2.data);

      if (!nameColumn1 || !nameColumn2) {
        throw new Error('Não foi possível detectar automaticamente as colunas de nomes. Verifique se os arquivos contêm uma coluna com nomes de funcionários.');
      }

      // Detectar colunas de alocação (opcional)
      const allocationColumn1 = detectAllocationColumn(data1.data);
      const allocationColumn2 = detectAllocationColumn(data2.data);

      // Extrair listas de funcionários
      const list1 = extractEmployeeList(
        data1.data, 
        nameColumn1.index, 
        allocationColumn1?.index
      );
      const list2 = extractEmployeeList(
        data2.data, 
        nameColumn2.index, 
        allocationColumn2?.index
      );

      if (list1.length === 0 || list2.length === 0) {
        throw new Error('Uma ou ambas as listas estão vazias. Verifique se os arquivos contêm dados válidos.');
      }

      // Executar conciliação
      const engine = new ReconciliationEngine(config);
      const reconciliationResults = engine.reconcile(list1, list2);
      const report = engine.generateReport(reconciliationResults);

      setResults({
        ...reconciliationResults,
        report,
        metadata: {
          file1Name: file1.name,
          file2Name: file2.name,
          nameColumn1: nameColumn1.name,
          nameColumn2: nameColumn2.name,
          allocationColumn1: allocationColumn1?.name,
          allocationColumn2: allocationColumn2?.name
        }
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }, [file1, file2, config]);

  const downloadReport = useCallback(() => {
    if (!results) return;

    const reportData = {
      list1Count: results.statistics.list1Count,
      list2Count: results.statistics.list2Count,
      exactMatches: results.statistics.exactMatches,
      similarMatches: results.statistics.similarMatches,
      notFoundList1: results.statistics.notFoundList1,
      notFoundList2: results.statistics.notFoundList2,
      matchRate: results.statistics.matchRate,
      exactMatchesData: results.report.exactMatchesData,
      similarMatchesData: results.report.similarMatchesData,
      notFoundData: results.report.notFoundData
    };

    const wb = createReconciliationReport(reportData);
    XLSX.writeFile(wb, `conciliacao_funcionarios_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [results]);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Users className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Conciliação de Funcionários
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compare duas listas de funcionários e identifique automaticamente correspondências, 
            diferenças e mudanças de alocação com algoritmos avançados de similaridade.
          </p>
        </div>

        {/* Upload de Arquivos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <FileUpload
            label="Lista de Funcionários 1"
            selectedFile={file1}
            onFileSelect={setFile1}
          />
          <FileUpload
            label="Lista de Funcionários 2"
            selectedFile={setFile2}
            onFileSelect={setFile2}
          />
        </div>

        {/* Painel de Configuração */}
        <div className="mb-8">
          <ConfigPanel
            config={config}
            onConfigChange={setConfig}
            onReset={resetConfig}
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button
            onClick={processFiles}
            disabled={!file1 || !file2 || processing}
            size="lg"
            className="px-8"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Conciliação
              </>
            )}
          </Button>

          {results && (
            <>
              <Button
                variant="outline"
                onClick={downloadReport}
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Relatório
              </Button>
              <Button
                variant="outline"
                onClick={clearResults}
                size="lg"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Limpar Resultados
              </Button>
            </>
          )}
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Resultados */}
        {results && (
          <div className="space-y-8">
            {/* Estatísticas */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="h-6 w-6 mr-2" />
                Estatísticas da Conciliação
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatisticsCard
                  title="Taxa de Correspondência"
                  value={`${results.statistics.matchRate}%`}
                  subtitle={`${results.statistics.totalMatches} de ${results.statistics.list1Count}`}
                  color="blue"
                  icon={BarChart3}
                />
                <StatisticsCard
                  title="Correspondências Exatas"
                  value={results.statistics.exactMatches}
                  subtitle="Nomes idênticos"
                  color="green"
                  icon={CheckCircle}
                />
                <StatisticsCard
                  title="Correspondências Similares"
                  value={results.statistics.similarMatches}
                  subtitle="Nomes similares"
                  color="yellow"
                  icon={AlertCircle}
                />
                <StatisticsCard
                  title="Não Encontrados"
                  value={results.statistics.notFoundList1 + results.statistics.notFoundList2}
                  subtitle="Total sem correspondência"
                  color="red"
                  icon={XCircle}
                />
              </div>

              {/* Informações dos Arquivos */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Informações dos Arquivos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Arquivo 1:</strong> {results.metadata.file1Name}</p>
                    <p><strong>Coluna de Nomes:</strong> {results.metadata.nameColumn1}</p>
                    {results.metadata.allocationColumn1 && (
                      <p><strong>Coluna de Alocação:</strong> {results.metadata.allocationColumn1}</p>
                    )}
                    <p><strong>Total de Registros:</strong> {results.statistics.list1Count}</p>
                  </div>
                  <div>
                    <p><strong>Arquivo 2:</strong> {results.metadata.file2Name}</p>
                    <p><strong>Coluna de Nomes:</strong> {results.metadata.nameColumn2}</p>
                    {results.metadata.allocationColumn2 && (
                      <p><strong>Coluna de Alocação:</strong> {results.metadata.allocationColumn2}</p>
                    )}
                    <p><strong>Total de Registros:</strong> {results.statistics.list2Count}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabelas de Resultados */}
            <div className="space-y-6">
              {/* Correspondências Exatas */}
              {results.report.exactMatchesData.length > 0 && (
                <ResultsTable
                  title="Correspondências Exatas"
                  data={results.report.exactMatchesData}
                  columns={[
                    { key: 'Nome Lista 1', label: 'Nome Lista 1' },
                    { key: 'Nome Lista 2', label: 'Nome Lista 2' },
                    { key: 'Alocação Lista 1', label: 'Alocação Lista 1' },
                    { key: 'Alocação Lista 2', label: 'Alocação Lista 2' },
                    { key: 'Score', label: 'Similaridade' },
                    { key: 'Tipo', label: 'Tipo' }
                  ]}
                  type="matches"
                />
              )}

              {/* Correspondências Similares */}
              {results.report.similarMatchesData.length > 0 && (
                <ResultsTable
                  title="Correspondências Similares"
                  data={results.report.similarMatchesData}
                  columns={[
                    { key: 'Nome Lista 1', label: 'Nome Lista 1' },
                    { key: 'Nome Lista 2', label: 'Nome Lista 2' },
                    { key: 'Alocação Lista 1', label: 'Alocação Lista 1' },
                    { key: 'Alocação Lista 2', label: 'Alocação Lista 2' },
                    { key: 'Score', label: 'Similaridade' },
                    { key: 'Tipo', label: 'Tipo' }
                  ]}
                  type="matches"
                />
              )}

              {/* Não Encontrados */}
              {results.report.notFoundData.length > 0 && (
                <ResultsTable
                  title="Funcionários Não Encontrados"
                  data={results.report.notFoundData}
                  columns={[
                    { key: 'Nome', label: 'Nome' },
                    { key: 'Alocação', label: 'Alocação' },
                    { key: 'Lista', label: 'Lista de Origem' },
                    { key: 'Status', label: 'Status' }
                  ]}
                  type="notfound"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

