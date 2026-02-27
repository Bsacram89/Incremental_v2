import { User, Calendar, Briefcase, FileUser } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const EmployeeCard = () => {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5 text-accent" />
          <span>Dados do Funcionário</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-lg">LISA KEIKO YAMASHITA AOKI</h3>
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Admissão: 08/09/2023</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Sexo: F</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileUser className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Vínculo: Trabalhador CLT</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">GERENTE ADMINISTRATIVO</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm">Salário: <span className="font-semibold text-accent">R$ 7.875,00</span></p>
              <p className="text-sm">Tipo: M (220,00 Hrs)</p>
              <Badge variant="outline">MENSAL</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>Dep. IRRF: 0</span>
              <span>Dep. Sal. Fam: 0</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};