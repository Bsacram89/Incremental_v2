import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, User, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface Employee {
  codigo: string;
  nome: string;
  admissao: string;
  funcao: string;
  salario: number;
  resumoFinanceiro: {
    totalPagamentos: number;
    totalDescontos: number;
    liquido: number;
    fgts: number;
  };
}

interface MultiEmployeeManagerProps {
  employees: Employee[];
  onEmployeeSelect: (employee: Employee, index: number) => void;
}

export const MultiEmployeeManager = ({ employees, onEmployeeSelect }: MultiEmployeeManagerProps) => {
  const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState(0);

  if (!employees || employees.length === 0) {
    return null;
  }

  const selectedEmployee = employees[selectedEmployeeIndex];
  
  const totalSalaries = employees.reduce((sum, emp) => sum + emp.resumoFinanceiro.totalPagamentos, 0);
  const totalDiscounts = employees.reduce((sum, emp) => sum + emp.resumoFinanceiro.totalDescontos, 0);
  const totalNet = employees.reduce((sum, emp) => sum + emp.resumoFinanceiro.liquido, 0);

  const handleEmployeeChange = (index: string) => {
    const empIndex = parseInt(index);
    setSelectedEmployeeIndex(empIndex);
    onEmployeeSelect(employees[empIndex], empIndex);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Resumo da Folha de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
                <p className="text-sm text-blue-600">Funcionários</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalSalaries)}</p>
                <p className="text-sm text-green-600">Total Bruto</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalDiscounts)}</p>
                <p className="text-sm text-red-600">Total Descontos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(totalNet)}</p>
                <p className="text-sm text-orange-600">Total Líquido</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Funcionário */}
      {employees.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Selecionar Funcionário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={selectedEmployeeIndex.toString()} onValueChange={handleEmployeeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{employee.nome}</span>
                        <Badge variant="secondary" className="ml-2">
                          {formatCurrency(employee.resumoFinanceiro.liquido)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Lista de Funcionários */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all ${
                      index === selectedEmployeeIndex
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleEmployeeChange(index.toString())}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={index === selectedEmployeeIndex ? "default" : "secondary"}>
                            #{employee.codigo}
                          </Badge>
                          {index === selectedEmployeeIndex && (
                            <Badge variant="default">Selecionado</Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-sm truncate" title={employee.nome}>
                          {employee.nome}
                        </h3>
                        
                        <p className="text-xs text-muted-foreground truncate" title={employee.funcao}>
                          {employee.funcao}
                        </p>
                        
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600">
                              {formatCurrency(employee.resumoFinanceiro.totalPagamentos)}
                            </span>
                            <span className="text-red-600">
                              -{formatCurrency(employee.resumoFinanceiro.totalDescontos)}
                            </span>
                          </div>
                          <div className="text-center mt-1">
                            <span className="font-semibold text-sm text-blue-600">
                              {formatCurrency(employee.resumoFinanceiro.liquido)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalhes do Funcionário Selecionado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Funcionário Selecionado: {selectedEmployee.nome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Informações Pessoais</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Código:</span>
                  <span className="font-medium">{selectedEmployee.codigo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="font-medium">{selectedEmployee.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Função:</span>
                  <span className="font-medium">{selectedEmployee.funcao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admissão:</span>
                  <span className="font-medium">{selectedEmployee.admissao}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Resumo Financeiro</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700">Total Pagamentos:</span>
                  <span className="font-bold text-green-700">
                    {formatCurrency(selectedEmployee.resumoFinanceiro.totalPagamentos)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-red-700">Total Descontos:</span>
                  <span className="font-bold text-red-700">
                    {formatCurrency(selectedEmployee.resumoFinanceiro.totalDescontos)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700">Salário Líquido:</span>
                  <span className="font-bold text-blue-700">
                    {formatCurrency(selectedEmployee.resumoFinanceiro.liquido)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-700">FGTS:</span>
                  <span className="font-bold text-yellow-700">
                    {formatCurrency(selectedEmployee.resumoFinanceiro.fgts)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};