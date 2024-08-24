import React, { useState } from 'react';
import { VSCodeButton, VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react';
import { vscode } from '../utils/vscode';

interface AutomationSetupViewProps {
  onStartAutomation: () => void;
}

const AutomationSetupView: React.FC<AutomationSetupViewProps> = ({ onStartAutomation }) => {
  const [automationType, setAutomationType] = useState<string>('');
  const [swaggerFile, setSwaggerFile] = useState<File | null>(null);
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const handleAutomationTypeChange = (event: Event | React.FormEvent<HTMLElement>) => {
    const target = event.target as HTMLSelectElement;
    setAutomationType(target.value);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSwaggerFile(event.target.files[0]);
      // Here you would parse the Swagger file and update the available endpoints
      // For now, we'll just use dummy data
      setSelectedEndpoints([]);
    }
  };

  const handleEndpointSelection = (endpoint: string) => {
    setSelectedEndpoints(prev => {
      if (prev.includes(endpoint)) {
        return prev.filter(e => e !== endpoint);
      } else if (prev.length < 2) {
        return [...prev, endpoint];
      }
      return prev;
    });
  };

  const handleLanguageChange = (event: Event | React.FormEvent<HTMLElement>) => {
    const target = event.target as HTMLSelectElement;
    setSelectedLanguage(target.value);
  };

  const handleStartAutomation = () => {
    vscode.postMessage({
      type: 'newTask',
      text: `Create an API automation framework for ${automationType} using ${selectedLanguage}. Endpoints: ${selectedEndpoints.join(', ')}`
    });
    onStartAutomation();
  };

  return (
    <div className="automation-setup" style={{ padding: '20px', backgroundColor: '#f3e5f5', color: '#4a148c' }}>
      <h2 style={{ color: '#7b1fa2' }}>API Automation Setup</h2>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="automationType">Select Automation Type: </label>
        <VSCodeDropdown id="automationType" value={automationType} onChange={handleAutomationTypeChange}>
          <VSCodeOption value="">Select...</VSCodeOption>
          <VSCodeOption value="api">API Automation</VSCodeOption>
          <VSCodeOption value="ui" disabled>UI Automation (Coming Soon)</VSCodeOption>
        </VSCodeDropdown>
      </div>

      {automationType === 'api' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="swaggerUpload">Upload Swagger File: </label>
            <input type="file" id="swaggerUpload" onChange={handleFileUpload} accept=".json,.yaml" style={{ display: 'none' }} />
            <VSCodeButton onClick={() => document.getElementById('swaggerUpload')?.click()} style={{ backgroundColor: '#ff9800', color: 'white' }}>
              Upload Swagger File
            </VSCodeButton>
            {swaggerFile && <p>File uploaded: {swaggerFile.name}</p>}
          </div>

          {swaggerFile && (
            <div style={{ marginBottom: '20px' }}>
              <p>Select up to 2 endpoints:</p>
              {/* Replace with actual endpoints from parsed Swagger file */}
              {['GET /users', 'POST /users', 'GET /products', 'PUT /orders'].map(endpoint => (
                <div key={endpoint}>
                  <input
                    type="checkbox"
                    id={endpoint}
                    checked={selectedEndpoints.includes(endpoint)}
                    onChange={() => handleEndpointSelection(endpoint)}
                    disabled={selectedEndpoints.length >= 2 && !selectedEndpoints.includes(endpoint)}
                  />
                  <label htmlFor={endpoint}>{endpoint}</label>
                </div>
              ))}
            </div>
          )}

          {selectedEndpoints.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="language">Select Language: </label>
              <VSCodeDropdown id="language" value={selectedLanguage} onChange={handleLanguageChange}>
                <VSCodeOption value="">Select...</VSCodeOption>
                <VSCodeOption value="python">Python</VSCodeOption>
                <VSCodeOption value="java">Java</VSCodeOption>
                <VSCodeOption value="javascript">JavaScript (ES6)</VSCodeOption>
              </VSCodeDropdown>
            </div>
          )}

          {selectedLanguage && (
            <VSCodeButton onClick={handleStartAutomation} style={{ backgroundColor: '#7b1fa2', color: 'white' }}>
              Start Creating Automation Framework
            </VSCodeButton>
          )}
        </>
      )}
    </div>
  );
};

export default AutomationSetupView;