import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialData {
  totalPayments: number;
  totalDiscounts: number;
  netValue: number;
}

interface DynamicFinancialSummaryProps {
  financial: FinancialData;
}

export const DynamicFinancialSummary = ({ financial }: DynamicFinancialSummaryProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular encargos baseado em aproximação (cerca de 27% do salário)
  const estimatedCharges = financial.totalPayments * 0.27;

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Card className="shadow-card border-l-4 border-l-success">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            Total Pagamentos
            <TrendingUp className="h-4 w-4 text-success" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{formatCurrency(financial.totalPayments)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Salário + Gratificações
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-card border-l-4 border-l-destructive">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            Total Descontos
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(financial.totalDiscounts)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            IR + INSS
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-card border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            Salário Líquido
            <DollarSign className="h-4 w-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{formatCurrency(financial.netValue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Valor a receber
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-card border-l-4 border-l-accent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            Total Encargos
            <PiggyBank className="h-4 w-4 text-accent" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{formatCurrency(estimatedCharges)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Custos da empresa
          </p>
        </CardContent>
      </Card>
    </div>
  );
};