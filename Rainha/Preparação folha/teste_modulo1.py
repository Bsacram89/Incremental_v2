"""
TESTE DO MÓDULO 1 - VALIDAÇÃO E PREPARAÇÃO DE ARQUIVOS
Script de demonstração para testar o sistema de validação

Execute este arquivo para testar o Módulo 1 com seus dados
"""

import sys
import os
from pathlib import Path

# Adicionar o caminho do módulo
sys.path.append(str(Path(__file__).parent))

from modulo1_validacao import ValidadorArquivos

def executar_teste_completo():
    """Executa teste completo do Módulo 1"""
    
    print("🚀 TESTE DO MÓDULO 1 - SISTEMA DE VALIDAÇÃO")
    print("=" * 60)
    print()
    
    try:
        # 1. Instanciar o validador
        print("🔧 Inicializando validador...")
        validador = ValidadorArquivos()
        print("✅ Validador inicializado com sucesso")
        print()
        
        # 2. Mostrar configuração
        print("⚙️ CONFIGURAÇÕES CARREGADAS:")
        print(f"   📁 Pasta base: {validador.base_path}")
        print(f"   📄 Pasta dados: {validador.pasta_dados}")
        print(f"   💾 Pasta backup: {validador.pasta_backup}")
        print(f"   🔍 Tipos de arquivo esperados: {len(validador.config['arquivos_obrigatorios'])}")
        print()
        
        # 3. Executar validação completa
        print("🔍 EXECUTANDO VALIDAÇÃO COMPLETA...")
        print("-" * 40)
        
        sucesso, relatorio = validador.executar_validacao_completa()
        
        print()
        print("📊 RESULTADO DA VALIDAÇÃO:")
        print("-" * 40)
        
        # 4. Mostrar resumo
        if sucesso:
            print("🎉 VALIDAÇÃO CONCLUÍDA COM SUCESSO!")
        else:
            print("❌ VALIDAÇÃO ENCONTROU PROBLEMAS")
        
        print()
        if relatorio.get("resumo_por_tipo"):
            print("📋 DETALHES POR ARQUIVO:")
            for tipo, info in relatorio["resumo_por_tipo"].items():
                status_emoji = "✅" if info["status"] == "válido" else "❌"
                print(f"   {status_emoji} {tipo.upper()}: {info['arquivo']}")
                print(f"      Status: {info['status']}")
                if info["warnings"] > 0:
                    print(f"      ⚠️ Warnings: {info['warnings']}")
                if info["erros"] > 0:
                    print(f"      ❌ Erros: {info['erros']}")
                print()
        
        # 5. Mostrar estatísticas gerais
        print("📈 ESTATÍSTICAS GERAIS:")
        print(f"   Total de arquivos analisados: {relatorio.get('total_arquivos', 0)}")
        print(f"   Arquivos válidos: {relatorio.get('arquivos_validos', 0)}")
        print(f"   Arquivos com warnings: {relatorio.get('arquivos_com_warnings', 0)}")
        print(f"   Arquivos inválidos: {relatorio.get('arquivos_invalidos', 0)}")
        print(f"   Backup criado: {'✅' if relatorio.get('backup_criado') else '❌'}")
        print()
        
        # 6. Próximos passos
        print("🎯 PRÓXIMOS PASSOS:")
        for passo in relatorio.get("proximos_passos", []):
            print(f"   {passo}")
        print()
        
        # 7. Arquivos gerados
        print("📄 ARQUIVOS GERADOS:")
        arquivos_gerados = [
            "relatorio_validacao.json",
            "validacao.log"
        ]
        
        for arquivo in arquivos_gerados:
            caminho = validador.base_path / arquivo
            if caminho.exists():
                tamanho = caminho.stat().st_size / 1024
                print(f"   ✅ {arquivo} ({tamanho:.1f} KB)")
            else:
                print(f"   ❌ {arquivo} (não encontrado)")
        
        print()
        
        # 8. Recomendações baseadas no resultado
        print("💡 RECOMENDAÇÕES:")
        if sucesso:
            if relatorio.get("arquivos_com_warnings", 0) == 0:
                print("   🎉 Sistema pronto para processamento!")
                print("   📌 Próximo passo: Implementar Módulo 2 (Processamento)")
            else:
                print("   ⚠️ Revisar warnings antes de continuar")
                print("   📌 Warnings não impedem o processamento, mas devem ser verificados")
        else:
            print("   ❌ Corrigir problemas identificados antes de continuar")
            print("   📌 Verificar se todos os arquivos estão na pasta correta")
            print("   📌 Verificar se os nomes dos arquivos seguem o padrão esperado")
        
        print()
        print("🏁 TESTE CONCLUÍDO!")
        
        return sucesso
        
    except Exception as e:
        print(f"❌ ERRO DURANTE O TESTE: {e}")
        print()
        print("🔧 DICAS DE SOLUÇÃO:")
        print("   1. Verifique se a pasta Base de Dados existe")
        print("   2. Verifique se há arquivos Excel na pasta")
        print("   3. Verifique as permissões de leitura/escrita")
        print("   4. Consulte o arquivo de log para mais detalhes")
        
        return False

def testar_descoberta_arquivos():
    """Teste específico para descoberta de arquivos"""
    print("🔍 TESTE DE DESCOBERTA DE ARQUIVOS")
    print("-" * 40)
    
    try:
        validador = ValidadorArquivos()
        arquivos = validador.descobrir_arquivos()
        
        if arquivos:
            print(f"✅ Encontrados {len(arquivos)} arquivos:")
            for tipo, caminho in arquivos.items():
                print(f"   📄 {tipo.upper()}: {caminho.name}")
        else:
            print("❌ Nenhum arquivo encontrado")
            print("💡 Verifique se os arquivos estão na pasta 'Base de Dados'")
        
        return len(arquivos) > 0
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def main():
    """Função principal"""
    print("🧪 BATERIA DE TESTES - MÓDULO 1")
    print("=" * 60)
    print()
    
    # Teste 1: Descoberta de arquivos
    print("📋 TESTE 1: Descoberta de Arquivos")
    sucesso_descoberta = testar_descoberta_arquivos()
    print()
    
    # Teste 2: Validação completa
    print("📋 TESTE 2: Validação Completa")
    sucesso_validacao = executar_teste_completo()
    print()
    
    # Resumo final
    print("🏆 RESUMO DOS TESTES:")
    print(f"   Descoberta de arquivos: {'✅' if sucesso_descoberta else '❌'}")
    print(f"   Validação completa: {'✅' if sucesso_validacao else '❌'}")
    print()
    
    if sucesso_descoberta and sucesso_validacao:
        print("🎉 TODOS OS TESTES PASSARAM!")
        print("📌 Módulo 1 está funcionando corretamente")
        print("📌 Sistema pronto para implementar Módulo 2")
    else:
        print("⚠️ ALGUNS TESTES FALHARAM")
        print("📌 Revise os logs e corrija os problemas identificados")
    
    print()
    return sucesso_descoberta and sucesso_validacao

if __name__ == "__main__":
    main()
    
    # Aguardar input do usuário antes de fechar
    input("\n💭 Pressione Enter para sair...")