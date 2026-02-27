import React, { useState } from 'react';

const MudancasAlocacao = () => {
  const [activeTab, setActiveTab] = useState('exatas');
  
  // Dados de mudanças de alocação com correspondências exatas
  const mudancasExatas = [
    { nome: "CAROLAINE SILVA DE ASSIS", anterior: "RAINHA MAISON", nova: "REIS MTZ" },
    { nome: "GIZELIA LIMA BARBOSA", anterior: "GENESIS", nova: "RAINHA MAISON" },
    { nome: "IRACEMA DE ALMEIDA E SILVA", anterior: "RAINHA HOME", nova: "ESCRITORIO" },
    { nome: "ISAC MORENO MENEZES MELO", anterior: "RAINHA HOME", nova: "ESCRITORIO" },
    { nome: "JOÃO VICTOR DE SOUZA SANTANA", anterior: "REIS MTZ", nova: "RAINHA MAISON" },
    { nome: "JOSE CARLOS RIBEIRO DE OLIVEIRA", anterior: "30K", nova: "GRAND CANYON" },
    { nome: "KESSIA DA COSTA SILVA", anterior: "RAINHA HOME", nova: "GENESIS" },
    { nome: "MARIA JOSE CONI FONSECA", anterior: "REIS MTZ", nova: "RAINHA MAISON" },
    { nome: "MIGUEL NASCIMENTO DE JESUS FILHO", anterior: "GENESIS", nova: "05K" },
    { nome: "NATERCIO PEREIRA SANTANA", anterior: "RAINHA HOME", nova: "REIS FÁBRICA" },
    { nome: "VALDICK SANTOS LEAO", anterior: "RAINHA HOME", nova: "REIS FÁBRICA" },
    { nome: "EVELLIN LORENA SILVA DIAS", anterior: "REIS FABRICA", nova: "REIS FÁBRICA" },
    { nome: "GUILHERME ARAUJO DE ANDRADE", anterior: "REIS FABRICA", nova: "REIS FÁBRICA" }
  ];
  
  // Dados de mudanças de alocação em nomes similares
  const mudancasSimilares = [
    { 
      nome1: "GABRIELE SOUZA OLIVEIRA", 
      nome2: "GABRIELLE SOUZA OLIVEIRA", 
      anterior: "REIS FÁBRICA", 
      nova: "RAINHA HOME" 
    },
    { 
      nome1: "MICHELLE JESUS ROCHA ESTRELA", 
      nome2: "MICHELLE JESUS ROCHA", 
      anterior: "REIS MTZ", 
      nova: "GENESIS" 
    },
    { 
      nome1: "ICAELLE NASCIMENTO GONZAGA", 
      nome2: "ILCAELLE NASCIMENTO GONZAGA", 
      anterior: "REIS FABRICA", 
      nova: "REIS FÁBRICA" 
    },
    { 
      nome1: "JOSE GABRIEL SANTOS SILVA", 
      nome2: "JOSÉ GABRIEL SANTOS SILVA", 
      anterior: "REIS FABRICA", 
      nova: "REIS FÁBRICA" 
    },
    { 
      nome1: "MARIA ROSILENE SANTOS", 
      nome2: "MARIA ROSILENE DOS SANTOS", 
      anterior: "REIS MATRIZ", 
      nova: "REIS MTZ" 
    }
  ];
  
  // Contagem por tipo de alocação (para o gráfico de sumário)
  const tiposAlocacao = {
    "Padronização de Nome": 4, // Ex: REIS FABRICA → REIS FÁBRICA
    "Mudança de Unidade": 9,   // Mudanças reais entre unidades diferentes
    "Total": 13
  };
  
  const padronizacoes = [
    "REIS FABRICA → REIS FÁBRICA",
    "REIS MATRIZ → REIS MTZ"
  ];
  
  // Função para verificar se é apenas padronização
  const isPadronizacao = (anterior, nova) => {
    // Caso seja apenas diferença de acentuação
    if (anterior.replace(/Á/g, 'A').replace(/á/g, 'a') === nova.replace(/Á/g, 'A').replace(/á/g, 'a')) {
      return true;
    }
    
    // Caso seja abreviação conhecida
    if ((anterior === "REIS MATRIZ" && nova === "REIS MTZ") || 
        (anterior === "REIS FABRICA" && nova === "REIS FÁBRICA")) {
      return true;
    }
    
    return false;
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Mudanças de Alocação de Funcionários</h1>
      
      {/* Sumário visual */}
      <div className="mb-8 bg-gray-50 p-4 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Resumo das Mudanças</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800">Total de Mudanças</h3>
            <p className="text-3xl font-bold">{tiposAlocacao.Total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800">Padronizações</h3>
            <p className="text-3xl font-bold">{tiposAlocacao["Padronização de Nome"]}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800">Mudanças de Unidade</h3>
            <p className="text-3xl font-bold">{tiposAlocacao["Mudança de Unidade"]}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Padronizações Identificadas:</h3>
          <ul className="list-disc pl-6">
            {padronizacoes.map((item, index) => (
              <li key={index} className="text-gray-600">{item}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Tabs para os diferentes tipos de mudanças */}
      <div className="flex mb-6 border-b">
        <button 
          className={`px-4 py-2 ${activeTab === 'exatas' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('exatas')}
        >
          Mudanças Exatas
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'similares' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('similares')}
        >
          Nomes Similares
        </button>
      </div>
      
      {/* Conteúdo das tabs */}
      {activeTab === 'exatas' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Mudanças em Nomes com Correspondência Exata</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Nome</th>
                  <th className="py-2 px-4 border-b text-left">Alocação Antiga</th>
                  <th className="py-2 px-4 border-b text-left">Nova Alocação</th>
                  <th className="py-2 px-4 border-b text-left">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {mudancasExatas.map((item, index) => {
                  const tipo = isPadronizacao(item.anterior, item.nova) ? 
                    "Padronização" : "Mudança de Unidade";
                  
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-4 border-b">{item.nome}</td>
                      <td className="py-2 px-4 border-b text-red-500">{item.anterior}</td>
                      <td className="py-2 px-4 border-b text-green-600">{item.nova}</td>
                      <td className="py-2 px-4 border-b">
                        <span className={`px-2 py-1 rounded text-xs font-medium
                          ${tipo === "Padronização" ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {tipo}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'similares' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Mudanças em Nomes Similares</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Nome Lista 1</th>
                  <th className="py-2 px-4 border-b text-left">Nome Lista 2</th>
                  <th className="py-2 px-4 border-b text-left">Alocação Antiga</th>
                  <th className="py-2 px-4 border-b text-left">Nova Alocação</th>
                  <th className="py-2 px-4 border-b text-left">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {mudancasSimilares.map((item, index) => {
                  const tipo = isPadronizacao(item.anterior, item.nova) ? 
                    "Padronização" : "Mudança de Unidade";
                  
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-4 border-b">{item.nome1}</td>
                      <td className="py-2 px-4 border-b">{item.nome2}</td>
                      <td className="py-2 px-4 border-b text-red-500">{item.anterior}</td>
                      <td className="py-2 px-4 border-b text-green-600">{item.nova}</td>
                      <td className="py-2 px-4 border-b">
                        <span className={`px-2 py-1 rounded text-xs font-medium
                          ${tipo === "Padronização" ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {tipo}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MudancasAlocacao;
