import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const PayrollTable = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const payrollItems = [
    { evt: "0010", description: "Salário Base", qty: "220,00", baseCalc: "0,00", value: 7875.00, type: "payment" },
    { evt: "3019", description: "Gratificação", qty: "40,00", baseCalc: "0,00", value: 3150.00, type: "payment" },
    { evt: "5500", description: "IR Retido", qty: "0,00", baseCalc: "10.073,38", value: -1861.45, type: "discount" },
    { evt: "5560", description: "INSS", qty: "0,00", baseCalc: "8.157,41", value: -951.62, type: "discount" },
    { evt: "1330", description: "FGTS RecMes - Remun", qty: "0,00", baseCalc: "0,00", value: 882.00, type: "benefit" },
  ];

  const getValueBadge = (type: string, value: number) => {
    if (type === "payment") {
      return <Badge variant="default" className="bg-success text-success-foreground">+{formatCurrency(Math.abs(value))}</Badge>;
    } else if (type === "discount") {
      return <Badge variant="destructive">-{formatCurrency(Math.abs(value))}</Badge>;
    } else {
      return <Badge variant="outline">{formatCurrency(value)}</Badge>;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Detalhamento da Folha de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Evt</TableHead>
              <TableHead>Denominação</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Base Cálculo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrollItems.map((item) => (
              <TableRow key={item.evt}>
                <TableCell className="font-mono text-sm">{item.evt}</TableCell>
                <TableCell className="font-medium">{item.description}</TableCell>
                <TableCell className="text-right font-mono">{item.qty}</TableCell>
                <TableCell className="text-right font-mono">{item.baseCalc}</TableCell>
                <TableCell className="text-right">
                  {getValueBadge(item.type, item.value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Summary row */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Pagamentos</p>
              <p className="text-xl font-bold text-success">{formatCurrency(11025.00)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Descontos</p>
              <p className="text-xl font-bold text-destructive">{formatCurrency(2813.07)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Líquido</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(8211.93)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};