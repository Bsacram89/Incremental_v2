import { useState, useEffect } from "react";
import { DynamicPayrollHeader } from "@/components/DynamicPayrollHeader";
import { DynamicEmployeeCard } from "@/components/DynamicEmployeeCard";
import { DynamicFinancialSummary } from "@/components/DynamicFinancialSummary";
import { PayrollTable } from "@/components/PayrollTable";
import { ProvisionTable } from "@/components/ProvisionTable";
import { FileUpload } from "@/components/FileUpload";
import { FileUploadImproved } from "@/components/FileUploadImproved";
import { MultiEmployeeManager } from "@/components/MultiEmployeeManager";
import { EditForms } from "@/components/EditForms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, Database, Users } from "lucide-react";

interface Employee {
  codigo: string;
  nome: string;
  admissao: string;
  sexo: string;
  funcao: string;
  salario: number;
  vinculo: string;
  tipoSalario: string;
  proventos: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    baseCalculo: number;
    valor: number;
  }>;
  descontos: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    baseCalculo: number;
    valor: number;
  }>;
  resumoFinanceiro: {
    totalPagamentos: number;
    totalDescontos: number;
    liquido: number;
    fgts: number;
  };
}

const Index = () => {
  const [payrollData, setPayrollData] = useState({
    company: {
      name: "NOVA TERRA DE SANTA CRUZ LTDA",
      cnpj: "51.838.101/0001-77"
    },
    period: "01/06/2025 a 30/06/2025",
    employee: {
      name: "LISA KEIKO YAMASHITA AOKI",
      role: "GERENTE ADMINISTRATIVO",
      admission: "08/09/2023",
      salary: 7875.00
    },
    financial: {
      totalPayments: 11025.00,
      totalDiscounts: 2813.07,
      netValue: 8211.93
    }
  });

  const [fullPayrollData, setFullPayrollData] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = (newData: any) => {
    setPayrollData(newData);
    
    // Se há dados completos (múltiplos funcionários)
    if (newData.fullData) {
      setFullPayrollData(newData.fullData);
      setSelectedEmployee(newData.fullData.funcionarios[0]);
      setSelectedEmployeeIndex(0);
    }
  };

  const handleEmployeeSelect = (employee: Employee, index: number) => {
    setSelectedEmployee(employee);
    setSelectedEmployeeIndex(index);
    
    // Atualizar dados do payrollData para compatibilidade com componentes existentes
    setPayrollData(prev => ({
      ...prev,
      employee: {
        name: employee.nome,
        role: employee.funcao,
        admission: employee.admissao,
        salary: employee.salario
      },
      financial: {
        totalPayments: employee.resumoFinanceiro.totalPagamentos,
        totalDiscounts: employee.resumoFinanceiro.totalDescontos,
        netValue: employee.resumoFinanceiro.liquido
      }
    }));
  };

  const handleDataUpdate = (updatedData: any) => {
    setPayrollData(updatedData);
  };

  // Funções de exportação
  const exportToJSON = () => {
    const dataToExport = fullPayrollData || {
      empresa: {
        nome: payrollData.company.name,
        cnpj: payrollData.company.cnpj,
        competencia: payrollData.period
      },
      funcionarios: [{
        nome: payrollData.employee.name,
        funcao: payrollData.employee.role,
        admissao: payrollData.employee.admission,
        salario: payrollData.employee.salary,
        resumoFinanceiro: payrollData.financial
      }]
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folha-pagamento-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportação JSON",
      description: "Dados exportados com sucesso!",
      variant: "default"
    });
  };

  const exportToCSV = () => {
    const employees = fullPayrollData?.funcionarios || [{
      nome: payrollData.employee.name,
      funcao: payrollData.employee.role,
      resumoFinanceiro: payrollData.financial
    }];

    const csvContent = [
      ['Nome', 'Função', 'Salário Bruto', 'Descontos', 'Salário Líquido'].join(','),
      ...employees.map((emp: any) => [
        emp.nome,
        emp.funcao,
        emp.resumoFinanceiro?.totalPagamentos || emp.salary || 0,
        emp.resumoFinanceiro?.totalDescontos || 0,
        emp.resumoFinanceiro?.liquido || emp.netValue || 0
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folha-pagamento-${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportação CSV",
      description: "Dados exportados com sucesso!",
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        <DynamicPayrollHeader company={payrollData.company} period={payrollData.period} />
        
        {/* Badge de Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {fullPayrollData?.funcionarios && fullPayrollData.funcionarios.length > 1 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {fullPayrollData.funcionarios.length} funcionários carregados
              </Badge>
            )}
            {selectedEmployee && (
              <Badge variant="outline">
                Visualizando: {selectedEmployee.nome}
              </Badge>
            )}
          </div>
          
          {/* Botões de Exportação */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToJSON}>
              <Database className="h-4 w-4 mr-2" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="employees">Funcionários</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="edit">Editar</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <DynamicEmployeeCard employee={payrollData.employee} />
            <DynamicFinancialSummary financial={payrollData.financial} />
            <PayrollTable />
            <ProvisionTable />
          </TabsContent>

          <TabsContent value="employees" className="space-y-8">
            {fullPayrollData?.funcionarios ? (
              <MultiEmployeeManager 
                employees={fullPayrollData.funcionarios}
                onEmployeeSelect={handleEmployeeSelect}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gerenciamento de Funcionários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum arquivo processado</h3>
                    <p className="text-muted-foreground mb-4">
                      Faça upload de um arquivo de folha de pagamento para visualizar os funcionários
                    </p>
                    <Button variant="outline" onClick={() => document.querySelector('[data-state="active"][value="upload"]')?.click()}>
                      Ir para Upload
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Upload Básico</h3>
                <FileUpload onFileUploaded={handleFileUpload} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Upload Avançado</h3>
                <FileUploadImproved onFileUploaded={handleFileUpload} />
              </div>
            </div>
            
            {/* Instruções de uso */}
            <Card>
              <CardHeader>
                <CardTitle>Como usar o Upload Avançado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>✅ <strong>Múltiplos funcionários:</strong> Detecta e processa vários funcionários em um único arquivo</p>
                  <p>✅ <strong>Tratamento de erros:</strong> Validação robusta e mensagens de erro claras</p>
                  <p>✅ <strong>Extração completa:</strong> Captura todos os eventos financeiros (proventos e descontos)</p>
                  <p>✅ <strong>Visualização instantânea:</strong> Preview dos dados processados antes de carregar</p>
                  <p>✅ <strong>Compatibilidade:</strong> Funciona com diferentes formatos de folha de pagamento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit" className="space-y-8">
            <EditForms data={payrollData} onDataUpdate={handleDataUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;