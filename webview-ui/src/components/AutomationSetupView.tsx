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
        return ['pytest', 'unittest', 'behave'];
      case 'java':
        return ['RestAssured','JUnit', 'TestNG', 'Cucumber'];
      case 'javascript':
        return ['Mocha', 'Jest', 'Jasmine', 'Playwright'];
      default:
        return [];
    }
  };

  const handleStartAutomation = () => {
    const prompt = `
Create a comprehensive, maintainable, reusable, and scalable API automation framework for ${automationType} using ${selectedLanguage} with ${selectedRunner} as the test runner. Follow these steps and requirements:

1. Project Structure:
   - Create a proper folder structure that promotes modularity and ease of maintenance.
   - Include separate directories for tests, API clients, utilities, configurations, and test data.
   - Organize tests into separate files for different endpoints, following proper test file naming conventions.

2. Design Principles:
   - Implement API-specific design patterns such as the API Client pattern or Service Object pattern.
   - Use Object-Oriented Programming (OOP) principles to create reusable components for API interactions.
   - Implement proper error handling, logging mechanisms, and request/response validation.
   - Create utility functions for common API operations (e.g., authentication, header management).

3. Framework Features:
   - Create a robust configuration management system for different environments (e.g., dev, staging, production).
   - Implement a comprehensive reporting mechanism that generates detailed, interactive HTML reports using the best HTML report creation package for ${selectedLanguage}. The HTML report should include the following features:
     a. A visually stunning and modern main dashboard page with an overview of test results, including:
        - Summary statistics (total tests, passed, failed, skipped) with eye-catching visualizations
        - At least 4 different types of interactive charts and graphs showing test execution statistics (e.g., pass/fail ratio, execution time, test duration distribution, error types)
        - Trend analysis of test results over time with animated transitions
     b. An intuitive and sleek navigation menu to access different sections of the report
     c. A detailed test results page, accessible from the dashboard, showing:
        - List of all test cases with their status (passed, failed, skipped) and smooth animations on status changes
        - Ability to expand each test case to view detailed information, including:
          * Test steps with a timeline or flowchart visualization
          * Request/response details in a formatted and syntax-highlighted view
          * Assertions and their results with clear visual indicators
          * Any error messages or stack traces for failed tests, presented in a readable format
     d. Advanced filtering and search capabilities with real-time results updating
     e. Smooth animations and transitions throughout the report, including loading effects, chart animations, and page transitions
     f. Responsive design that looks great on both desktop and mobile devices, with optimized layouts for different screen sizes
     g. Performance insights and recommendations based on test results
     h. Integration with version control systems to show changes between test runs
   - Include support for parallel test execution to improve efficiency.
   - Implement a mechanism for easy test data management (e.g., using external files or databases).
   - Create helpers for request building, response parsing, and JSON/XML handling.

4. Test Cases:
   - For the selected endpoints (${selectedEndpoints.join(', ')}), create extensive test suites covering:
     a. Happy path scenarios
     b. Negative test cases
     c. Edge cases
     d. Security-related test cases (e.g., authentication, authorization)
   - Implement data-driven testing to cover multiple scenarios efficiently.
   - Include tests for different HTTP methods (GET, POST, PUT, DELETE, etc.) as applicable.
   - Validate response status codes, headers, and body content.
   - Aim for a minimum of 10-15 diverse test cases per endpoint to ensure comprehensive coverage.
   - Ensure each endpoint has its own test file, following proper naming conventions (e.g., test_endpoint_name.py for Python).

5. Best Practices:
   - Follow coding best practices and style guidelines specific to ${selectedLanguage}.
   - Include clear and comprehensive comments and documentation.
   - Implement proper version control practices (e.g., .gitignore file, README.md with setup instructions).
   - Use assertions effectively to validate API responses.
   - Implement retry mechanisms for flaky tests or unreliable network conditions.

6. Dependencies and Setup:
   - Create a requirements.txt or equivalent file listing all necessary dependencies.
   - Include clear instructions for setting up and running the framework.
   - Specify any necessary environment variables or configuration files.

7. CI/CD Considerations:
   - Provide guidelines or configurations for integrating the framework into common CI/CD pipelines.
   - Include examples of how to run tests in a CI environment.

8. Test Runner Configuration:
   - Set up and configure ${selectedRunner} as the test runner for the project.
   - Include any necessary configuration files or setup for ${selectedRunner}.
   - Ensure that ${selectedRunner} is properly integrated with the HTML reporting mechanism.

9. HTML Report Generation:
   - Choose and implement the best HTML report creation package for ${selectedLanguage} that supports:
     a. Highly interactive and visually appealing charts and graphs
     b. Detailed execution reports with advanced visualizations
     c. Smooth animations for transitions, loading effects, and data updates
     d. Responsive design for various screen sizes with optimized layouts
   - If no existing package meets all the requirements, create a custom solution using modern web technologies (e.g., D3.js for advanced visualizations, GSAP for animations)
   - Implement all the features specified in the "Framework Features" section, ensuring a slick and modern design
   - Include sample data to demonstrate the report's functionality and visual appeal
   - Provide clear instructions on how to customize and extend the HTML report if needed

10. Test Execution and Report Generation:
    - Create a single command or script that accomplishes the following:
      a. Runs all the tests using the configured test runner (${selectedRunner})
      b. Generates the visually stunning HTML report using the chosen or custom-built reporting solution
      c. Opens the generated HTML report in the default browser
    - Provide clear instructions on how to use this command, including any necessary setup steps
    - Ensure that this command works seamlessly across different environments (development, CI/CD pipelines, etc.)

Please generate this framework, ensuring it's robust, easy to maintain, and can be easily extended for future endpoints and test cases. Make sure to organize the tests into separate files for each endpoint and create a comprehensive, interactive, and visually stunning HTML report with a modern dashboard, multiple interactive charts, and detailed test results pages. The report should be created using the best available package for ${selectedLanguage} or a custom solution if needed. Create a single command that runs the tests and generates this amazing HTML report.
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