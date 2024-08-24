import React, { useState } from 'react';
import { VSCodeButton, VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react';
import { vscode } from '../utils/vscode';

// Import the logo
import logo from '../assets/logo.png';

interface AutomationSetupViewProps {
  onStartAutomation: () => void;
}

const AutomationSetupView: React.FC<AutomationSetupViewProps> = ({ onStartAutomation }) => {
  const [automationType, setAutomationType] = useState<string>('');
  const [swaggerFile, setSwaggerFile] = useState<File | null>(null);
  const [endpoints, setEndpoints] = useState<string[]>([]);
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const handleAutomationTypeChange = (event: Event | React.FormEvent<HTMLElement>) => {
    const target = event.target as HTMLSelectElement;
    setAutomationType(target.value);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSwaggerFile(file);
      
      try {
        const fileContent = await file.text();
        const parsedSwagger = JSON.parse(fileContent);
        const paths = parsedSwagger.paths;
        const extractedEndpoints = Object.keys(paths).flatMap(path => 
          Object.keys(paths[path]).map(method => `${method.toUpperCase()} ${path}`)
        );
        setEndpoints(extractedEndpoints);
      } catch (error) {
        console.error('Error parsing Swagger file:', error);
        setEndpoints([]);
      }
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
    <div className="automation-setup" style={{
      padding: '40px',
      backgroundColor: '#1e1e1e',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
        <img src={logo} alt="AI-enabled Test Automation" style={{
          width: '60px',
          height: '60px',
          marginRight: '20px'
        }} />
        <h1 style={{ color: '#ff9800', margin: 0, fontSize: '28px' }}>AI-enabled Test Automation</h1>
      </div>

      <p style={{ marginBottom: '30px', lineHeight: '1.6', fontSize: '16px', color: '#cccccc' }}>
        Welcome to the next generation of test automation. Our AI-powered tool simplifies the process of creating robust, efficient, and maintainable test frameworks for your API and UI testing needs. Get started by selecting your automation type below.
      </p>

      <div style={{ marginBottom: '30px' }}>
        <label htmlFor="automationType" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#ff9800' }}>Select Automation Type:</label>
        <VSCodeDropdown id="automationType" value={automationType} onChange={handleAutomationTypeChange} style={{ width: '100%' }}>
          <VSCodeOption value="">Select...</VSCodeOption>
          <VSCodeOption value="api">API Automation</VSCodeOption>
          <VSCodeOption value="ui" disabled>UI Automation (Coming Soon)</VSCodeOption>
        </VSCodeDropdown>
      </div>

      {automationType === 'api' && (
        <>
          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="swaggerUpload" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#ff9800' }}>Upload Swagger File:</label>
            <input type="file" id="swaggerUpload" onChange={handleFileUpload} accept=".json,.yaml" style={{ display: 'none' }} />
            <VSCodeButton onClick={() => document.getElementById('swaggerUpload')?.click()} style={{ backgroundColor: '#ff9800', color: '#1e1e1e', width: '100%', padding: '10px' }}>
              {swaggerFile ? `File uploaded: ${swaggerFile.name}` : 'Upload Swagger File'}
            </VSCodeButton>
          </div>

          {endpoints.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#ff9800' }}>Select up to 2 endpoints:</p>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #444', borderRadius: '4px', padding: '10px' }}>
                {endpoints.map(endpoint => (
                  <div key={endpoint} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <input
                      type="checkbox"
                      id={endpoint}
                      checked={selectedEndpoints.includes(endpoint)}
                      onChange={() => handleEndpointSelection(endpoint)}
                      disabled={selectedEndpoints.length >= 2 && !selectedEndpoints.includes(endpoint)}
                      style={{ marginRight: '10px' }}
                    />
                    <label htmlFor={endpoint} style={{ color: '#cccccc' }}>{endpoint}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedEndpoints.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="language" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#ff9800' }}>Select Language:</label>
              <VSCodeDropdown id="language" value={selectedLanguage} onChange={handleLanguageChange} style={{ width: '100%' }}>
                <VSCodeOption value="">Select...</VSCodeOption>
                <VSCodeOption value="python">Python</VSCodeOption>
                <VSCodeOption value="java">Java</VSCodeOption>
                <VSCodeOption value="javascript">JavaScript (ES6)</VSCodeOption>
              </VSCodeDropdown>
            </div>
          )}

          {selectedLanguage && (
            <VSCodeButton onClick={handleStartAutomation} style={{ backgroundColor: '#ff9800', color: '#1e1e1e', width: '100%', padding: '10px', fontSize: '16px' }}>
              Generate Automation Framework
            </VSCodeButton>
          )}
        </>
      )}
    </div>
  );
};

export default AutomationSetupView;