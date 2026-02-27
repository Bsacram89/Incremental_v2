// Script para Tabular Editor
// Adiciona medidas de inadimplência e análise financeira
// Usa USERELATIONSHIP para vincular às datas corretas

// Identifique a tabela onde as medidas serão adicionadas
var table = Model.Tables["Base de Dados"];

// Se a tabela não existir, mostra mensagem de erro
if (table == null) {
    Error("Tabela 'Base de Dados' não encontrada. Ajuste o nome da tabela no início do script.");
    return;
}

// ========== MEDIDAS DE INADIMPLÊNCIA ==========

// Taxa de Inadimplência (Valor)
var m1 = table.AddMeasure(
    "Taxa de Inadimplência (Valor)",
    "VAR TotalVencido = CALCULATE(ABS(SUM('Base de Dados'[REAL])), 'Base de Dados'[STATUS] = \"Em aberto\", 'Base de Dados'[VENCIMENTO] < TODAY(), 'Base de Dados'[GRUPO | DÉB CRÉD] = \"ENTRADAS\", USERELATIONSHIP('Base de Dados'[VENCIMENTO], dCalendario[Date])) " + 
    "VAR TotalDevido = CALCULATE(ABS(SUM('Base de Dados'[REAL])), ('Base de Dados'[STATUS] = \"Em aberto\" || 'Base de Dados'[STATUS] = \"Pago\"), 'Base de Dados'[GRUPO | DÉB CRÉD] = \"ENTRADAS\", USERELATIONSHIP('Base de Dados'[VENCIMENTO], dCalendario[Date])) " +
    "RETURN DIVIDE(TotalVencido, TotalDevido, 0)",
    "Fluxo de Caixa"
);
m1.DisplayFolder = "Medidas Fluxo de Caixa\\Inadimplência";
m1.FormatString = "0.0%";

// Taxa de Inadimplência (Quantidade)
var m2 = table.AddMeasure(
    "Taxa de Inadimplência (Qtd)",
    "VAR QtdVencida = CALCULATE(COUNTROWS('Base de Dados'), 'Base de Dados'[STATUS] = \"Em aberto\", 'Base de Dados'[VENCIMENTO] < TODAY(), 'Base de Dados'[GRUPO | DÉB CRÉD] = \"ENTRADAS\", USERELATIONSHIP('Base de Dados'[VENCIMENTO], dCalendario[Date])) " + 
    "VAR QtdTotal = CALCULATE(COUNTROWS('Base de Dados'), ('Base de Dados'[STATUS] = \"Em aberto\" || 'Base de Dados'[STATUS] = \"Pago\"), 'Base de Dados'[GRUPO | DÉB CRÉD] = \"ENTRADAS\", USERELATIONSHIP('Base de Dados'[VENCIMENTO], dCalendario[Date])) " +
    "RETURN DIVIDE(QtdVencida, QtdTotal, 0)",
    "Fluxo de Caixa"
);
m2.DisplayFolder = "Medidas Fluxo de Caixa\\Inadimplência";
m2.FormatString = "0.0%";

// Valor em Atraso por Faixa (0-30 dias)
var m3 = table.AddMeasure(
    "Valor em Atraso 0-30 dias",
    "CALCULATE(ABS(SUM('Base de Dados'[REAL])), 'Base de Dados'[STATUS] = \"Em aberto\", 'Base de Dados'[VENCIMENTO] < TODAY(), 'Base de Dados'[VENCIMENTO] >= TODAY() - 30, 'Base de Dados'[GRUPO | DÉB CRÉD] = \"ENTRADAS\", USERELATIONSHIP('Base de Dados'[VENCIMENTO], dCalendario[Date]))",
    "Fluxo de Caixa"
);
m3.DisplayFolder = "Medidas Fluxo de Caixa\\Inadimplência\\Faixas de Atraso";
m3.FormatString = "R$ #,##0.00";

// Valor em Atraso por Faixa (31-60 dias)
var m4 = table.AddMeasure(
    "Valor em Atraso 31-60 dias",
    "CALCULATE(ABS(SUM('Base de Dados'[REAL])), 'Base de Dados'[STATUS] = \"Em aberto\", 'Base de Dados'[VENCIMENTO] < TODAY() - 30, 'Base de Dados'[VENCIMENTO] >= TODAY() - 60, 'Base de Dados'[GRUPO | DÉB CRÉD] = \"ENTRADAS\", USERELATIONSHIP('Base de Dados'[VENCIMENTO], dCalendario[Date]))",
    "Fluxo de Caixa"
);
m4.DisplayFolder = "Medidas Fluxo de Caixa\\Inadimplência\\Faixas de Atraso";
m4.FormatString = "R$ #,##0.00";

// Valor em Atraso por Faixa (>60 dias)
var m5 = table.AddMeasure(
    "Valor em Atraso >60 dias",
    "CALCULATE(ABS(SUM('Base de Dados'[REAL])), 'Base de Dados'[STATUS] = \"Em aberto\", 'Base de Dados'[VENCIMENTO] < TODAY() - 60, 'Base de Dados'[GRUPO | DÉB CRÉD] = \"ENTRADAS\", USERELATIONSHIP('Base de Dados'[VENCIMENTO], dCalendario[Date]))",
    "Fluxo de Caixa"
);
m5.DisplayFolder = "Medidas Fluxo de Caixa\\Inadimplência\\Faixas de Atraso";
m5.FormatString = "R$ #,##0.00";

// ========== ANÁLISE DE RECEITAS ==========

// Receitas Realizadas por Mês
var m6 = table.AddMeasure(
    "Receitas Realizadas por Mês",
    "CALCULATE(SUM('Base de Dados'[REAL]), 'Base de Dados'[STATUS] = \"Pago\", 'Base de Dados'[GRUPO | DÉB CRÉD] = \"SAÍDAS\", USERELATIONSHIP('Base de Dados'[PAGTO], dCalendario[Date]))",
    "Fluxo de Caixa"
);
m6.DisplayFolder = "Medidas Fluxo de Caixa\\Análise de Receitas";
m6.FormatString = "R$ #,##0.00";

// Crescimento Receitas MoM
var m7 = table.AddMeasure(
    "Crescimento Receitas MoM",
    "VAR MesAtual = CALCULATE(SUM('Base de Dados'[REAL]), 'Base de Dados'[STATUS] = \"Pago\", 'Base de Dados'[GRUPO | DÉB CRÉD] = \"SAÍDAS\", MONTH('Base de Dados'[PAGTO]) = MONTH(TODAY()) && YEAR('Base de Dados'[PAGTO]) = YEAR(TODAY()), USERELATIONSHIP('Base de Dados'[PAGTO], dCalendario[Date])) " +
    "VAR MesAnterior = CALCULATE(SUM('Base de Dados'[REAL]), 'Base de Dados'[STATUS] = \"Pago\", 'Base de Dados'[GRUPO | DÉB CRÉD] = \"SAÍDAS\", MONTH('Base de Dados'[PAGTO]) = MONTH(TODAY())-1 && YEAR('Base de Dados'[PAGTO]) = YEAR(TODAY()), USERELATIONSHIP('Base de Dados'[PAGTO], dCalendario[Date])) " +
    "RETURN DIVIDE(MesAtual - MesAnterior, ABS(MesAnterior), 0)",
    "Fluxo de Caixa"
);
m7.DisplayFolder = "Medidas Fluxo de Caixa\\Análise de Receitas";
m7.FormatString = "0.0%";

// Média Móvel Receitas (3 meses)
var m8 = table.AddMeasure(
    "Média Móvel Receitas (3m)",
    "AVERAGEX(DATESINPERIOD(dCalendario[Date], MAX(dCalendario[Date]), -3, MONTH), [Receitas Realizadas por Mês])",
    "Fluxo de Caixa"
);
m8.DisplayFolder = "Medidas Fluxo de Caixa\\Análise de Receitas";
m8.FormatString = "R$ #,##0.00";

// ========== ANÁLISE DE DESPESAS ==========

// Despesas Realizadas por Mês
var m9 = table.AddMeasure(
    "Despesas Realizadas por Mês",
    "CALCULATE(ABS(SUM('Base de Dados'[REAL])), 'Base de Dados'[STATUS] = \"Pago\", 'Base de Dados'[GRUPO | DÉB CRÉD] = \"ENTRADAS\", USERELATIONSHIP('Base de Dados'[PAGTO], dCalendario[Date]))",
    "Fluxo de Caixa"
);
m9.DisplayFolder = "Medidas Fluxo de Caixa\\Análise de Despesas";
m9.FormatString = "R$ #,##0.00";

// Crescimento Despesas MoM
var m10 = table.AddMeasure(
    "Crescimento Despesas MoM",
    "VAR MesAtual = CALCULATE(ABS(SUM('Base de Dados'[REAL])), 'Base de Dados'[STATUS] = \"Pago\", 'Base de Dados'[GRUPO | DÉB CRÉD] = \"ENTRADAS\", MONTH('Base de Dados'[PAGTO]) = MONTH(TODAY()) && YEAR('Base de Dados'[PAGTO]) = YEAR(TODAY()), USERELATIONSHIP('Base de Dados'[PAGTO], dCalendario[Date])) " +
    "VAR MesAnterior = CALCULATE(ABS(SUM('Base de Dados'[REAL])), 'Base de Dados'[STATUS] = \"Pago\", 'Base de Dados'[GRUPO | DÉB CRÉD] = \"ENTRADAS\", MONTH('Base de Dados'[PAGTO]) = MONTH(TODAY())-1 && YEAR('Base de Dados'[PAGTO]) = YEAR(TODAY()), USERELATIONSHIP('Base de Dados'[PAGTO], dCalendario[Date])) " +
    "RETURN DIVIDE(MesAtual - MesAnterior, MesAnterior, 0)",
    "Fluxo de Caixa"
);
m10.DisplayFolder = "Medidas Fluxo de Caixa\\Análise de Despesas";
m10.FormatString = "0.0%";

// Média Móvel Despesas (3 meses)
var m11 = table.AddMeasure(
    "Média Móvel Despesas (3m)",
    "AVERAGEX(DATESINPERIOD(dCalendario[Date], MAX(dCalendario[Date]), -3, MONTH), [Despesas Realizadas por Mês])",
    "Fluxo de Caixa"
);
m11.DisplayFolder = "Medidas Fluxo de Caixa\\Análise de Despesas";
m11.FormatString = "R$ #,##0.00";

// ========== RELAÇÃO RECEITAS/DESPESAS ==========

// Índice Receitas/Despesas
var m12 = table.AddMeasure(
    "Índice Receitas/Despesas",
    "DIVIDE([Receitas Realizadas por Mês], [Despesas Realizadas por Mês], 0)",
    "Fluxo de Caixa"
);
m12.DisplayFolder = "Medidas Fluxo de Caixa\\Indicadores";
m12.FormatString = "0.00";

// Margem Financeira
var m13 = table.AddMeasure(
    "Margem Financeira",
    "DIVIDE([Receitas Realizadas por Mês] - [Despesas Realizadas por Mês], [Receitas Realizadas por Mês], 0)",
    "Fluxo de Caixa"
);
m13.DisplayFolder = "Medidas Fluxo de Caixa\\Indicadores";
m13.FormatString = "0.0%";

// Notificação após conclusão
Info("13 medidas adicionais de Inadimplência e Análise Financeira foram adicionadas com sucesso!");
