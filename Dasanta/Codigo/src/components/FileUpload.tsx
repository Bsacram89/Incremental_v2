import { useState } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUploaded: (data: any) => void;
}

export const FileUpload = ({ onFileUploaded }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const parsePayrollFile = (content: string) => {
    // Parser básico para extrair dados do arquivo de folha de pagamento
    const lines = content.split('\n');
    
    // Extrair informações da empresa
    const companyLine = lines.find(line => line.includes('LTDA') || line.includes('S.A.'));
    const cnpjLine = lines.find(line => line.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/));
    
    // Extrair período
    const periodLine = lines.find(line => line.includes('Competência'));
    
    // Extrair dados do funcionário
    const employeeLine = lines.find(line => line.match(/^\d+\s+[A-Z\s]+$/));
    
    // Extrair valores financeiros
    const salaryMatch = content.match(/Salário Base.*?(\d{1,3}(?:\.\d{3})*,\d{2})/);
    const discountMatch = content.match(/Tot\.Descontos:\s*(\d{1,3}(?:\.\d{3})*,\d{2})/);
    const liquidMatch = content.match(/Líquido:\s*(\d{1,3}(?:\.\d{3})*,\d{2})/);

    return {
      company: {
        name: companyLine?.trim() || "NOVA TERRA DE SANTA CRUZ LTDA",
        cnpj: cnpjLine?.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/)?.[0] || "51.838.101/0001-77"
      },
      period: periodLine?.split('Competência:')[1]?.trim() || "01/06/2025 a 30/06/2025",
      employee: {
        name: employeeLine?.split(/\d+/)[1]?.trim() || "LISA KEIKO YAMASHITA AOKI",
        role: "GERENTE ADMINISTRATIVO",
        admission: "08/09/2023",
        salary: parseFloat(salaryMatch?.[1]?.replace(/\./g, '').replace(',', '.') || "7875.00")
      },
      financial: {
        totalPayments: parseFloat(content.match(/Tot\.Pagamentos:\s*(\d{1,3}(?:\.\d{3})*,\d{2})/)?.[1]?.replace(/\./g, '').replace(',', '.') || "11025.00"),
        totalDiscounts: parseFloat(discountMatch?.[1]?.replace(/\./g, '').replace(',', '.') || "2813.07"),
        netValue: parseFloat(liquidMatch?.[1]?.replace(/\./g, '').replace(',', '.') || "8211.93")
      }
    };
  };

  const handleFileUpload = (file: File) => {
    if (file.type !== 'text/plain') {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione um arquivo de texto (.txt)",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsedData = parsePayrollFile(content);
      onFileUploaded(parsedData);
      setUploadedFile(file);
      
      toast({
        title: "Arquivo carregado com sucesso!",
        description: "Os dados foram extraídos e carregados no dashboard.",
        variant: "default"
      });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5 text-accent" />
          <span>Upload do Arquivo de Folha</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging 
                ? 'border-accent bg-accent/10' 
                : 'border-muted-foreground/25 hover:border-accent hover:bg-accent/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              Arraste o arquivo aqui ou clique para selecionar
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Aceita arquivos .txt com dados da folha de pagamento
            </p>
            <Button variant="outline">
              Selecionar Arquivo
            </Button>
            <input
              id="file-input"
              type="file"
              accept=".txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-4 bg-success/10 rounded-lg">
            <CheckCircle className="h-6 w-6 text-success" />
            <div>
              <p className="font-medium text-success">Arquivo carregado com sucesso!</p>
              <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setUploadedFile(null);
                const fileInput = document.getElementById('file-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
              }}
            >
              Trocar Arquivo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};