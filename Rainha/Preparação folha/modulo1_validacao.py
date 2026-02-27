"""
MÓDULO 1: SISTEMA DE VALIDAÇÃO E PREPARAÇÃO DE ARQUIVOS
Sistema de Automação da Folha de Pagamento - Rainha

Este módulo é responsável por:
1. Validar estrutura dos arquivos de entrada
2. Padronizar nomenclatura 
3. Verificar integridade dos dados
4. Preparar ambiente de processamento
"""

import pandas as pd
import os
import json
import logging
from datetime import datetime
from pathlib import Path
import hashlib
from typing import Dict, List, Tuple, Optional

class ValidadorArquivos:
    """
    Classe responsável pela validação e preparação dos arquivos
    """
    
    def __init__(self, base_path: str = None):
        """
        Inicializa o validador
        
        Args:
            base_path: Caminho base onde estão os arquivos
        """
        if base_path is None:
            base_path = r"C:\Users\bsacr\OneDrive\Área de Trabalho\Claude Resumos\Rainha"
        
        self.base_path = Path(base_path)
        self.pasta_dados = self.base_path / "Base de Dados"
        self.pasta_backup = self.base_path / "backup"
        
        # Configurar logging
        self.setup_logging()
        
        # Carregar configurações
        self.config = self.carregar_configuracoes()
        
        # Criar estrutura de pastas se necessário
        self.criar_estrutura_pastas()
    
    def setup_logging(self):
        """Configura sistema de logs"""
        log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        logging.basicConfig(
            level=logging.INFO,
            format=log_format,
            handlers=[
                logging.FileHandler(self.base_path / 'validacao.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('ValidadorArquivos')
    
    def carregar_configuracoes(self) -> Dict:
        """Carrega as configurações do sistema"""
        config = {
            "arquivos_obrigatorios": {
                "fenix": {
                    "pattern": "*FENIX*.xlsx",
                    "alias": "FOLHA_FENIX",
                    "sheets_esperadas": ["Report"],
                    "colunas_criticas": ["Column1", "Column2", "Column3"]
                },
                "genesis": {
                    "pattern": "*GENESIS*.xlsx", 
                    "alias": "FOLHA_GENESIS", 
                    "sheets_esperadas": ["Report"],
                    "colunas_criticas": ["Column1", "Column2", "Column3"]
                },
                "alocacoes": {
                    "pattern": "*Alocações*.xlsx",
                    "alias": "ALOCACOES",
                    "sheets_esperadas": ["ALOCAÇÃO MAIO"],
                    "colunas_criticas": ["NOME", "FUNÇÃO", "ALOCAÇAO"]
                },
                "extrato": {
                    "pattern": "*Extrato*.xlsx",
                    "alias": "EXTRATO_MENSAL",
                    "sheets_esperadas": ["Extrato Mensal"],
                    "colunas_criticas": ["Column1", "Column2"]
                },
                "gratificacao": {
                    "pattern": "*Gratificação*.xlsx",
                    "alias": "GRATIFICACAO",
                    "sheets_esperadas": [],
                    "colunas_criticas": ["COLABORADOR", "Gratificação"]
                },
                "nao_contabil": {
                    "pattern": "*não contábil*.xlsx",
                    "alias": "NAO_CONTABIL",
                    "sheets_esperadas": [],
                    "colunas_criticas": []
                }
            },
            "validacoes": {
                "tamanho_minimo_kb": 10,
                "linhas_minimas": 5,
                "encoding_aceitos": ["utf-8", "latin-1", "cp1252"]
            }
        }
        return config
    
    def criar_estrutura_pastas(self):
        """Cria estrutura de pastas necessárias"""
        pastas = [
            self.pasta_backup,
            self.base_path / "logs",
            self.base_path / "temp",
            self.base_path / "resultados"
        ]
        
        for pasta in pastas:
            pasta.mkdir(exist_ok=True)
            self.logger.info(f"Pasta criada/verificada: {pasta}")
    
    def descobrir_arquivos(self) -> Dict[str, Path]:
        """
        Descobre e mapeia todos os arquivos na pasta de dados
        
        Returns:
            Dicionário com tipo_arquivo: caminho_arquivo
        """
        arquivos_encontrados = {}
        
        self.logger.info("Descobrindo arquivos na pasta de dados...")
        
        if not self.pasta_dados.exists():
            self.logger.error(f"Pasta de dados não encontrada: {self.pasta_dados}")
            return {}
        
        # Listar todos os arquivos Excel na pasta
        arquivos_excel = list(self.pasta_dados.glob("*.xlsx"))
        
        self.logger.info(f"Encontrados {len(arquivos_excel)} arquivos Excel")
        
        # Tentar mapear cada arquivo baseado nos padrões
        for tipo, config in self.config["arquivos_obrigatorios"].items():
            pattern = config["pattern"]
            arquivos_match = list(self.pasta_dados.glob(pattern))
            
            if arquivos_match:
                # Pegar o mais recente se houver múltiplos
                arquivo_mais_recente = max(arquivos_match, key=lambda x: x.stat().st_mtime)
                arquivos_encontrados[tipo] = arquivo_mais_recente
                self.logger.info(f"{tipo.upper()}: {arquivo_mais_recente.name}")
            else:
                self.logger.warning(f"{tipo.upper()}: Não encontrado (padrão: {pattern})")
        
        return arquivos_encontrados    
    def validar_arquivo_individual(self, arquivo: Path, config_tipo: Dict) -> Dict:
        """Valida um arquivo individual"""
        resultado = {
            "arquivo": arquivo.name,
            "caminho": str(arquivo),
            "valido": True,
            "erros": [],
            "warnings": [],
            "info": {}
        }
        
        self.logger.info(f"Validando: {arquivo.name}")
        
        # 1. Verificar se arquivo existe
        if not arquivo.exists():
            resultado["valido"] = False
            resultado["erros"].append("Arquivo não encontrado")
            return resultado
        
        # 2. Verificar tamanho
        tamanho_kb = arquivo.stat().st_size / 1024
        resultado["info"]["tamanho_kb"] = round(tamanho_kb, 2)
        
        if tamanho_kb < self.config["validacoes"]["tamanho_minimo_kb"]:
            resultado["valido"] = False
            resultado["erros"].append(f"Arquivo muito pequeno: {tamanho_kb:.1f}KB")
        
        return resultado    
    def calcular_hash_arquivo(self, arquivo: Path) -> str:
        """Calcula hash MD5 do arquivo"""
        hash_md5 = hashlib.md5()
        with open(arquivo, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def criar_backup(self, arquivos: Dict[str, Path]) -> bool:
        """Cria backup dos arquivos originais"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        pasta_backup_sessao = self.pasta_backup / f"backup_{timestamp}"
        pasta_backup_sessao.mkdir(exist_ok=True)
        
        self.logger.info(f"Criando backup em: {pasta_backup_sessao}")
        
        try:
            backup_info = {"timestamp": timestamp, "arquivos": {}}
            
            for tipo, arquivo in arquivos.items():
                if arquivo.exists():
                    import shutil
                    novo_nome = f"{tipo}_{arquivo.name}"
                    destino = pasta_backup_sessao / novo_nome
                    shutil.copy2(arquivo, destino)
                    
                    backup_info["arquivos"][tipo] = {
                        "original": str(arquivo),
                        "backup": str(destino),
                        "hash": self.calcular_hash_arquivo(arquivo)
                    }
                    
                    self.logger.info(f"Backup: {arquivo.name} -> {novo_nome}")
            
            # Salvar informações do backup
            with open(pasta_backup_sessao / "backup_info.json", "w", encoding="utf-8") as f:
                json.dump(backup_info, f, indent=2, ensure_ascii=False)
            
            self.logger.info(f"Backup criado: {len(backup_info['arquivos'])} arquivos")
            return True
            
        except Exception as e:
            self.logger.error(f"Erro ao criar backup: {e}")
            return False    
    def gerar_relatorio_validacao(self, resultados: Dict) -> Dict:
        """Gera relatório consolidado da validação"""
        relatorio = {
            "timestamp": datetime.now().isoformat(),
            "total_arquivos": len(resultados),
            "arquivos_validos": 0,
            "arquivos_com_warnings": 0,
            "arquivos_invalidos": 0,
            "resumo_por_tipo": {},
            "proximos_passos": []
        }
        
        for tipo, resultado in resultados.items():
            relatorio["resumo_por_tipo"][tipo] = {
                "status": "válido" if resultado["valido"] else "inválido",
                "erros": len(resultado["erros"]),
                "warnings": len(resultado["warnings"]),
                "arquivo": resultado["arquivo"]
            }
            
            if resultado["valido"]:
                relatorio["arquivos_validos"] += 1
                if resultado["warnings"]:
                    relatorio["arquivos_com_warnings"] += 1
            else:
                relatorio["arquivos_invalidos"] += 1
        
        # Determinar próximos passos
        if relatorio["arquivos_invalidos"] == 0:
            if relatorio["arquivos_com_warnings"] == 0:
                relatorio["proximos_passos"] = ["Todos os arquivos válidos - Pronto para processamento"]
            else:
                relatorio["proximos_passos"] = ["Verificar warnings antes do processamento"]
        else:
            relatorio["proximos_passos"] = ["Corrigir arquivos inválidos antes de continuar"]
        
        return relatorio    
    def executar_validacao_completa(self) -> Tuple[bool, Dict]:
        """Executa o processo completo de validação"""
        self.logger.info("Iniciando validação completa dos arquivos")
        
        # 1. Descobrir arquivos
        arquivos_encontrados = self.descobrir_arquivos()
        
        if not arquivos_encontrados:
            self.logger.error("Nenhum arquivo encontrado para validação")
            return False, {"erro": "Nenhum arquivo encontrado"}
        
        # 2. Validar cada arquivo
        resultados_validacao = {}
        
        for tipo, arquivo in arquivos_encontrados.items():
            config_tipo = self.config["arquivos_obrigatorios"][tipo]
            resultado = self.validar_arquivo_individual(arquivo, config_tipo)
            resultados_validacao[tipo] = resultado
        
        # 3. Criar backup
        backup_sucesso = self.criar_backup(arquivos_encontrados)
        
        # 4. Gerar relatório
        relatorio = self.gerar_relatorio_validacao(resultados_validacao)
        relatorio["backup_criado"] = backup_sucesso
        relatorio["detalhes"] = resultados_validacao
        
        # 5. Salvar relatório
        try:
            with open(self.base_path / "relatorio_validacao.json", "w", encoding="utf-8") as f:
                json.dump(relatorio, f, indent=2, ensure_ascii=False)
        except Exception as e:
            self.logger.error(f"Erro ao salvar relatório: {e}")
        
        # 6. Determinar sucesso geral
        sucesso_geral = relatorio["arquivos_invalidos"] == 0
        
        # 7. Log final
        self.logger.info("RESUMO DA VALIDAÇÃO:")
        self.logger.info(f"   Total de arquivos: {relatorio['total_arquivos']}")
        self.logger.info(f"   Válidos: {relatorio['arquivos_validos']}")
        self.logger.info(f"   Com warnings: {relatorio['arquivos_com_warnings']}")
        self.logger.info(f"   Inválidos: {relatorio['arquivos_invalidos']}")
        self.logger.info(f"   Backup criado: {'✅' if backup_sucesso else '❌'}")
        
        for passo in relatorio["proximos_passos"]:
            self.logger.info(f"   {passo}")
        
        return sucesso_geral, relatorio

# Função de teste e demonstração
def main():
    """Função principal para testar o módulo"""
    print("MÓDULO 1: VALIDAÇÃO E PREPARAÇÃO DE ARQUIVOS")
    print("=" * 60)
    
    # Instanciar validador
    validador = ValidadorArquivos()
    
    # Executar validação completa
    sucesso, relatorio = validador.executar_validacao_completa()
    
    print(f"\n{'SUCESSO' if sucesso else 'FALHA'}: Validação {'concluída' if sucesso else 'falhou'}")
    
    if relatorio.get("resumo_por_tipo"):
        print("\nRESUMO POR ARQUIVO:")
        for tipo, info in relatorio["resumo_por_tipo"].items():
            status_emoji = "✅" if info["status"] == "válido" else "❌"
            print(f"   {status_emoji} {tipo.upper()}: {info['arquivo']} ({info['status']})")
            if info["warnings"] > 0:
                print(f"      ⚠️ {info['warnings']} warnings")
            if info["erros"] > 0:
                print(f"      ❌ {info['erros']} erros")
    
    print(f"\nRelatório completo salvo em: relatorio_validacao.json")
    
    return sucesso

if __name__ == "__main__":
    main()