import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FileUpload = ({ onFileSelect, selectedFile, label, accept = ".xlsx,.xls" }) => {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.type.includes('spreadsheet') || 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls')
    );
    
    if (excelFile) {
      onFileSelect(excelFile);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const removeFile = useCallback(() => {
    onFileSelect(null);
  }, [onFileSelect]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        {label}
      </label>
      
      {selectedFile ? (
        <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{selectedFile.name}</p>
                <p className="text-sm text-green-600">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            id={`file-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label
            htmlFor={`file-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="cursor-pointer"
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">
              Clique para selecionar ou arraste o arquivo aqui
            </p>
            <p className="text-sm text-gray-500">
              Arquivos Excel (.xlsx, .xls) até 10MB
            </p>
          </label>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

