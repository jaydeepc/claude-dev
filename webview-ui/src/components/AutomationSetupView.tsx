import React, { useState, useEffect } from 'react';
import { VSCodeButton, VSCodeDropdown, VSCodeOption, VSCodeTextArea } from '@vscode/webview-ui-toolkit/react';
import { vscode } from '../utils/vscode';

interface AutomationSetupViewProps {
  onStartAutomation: () => void;
}

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: '10px 20px',
      border: 'none',
      background: isActive ? '#4CAF50' : '#333',
      color: isActive ? '#000' : '#fff',
      cursor: 'pointer',
      borderRadius: '4px 4px 0 0',
      transition: 'background-color 0.3s',
    }}
  >
    {children}
  </button>
);

const AutomationSetupView: React.FC<AutomationSetupViewProps> = ({ onStartAutomation }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'add'>('create');
  const [automationType, setAutomationType] = useState<string>('');
  const [swaggerFile, setSwaggerFile] = useState<File | null>(null);
  const [endpoints, setEndpoints] = useState<string[]>([]);
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedRunner, setSelectedRunner] = useState<string>('');
  const [folderStructure, setFolderStructure] = useState<string>('');
  const [endpointInput, setEndpointInput] = useState<string>('');
  const [inputMethod, setInputMethod] = useState<'swagger' | 'manual'>('swagger');

  useEffect(() => {
    console.log('AutomationSetupView mounted');
    if (activeTab === 'add') {
      vscode.postMessage({ type: 'getFolderStructure' });
    }
  }, [activeTab]);

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'folderStructure') {
        setFolderStructure(message.structure);
      }
    };

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

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
    setSelectedRunner('');
  };

  const handleRunnerChange = (event: Event | React.FormEvent<HTMLElement>) => {
    const target = event.target as HTMLSelectElement;
    setSelectedRunner(target.value);
  };

  const getRunnerOptions = (language: string) => {
    switch (language) {
      case 'python':
        return ['pytest', 'unittest'];
      case 'java':
        return ['JUnit', 'TestNG', 'RestAssured'];
      case 'javascript':
        return ['Jest', 'Mocha', 'Playwright'];
      default:
        return [];
    }
  };

  const handleStartAutomation = () => {
    let prompt = '';
    if (activeTab === 'create') {
      prompt = `
Create a comprehensive, maintainable, reusable, and scalable API automation framework for ${automationType} using ${selectedLanguage} with ${selectedRunner} as the test runner. Follow these steps and requirements strictly to ensure consistency and eliminate errors:

1. Project Structure:
   Create the following folder structure:
   /api_automation_framework
   ├── tests/
   │   ├── <test_name_based_on_what_endpoint_is_tested>.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'}
   │   └── <test_name_based_on_what_endpoint_is_tested>.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'}
   ├── api_client/
   │   └── client.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'}
   ├── utils/
   │   ├── config_manager.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'}
   │   └── logger.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'}
   ├── config/
   │   └── config.json
   ├── data/
   │   └── test_data.json
   ├── reports/
   ├── ${selectedLanguage === 'python' ? 'requirements.txt' : selectedLanguage === 'java' ? 'pom.xml' : 'package.json'}
   ├── README.md
   ├── ${selectedLanguage === 'python' ? 'setup.py' : selectedLanguage === 'java' ? 'setup.sh' : 'setup.js'}
   └── .gitignore

2. Design Principles:
   - Implement the API Client pattern in the api_client/client.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'} file.
   - Use Object-Oriented Programming (OOP) principles to create reusable components for API interactions.
   - Implement proper error handling and logging mechanisms in the utils/ directory.

3. Framework Features:
   - Implement configuration management in utils/config_manager.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'}.
   - Set up logging in utils/logger.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'}.
   - Implement a reporting mechanism that generates HTML reports in the reports/ directory.
   ${selectedLanguage === 'javascript' ? '- For JavaScript frameworks, use jest-html-reporters package to generate a dashboard-like HTML report with charts and detailed test information.' : ''}
   - Include support for parallel test execution in the test runner configuration.
   - Use the data/ directory for test data management.

4. Test Cases:
   - Create test files ONLY for the following selected endpoints: ${selectedEndpoints.join(', ')}
   - For each selected endpoint, create a separate test file in the tests/ directory with a suitable name according to the endpoint.
   - Implement at least 10 diverse test cases for each selected endpoint, covering happy paths, negative cases, edge cases, and security-related scenarios.
   - Use data-driven testing by reading test data from data/test_data.json.
   - DO NOT create test files or test cases for any endpoints other than the ones explicitly listed above.

5. Best Practices:
   - Follow ${selectedLanguage}-specific coding standards and best practices.
   - Include comprehensive comments and docstrings/javadocs.
   - Create a .gitignore file with appropriate entries for the chosen language and framework.

6. Dependencies and Setup:
   - List all dependencies in the ${selectedLanguage === 'python' ? 'requirements.txt' : selectedLanguage === 'java' ? 'pom.xml' : 'package.json'} file.
   ${selectedLanguage === 'javascript' ? '- For JavaScript, include jest-html-reporters as a dev dependency in package.json.' : ''}
   - Create a setup script (${selectedLanguage === 'python' ? 'setup.py' : selectedLanguage === 'java' ? 'setup.sh' : 'setup.js'}) to automate the installation of dependencies and configuration of the test environment.

7. Test Runner Configuration:
   - Set up and configure ${selectedRunner} as the test runner for the project.
   - Include necessary configuration files for ${selectedRunner}.
   ${selectedLanguage === 'javascript' && selectedRunner === 'Jest' ? '- Configure Jest to use jest-html-reporters for generating the dashboard-like HTML report.' : ''}

8. README.md:
   Create a comprehensive README.md file with the following sections:
   - Project Overview
   - Prerequisites
   - Installation
   - Configuration
   - Running Tests
   - Adding New Tests
   - Project Structure
   - Troubleshooting Guide
   ${selectedLanguage === 'javascript' ? '- Viewing Test Reports (include instructions on how to access and interpret the dashboard-like HTML report)' : ''}

9. Error Handling and Logging:
   - Implement try-catch blocks for error handling in all major operations.
   - Use the logging mechanism set up in utils/logger.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'} throughout the framework.

10. Sample Test:
    Create a sample test in tests/test_sample.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'} that demonstrates the usage of the framework and verifies the setup.

11. Continuous Integration:
    Provide a .github/workflows/tests.yml file for GitHub Actions that demonstrates how to run the tests in a CI environment.
    ${selectedLanguage === 'javascript' ? 'Include steps to generate and archive the HTML report as an artifact in the CI process.' : ''}

Please generate this framework, ensuring it's robust, easy to maintain, and can be easily extended for future endpoints and test cases. Make sure to organize the tests into separate files for each endpoint, include comprehensive setup instructions, and provide a thorough troubleshooting guide to help users resolve common issues. The goal is to create a framework that is not only powerful but also user-friendly and easy to set up and run.

${selectedLanguage === 'javascript' ? `
For JavaScript frameworks, particularly when using Jest:
1. Install jest-html-reporters as a dev dependency:
   npm install --save-dev jest-html-reporters

2. Configure Jest to use the HTML reporter in the Jest configuration (usually in package.json or jest.config.js):
   {
     "reporters": [
       "default",
       ["jest-html-reporters", {
         "publicPath": "./reports",
         "filename": "report.html",
         "openReport": true,
         "pageTitle": "API Automation Test Report"
       }]
     ]
   }

3. Ensure that the HTML report is generated after each test run and provide instructions in the README on how to view and interpret the report.

4. Include charts and graphs in the report to visualize test results, such as:
   - Test pass/fail ratio
   - Test execution time
   - Coverage information
   - Trend analysis over time (if applicable)

5. Make sure the report is responsive and easily navigable, providing a good user experience on both desktop and mobile devices.
` : ''}

IMPORTANT: Ensure that all files are created with the correct content, and that there are no placeholder comments or TODOs left in the generated code. The framework should be fully functional and ready to run after following the setup instructions.
    `;
    } else if (activeTab === 'add') {
      const endpointDetails = inputMethod === 'swagger' ? selectedEndpoints.join(', ') : endpointInput;
      prompt = `
Add new test cases to the existing API automation framework. The new test cases should be for the following endpoint(s): ${endpointDetails}

Existing folder structure:
${folderStructure}

Follow these steps to add the new test cases:

1. Analyze the existing framework structure and coding patterns.
2. Create a new test file for each endpoint if it doesn't exist, following the naming conventions used in the framework.
3. Implement at least 5 diverse test cases per endpoint, covering:
   - Happy path scenarios
   - Negative test cases
   - Edge cases
   - Security-related scenarios (if applicable)
4. Ensure the new test cases follow the existing framework's design principles and best practices.
5. Update any necessary configuration files or test data to support the new test cases.
6. If needed, extend the API client to support the new endpoint(s).
7. Update the README.md file to include information about the new endpoint(s) and test cases.

IMPORTANT: Ensure that the new test cases integrate seamlessly with the existing framework and follow all established coding standards and practices. Do not modify or remove any existing test cases unless absolutely necessary.
    `;
    }

    vscode.postMessage({
      type: 'newTask',
      text: prompt
    });
    onStartAutomation();
  };

  return (
    <div className="automation-setup" style={{
      padding: '40px',
      backgroundColor: '#121212',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#4CAF50', margin: 0, fontSize: '32px', fontWeight: 'bold' }}>PhantomQA</h1>
        <p style={{ color: '#81C784', fontSize: '18px', marginTop: '10px' }}>AI-Driven Test Automation at Your Fingertips</p>
      </div>

      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <TabButton isActive={activeTab === 'create'} onClick={() => setActiveTab('create')}>
          Create with PhantomQA
        </TabButton>
        <TabButton isActive={activeTab === 'add'} onClick={() => setActiveTab('add')}>
          Enhance with PhantomQA
        </TabButton>
      </div>

      <p style={{ marginBottom: '30px', lineHeight: '1.6', fontSize: '16px', color: '#A5D6A7' }}>
        {activeTab === 'create'
          ? 'PhantomQA leverages the power of AI to help QAs effortlessly create automated testing frameworks and tests. No more manual setup or extensive coding—PhantomQA uses cutting-edge AI to generate custom, reliable, and scalable automated tests tailored to your application\'s architecture.'
          : 'Enhance your existing automation framework with new test cases. Our AI will help you create comprehensive tests for new endpoints while maintaining consistency with your existing framework.'}
      </p>

      {activeTab === 'create' && (
        <>
          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="automationType" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#4CAF50' }}>Select Automation Type:</label>
            <VSCodeDropdown id="automationType" value={automationType} onChange={handleAutomationTypeChange} style={{ width: '100%' }}>
              <VSCodeOption value="">Select...</VSCodeOption>
              <VSCodeOption value="api">API Automation</VSCodeOption>
              <VSCodeOption value="ui" disabled>UI Automation (Coming Soon)</VSCodeOption>
            </VSCodeDropdown>
          </div>

          {automationType === 'api' && (
            <>
              <div style={{ marginBottom: '30px' }}>
                <label htmlFor="swaggerUpload" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#4CAF50' }}>Upload Swagger File:</label>
                <input type="file" id="swaggerUpload" onChange={handleFileUpload} accept=".json,.yaml" style={{ display: 'none' }} />
                <VSCodeButton onClick={() => document.getElementById('swaggerUpload')?.click()} style={{ backgroundColor: '#4CAF50', color: '#000', width: '100%', padding: '10px' }}>
                  {swaggerFile ? `File uploaded: ${swaggerFile.name}` : 'Upload Swagger File'}
                </VSCodeButton>
              </div>

              {endpoints.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#4CAF50' }}>Select up to 2 endpoints:</p>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #4CAF50', borderRadius: '4px', padding: '10px' }}>
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
                        <label htmlFor={endpoint} style={{ color: '#A5D6A7' }}>{endpoint}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEndpoints.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <label htmlFor="language" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#4CAF50' }}>Select Language:</label>
                  <VSCodeDropdown id="language" value={selectedLanguage} onChange={handleLanguageChange} style={{ width: '100%' }}>
                    <VSCodeOption value="">Select...</VSCodeOption>
                    <VSCodeOption value="python">Python</VSCodeOption>
                    <VSCodeOption value="java">Java</VSCodeOption>
                    <VSCodeOption value="javascript">JavaScript (ES6)</VSCodeOption>
                  </VSCodeDropdown>
                </div>
              )}

              {selectedLanguage && (
                <div style={{ marginBottom: '30px' }}>
                  <label htmlFor="runner" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#4CAF50' }}>Select Test Runner:</label>
                  <VSCodeDropdown id="runner" value={selectedRunner} onChange={handleRunnerChange} style={{ width: '100%' }}>
                    <VSCodeOption value="">Select...</VSCodeOption>
                    {getRunnerOptions(selectedLanguage).map(runner => (
                      <VSCodeOption key={runner} value={runner}>{runner}</VSCodeOption>
                    ))}
                  </VSCodeDropdown>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'add' && (
        <>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#4CAF50', fontSize: '20px' }}>Existing Folder Structure:</h2>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#1E1E1E', padding: '10px', borderRadius: '4px', color: '#A5D6A7' }}>
              {folderStructure}
            </pre>
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="inputMethod" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#4CAF50' }}>Select Input Method:</label>
            <VSCodeDropdown id="inputMethod" value={inputMethod} onChange={(e) => setInputMethod((e.target as HTMLSelectElement).value as 'swagger' | 'manual')} style={{ width: '100%' }}>
              <VSCodeOption value="swagger">Upload Swagger File</VSCodeOption>
              <VSCodeOption value="manual">Manually Enter Endpoint</VSCodeOption>
            </VSCodeDropdown>
          </div>
          {inputMethod === 'swagger' ? (
            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="swaggerUpload" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#4CAF50' }}>Upload Swagger File:</label>
              <input type="file" id="swaggerUpload" onChange={handleFileUpload} accept=".json,.yaml" style={{ display: 'none' }} />
              <VSCodeButton onClick={() => document.getElementById('swaggerUpload')?.click()} style={{ backgroundColor: '#4CAF50', color: '#000', width: '100%', padding: '10px' }}>
                {swaggerFile ? `File uploaded: ${swaggerFile.name}` : 'Upload Swagger File'}
              </VSCodeButton>
              {endpoints.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#4CAF50' }}>Select endpoints to add tests for:</p>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #4CAF50', borderRadius: '4px', padding: '10px' }}>
                    {endpoints.map(endpoint => (
                      <div key={endpoint} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                        <input
                          type="checkbox"
                          id={endpoint}
                          checked={selectedEndpoints.includes(endpoint)}
                          onChange={() => handleEndpointSelection(endpoint)}
                          style={{ marginRight: '10px' }}
                        />
                        <label htmlFor={endpoint} style={{ color: '#A5D6A7' }}>{endpoint}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="endpointInput" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#4CAF50' }}>Enter Endpoint Details:</label>
              <VSCodeTextArea
                id="endpointInput"
                value={endpointInput}
                onChange={(e) => setEndpointInput((e.target as HTMLTextAreaElement).value)}
                placeholder="Enter the endpoint details (e.g., GET /api/users)"
                style={{ width: '100%', minHeight: '100px' }}
              />
            </div>
          )}
        </>
      )}

      {((activeTab === 'create' && selectedRunner) || (activeTab === 'add' && ((inputMethod === 'swagger' && selectedEndpoints.length > 0) || (inputMethod === 'manual' && endpointInput)))) && (
        <VSCodeButton onClick={handleStartAutomation} style={{ backgroundColor: '#4CAF50', color: '#000', width: '100%', padding: '10px', fontSize: '16px' }}>
          {activeTab === 'create' ? 'Generate Automation Framework' : 'Add Tests to Existing Framework'}
        </VSCodeButton>
      )}
    </div>
  );
};

export default AutomationSetupView;