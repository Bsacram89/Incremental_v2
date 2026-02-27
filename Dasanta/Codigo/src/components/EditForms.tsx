import { useState } from "react";
import { Edit3, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface PayrollData {
  company: {
    name: string;
    cnpj: string;
  };
  period: string;
  employee: {
    name: string;
    role: string;
    admission: string;
    salary: number;
  };
  financial: {
    totalPayments: number;
    totalDiscounts: number;
    netValue: number;
  };
}

interface EditFormsProps {
  data: PayrollData;
  onDataUpdate: (updatedData: PayrollData) => void;
}

export const EditForms = ({ data, onDataUpdate }: EditFormsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<PayrollData>(data);
  const { toast } = useToast();

  const handleSave = () => {
    onDataUpdate(editedData);
    setIsEditing(false);
    toast({
      title: "Dados atualizados com sucesso!",
      description: "As informações da folha de pagamento foram salvas.",
    });
  };

  const handleCancel = () => {
    setEditedData(data);
    setIsEditing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const updateEmployeeField = (field: string, value: string | number) => {
    setEditedData({
      ...editedData,
      employee: {
        ...editedData.employee,
        [field]: value
      }
    });
  };

  const updateFinancialField = (field: string, value: number) => {
    const updatedFinancial = {
      ...editedData.financial,
      [field]: value
    };

    // Recalcular valor líquido automaticamente
    if (field === 'totalPayments' || field === 'totalDiscounts') {
      updatedFinancial.netValue = updatedFinancial.totalPayments - updatedFinancial.totalDiscounts;
    }

    setEditedData({
      ...editedData,
      financial: updatedFinancial
    });
  };

  const updateCompanyField = (field: string, value: string) => {
    setEditedData({
      ...editedData,
      company: {
        ...editedData.company,
        [field]: value
      }
    });
  };

  if (!isEditing) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dados Atuais</span>
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              Editar Dados
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-primary">Informações da Empresa</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Nome:</span> {data.company.name}</p>
                <p><span className="font-medium">CNPJ:</span> {data.company.cnpj}</p>
                <p><span className="font-medium">Período:</span> {data.period}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-primary">Dados do Funcionário</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Nome:</span> {data.employee.name}</p>
                <p><span className="font-medium">Cargo:</span> {data.employee.role}</p>
                <p><span className="font-medium">Admissão:</span> {data.employee.admission}</p>
                <p><span className="font-medium">Salário:</span> {formatCurrency(data.employee.salary)}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 text-primary">Resumo Financeiro</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <Badge variant="default" className="bg-success text-success-foreground mb-2">
                  Total Pagamentos
                </Badge>
                <p className="text-xl font-bold text-success">{formatCurrency(data.financial.totalPayments)}</p>
              </div>
              <div className="text-center">
                <Badge variant="destructive" className="mb-2">
                  Total Descontos
                </Badge>
                <p className="text-xl font-bold text-destructive">{formatCurrency(data.financial.totalDiscounts)}</p>
              </div>
              <div className="text-center">
                <Badge variant="default" className="bg-primary text-primary-foreground mb-2">
                  Valor Líquido
                </Badge>
                <p className="text-xl font-bold text-primary">{formatCurrency(data.financial.netValue)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Editar Dados da Folha</span>
          <div className="space-x-2">
            <Button onClick={handleSave} variant="success" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações da Empresa */}
        <div>
          <h3 className="font-semibold mb-4 text-primary">Informações da Empresa</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input
                id="company-name"
                value={editedData.company.name}
                onChange={(e) => updateCompanyField('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company-cnpj">CNPJ</Label>
              <Input
                id="company-cnpj"
                value={editedData.company.cnpj}
                onChange={(e) => updateCompanyField('cnpj', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="period">Período de Competência</Label>
              <Input
                id="period"
                value={editedData.period}
                onChange={(e) => setEditedData({...editedData, period: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Dados do Funcionário */}
        <div>
          <h3 className="font-semibold mb-4 text-primary">Dados do Funcionário</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee-name">Nome Completo</Label>
              <Input
                id="employee-name"
                value={editedData.employee.name}
                onChange={(e) => updateEmployeeField('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="employee-role">Cargo</Label>
              <Input
                id="employee-role"
                value={editedData.employee.role}
                onChange={(e) => updateEmployeeField('role', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="employee-admission">Data de Admissão</Label>
              <Input
                id="employee-admission"
                type="date"
                value={editedData.employee.admission}
                onChange={(e) => updateEmployeeField('admission', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="employee-salary">Salário Base</Label>
              <Input
                id="employee-salary"
                type="number"
                step="0.01"
                value={editedData.employee.salary}
                onChange={(e) => updateEmployeeField('salary', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Valores Financeiros */}
        <div>
          <h3 className="font-semibold mb-4 text-primary">Valores Financeiros</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="total-payments">Total de Pagamentos</Label>
              <Input
                id="total-payments"
                type="number"
                step="0.01"
                value={editedData.financial.totalPayments}
                onChange={(e) => updateFinancialField('totalPayments', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="total-discounts">Total de Descontos</Label>
              <Input
                id="total-discounts"
                type="number"
                step="0.01"
                value={editedData.financial.totalDiscounts}
                onChange={(e) => updateFinancialField('totalDiscounts', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="net-value">Valor Líquido (Calculado)</Label>
              <Input
                id="net-value"
                type="number"
                step="0.01"
                value={editedData.financial.netValue}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            * O valor líquido é calculado automaticamente (Pagamentos - Descontos)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};