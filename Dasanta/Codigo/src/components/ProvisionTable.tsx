import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ProvisionTable = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const vacationProvisions = [
    { description: "Prov. Férias - Valor Mês", value: 1225.00 },
    { description: "Prov. Férias INSS - Valor Mês", value: 340.55 },
    { description: "Prov. Férias FGTS - Valor Mês", value: 98.00 },
    { description: "Prov. Férias - Saldo Atual", value: 26950.00 },
    { description: "Prov. Férias INSS - Saldo Atual", value: 7492.10 },
    { description: "Prov. Férias FGTS - Saldo Atual", value: 2156.00 },
  ];

  const thirteenthProvisions = [
    { description: "Prov. 13º Sal - Valor Mês", value: 918.75 },
    { description: "Prov. 13º Sal INSS - Valor Mês", value: 255.41 },
    { description: "Prov. 13º Sal FGTS - Valor Mês", value: 73.50 },
    { description: "Prov. 13º Sal - Acm. Atual", value: 5512.50 },
    { description: "Prov. 13º Sal INSS - Acm. Atual", value: 1532.48 },
    { description: "Prov. 13º Sal FGTS - Acm. Atual", value: 441.00 },
  ];

  const employerCharges = [
    { description: "INSS Empregador", rate: "20,00%", value: 2205.00 },
    { description: "RAT", rate: "2,00%", value: 220.50 },
    { description: "Salário Educação", rate: "2,50%", value: 275.63 },
    { description: "INCRA", rate: "0,20%", value: 22.05 },
    { description: "SENAC", rate: "1,00%", value: 110.25 },
    { description: "SESC", rate: "1,50%", value: 165.38 },
    { description: "SEBRAE", rate: "0,60%", value: 66.15 },
  ];

  return (
    <Tabs defaultValue="provisions" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="provisions">Provisões</TabsTrigger>
        <TabsTrigger value="thirteenth">13º Salário</TabsTrigger>
        <TabsTrigger value="charges">Encargos</TabsTrigger>
      </TabsList>

      <TabsContent value="provisions">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Provisões de Férias</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vacationProvisions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.value)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-bold">
                  <TableCell>Total Provisões Férias</TableCell>
                  <TableCell className="text-right text-accent">
                    {formatCurrency(vacationProvisions.reduce((sum, item) => sum + item.value, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="thirteenth">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Provisões 13º Salário</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {thirteenthProvisions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.value)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-bold">
                  <TableCell>Total Provisões 13º</TableCell>
                  <TableCell className="text-right text-accent">
                    {formatCurrency(thirteenthProvisions.reduce((sum, item) => sum + item.value, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="charges">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Encargos Patronais</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Alíquota</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employerCharges.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right font-mono">{item.rate}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.value)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-bold">
                  <TableCell colSpan={2}>Total Encargos</TableCell>
                  <TableCell className="text-right text-accent">
                    {formatCurrency(employerCharges.reduce((sum, item) => sum + item.value, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};