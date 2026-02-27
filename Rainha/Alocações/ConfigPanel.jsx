import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConfigPanel = ({ config, onConfigChange, onReset }) => {
  const handleSliderChange = (key, value) => {
    onConfigChange({
      ...config,
      [key]: parseFloat(value)
    });
  };

  const handleCheckboxChange = (key, checked) => {
    onConfigChange({
      ...config,
      [key]: checked
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Configurações de Conciliação</h3>
      </div>

      <div className="space-y-6">
        {/* Threshold de Similaridade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Limite de Similaridade: {(config.similarMatchThreshold * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="1.0"
            step="0.05"
            value={config.similarMatchThreshold}
            onChange={(e) => handleSliderChange('similarMatchThreshold', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Nomes com similaridade acima deste valor serão considerados correspondências
          </p>
        </div>

        {/* Opções de Processamento */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Opções de Processamento</h4>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableNameCleaning"
              checked={config.enableNameCleaning}
              onChange={(e) => handleCheckboxChange('enableNameCleaning', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="enableNameCleaning" className="text-sm text-gray-700">
              Limpeza automática de nomes
            </label>
          </div>
          <p className="text-xs text-gray-600 ml-6">
            Remove sufixos de data e caracteres especiais
          </p>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableNormalization"
              checked={config.enableNormalization}
              onChange={(e) => handleCheckboxChange('enableNormalization', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="enableNormalization" className="text-sm text-gray-700">
              Normalização de nomes
            </label>
          </div>
          <p className="text-xs text-gray-600 ml-6">
            Remove acentos e padroniza maiúsculas/minúsculas
          </p>
        </div>

        {/* Botão de Reset */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full"
          >
            Restaurar Configurações Padrão
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;

