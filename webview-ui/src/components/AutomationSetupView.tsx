import React, { useState, useEffect } from 'react';
import { VSCodeButton, VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react';
import { vscode } from '../utils/vscode';

interface AutomationSetupViewProps {
  onStartAutomation: () => void;
}

const AutomationSetupView: React.FC<AutomationSetupViewProps> = ({ onStartAutomation }) => {
  const [automationType, setAutomationType] = useState<string>('');
  const [swaggerFile, setSwaggerFile] = useState<File | null>(null);
  const [endpoints, setEndpoints] = useState<string[]>([]);
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedRunner, setSelectedRunner] = useState<string>('');

  useEffect(() => {
    console.log('AutomationSetupView mounted');
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
    setSelectedRunner(''); // Reset runner when language changes
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
    const prompt = `
Create a comprehensive, maintainable, reusable, and scalable API automation framework for ${automationType} using ${selectedLanguage} with ${selectedRunner} as the test runner. Follow these steps and requirements strictly to ensure consistency and eliminate errors:

1. Project Structure:
   Create the following folder structure:
   /api_automation_framework
   ├── tests/
   │   ├── test_endpoint1.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'}
   │   └── test_endpoint2.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'}
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
   - For the selected endpoints (${selectedEndpoints.join(', ')}), create test files in the tests/ directory and make sure to provide suitable name according to the endpoint
   - Implement at least 10 diverse test cases per endpoint, covering happy paths, negative cases, edge cases, and security-related scenarios.
   - Use data-driven testing by reading test data from data/test_data.json.

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

    vscode.postMessage({
      type: 'newTask',
      text: prompt
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
        
      <div style={{ marginBottom: '30px' }}>
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
            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="runner" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#ff9800' }}>Select Test Runner:</label>
              <VSCodeDropdown id="runner" value={selectedRunner} onChange={handleRunnerChange} style={{ width: '100%' }}>
                <VSCodeOption value="">Select...</VSCodeOption>
                {getRunnerOptions(selectedLanguage).map(runner => (
                  <VSCodeOption key={runner} value={runner}>{runner}</VSCodeOption>
                ))}
              </VSCodeDropdown>
            </div>
          )}

          {selectedRunner && (
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