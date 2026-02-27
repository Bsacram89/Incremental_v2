// Script para Tabular Editor
// Adiciona medidas de moeda estrangeira para análise financeira
// Usa USERELATIONSHIP para vincular às datas corretas

// Identifique a tabela onde as medidas serão adicionadas
var table = Model.Tables["Base de Dados"];

// Se a tabela não existir, mostra mensagem de erro
if (table == null) {
    Error("Tabela 'Base de Dados' não encontrada. Ajuste o nome da tabela no início do script.");
    return;
}

// ========== MEDIDAS DE MOEDA ESTRANGEIRA ==========

// Saldo Inicial do Mês ME
var m1 = table.AddMeasure(
    "Saldo Inicial do Mês ME",
    "VAR PrimeiraDataDoMes = DATE(YEAR(MAX(dCalendario[Date])), MONTH(MAX(dCalendario[Date])), 1) " +
    "VAR SaldoInicial = CALCULATE( " +
    "    SUM('Base de Dados'[MOEDA ESTRANGEIRA]), " +
    "    'Base de Dados'[PAGTO] < PrimeiraDataDoMes, " +
    "    'Base de Dados'[STATUS] = \"Pago\", " +
    "    USERELATIONSHIP('Base de Dados'[PAGTO], dCalendario[Date]) " +
    ") " +
    "RETURN SaldoInicial",
    "Fluxo de Caixa"
);
m1.DisplayFolder = "Medidas Fluxo de Caixa\\Moeda Estrangeira\\Valores Principais";
m1.FormatString = "#,##0.00";

// Total Receitas Realizadas ME
var m2 = table.AddMeasure(
    "Total Receitas Realizadas ME",
    "CALCULATE( " +
    "    SUM('Base de Dados'[MOEDA ESTRANGEIRA]), " +
    "    'Base de Dados'[STATUS] = \"Pago\", " +
    "    'Base de Dados'[GRUPO | DÉB CRÉD] = \"SAÍDAS\", " +
    "    USERELATIONSHIP('Base de Dados'[PAGTO], dCalendario[Date]) " +
    ")",
    "Fluxo de Caixa"
);
m2.DisplayFolder = "Medidas Fluxo de Caixa\\Moeda Estrangeira\\Valores Principais";
m2.FormatString = "#,##0.00";

// Total Despesas Realizadas ME
var m3 = table.AddMeasure(
    "Total Despesas Realizadas ME",
    "CALCULATE( " +
    "    ABS(SUM('Base de Dados'[MOEDA ESTRANGEIRA])), " +
    "    'Base de Dados'[STATUS] = \"Pago\", " +
    "    'Base de Dados'[GRUPO | DÉB CRÉD] = \"ENTRADAS\", " +
    "    USERELATIONSHIP('Base de Dados'[PAGTO], dCalendario[Date]) " +
    ")",
    "Fluxo de Caixa"
);
m3.DisplayFolder = "Medidas Fluxo de Caixa\\Moeda Estrangeira\\Valores Principais";
m3.FormatString = "#,##0.00";

// Lucratividade ME
var m4 = table.AddMeasure(
    "Lucratividade ME",
    "VAR Receitas = [Total Receitas Realizadas ME] " +
    "VAR Despesas = [Total Despesas Realizadas ME] " +
    "RETURN DIVIDE(Receitas - Despesas, Receitas, 0)",
    "Fluxo de Caixa"
);
m4.DisplayFolder = "Medidas Fluxo de Caixa\\Moeda Estrangeira\\Indicadores";
m4.FormatString = "0.0%";

// Despesas Previstas ME
var m5 = table.AddMeasure(
    "Despesas Previstas ME",
    "CALCULATE( " +
    "    ABS(SUM('Base de Dados'[MOEDA ESTRANGEIRA])), " +
    "    'Base de Dados'[STATUS] = \"Em aberto\", " +
    "    'Base de Dados'[GRUPO | DÉB CRÉD] = \"ENTRADAS\", " +
    "    USERELATIONSHIP('Base de Dados'[VENCIMENTO], dCalendario[Date]) " +
    ")",
    "Fluxo de Caixa"
);
m5.DisplayFolder = "Medidas Fluxo de Caixa\\Moeda Estrangeira\\Valores Principais";
m5.FormatString = "#,##0.00";

// Receitas Previstas ME
var m6 = table.AddMeasure(
    "Receitas Previstas ME",
    "CALCULATE( " +
    "    SUM('Base de Dados'[MOEDA ESTRANGEIRA]), " +
    "    'Base de Dados'[STATUS] = \"Em aberto\", " +
    "    'Base de Dados'[GRUPO | DÉB CRÉD] = \"SAÍDAS\", " +
    "    USERELATIONSHIP('Base de Dados'[VENCIMENTO], dCalendario[Date]) " +
    ")",
    "Fluxo de Caixa"
);
m6.DisplayFolder = "Medidas Fluxo de Caixa\\Moeda Estrangeira\\Valores Principais";
m6.FormatString = "#,##0.00";

// Saldo Projetado ME
var m7 = table.AddMeasure(
    "Saldo Projetado ME",
    "VAR SaldoAtual = [Saldo Inicial do Mês ME] + [Total Receitas Realizadas ME] - [Total Despesas Realizadas ME] " +
    "VAR SaldoFuturo = SaldoAtual + [Receitas Previstas ME] - [Despesas Previstas ME] " +
    "RETURN SaldoFuturo",
    "Fluxo de Caixa"
);
m7.DisplayFolder = "Medidas Fluxo de Caixa\\Moeda Estrangeira\\Valores Principais";
m7.FormatString = "#,##0.00";

// Saldo Real Acumulado ME
var m8 = table.AddMeasure(
    "Saldo Real Acumulado ME",
    "VAR SaldoInicial = [Saldo Inicial do Mês ME] " +
    "VAR FluxoRealizado = [Total Receitas Realizadas ME] - [Total Despesas Realizadas ME] " +
    "RETURN SaldoInicial + FluxoRealizado",
    "Fluxo de Caixa"
);
m8.DisplayFolder = "Medidas Fluxo de Caixa\\Moeda Estrangeira\\Fluxo Completo";
m8.FormatString = "#,##0.00";

// Notificação após conclusão
Info("8 medidas de Moeda Estrangeira foram adicionadas com sucesso!");
