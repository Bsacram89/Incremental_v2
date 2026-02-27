import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FinancialSummary = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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
          <div className="text-2xl font-bold text-success">{formatCurrency(11025.00)}</div>
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
          <div className="text-2xl font-bold text-destructive">{formatCurrency(2813.07)}</div>
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
          <div className="text-2xl font-bold text-primary">{formatCurrency(8211.93)}</div>
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
          <div className="text-2xl font-bold text-accent">{formatCurrency(3064.96)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Custos da empresa
          </p>
        </CardContent>
      </Card>
    </div>
  );
};