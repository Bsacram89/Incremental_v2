import { Building2, Calendar, FileText, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CompanyData {
  name: string;
  cnpj: string;
}

interface DynamicPayrollHeaderProps {
  company: CompanyData;
  period: string;
}

export const DynamicPayrollHeader = ({ company, period }: DynamicPayrollHeaderProps) => {
  return (
    <div className="space-y-6">
      {/* Company Header */}
      <Card className="shadow-card border-0 bg-gradient-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-primary-foreground">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">{company.name}</h1>
                <p className="text-primary-foreground/80">CNPJ: {company.cnpj}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold">Folha de Pagamento Consolidada</h2>
              <Badge variant="secondary" className="bg-primary-foreground text-primary">
                Página 1
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period and Selection Info */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Competência</p>
                <p className="font-semibold">{period}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Referente</p>
                <p className="font-semibold">MENSAL / RESCISÃO</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Empregados</p>
                <p className="font-semibold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};