// Sistema Avançado de Conciliação de Funcionários
// Versão otimizada e funcional

const { useState, useEffect } = React;
const { Search, Upload, Download, Users, AlertCircle, CheckCircle, BarChart3, Settings } = lucide;

const SistemaConciliacao = () => {
  const [dados, setDados] = useState({
    lista1: [],
    lista2: [],
    resultado: null
  });
  
  const [config, setConfig] = useState({
    similaridade: 80,
    algoritmo: 'jaro-winkler'
  });
  
  const [aba, setAba] = useState('upload');
  const [processando, setProcessando] = useState(false);

  // Dados de exemplo
  const dadosExemplo = {
    lista1: [
      { nome: "ADRIANA CLEIDE ALVES", alocacao: "ESCRITORIO" },
      { nome: "CAROLINE BERNARDO DA SILVA", alocacao: "GENESIS" },
      { nome: "MICHELLE JESUS ROCHA", alocacao: "REIS MTZ" },
      { nome: "VALERIA BATISTA DOS SANTOS - 26/09", alocacao: "30K" }
    ],
    lista2: [
      { nome: "ADRIANA CLEIDE ALVES FIGUEREDO SANTOS", alocacao: "ESCRITORIO" },
      { nome: "CAROLINE BERNARDO SILVA", alocacao: "GENESIS" },
      { nome: "MICHELLE JESUS ROCHA ESTRELA", alocacao: "GENESIS" },
      { nome: "VALERIA BATISTA DOS SANTOS", alocacao: "30K" },
      { nome: "NOVO FUNCIONARIO", alocacao: "RAINHA MAISON" }
    ]
  };

  // Função de similaridade Jaro-Winkler simplificada
  const calcularSimilaridade = (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    // Normalizar strings
    const s1 = str1.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const s2 = str2.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    if (s1 === s2) return 100;
    
    // Algoritmo simplificado baseado em tokens comuns
    const tokens1 = s1.split(/\s+/);
    const tokens2 = s2.split(/\s+/);
    
    let tokensComuns = 0;
    tokens1.forEach(token1 => {
      if (tokens2.some(token2 => 
        token1.includes(token2) || token2.includes(token1) || 
        Math.abs(token1.length - token2.length) <= 2 && 
        token1.substring(0, 3) === token2.substring(0, 3)
      )) {
        tokensComuns++;
      }
    });
    
    const similaridade = (tokensComuns / Math.max(tokens1.length, tokens2.length)) * 100;
    return Math.round(similaridade);
  };

  // Função principal de conciliação
  const executarConciliacao = () => {
    setProcessando(true);
    
    setTimeout(() => {
      const resultado = {
        exatas: [],
        similares: [],
        mudancas: [],
        novos: [],
        removidos: [],
        estatisticas: {}
      };

      const processados = new Set();

      // 1. Correspondências exatas
      dados.lista1.forEach(item1 => {
        const exata = dados.lista2.find(item2 => 
          calcularSimilaridade(item1.nome, item2.nome) === 100 && 
          !processados.has(item2.nome)
        );
        
        if (exata) {
          processados.add(exata.nome);
          
          if (item1.alocacao !== exata.alocacao) {
            resultado.mudancas.push({
              nome: item1.nome,
              anterior: item1.alocacao,
              nova: exata.alocacao,
              tipo: 'Exata'
            });
          }
          
          resultado.exatas.push({
            nome: item1.nome,
            lista1: item1,
            lista2: exata,
            mudou: item1.alocacao !== exata.alocacao
          });
        }
      });

      // 2. Correspondências similares
      dados.lista1.forEach(item1 => {
        if (resultado.exatas.some(ex => ex.nome === item1.nome)) return;
        
        let melhorMatch = null;
        let melhorSimilaridade = 0;
        
        dados.lista2.forEach(item2 => {
          if (processados.has(item2.nome)) return;
          
          const similaridade = calcularSimilaridade(item1.nome, item2.nome);
          if (similaridade >= config.similaridade && similaridade > melhorSimilaridade) {
            melhorSimilaridade = similaridade;
            melhorMatch = item2;
          }
        });
        
        if (melhorMatch) {
          processados.add(melhorMatch.nome);
          
          if (item1.alocacao !== melhorMatch.alocacao) {
            resultado.mudancas.push({
              nome: `${item1.nome} → ${melhorMatch.nome}`,
              anterior: item1.alocacao,
              nova: melhorMatch.alocacao,
              tipo: `Similar (${melhorSimilaridade}%)`
            });
          }
          
          resultado.similares.push({
            lista1: item1,
            lista2: melhorMatch,
            similaridade: melhorSimilaridade,
            mudou: item1.alocacao !== melhorMatch.alocacao
          });
        }
      });

      // 3. Não encontrados
      dados.lista1.forEach(item1 => {
        const encontrado = resultado.exatas.some(ex => ex.nome === item1.nome) ||
                          resultado.similares.some(sim => sim.lista1.nome === item1.nome);
        if (!encontrado) {
          resultado.removidos.push(item1);
        }
      });

      dados.lista2.forEach(item2 => {
        if (!processados.has(item2.nome)) {
          resultado.novos.push(item2);
        }
      });

      // 4. Estatísticas
      resultado.estatisticas = {
        total1: dados.lista1.length,
        total2: dados.lista2.length,
        exatas: resultado.exatas.length,
        similares: resultado.similares.length,
        mudancas: resultado.mudancas.length,
        novos: resultado.novos.length,
        removidos: resultado.removidos.length,
        taxa: Math.round(((resultado.exatas.length + resultado.similares.length) / Math.max(dados.lista1.length, dados.lista2.length)) * 100)
      };

      setDados(prev => ({ ...prev, resultado }));
      setProcessando(false);
      setAba('resultados');
    }, 1000);
  };

  // Carregar dados de exemplo
  const carregarExemplo = () => {
    setDados({
      lista1: dadosExemplo.lista1,
      lista2: dadosExemplo.lista2,
      resultado: null
    });
  };

  // Função para processar arquivo CSV
  const processarCSV = (arquivo, lista) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const texto = e.target.result;
      const linhas = texto.split('\n').filter(l => l.trim());
      
      if (linhas.length < 2) {
        alert('Arquivo deve ter pelo menos cabeçalho e uma linha de dados');
        return;
      }
      
      const cabecalho = linhas[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const dados = linhas.slice(1).map(linha => {
        const valores = linha.split(',').map(v => v.trim().replace(/"/g, ''));
        return {
          nome: valores[0] || '',
          alocacao: valores[1] || ''
        };
      }).filter(item => item.nome);
      
      setDados(prev => ({
        ...prev,
        [lista]: dados
      }));
    };
    reader.readAsText(arquivo);
  };

  // Componente de upload
  const ComponenteUpload = ({ titulo, lista }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">{titulo}</h3>
      <input
        type="file"
        accept=".csv,.txt"
        onChange={(e) => e.target.files[0] && processarCSV(e.target.files[0], lista)}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
      />
      {dados[lista].length > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded border-l-4 border-green-400">
          <p className="text-green-700">✓ {dados[lista].length} registros carregados</p>
        </div>
      )}
    </div>
  );

  // Componente de estatísticas
  const CardEstatistica = ({ titulo, valor, cor }) => (
    <div className={`bg-white rounded-lg border-l-4 ${cor} p-4 shadow`}>
      <div className="text-2xl font-bold text-gray-900">{valor}</div>
      <div className="text-gray-600 text-sm">{titulo}</div>
    </div>
  );

  // Componente de tabela
  const Tabela = ({ dados, colunas, titulo }) => (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-3 border-b">
        <h3 className="text-lg font-medium">{titulo} ({dados.length})</h3>
      </div>
      {dados.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {colunas.map((col, i) => (
                  <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {col.titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dados.map((item, i) => (
                <tr key={i}>
                  {colunas.map((col, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap text-sm">
                      {col.render ? col.render(item) : item[col.campo]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">Nenhum dado encontrado</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              Sistema de Conciliação de Funcionários
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={carregarExemplo}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Carregar Exemplo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'upload', nome: 'Upload', icone: Upload },
              { id: 'resultados', nome: 'Resultados', icone: BarChart3 },
              { id: 'config', nome: 'Configurações', icone: Settings }
            ].map(aba_item => {
              const Icon = aba_item.icone;
              return (
                <button
                  key={aba_item.id}
                  onClick={() => setAba(aba_item.id)}
                  className={`py-4 border-b-2 font-medium text-sm flex items-center ${
                    aba === aba_item.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {aba_item.nome}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {aba === 'upload' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <ComponenteUpload titulo="Lista Anterior" lista="lista1" />
              <ComponenteUpload titulo="Lista Atual" lista="lista2" />
            </div>
            
            {dados.lista1.length > 0 && dados.lista2.length > 0 && (
              <div className="text-center">
                <button
                  onClick={executarConciliacao}
                  disabled={processando}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg"
                >
                  {processando ? 'Processando...' : 'Executar Conciliação'}
                </button>
              </div>
            )}
          </div>
        )}

        {aba === 'config' && (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Configurações</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Similaridade Mínima: {config.similaridade}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={config.similaridade}
                  onChange={(e) => setConfig(prev => ({ ...prev, similaridade: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Algoritmo
                </label>
                <select
                  value={config.algoritmo}
                  onChange={(e) => setConfig(prev => ({ ...prev, algoritmo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="jaro-winkler">Jaro-Winkler</option>
                  <option value="levenshtein">Levenshtein</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {aba === 'resultados' && dados.resultado && (
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CardEstatistica 
                titulo="Taxa de Correspondência" 
                valor={`${dados.resultado.estatisticas.taxa}%`} 
                cor="border-green-500" 
              />
              <CardEstatistica 
                titulo="Correspondências Exatas" 
                valor={dados.resultado.estatisticas.exatas} 
                cor="border-blue-500" 
              />
              <CardEstatistica 
                titulo="Correspondências Similares" 
                valor={dados.resultado.estatisticas.similares} 
                cor="border-yellow-500" 
              />
              <CardEstatistica 
                titulo="Mudanças de Alocação" 
                valor={dados.resultado.estatisticas.mudancas} 
                cor="border-red-500" 
              />
            </div>

            {/* Mudanças de Alocação */}
            {dados.resultado.mudancas.length > 0 && (
              <Tabela
                titulo="Mudanças de Alocação"
                dados={dados.resultado.mudancas}
                colunas={[
                  { titulo: 'Nome', campo: 'nome' },
                  { 
                    titulo: 'Anterior', 
                    campo: 'anterior',
                    render: (item) => <span className="text-red-600 font-medium">{item.anterior}</span>
                  },
                  { 
                    titulo: 'Nova', 
                    campo: 'nova',
                    render: (item) => <span className="text-green-600 font-medium">{item.nova}</span>
                  },
                  { titulo: 'Tipo', campo: 'tipo' }
                ]}
              />
            )}

            {/* Correspondências Similares */}
            {dados.resultado.similares.length > 0 && (
              <Tabela
                titulo="Correspondências Similares"
                dados={dados.resultado.similares}
                colunas={[
                  { titulo: 'Nome Lista 1', campo: 'lista1', render: (item) => item.lista1.nome },
                  { titulo: 'Nome Lista 2', campo: 'lista2', render: (item) => item.lista2.nome },
                  { 
                    titulo: 'Similaridade', 
                    campo: 'similaridade',
                    render: (item) => `${item.similaridade}%`
                  },
                  { 
                    titulo: 'Status', 
                    campo: 'mudou',
                    render: (item) => item.mudou ? 
                      <span className="text-yellow-600">Mudou Alocação</span> : 
                      <span className="text-green-600">Sem Mudança</span>
                  }
                ]}
              />
            )}

            {/* Funcionários Novos */}
            {dados.resultado.novos.length > 0 && (
              <Tabela
                titulo="Funcionários Novos (Apenas na Lista Atual)"
                dados={dados.resultado.novos}
                colunas={[
                  { titulo: 'Nome', campo: 'nome' },
                  { titulo: 'Alocação', campo: 'alocacao' }
                ]}
              />
            )}

            {/* Funcionários Removidos */}
            {dados.resultado.removidos.length > 0 && (
              <Tabela
                titulo="Funcionários Removidos (Apenas na Lista Anterior)"
                dados={dados.resultado.removidos}
                colunas={[
                  { titulo: 'Nome', campo: 'nome' },
                  { titulo: 'Alocação', campo: 'alocacao' }
                ]}
              />
            )}
          </div>
        )}

        {aba === 'resultados' && !dados.resultado && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma conciliação executada
            </h3>
            <p className="text-gray-600">
              Faça o upload das listas e execute a conciliação para ver os resultados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Renderizar a aplicação
ReactDOM.render(<SistemaConciliacao />, document.getElementById('root'));
