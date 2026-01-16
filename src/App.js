import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import OrgChart from './components/OrgChart';
import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';
import ImportExport from './components/ImportExport';
import Settings from './components/Settings';
import { Plus, Users, Settings as SettingsIcon, Sun, Moon, Download, Palette, List, X, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'list'
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'
  const [showImportExportMenu, setShowImportExportMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState('field-management');
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [viewedEmployee, setViewedEmployee] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showAppNavigator, setShowAppNavigator] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showSubordinatesError, setShowSubordinatesError] = useState(false);
  const [employeeWithSubordinates, setEmployeeWithSubordinates] = useState(null);
  const [designSettings, setDesignSettings] = useState({
    cardStyle: 'rounded',
    avatarSize: 'medium',
    showContactInfo: true,
    showDepartment: true,
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    edgeType: 'straight',
    edgeColor: '#3b82f6',
    edgeWidth: 3
  });
  const dropdownRef = useRef(null);
  const viewDropdownRef = useRef(null);
  const settingsDropdownRef = useRef(null);
  const orgChartRef = useRef(null);
  const lastSyncTimeRef = useRef(0);

  // Monday.com related state
  const [mondayBoardId, setMondayBoardId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [mondayColumnMapping, setMondayColumnMapping] = useState({});
  const [fieldNameToColumnId, setFieldNameToColumnId] = useState({});
  const [columnIdToType, setColumnIdToType] = useState({});
  const [managerColumnInfo, setManagerColumnInfo] = useState(null);
  const [departmentColumnInfo, setDepartmentColumnInfo] = useState(null);
  const [imageColumnId, setImageColumnId] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Monday.com SDK reference (will be set when available)
  const [monday, setMonday] = useState(null);

  // Helper function to find column ID by title
  const findColumnIdByTitle = (title) => {
    if (!title || !mondayColumnMapping) return null;
    const lowerTitle = title.toLowerCase().trim();
    for (const [id, colTitle] of Object.entries(mondayColumnMapping)) {
      if (colTitle && colTitle.toLowerCase().trim() === lowerTitle) {
        return id;
      }
    }
    return null;
  };

  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees');
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedDesignSettings = localStorage.getItem('designSettings');
    
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Load saved employees if they exist
    if (savedEmployees) {
      try {
        const parsedEmployees = JSON.parse(savedEmployees);
        if (parsedEmployees && parsedEmployees.length > 0) {
          setEmployees(parsedEmployees);
        } else {
          // If saved employees array is empty, generate sample data
          generateAndSetSampleEmployees();
        }
      } catch (error) {
        console.error('Error parsing saved employees:', error);
        // If parsing fails, generate sample data
        generateAndSetSampleEmployees();
      }
    } else {
      // If no saved employees, generate sample data
      generateAndSetSampleEmployees();
    }

    // Initialize design settings
    if (savedDesignSettings) {
      const parsedSettings = JSON.parse(savedDesignSettings);
      // Merge with default settings to ensure new properties are included
      const defaultSettings = {
        cardStyle: 'rounded',
        avatarSize: 'medium',
        showContactInfo: true,
        showDepartment: true,
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        edgeType: 'straight',
        edgeColor: '#3b82f6',
        edgeWidth: 3
      };
      setDesignSettings({ ...defaultSettings, ...parsedSettings });
    }

    // Helper function to generate and set sample employees
    function generateAndSetSampleEmployees() {
      const generateSampleEmployees = () => {
        const names = [
          'John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Chen', 'David Wilson',
          'Emma Wilson', 'James Brown', 'Sophia Davis', 'Michael Johnson', 'Olivia Garcia',
          'Daniel Miller', 'Ava Rodriguez', 'Christopher Martinez', 'Isabella Anderson', 'Matthew Taylor',
          'Mia Thomas', 'Andrew Jackson', 'Charlotte White', 'Joshua Harris', 'Amelia Martin',
          'Ryan Thompson', 'Harper Garcia', 'Nicholas Moore', 'Evelyn Lee', 'Christopher Clark',
          'Grace Lewis', 'Kevin Hall', 'Chloe Allen', 'Steven Young', 'Zoe King',
          'Brian Wright', 'Lily Green', 'Timothy Baker', 'Hannah Adams', 'Jeffrey Nelson',
          'Victoria Carter', 'Mark Mitchell', 'Penelope Perez', 'Donald Roberts', 'Layla Turner',
          'Paul Phillips', 'Riley Campbell', 'George Parker', 'Nora Evans', 'Edward Edwards',
          'Scarlett Collins', 'Robert Stewart', 'Aria Morris', 'Thomas Rogers', 'Luna Reed'
        ];

        const positions = [
          'CEO', 'CTO', 'CFO', 'COO', 'VP of Engineering', 'VP of Marketing', 'VP of Sales', 'VP of HR',
          'Senior Software Engineer', 'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
          'Product Manager', 'Project Manager', 'Scrum Master', 'Business Analyst', 'Data Analyst',
          'UX Designer', 'UI Designer', 'Graphic Designer', 'Marketing Manager', 'Marketing Specialist',
          'Sales Manager', 'Sales Representative', 'Account Executive', 'Customer Success Manager',
          'HR Manager', 'HR Coordinator', 'Recruiter', 'Finance Manager', 'Financial Analyst',
          'Accountant', 'Operations Manager', 'Operations Specialist', 'DevOps Engineer',
          'QA Engineer', 'Technical Lead', 'Architect', 'Database Administrator', 'System Administrator',
          'Content Strategist', 'SEO Specialist', 'Social Media Manager', 'Brand Manager',
          'Legal Counsel', 'Compliance Officer', 'Security Engineer', 'Network Engineer', 'Support Engineer'
        ];

        const departments = [
          'Executive', 'Technology', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 
          'Human Resources', 'Finance', 'Operations', 'Customer Success', 'Business Development', 
          'Research & Development', 'Legal', 'Security', 'Support'
        ];

        const employees = [];
        
        // Create CEO (no manager)
        employees.push({
          id: 1,
          name: names[0],
          position: 'CEO',
          department: 'Executive',
          email: `${names[0].toLowerCase().replace(' ', '.')}@company.com`,
          phone: `+1-555-${String(100 + 1).padStart(3, '0')}-${String(1000 + 1).padStart(4, '0')}`,
          managerId: null,
          image: null
        });

        // Create C-level executives (report to CEO)
        const cLevelPositions = ['CTO', 'CFO', 'COO'];
        for (let i = 0; i < cLevelPositions.length; i++) {
          employees.push({
            id: i + 2,
            name: names[i + 1],
            position: cLevelPositions[i],
            department: cLevelPositions[i] === 'CTO' ? 'Technology' : cLevelPositions[i] === 'CFO' ? 'Finance' : 'Operations',
            email: `${names[i + 1].toLowerCase().replace(' ', '.')}@company.com`,
            phone: `+1-555-${String(100 + i + 2).padStart(3, '0')}-${String(1000 + i + 2).padStart(4, '0')}`,
            managerId: 1,
            image: null
          });
        }

        // Create VPs (report to C-level)
        const vpPositions = ['VP of Engineering', 'VP of Marketing', 'VP of Sales', 'VP of HR'];
        const vpDepartments = ['Technology', 'Marketing', 'Sales', 'Human Resources'];
        for (let i = 0; i < vpPositions.length; i++) {
          const managerId = i < 2 ? 2 : i < 3 ? 3 : 4; // CTO, CTO, CFO, COO
          employees.push({
            id: i + 5,
            name: names[i + 4],
            position: vpPositions[i],
            department: vpDepartments[i],
            email: `${names[i + 4].toLowerCase().replace(' ', '.')}@company.com`,
            phone: `+1-555-${String(100 + i + 5).padStart(3, '0')}-${String(1000 + i + 5).padStart(4, '0')}`,
            managerId: managerId,
            image: null
          });
        }

        // Create remaining employees (report to VPs and other managers)
        let currentId = 9;
        for (let i = 9; i < 21; i++) {
          const name = names[i];
          const position = positions[Math.floor(Math.random() * positions.length)];
          const department = departments[Math.floor(Math.random() * departments.length)];
          
          // Assign manager based on department and hierarchy
          let managerId;
          if (department === 'Technology' || department === 'Engineering') {
            managerId = Math.random() > 0.5 ? 2 : 5; // CTO or VP Engineering
          } else if (department === 'Marketing') {
            managerId = 6; // VP Marketing
          } else if (department === 'Sales') {
            managerId = 7; // VP Sales
          } else if (department === 'Human Resources') {
            managerId = 8; // VP HR
          } else if (department === 'Finance') {
            managerId = 3; // CFO
          } else if (department === 'Operations') {
            managerId = 4; // COO
          } else {
            // For other departments, randomly assign to existing managers
            const existingManagers = employees.filter(emp => 
              emp.position.includes('VP') || emp.position.includes('Manager') || emp.position.includes('Lead')
            );
            if (existingManagers.length > 0) {
              managerId = existingManagers[Math.floor(Math.random() * existingManagers.length)].id;
            } else {
              managerId = 1; // Default to CEO
            }
          }

          employees.push({
            id: currentId,
            name: name,
            position: position,
            department: department,
            email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
            phone: `+1-555-${String(100 + currentId).padStart(3, '0')}-${String(1000 + currentId).padStart(4, '0')}`,
            managerId: managerId,
            image: null
          });
          currentId++;
        }

        return employees;
      };

      const sampleEmployees = generateSampleEmployees();
      setEmployees(sampleEmployees);
      localStorage.setItem('employees', JSON.stringify(sampleEmployees));
    }

    // Initialize Monday.com SDK if available
    if (window.monday) {
      setMonday(window.monday);
      // Get context and board info
      window.monday.get('context').then((context) => {
        if (context && context.boardId) {
          setMondayBoardId(context.boardId);
        }
      }).catch((error) => {
        console.warn('Monday.com context not available:', error);
      });
    }
  }, []);

  // Save employees to localStorage whenever employees change
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  // Save theme to localStorage and update DOM whenever theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowImportExportMenu(false);
      }
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target)) {
        setShowViewMenu(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    };

    if (showImportExportMenu || showViewMenu || showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showImportExportMenu, showViewMenu, showSettingsMenu]);

  // Double click outside to close popups
  useEffect(() => {
    const handleDoubleClickOutside = (event) => {
      // Check if click is outside the form overlay, settings modal, and view popup
      const isOutsideForm = !event.target.closest('.form-overlay');
      const isOutsideSettings = !event.target.closest('.settings-modal-overlay');
      const isOutsideViewPopup = !event.target.closest('.view-popup-overlay');
      
      if (isOutsideForm && isOutsideSettings && isOutsideViewPopup) {
        if (showForm) {
          setShowForm(false);
          setSelectedEmployee(null);
        }
        if (showSettingsModal) {
          setShowSettingsModal(false);
        }
        if (showViewPopup) {
          closeViewPopup();
        }
      }
    };

    if (showForm || showSettingsModal || showViewPopup) {
      document.addEventListener('dblclick', handleDoubleClickOutside);
    }

    return () => {
      document.removeEventListener('dblclick', handleDoubleClickOutside);
    };
  }, [showForm, showSettingsModal, showViewPopup]);


  // Development mode helper for ngrok testing
  const enableDevelopmentMode = () => {
    // Add development controls to window for easy testing
    window.mondayDev = {
      // Trigger mock context event
      triggerContext: (mockData = null) => {
        const defaultContext = {
          data: {
            boardId: 12345,
            itemId: 67890,
            theme: "light", // Monday.com theme
            user: {
              id: "1234567890",
              name: "John Developer",
              email: "john.developer@company.com"
            },
            board: {
              id: 12345,
              name: "Employee Data Board"
            },
            item: {
              id: 67890,
              name: "Employee Record"
            }
          },
          timestamp: Date.now()
        };

        const contextData = mockData || defaultContext;
        // Simulate the context event
        const mockEvent = new CustomEvent('mondayContext', { detail: contextData });
        document.dispatchEvent(mockEvent);

        return contextData;
      },

      // Mock API for testing
      api: (query) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            // Mock response for board items query
            if (query.includes('boards(ids:')) {
              const mockEmployees = [
                {
                  id: '1',
                  name: 'გიორგი ბერიძე',
                  group: { id: 'group1', title: 'Executive' },
                  column_values: [
                    { id: 'person', text: 'გიორგი ბერიძე', type: 'people', value: JSON.stringify({
                      personsAndTeams: [{
                        id: 12345,
                        first_name: 'გიორგი',
                        last_name: 'ბერიძე',
                        email: 'giorgi.beridze@company.com',
                        photo_original: null,
                        photo_small: null
                      }]
                    })},
                    { id: 'position', text: 'CEO' },
                    { id: 'department', text: 'Executive' },
                    { id: 'phone', text: '+995-555-123456' }
                  ]
                },
                {
                  id: '2',
                  name: 'მარიამი კობახიძე',
                  group: { id: 'group2', title: 'Technology' },
                  column_values: [
                    { id: 'person', text: 'მარიამი კობახიძე', type: 'people', value: JSON.stringify({
                      personsAndTeams: [{
                        id: 12346,
                        first_name: 'მარიამი',
                        last_name: 'კობახიძე',
                        email: 'mariam.kobakhidze@company.com',
                        photo_original: null,
                        photo_small: null
                      }]
                    })},
                    { id: 'position', text: 'CTO' },
                    { id: 'department', text: 'Technology' },
                    { id: 'phone', text: '+995-555-123457' },
                    { id: 'manager', text: 'გიორგი ბერიძე' }
                  ]
                },
                {
                  id: '3',
                  name: 'დავითი გელაშვილი',
                  group: { id: 'group2', title: 'Technology' },
                  column_values: [
                    { id: 'person', text: 'დავითი გელაშვილი', type: 'people', value: JSON.stringify({
                      personsAndTeams: [{
                        id: 12347,
                        first_name: 'დავითი',
                        last_name: 'გელაშვილი',
                        email: 'daviti.gelashvili@company.com',
                        photo_original: null,
                        photo_small: null
                      }]
                    })},
                    { id: 'position', text: 'Senior Developer' },
                    { id: 'department', text: 'Technology' },
                    { id: 'phone', text: '+995-555-123458' },
                    { id: 'manager', text: 'მარიამი კობახიძე' }
                  ]
                },
                {
                  id: '4',
                  name: 'ნინო ნაცვლიშვილი',
                  group: { id: 'group3', title: 'Human Resources' },
                  column_values: [
                    { id: 'person', text: 'ნინო ნაცვლიშვილი', type: 'people', value: JSON.stringify({
                      personsAndTeams: [{
                        id: 12348,
                        first_name: 'ნინო',
                        last_name: 'ნაცვლიშვილი',
                        email: 'nino.natsvlishvili@company.com',
                        photo_original: null,
                        photo_small: null
                      }]
                    })},
                    { id: 'position', text: 'HR Manager' },
                    { id: 'department', text: 'Human Resources' },
                    { id: 'phone', text: '+995-555-123459' },
                    { id: 'manager', text: 'გიორგი ბერიძე' }
                  ]
                },
                {
                  id: '5',
                  name: 'ალექსი მაისურაძე',
                  group: { id: 'group4', title: 'Design' },
                  column_values: [
                    { id: 'person', text: 'ალექსი მაისურაძე', type: 'people', value: JSON.stringify({
                      personsAndTeams: [{
                        id: 12349,
                        first_name: 'ალექსი',
                        last_name: 'მაისურაძე',
                        email: 'aleksi.maisuradze@company.com',
                        photo_original: null,
                        photo_small: null
                      }]
                    })},
                    { id: 'position', text: 'Designer' },
                    { id: 'department', text: 'Design' },
                    { id: 'phone', text: '+995-555-123460' },
                    { id: 'manager', text: 'მარიამი კობახიძე' }
                  ]
                }
              ];

              resolve({
                data: {
                  boards: [{
                    name: 'Employee Data Board',
                    groups: [
                      { id: 'group1', title: 'Executive' },
                      { id: 'group2', title: 'Technology' },
                      { id: 'group3', title: 'Human Resources' },
                      { id: 'group4', title: 'Design' }
                    ],
                    items_page: {
                      items: mockEmployees
                    }
                  }]
                }
              });
            } else {
              resolve({ data: null });
            }
          }, 500); // Simulate API delay
        });
      },

      // Get current mock context
      getMockContext: () => {
        return {
          data: {
            boardId: 12345,
            itemId: 67890,
            theme: "light", // Monday.com theme
            user: {
              id: "1234567890",
              name: "John Developer",
              email: "john.developer@company.com"
            },
            board: {
              id: 12345,
              name: "Employee Data Board"
            },
            item: {
              id: 67890,
              name: "Employee Record"
            }
          },
          timestamp: Date.now()
        };
      },

      // Listen for custom events (for testing)
      onContext: (callback) => {
        document.addEventListener('mondayContext', (event) => {
          callback(event.detail);
        });
      },

      // Test theme switching
      setLightTheme: () => {
        const lightContext = {
          data: { ...window.mondayDev.getMockContext().data, theme: "light" },
          timestamp: Date.now()
        };
        window.mondayDev.triggerContext(lightContext);
      },

      setDarkTheme: () => {
        const darkContext = {
          data: { ...window.mondayDev.getMockContext().data, theme: "dark" },
          timestamp: Date.now()
        };
        window.mondayDev.triggerContext(darkContext);
      },

      setNightTheme: () => {
        const nightContext = {
          data: { ...window.mondayDev.getMockContext().data, theme: "night" },
          timestamp: Date.now()
        };
        window.mondayDev.triggerContext(nightContext);
      }
    };

    // Listen for our custom monday context events
    window.mondayDev.onContext((contextData) => {
      // Apply theme from mock context
      if (contextData && contextData.data && contextData.data.theme) {
        const mondayTheme = contextData.data.theme;
        // Convert monday.com themes to app themes
        // light = light mode, dark/night = dark mode
        if (mondayTheme === "light") {
          setTheme("light");
        } else {
          // Both "dark" and "night" should result in dark mode
          setTheme("dark");
        }
      }
    });

    // Add keyboard shortcuts for testing
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'm') {
        event.preventDefault();
        window.mondayDev.triggerContext();
      } else if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        window.mondayDev.setLightTheme();
      } else if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        window.mondayDev.setDarkTheme();
      } else if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        window.mondayDev.setNightTheme();
      }
    });

    // Auto-trigger a context event after 3 seconds for testing
    setTimeout(() => {
      window.mondayDev.triggerContext();
      // Also load employees from the mock board
      setTimeout(() => {
        loadEmployeesFromBoard(12345);
      }, 1000);
    }, 3000);
  };

  // Context menu event listeners
  useEffect(() => {
    const handleGlobalContextMenu = (event) => {
      // Don't show context menu on form overlays, modals, or dropdowns
      if (event.target.closest('.form-overlay') || 
          event.target.closest('.settings-modal-overlay') || 
          event.target.closest('.view-popup-overlay') ||
          event.target.closest('.dropdown-menu')) {
        return;
      }
      handleContextMenu(event);
    };

    const handleGlobalClick = () => {
      closeContextMenu();
    };

    document.addEventListener('contextmenu', handleGlobalContextMenu);
    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('contextmenu', handleGlobalContextMenu);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // Create employee in Monday.com
  const createEmployeeInMonday = async (employee) => {
    console.log('🔍 createEmployeeInMonday called for employee:', employee);

    if (!mondayBoardId) {
      console.warn('⚠️ No Monday.com board ID, skipping create');
      return null;
    }

    try {
      console.log('🔍 Starting Monday.com employee creation...');
      // Find column IDs from mapping (don't use fallback strings - they won't work)
      const positionColumnId = findColumnIdByTitle('position');
      const departmentColumnId = findColumnIdByTitle('department');
      const emailColumnId = findColumnIdByTitle('email');
      const phoneColumnId = findColumnIdByTitle('phone') || findColumnIdByTitle('mobile');
      const managerColumnId = findColumnIdByTitle('manager') || findColumnIdByTitle('reports_to');

      // Get manager name if exists
      const managerName = employee.managerId ? getEmployeeNameById(employee.managerId) : '';

      // Build column values JSON
      const columnValues = {};

      // Position column - Monday.com API requires JSON format {"text": "value"} for all text columns
      if (positionColumnId && employee.position) {
        // Each value must be a JSON string
        columnValues[positionColumnId] = JSON.stringify({ text: employee.position });
      }

      // Department column - handle dropdown or text type
      if (departmentColumnId && employee.department) {
        if (departmentColumnInfo && departmentColumnInfo.type === 'dropdown' && departmentColumnInfo.labels) {
          // Dropdown column - find matching label ID or text
          const labels = departmentColumnInfo.labels;
          let labelId = null;
          let labelText = null;

          // Try to find exact match (case-insensitive)
          for (const [id, text] of Object.entries(labels)) {
            const textStr = String(text || '');
            const departmentStr = String(employee.department || '');

            if (textStr === departmentStr || textStr.toLowerCase() === departmentStr.toLowerCase()) {
              labelId = parseInt(id);
              labelText = textStr;
              break;
            }
          }

          if (labelId !== null) {
            // Use label ID (preferred) - value must be JSON string
            columnValues[departmentColumnId] = JSON.stringify({ labels: [labelId] });
          } else if (labelText) {
            // Use label text as fallback - value must be JSON string
            columnValues[departmentColumnId] = JSON.stringify({ labels: [labelText] });
          }
          // If no match found, skip setting department column
        } else {
          // Text column - value must be JSON string
          columnValues[departmentColumnId] = JSON.stringify({ text: employee.department });
        }
      }

      // Email column
      if (emailColumnId && employee.email) {
        // Value must be JSON string
        columnValues[emailColumnId] = JSON.stringify({ email: employee.email });
      }

      // Phone column
      if (phoneColumnId && employee.phone) {
        // Value must be JSON string
        columnValues[phoneColumnId] = JSON.stringify({ phone: employee.phone, countryShortName: 'US' });
      }

      // Manager column - handle dropdown or text type
      if (managerColumnId && managerName) {
        if (managerColumnInfo && managerColumnInfo.type === 'dropdown' && managerColumnInfo.labels) {
          // Dropdown column - find matching label ID or text
          const labels = managerColumnInfo.labels;
          let labelId = null;
          let labelText = null;

          // Try to find exact match (case-insensitive)
          for (const [id, text] of Object.entries(labels)) {
            // Ensure both text and managerName are strings
            const textStr = String(text || '');
            const managerNameStr = String(managerName || '');

            if (textStr === managerNameStr || textStr.toLowerCase() === managerNameStr.toLowerCase()) {
              labelId = parseInt(id);
              labelText = textStr;
              break;
            }
          }

          if (labelId !== null) {
            // Use label ID (preferred) - value must be JSON string
            columnValues[managerColumnId] = JSON.stringify({ labels: [labelId] });
          } else if (labelText) {
            // Use label text as fallback - value must be JSON string
            columnValues[managerColumnId] = JSON.stringify({ labels: [labelText] });
          }
          // If no match found, skip setting manager column
        } else {
          // Text column - value must be JSON string
          columnValues[managerColumnId] = JSON.stringify({ text: managerName });
        }
      }

      // Handle custom fields - iterate through all employee properties
      const standardFields = ['id', 'mondayItemId', 'name', 'position', 'department', 'email', 'phone', 'managerId', 'managerName', 'image'];

      for (const [fieldName, fieldValue] of Object.entries(employee)) {
        // Skip standard fields
        if (standardFields.includes(fieldName)) continue;

        // Skip empty values
        if (!fieldValue || (typeof fieldValue === 'string' && !fieldValue.trim())) continue;

        // Find Monday.com column ID for this field
        let columnId = fieldNameToColumnId[fieldName];

        // If not found in mapping, try to find by title (case-insensitive, partial match)
        if (!columnId) {
          // Try exact match first (sanitized title)
          let entry = Object.entries(mondayColumnMapping).find(([id, colTitle]) => {
            const sanitizedTitle = (colTitle || '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
            return sanitizedTitle === fieldName;
          });

          // If not found, try case-insensitive partial match
          if (!entry) {
            entry = Object.entries(mondayColumnMapping).find(([id, colTitle]) => {
              const sanitizedTitle = (colTitle || '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
              const fieldNameLower = fieldName.toLowerCase();
              return sanitizedTitle.includes(fieldNameLower) || fieldNameLower.includes(sanitizedTitle);
            });
          }

          if (entry) {
            columnId = entry[0];
          }
        }

        // If found a column, set the value
        if (columnId) {
          // Determine column type and format value accordingly
          const columnType = columnIdToType[columnId];

          if (columnType === 'text') {
            columnValues[columnId] = JSON.stringify({ text: String(fieldValue) });
          } else if (columnType === 'numbers') {
            columnValues[columnId] = JSON.stringify({ number: parseFloat(fieldValue) || 0 });
          } else {
            // Default to text for unknown types
            columnValues[columnId] = JSON.stringify({ text: String(fieldValue) });
          }
        } else {
          console.warn('⚠️ Custom field not found in Monday.com:', {
            fieldName,
            fieldValue,
            availableColumns: Object.keys(mondayColumnMapping).map(id => ({ id, title: mondayColumnMapping[id] }))
          });
        }
      }

      // Convert columnValues object to the format expected by Monday.com API
      // Monday.com API expects column_values as a JSON object where each value is a JSON object
      // Convert JSON strings to objects (like updateEmployeeInMonday does)
      const columnValuesObj = {};
      for (const [columnId, jsonString] of Object.entries(columnValues)) {
        try {
          columnValuesObj[columnId] = JSON.parse(jsonString);
        } catch (e) {
          console.warn('⚠️ Failed to parse JSON string for column:', columnId, jsonString);
          // If parsing fails, try to use as-is
          columnValuesObj[columnId] = jsonString;
        }
      }

      // Use Monday.com SDK's monday.api() method which handles token automatically
      // Convert JSON strings to objects for JSON! type variable (like updateEmployeeInMonday)
      const mutation = `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
        create_item(
          board_id: $boardId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
          name
        }
      }`;

      const variables = {
        boardId: String(mondayBoardId),
        itemName: employee.name,
        columnValues: columnValuesObj  // Pass raw object (like updateEmployeeInMonday)
      };

      console.log('🔍 Creating item with column values, variables:', variables);

      // Use SDK's monday.api() which handles token automatically
      console.log('🔍 Using Monday.com SDK to create employee...');
      const response = await monday.api(mutation, { variables });

      if (response.errors) {
        console.error('❌ Monday.com API error:', response.errors);
        const errorMessage = response.errors[0]?.message || 'GraphQL validation errors';
        alert('Failed to create employee in Monday.com: ' + errorMessage);
        throw new Error(errorMessage);
      } else {
        // Create item without column values if no columns found
        const mutation = `mutation ($boardId: ID!, $itemName: String!) {
          create_item(
            board_id: $boardId,
            item_name: $itemName
          ) {
            id
            name
          }
        }`;

        const variables = {
          boardId: String(mondayBoardId),
          itemName: employee.name
        };

        console.log('🔍 Creating item without column values, variables:', variables);

        // Use SDK's monday.api() which handles token automatically
        console.log('🔍 Using Monday.com SDK to create employee (no column values)...');
        response = await monday.api(mutation, { variables });
      }

      if (response && response.data && response.data.create_item) {
        const itemId = response.data.create_item.id;
        console.log('✅ createEmployeeInMonday completed successfully, returning item ID:', itemId);
        return itemId;
      }

      if (response && response.errors) {
        console.error('❌ Monday.com API error:', response.errors);
      }

      console.warn('⚠️ createEmployeeInMonday: No item ID in response');
      return null;
    } catch (error) {
      console.error('❌ Error creating employee in Monday.com:', error);
      console.error('❌ Error stack:', error.stack);
      // Don't show alert here - it's already shown in the fetch error handling above
      // Return null to allow the employee to be added locally even if Monday.com sync fails
      return null;
    }
  };

  // Update employee in Monday.com
  const updateEmployeeInMonday = async (employee) => {
    if (!mondayBoardId || !employee.mondayItemId) {
      return;
    }

    try {
      // Find column IDs from mapping (don't use fallback strings - they won't work)
      const positionColumnId = findColumnIdByTitle('position');
      const departmentColumnId = findColumnIdByTitle('department');
      const emailColumnId = findColumnIdByTitle('email');
      const phoneColumnId = findColumnIdByTitle('phone') || findColumnIdByTitle('mobile');
      const managerColumnId = findColumnIdByTitle('manager') || findColumnIdByTitle('reports_to');

      // Get manager name if exists
      const managerName = employee.managerId ? getEmployeeNameById(employee.managerId) : '';

      // Build column values JSON
      const columnValues = {};

      // Position column - Monday.com API requires JSON format {"text": "value"} for all text columns
      if (positionColumnId && employee.position) {
        // Each value must be a JSON string
        columnValues[positionColumnId] = JSON.stringify({ text: employee.position });
      }

      // Department column - handle dropdown or text type
      if (departmentColumnId && employee.department) {
        if (departmentColumnInfo && departmentColumnInfo.type === 'dropdown' && departmentColumnInfo.labels) {
          // Dropdown column - find matching label ID or text
          const labels = departmentColumnInfo.labels;
          let labelId = null;
          let labelText = null;

          // Try to find exact match (case-insensitive)
          for (const [id, text] of Object.entries(labels)) {
            const textStr = String(text || '');
            const departmentStr = String(employee.department || '');

            if (textStr === departmentStr || textStr.toLowerCase() === departmentStr.toLowerCase()) {
              labelId = parseInt(id);
              labelText = textStr;
              break;
            }
          }

          if (labelId !== null) {
            // Use label ID (preferred) - value must be JSON string
            columnValues[departmentColumnId] = JSON.stringify({ labels: [labelId] });
          } else if (labelText) {
            // Use label text as fallback - value must be JSON string
            columnValues[departmentColumnId] = JSON.stringify({ labels: [labelText] });
          }
          // If no match found, skip setting department column
        } else {
          // Text column - value must be JSON string
          columnValues[departmentColumnId] = JSON.stringify({ text: employee.department });
        }
      }

      // Email column
      if (emailColumnId && employee.email) {
        // Value must be JSON string
        columnValues[emailColumnId] = JSON.stringify({ email: employee.email });
      }

      // Phone column
      if (phoneColumnId && employee.phone) {
        // Value must be JSON string
        columnValues[phoneColumnId] = JSON.stringify({ phone: employee.phone, countryShortName: 'US' });
      }

      // Manager column - handle dropdown or text type
      if (managerColumnId && managerName) {
        if (managerColumnInfo && managerColumnInfo.type === 'dropdown' && managerColumnInfo.labels) {
          // Dropdown column - find matching label ID or text
          const labels = managerColumnInfo.labels;
          let labelId = null;
          let labelText = null;

          // Try to find exact match (case-insensitive)
          for (const [id, text] of Object.entries(labels)) {
            // Ensure both text and managerName are strings
            const textStr = String(text || '');
            const managerNameStr = String(managerName || '');

            if (textStr === managerNameStr || textStr.toLowerCase() === managerNameStr.toLowerCase()) {
              labelId = parseInt(id);
              labelText = textStr;
              break;
            }
          }

          if (labelId !== null) {
            // Use label ID (preferred) - value must be JSON string
            columnValues[managerColumnId] = JSON.stringify({ labels: [labelId] });
          } else if (labelText) {
            // Use label text as fallback - value must be JSON string
            columnValues[managerColumnId] = JSON.stringify({ labels: [labelText] });
          }
          // If no match found, skip setting manager column
        } else {
          // Text column - value must be JSON string
          columnValues[managerColumnId] = JSON.stringify({ text: managerName });
        }
      }

      // Handle custom fields - iterate through all employee properties
      const standardFields = ['id', 'mondayItemId', 'name', 'position', 'department', 'email', 'phone', 'managerId', 'managerName', 'image'];

      for (const [fieldName, fieldValue] of Object.entries(employee)) {
        // Skip standard fields
        if (standardFields.includes(fieldName)) continue;

        // Skip empty values
        if (!fieldValue || (typeof fieldValue === 'string' && !fieldValue.trim())) continue;

        // Find Monday.com column ID for this field
        let columnId = fieldNameToColumnId[fieldName];

        // If not found in mapping, try to find by title (case-insensitive, partial match)
        if (!columnId) {
          // Try exact match first (sanitized title)
          let entry = Object.entries(mondayColumnMapping).find(([id, colTitle]) => {
            const sanitizedTitle = (colTitle || '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
            return sanitizedTitle === fieldName;
          });

          // If not found, try case-insensitive partial match
          if (!entry) {
            entry = Object.entries(mondayColumnMapping).find(([id, colTitle]) => {
              const sanitizedTitle = (colTitle || '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
              const fieldNameLower = fieldName.toLowerCase();
              return sanitizedTitle.includes(fieldNameLower) || fieldNameLower.includes(sanitizedTitle);
            });
          }

          if (entry) {
            columnId = entry[0];
          }
        }

        // If found a column, set the value
        if (columnId) {
          // Determine column type and format value accordingly
          const columnType = columnIdToType[columnId];

          if (columnType === 'text') {
            columnValues[columnId] = JSON.stringify({ text: String(fieldValue) });
          } else if (columnType === 'numbers') {
            columnValues[columnId] = JSON.stringify({ number: parseFloat(fieldValue) || 0 });
          } else {
            // Default to text for unknown types
            columnValues[columnId] = JSON.stringify({ text: String(fieldValue) });
          }
        } else {
          console.warn('⚠️ Custom field not found in Monday.com:', {
            fieldName,
            fieldValue,
            availableColumns: Object.keys(mondayColumnMapping).map(id => ({ id, title: mondayColumnMapping[id] }))
          });
        }
      }

      // Convert columnValues object to the format expected by Monday.com API
      // Monday.com API expects column_values as a JSON object where each value is a JSON object
      // Convert JSON strings to objects (like updateEmployeeInMonday does)
      const columnValuesObj = {};
      for (const [columnId, jsonString] of Object.entries(columnValues)) {
        try {
          columnValuesObj[columnId] = JSON.parse(jsonString);
        } catch (e) {
          console.warn('⚠️ Failed to parse JSON string for column:', columnId, jsonString);
          // If parsing fails, try to use as-is
          columnValuesObj[columnId] = jsonString;
        }
      }

      // Use Monday.com SDK's monday.api() method which handles token automatically
      // Convert JSON strings to objects for JSON! type variable (like updateEmployeeInMonday)
      const mutation = `mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
        change_multiple_column_values(
          board_id: $boardId,
          item_id: $itemId,
          column_values: $columnValues
        ) {
          id
        }
      }`;

      const variables = {
        boardId: String(mondayBoardId),
        itemId: String(employee.mondayItemId),
        columnValues: columnValuesObj  // Pass raw object (like updateEmployeeInMonday)
      };

      console.log('🔍 Updating employee in Monday.com:', {
        boardId: mondayBoardId,
        itemId: employee.mondayItemId,
        columnValues: columnValuesObj
      });

      const response = await monday.api(mutation, { variables });

      if (response.errors) {
        console.error('❌ Monday.com API error:', response.errors);
      } else {
        console.log('✅ Employee updated successfully in Monday.com');
      }
    } catch (error) {
      console.error('❌ Error updating employee in Monday.com:', error.message);
    }
  };

  // Delete employee in Monday.com
  const deleteEmployeeInMonday = async (mondayItemId) => {
    if (!mondayBoardId || !mondayItemId) {
      return;
    }

    try {
      const mutation = `mutation {
        delete_item(item_id: ${mondayItemId}) {
          id
        }
      }`;

      const response = await monday.api(mutation);

      if (response.errors) {
        console.error('❌ Monday.com API error:', response.errors);
      }
    } catch (error) {
      console.error('❌ Error deleting employee from Monday.com:', error.message);
    }
  };

  // Upload image to Monday.com
  const uploadImageToMonday = async (employee, file) => {
    if (!employee || !employee.mondayItemId || !imageColumnId || !file) {
      console.error('❌ Missing required data for image upload:', { employee, imageColumnId, file });
      setIsUploadingImage(false);
      return null;
    }

    setIsUploadingImage(true);

    try {
      // Get Monday.com API token
      const token = await monday.get('token');
      if (!token) {
        throw new Error('Monday.com token not available');
      }

      // Monday.com API requires multipart/form-data with specific format:
      const formData = new FormData();
      formData.append('token', token);
      formData.append('query', `mutation ($file: File!) { add_file_to_column (item_id: ${employee.mondayItemId}, column_id: "${imageColumnId}", file: $file) { id } }`);
      formData.append('variables[file]', file);

      console.log('🔍 Uploading image to Monday.com:', {
        itemId: employee.mondayItemId,
        columnId: imageColumnId,
        fileName: file.name,
        fileSize: file.size
      });

      // Use fetch instead of monday.api for file upload (CORS issues with SDK)
      const fetchPromise = fetch('https://api.monday.com/v2/file', {
        method: 'POST',
        body: formData
      });

      // Set timeout for upload
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout')), 30000); // 30 second timeout
      });

      const result = await Promise.race([fetchPromise, timeoutPromise]);

      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }

      const response = await result.json();

      if (response.errors) {
        throw new Error('CORS error: Cannot upload files directly from browser. Please upload images directly in Monday.com board.');
      }

      console.log('✅ Image uploaded successfully to Monday.com');
      return response.data?.add_file_to_column?.id;
    } catch (error) {
      // Handle all upload errors
      console.error('❌ Error uploading image to Monday.com:', error);
      if (error.message.includes('timeout')) {
        console.error('Upload timeout after 30 seconds. This might be due to CORS restrictions.');
      } else if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        console.error('CORS error: Cannot upload files directly from browser. Please upload images directly in Monday.com board.');
      }
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Load employees from Monday.com board
  const loadEmployeesFromBoard = async (boardId) => {
    // Temporarily disabled due to code issues
    console.log('🔄 Monday.com sync temporarily disabled');
    return;
  };

  /*
  const loadEmployeesFromBoard_old = async (boardId) => {
    if (!boardId) {
      console.warn('⚠️ No board ID provided to loadEmployeesFromBoard');
      return;
    }

    try {
      console.log('🔄 Loading employees from Monday.com board:', boardId);

      // GraphQL query to load board items with column values
      const query = `query {
        boards(ids: [${boardId}]) {
          items_page(limit: 500) {
            items {
              id
              name
              updated_at
              group {
                id
                title
              }
              column_values {
                id
                text
                value
                type
              }
            }
          }
        }
      }`;

      const response = await monday.api(query);
      const items = response.data?.boards?.[0]?.items_page?.items || [];

      if (items.length === 0) {
        console.log('ℹ️ No items found in Monday.com board');
        return;
      }

      console.log(`📊 Processing ${items.length} items from Monday.com...`);

      // Get column mappings (this should be done once and cached)
      const columnIdToTitle = {};

      // First pass: build column mappings from the first item
      if (items.length > 0) {
        const firstItem = items[0];
        firstItem.column_values.forEach(col => {
          if (col.id && col.text) {
            columnIdToTitle[col.id] = col.text;
          }
        });
      }

      // Process each item into employee format
      const mondayEmployees = items.map((item, index) => {
        // Extract data from columns - similar to the logic I saw earlier
        const columnValues = item.column_values || [];

        // Find specific columns
        const firstnameColumn = columnValues.find(col => {
          if (!col) return false;
          const columnId = (col.id || '').toLowerCase();
          const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();

          // Check by column ID
          if (
            columnId === 'firstname' ||
            columnId === 'first_name' ||
            columnId === 'first-name' ||
            columnId === 'name' ||
            columnId === 'სახელი'
          ) {
            return true;
          }

          // Check by column title
          if (
            columnTitle === 'first name' ||
            columnTitle === 'firstname' ||
            columnTitle === 'first-name' ||
            columnTitle === 'name' ||
            columnTitle === 'სახელი'
          ) {
            return true;
          }

          return false;
        });

        // Similar logic for other columns...
        const lastnameColumn = columnValues.find(col => {
          if (!col) return false;
          const columnId = (col.id || '').toLowerCase();
          const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();

          if (
            columnId === 'lastname' ||
            columnId === 'last_name' ||
            columnId === 'last-name' ||
            columnId === 'surname' ||
            columnId === 'გვარი'
          ) {
            return true;
          }

          if (
            columnTitle === 'last name' ||
            columnTitle === 'lastname' ||
            columnTitle === 'surname' ||
            columnTitle === 'გვარი'
          ) {
            return true;
          }

          return false;
        });

        // Build full name
        let fullName = item.name; // Default fallback

        // Extract value from First Name column
        let firstNameValue = null;
        if (firstnameColumn) {
          // First check text field, then value field
          if (firstnameColumn.text && firstnameColumn.text.trim()) {
            firstNameValue = firstnameColumn.text.trim();
          } else if (firstnameColumn.value) {
            try {
              const parsed = JSON.parse(firstnameColumn.value);
              firstNameValue = parsed.text || parsed.value || firstnameColumn.value;
            } catch (e) {
              firstNameValue = firstnameColumn.value;
            }
          }
        }

        // Extract value from Last Name column
        let lastNameValue = null;
        if (lastnameColumn) {
          if (lastnameColumn.text && lastnameColumn.text.trim()) {
            lastNameValue = lastnameColumn.text.trim();
          } else if (lastnameColumn.value) {
            try {
              const parsed = JSON.parse(lastnameColumn.value);
              lastNameValue = parsed.text || parsed.value || lastnameColumn.value;
            } catch (e) {
              lastNameValue = lastnameColumn.value;
            }
          }
        }

        // Clean up values
        if (firstNameValue) firstNameValue = String(firstNameValue).trim();
        if (lastNameValue) lastNameValue = String(lastNameValue).trim();

        // Build full name from first and last name if available
        if (firstNameValue || lastNameValue) {
          fullName = `${firstNameValue || ''} ${lastNameValue || ''}`.trim();
        }

        // Extract other fields (simplified version)
        const positionColumn = columnValues.find(col => {
          if (!col) return false;
          const columnId = (col.id || '').toLowerCase();
          const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();

          if (columnId === 'position' || columnId === 'role' || columnTitle === 'position' || columnTitle === 'role') {
            return true;
          }
          return false;
        });

        const departmentColumn = columnValues.find(col => {
          if (!col) return false;
          const columnId = (col.id || '').toLowerCase();
          const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();

          if (columnId === 'department' || columnTitle === 'department') {
            return true;
          }
          return false;
        });

        const emailColumn = columnValues.find(col => {
          if (!col) return false;
          const columnId = (col.id || '').toLowerCase();
          const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();
          return columnId === 'email' || columnTitle === 'email';
        });

        const phoneColumn = columnValues.find(col => {
          if (!col) return false;
          const columnId = (col.id || '').toLowerCase();
          const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();
          return columnId === 'phone' || columnTitle === 'phone';
        });

        const managerColumn = columnValues.find(col => {
          if (!col) return false;
          const columnId = (col.id || '').toLowerCase();
          const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();
          return columnId === 'manager' || columnTitle === 'manager' || columnId === 'reports_to' || columnTitle === 'reports to';
        });

        // Extract values
        let positionValue = '';
        if (positionColumn) {
          if (positionColumn.text && positionColumn.text.trim()) {
            positionValue = positionColumn.text.trim();
          } else if (positionColumn.value) {
            try {
              const parsed = JSON.parse(positionColumn.value);
              positionValue = parsed.text || parsed.value || positionColumn.value;
            } catch (e) {
              positionValue = positionColumn.value;
            }
          }
        }

        let departmentValue = 'General';
        if (departmentColumn) {
          if (departmentColumn.text && departmentColumn.text.trim()) {
            departmentValue = departmentColumn.text.trim();
          } else if (departmentColumn.value) {
            try {
              const parsed = JSON.parse(departmentColumn.value);
              departmentValue = parsed.text || parsed.value || departmentColumn.value;
            } catch (e) {
              departmentValue = departmentColumn.value;
            }
          }
        }

        let emailValue = '';
        if (emailColumn) {
          if (emailColumn.text && emailColumn.text.trim()) {
            emailValue = emailColumn.text.trim();
          } else if (emailColumn.value) {
            try {
              const parsed = JSON.parse(emailColumn.value);
              emailValue = parsed.email || parsed.text || parsed.value || emailColumn.value;
            } catch (e) {
              emailValue = emailColumn.value;
            }
          }
        }

        let phoneValue = '';
        if (phoneColumn) {
          if (phoneColumn.text && phoneColumn.text.trim()) {
            phoneValue = phoneColumn.text.trim();
          } else if (phoneColumn.value) {
            try {
              const parsed = JSON.parse(phoneColumn.value);
              phoneValue = parsed.phone || parsed.text || parsed.value || phoneColumn.value;
            } catch (e) {
              phoneValue = phoneColumn.value;
            }
          }
        }

        let managerName = '';
        if (managerColumn) {
          if (managerColumn.text && managerColumn.text.trim()) {
            managerName = managerColumn.text.trim();
          } else if (managerColumn.value) {
            try {
              const parsed = JSON.parse(managerColumn.value);
              managerName = parsed.text || parsed.value || managerColumn.value;
            } catch (e) {
              managerName = managerColumn.value;
            }
          }
        }

        return {
          id: parseInt(item.id),
          mondayItemId: item.id,
          name: fullName,
          position: positionValue || 'Employee',
          department: departmentValue,
          email: emailValue || `${fullName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
          phone: phoneValue || `+1-555-${String(100 + index).padStart(3, '0')}-${String(1000 + index).padStart(4, '0')}`,
          managerId: null, // Will be resolved in second pass
          managerName: managerName,
          image: null
        };
      });

      // Second pass: Apply structured hierarchical organization
      if (mondayEmployees.length > 0) {
        // Step 1: Identify and structure C-level executives
        const cLevelTitles = ['CTO', 'Chief Technology Officer', 'CFO', 'Chief Financial Officer', 'COO', 'Chief Operating Officer'];
        const vpTitles = ['VP', 'Vice President', 'Director'];

        // Find or create CEO
        let ceo = mondayEmployees.find(emp =>
          emp.position && (
            emp.position.toLowerCase().includes('ceo') ||
            emp.position.toLowerCase().includes('chief executive') ||
            emp.position.toLowerCase().includes('founder') ||
            emp.position.toLowerCase().includes('president')
          )
        );

        // If no CEO found, make first employee CEO
        if (!ceo) {
          ceo = mondayEmployees[0];
          ceo.managerId = null;
        } else {
          ceo.managerId = null;
        }

        // Step 2: Identify C-level executives (report to CEO)
        const cLevelEmployees = mondayEmployees.filter(emp =>
          emp !== ceo && emp.position && cLevelTitles.some(title =>
            emp.position.toLowerCase().includes(title.toLowerCase())
          )
        );

        cLevelEmployees.forEach(emp => {
          emp.managerId = ceo.id;
        });

        // Step 3: Identify VP/Director level (report to C-level or CEO)
        const vpEmployees = mondayEmployees.filter(emp =>
          emp !== ceo && !cLevelEmployees.includes(emp) && emp.position &&
          vpTitles.some(title => emp.position.toLowerCase().includes(title.toLowerCase()))
        );

        vpEmployees.forEach(emp => {
          // Try to match with C-level manager first, then CEO
          let manager = cLevelEmployees.find(cLevel =>
            emp.managerName && cLevel.name &&
            (cLevel.name.toLowerCase().includes(emp.managerName.toLowerCase()) ||
             emp.managerName.toLowerCase().includes(cLevel.name.toLowerCase()))
          );

          if (!manager) {
            manager = ceo;
          }

          emp.managerId = manager.id;
        });

        // Step 4: Assign remaining employees based on manager names
        const remainingEmployees = mondayEmployees.filter(emp =>
          emp !== ceo && !cLevelEmployees.includes(emp) && !vpEmployees.includes(emp)
        );

        remainingEmployees.forEach(emp => {
          if (emp.managerName) {
            // Find manager by name matching
            const manager = mondayEmployees.find(m => {
              if (!m.name) return false;
              const empManagerName = emp.managerName.toLowerCase().trim();
              const managerName = m.name.toLowerCase().trim();

              // Exact match
              if (managerName === empManagerName) return true;

              // First name match
              const empParts = empManagerName.split(' ');
              const managerParts = managerName.split(' ');
              if (empParts.length > 0 && managerParts.length > 0 &&
                  empParts[0] === managerParts[0]) return true;

              return false;
            });

            if (manager) {
              emp.managerId = manager.id;
            } else {
              // Default to CEO if no manager found
              emp.managerId = ceo.id;
            }
          } else {
            // Default to CEO if no manager name specified
            emp.managerId = ceo.id;
          }
        });

        // Step 5: Handle employees with department/position logic as fallback
        const unassignedEmployees = mondayEmployees.filter(emp => emp.managerId === null);
        unassignedEmployees.forEach(emp => {
          // Logic for assigning based on department and position
          emp.managerId = ceo.id; // Default fallback
        });
      }

      const organizedEmployees = mondayEmployees;

      // Remove managerName field (no longer needed)
      organizedEmployees.forEach(emp => {
        delete emp.managerName;
      });

      console.log(`✅ Monday.com-დან დატვირთული: ${organizedEmployees.length} თანამშრომელი`);
      setEmployees(organizedEmployees);
      localStorage.setItem('employees', JSON.stringify(organizedEmployees));
      lastSyncTimeRef.current = Date.now();

    } catch (error) {
      console.error('❌ Error loading employees from Monday.com:', error.message || error);

      // Fall back to sample data if Monday.com data loading fails
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees));
      } else {
        // Generate sample data if no saved data exists
        resetToSampleData();
      }
    }
  };
  */

  /* ORPHANED CODE FROM loadEmployeesFromBoard - COMMENTED OUT
  // Monday.com sync functions - periodically sync changes between local app and Monday.com board
  
  // Helper function to get employee name by ID
  const getEmployeeNameById = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : '';
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const toggleImportExportMenu = () => {
    setShowImportExportMenu(!showImportExportMenu);
  };

  const handleDropdownMouseEnter = () => {
    setShowImportExportMenu(true);
  };

  const handleDropdownContainerMouseLeave = () => {
    setShowImportExportMenu(false);
  };

  const handleViewDropdownMouseEnter = () => {
    setShowViewMenu(true);
  };

  const handleViewDropdownContainerMouseLeave = () => {
    setShowViewMenu(false);
  };

  const handleSettingsDropdownMouseEnter = () => {
    setShowSettingsMenu(true);
  };

  const handleSettingsDropdownContainerMouseLeave = () => {
    setShowSettingsMenu(false);
  };

  const openSettingsModal = (section = 'field-management') => {
    setActiveSettingsSection(section);
    setShowSettingsModal(true);
    setShowSettingsMenu(false);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };

  // All orphaned code blocks removed to fix syntax errors
            if (
              columnId.includes('firstname') ||
              columnId.includes('first_name') ||
              columnId.includes('first-name')
            ) {
              return true;
            }
            
            // Check by column title from mapping (exact matches)
            if (
              columnTitle === 'first name' ||
              columnTitle === 'firstname' ||
              columnTitle === 'first-name' ||
              columnTitle === 'სახელი' // Georgian: სახელი
            ) {
              return true;
            }
            
            // Check by column title from mapping (contains)
            if (
              columnTitle.includes('first name') ||
              columnTitle.includes('firstname') ||
              columnTitle.includes('first-name') ||
              columnTitle.includes('სახელი')
            ) {
              return true;
            }
            
            // Check if it's a text column and title contains "first"
            if (col.type === 'text' && columnTitle.includes('first')) {
              return true;
            }
            
            return false;
          });
          
          // Fallback: if not found, try to find by checking all text columns
          // Use column title from mapping instead of col.text
          if (!firstnameColumn) {
            const textColumns = item.column_values.filter(col => col && col.type === 'text');
            
            // Try to find First Name in text columns by checking column title from mapping
            firstnameColumn = textColumns.find(col => {
              const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();
              return (
                columnTitle === 'first name' ||
                columnTitle === 'firstname' ||
                columnTitle === 'first-name' ||
                columnTitle.includes('first name') ||
                columnTitle.includes('firstname') ||
                columnTitle === 'სახელი' ||
                columnTitle.includes('სახელი')
              );
            });
          }
          
          const lastnameColumn = item.column_values.find(col => {
            if (!col) return false;
            
            const headerText = (col.text || '').toLowerCase().trim();
            const columnId = (col.id || '').toLowerCase();
            
            // Check by column ID
            if (
              columnId === 'lastname' ||
              columnId === 'last_name' ||
              columnId === 'last-name' ||
              columnId.includes('lastname') ||
              columnId.includes('last_name')
            ) {
              return true;
            }
            
            // Check by header text (column name)
            if (
              headerText === 'last name' ||
              headerText === 'lastname' ||
              headerText === 'last-name' ||
              headerText.includes('last name') ||
              headerText.includes('lastname') ||
              headerText.includes('last-name') ||
              headerText === 'გვარი' || // Georgian: გვარი
              headerText.includes('გვარი')
            ) {
              return true;
            }
            
            return false;
          });

          // Find Position column - check by ID and by title from mapping
          let positionColumn = item.column_values.find(col => {
            if (!col) return false;
            
            const columnId = (col.id || '').toLowerCase();
            // Get column title from mapping
            const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();
            
            // Check by column ID (exact matches)
            if (
              columnId === 'position' ||
              columnId === 'role' ||
              columnId === 'job_title'
            ) {
              return true;
            }
            
            // Check by column ID (contains)
            if (
              columnId.includes('position') ||
              columnId.includes('role') ||
              columnId.includes('job_title')
            ) {
              return true;
            }
            
            // Check by column title from mapping (exact matches)
            if (
              columnTitle === 'position' ||
              columnTitle === 'role' ||
              columnTitle === 'job title' ||
              columnTitle === 'პოზიცია'
            ) {
              return true;
            }
            
            // Check by column title from mapping (contains)
            if (
              columnTitle.includes('position') ||
              columnTitle.includes('role') ||
              columnTitle.includes('job title') ||
              columnTitle.includes('პოზიცია')
            ) {
              return true;
            }
            
            return false;
          });
          
          // Fallback: if not found, try to find by checking all text columns
          if (!positionColumn) {
            const textColumns = item.column_values.filter(col => col && col.type === 'text');
            
            // Try to find Position in text columns by checking column title from mapping
            positionColumn = textColumns.find(col => {
              const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();
              return (
                columnTitle === 'position' ||
                columnTitle === 'role' ||
                columnTitle === 'job title' ||
                columnTitle.includes('position') ||
                columnTitle.includes('role') ||
                columnTitle === 'პოზიცია' ||
                columnTitle.includes('პოზიცია')
              );
            });
          }
          
          // Find Department column - similar to Position column
          let departmentColumn = item.column_values.find(col => {
            if (!col) return false;
            
            const columnId = (col.id || '').toLowerCase();
            const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();
            
            // Check by column ID
            if (
              columnId === 'department' ||
              columnId.includes('department')
            ) {
              return true;
            }
            
            // Check by column title
            if (
              columnTitle === 'department' ||
              columnTitle === 'დეპარტამენტი' ||
              columnTitle.includes('department') ||
              columnTitle.includes('დეპარტამენტი')
            ) {
              return true;
            }
            
            return false;
          });
          
          // Find Email column - check by ID and title
          let emailColumn = item.column_values.find(col => {
            if (!col) return false;
            const columnId = (col.id || '').toLowerCase();
            const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();
            return columnId === 'email' || 
                   columnTitle === 'email' ||
                   columnTitle === 'ელფოსტა' ||
                   columnTitle.includes('email');
          });
          
          // Find Phone column - check by ID and title
          let phoneColumn = item.column_values.find(col => {
            if (!col) return false;
            const columnId = (col.id || '').toLowerCase();
            const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();
            return columnId === 'phone' || 
                   columnId === 'mobile' ||
                   columnTitle === 'phone' ||
                   columnTitle === 'mobile' ||
                   columnTitle === 'ტელეფონი' ||
                   columnTitle.includes('phone') ||
                   columnTitle.includes('mobile') ||
                   columnTitle.includes('ტელეფონი');
          });
          
          // Find Manager column - check by ID first, then by title from mapping
          let managerColumn = item.column_values.find(col => {
            if (!col) return false;
            const columnId = (col.id || '').toLowerCase();
            return columnId === 'manager' || columnId === 'reports_to' || columnId.includes('manager') || columnId.includes('reports_to');
          });
          
          // If not found by ID, try to find by title from mapping
          if (!managerColumn) {
            managerColumn = item.column_values.find(col => {
              if (!col) return false;
              const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();
              return (
                columnTitle === 'manager' ||
                columnTitle === 'reports to' ||
                columnTitle === 'reports_to' ||
                columnTitle === 'მენეჯერი' ||
                columnTitle === 'მენეჯერის სახელი' ||
                columnTitle.includes('manager') ||
                columnTitle.includes('reports to') ||
                columnTitle.includes('მენეჯერი')
              );
            });
          }
          
          // Manager column found (no logging needed)
          
          // Find Image column - check by ID and title
          let imageColumn = item.column_values.find(col => {
            if (!col) return false;
            const columnId = (col.id || '').toLowerCase();
            const columnTitle = (columnIdToTitle[col.id] || '').toLowerCase().trim();
            return col.type === 'file' ||
                   columnId === 'image' ||
                   columnId === 'photo' ||
                   columnId === 'avatar' ||
                   columnId === 'picture' ||
                   columnTitle === 'image' ||
                   columnTitle === 'photo' ||
                   columnTitle === 'avatar' ||
                   columnTitle === 'picture' ||
                   columnTitle === 'სურათი' ||
                   columnTitle.includes('image') ||
                   columnTitle.includes('photo') ||
                   columnTitle.includes('avatar') ||
                   columnTitle.includes('picture') ||
                   columnTitle.includes('სურათი');
          });
          
          // Save image column ID to state (only once, on first item)
          if (imageColumn && !imageColumnId && index === 0) {
            setImageColumnId(imageColumn.id);
          }
          
          // Find Status column (type === 'status')
          const statusColumn = item.column_values.find(col => col.type === 'status');
          let statusValue = null;
          if (statusColumn) {
            // Status column-ის text field-ში არის status-ის მნიშვნელობა (მაგ: "Done", "Working on it")
            if (statusColumn.text && statusColumn.text.trim()) {
              statusValue = statusColumn.text.trim();
            }
            // Fallback: value field-იდან JSON parse
            else if (statusColumn.value) {
              try {
                const parsed = JSON.parse(statusColumn.value);
                statusValue = parsed.text || statusColumn.value;
              } catch (e) {
                statusValue = statusColumn.value;
              }
            }
          }

          // Build full name - prioritize Item name, then First Name column
          let fullName = item.name; // Default fallback

          // Extract value from First Name column
          // First check text field, then value field
          let firstNameValue = null;
          if (firstnameColumn) {
            // პირველი პრიორიტეტი: First Name column-ის text field-ში შეიძლება იყოს რეალური მნიშვნელობა
            const textValue = firstnameColumn.text || '';
            const textLower = textValue.toLowerCase().trim();
            
            // Check if text field contains actual value (not column header name)
            if (
              textValue.trim() &&
              textLower !== 'first name' &&
              textLower !== 'firstname' &&
              textLower !== 'first-name' &&
              textLower !== 'სახელი' &&
              !textLower.includes('first name') &&
              !textLower.includes('firstname')
            ) {
              firstNameValue = textValue.trim();
            }
            
            // მეორე პრიორიტეტი: value field-იდან (JSON ან plain text)
            if (!firstNameValue || !firstNameValue.trim()) {
              if (firstnameColumn.value) {
                try {
                  const parsed = JSON.parse(firstnameColumn.value);
                  // Try different possible JSON structures
                  firstNameValue = parsed.text || parsed.value || parsed.name || firstnameColumn.value;
                } catch (e) {
                  // If not JSON, use value directly as string
                  firstNameValue = firstnameColumn.value;
                }
              }
            }
            
            // Clean up the value
            if (firstNameValue) {
              firstNameValue = String(firstNameValue).trim();
            }
          }

          let lastNameValue = null;
          if (lastnameColumn) {
            if (lastnameColumn.value) {
              try {
                const parsed = JSON.parse(lastnameColumn.value);
                lastNameValue = parsed.text || parsed.value || parsed.name || lastnameColumn.value;
              } catch (e) {
                lastNameValue = lastnameColumn.value;
              }
            }
            
            if (!lastNameValue || !lastNameValue.trim()) {
              const textValue = lastnameColumn.text || '';
              const textLower = textValue.toLowerCase().trim();
              if (
                textValue.trim() &&
                textLower !== 'last name' &&
                textLower !== 'lastname' &&
                textLower !== 'last-name' &&
                textLower !== 'გვარი' &&
                !textLower.includes('last name')
              ) {
                lastNameValue = textValue.trim();
              }
            }
            
            if (lastNameValue) {
              lastNameValue = String(lastNameValue).trim();
            }
          }

          // Priority order: Item name > First Name column
          
          // First priority: Item name (primary source for employee names)
          if (item.name && item.name.trim()) {
            fullName = item.name.trim();
          }
          // Second priority: First Name column
          else if (firstNameValue && firstNameValue.trim()) {
            const firstName = firstNameValue.trim();
            const lastName = lastNameValue ? lastNameValue.trim() : '';
            fullName = lastName ? `${firstName} ${lastName}` : firstName;
          }

          // Generate manager ID from manager column if available
          // Will be resolved in second pass after all employees are created
          let managerName = null;
          if (managerColumn) {
            // First priority: text field (contains actual manager name)
            if (managerColumn.text && managerColumn.text.trim()) {
              const textValue = managerColumn.text.trim();
              const textLower = textValue.toLowerCase().trim();
              
              // Check if text field contains actual value (not column header name)
              if (
                textValue &&
                textLower !== 'manager' &&
                textLower !== 'reports to' &&
                textLower !== 'reports_to' &&
                textLower !== 'მენეჯერი' &&
                textLower !== 'მენეჯერის სახელი' &&
                !textLower.includes('manager') &&
                !textLower.includes('reports to')
              ) {
                managerName = textValue;
              }
            }
            
            // Second priority: value field (JSON parse if needed)
            if (!managerName || !managerName.trim()) {
              if (managerColumn.value) {
                try {
                  const parsed = JSON.parse(managerColumn.value);
                  
                  // If dropdown/status column, check for labels array
                  if (managerColumnInfoLocal && 
                      (managerColumnInfoLocal.type === 'dropdown' || managerColumnInfoLocal.type === 'status') &&
                      parsed.labels && Array.isArray(parsed.labels) && parsed.labels.length > 0 &&
                      managerColumnInfoLocal.labels) {
                    // Get first label ID from array
                    const labelId = parsed.labels[0];
                    // Look up label text from labels object
                    const labelText = managerColumnInfoLocal.labels[labelId];
                    if (labelText) {
                      managerName = String(labelText).trim();
                    }
                  }
                  
                  // If not found from labels, try other JSON structures
                  if (!managerName || !managerName.trim()) {
                    managerName = parsed.text || parsed.value || parsed.name || managerColumn.value;
                    if (managerName) {
                      managerName = String(managerName).trim();
                    }
                  }
                } catch (e) {
                  // If not JSON, use value directly as string
                  managerName = String(managerColumn.value).trim();
                }
              }
            }
            
            // Clean up the value
            if (managerName) {
              managerName = managerName.trim();
            }
          }

          // Extract position - prioritize positionColumn, then statusColumn, then default
          let positionValue = 'Employee';
          
          if (positionColumn) {
            // First priority: text field (cell value)
            if (positionColumn.text && positionColumn.text.trim()) {
              const textValue = positionColumn.text.trim();
              // Check if text field contains actual value (not column header name)
              const columnTitle = (columnIdToTitle[positionColumn.id] || '').toLowerCase().trim();
              if (textValue.toLowerCase() !== columnTitle) {
                positionValue = textValue;
              }
            }
            
            // Second priority: value field (JSON or plain text)
            if ((!positionValue || positionValue === 'Employee') && positionColumn.value) {
              try {
                const parsed = JSON.parse(positionColumn.value);
                // Try different possible JSON structures
                let extractedValue = parsed.text || parsed.value || parsed.name || positionColumn.value;
                
                // If extractedValue is still a JSON string (e.g., '{"text":"Financial Analyst"}'), parse it again
                if (typeof extractedValue === 'string' && extractedValue.trim().startsWith('{')) {
                  try {
                    const nestedParsed = JSON.parse(extractedValue);
                    extractedValue = nestedParsed.text || nestedParsed.value || nestedParsed.name || extractedValue;
                  } catch (e) {
                    // Not nested JSON, use as is
                  }
                }
                
                positionValue = extractedValue;
              } catch (e) {
                // If not JSON, use value directly as string
                positionValue = positionColumn.value;
              }
            
              // Clean up the value
              if (positionValue) {
                positionValue = String(positionValue).trim();
                // Remove any remaining JSON-like structure if it's still a string
                if (positionValue.startsWith('{') && positionValue.includes('"text"')) {
                  try {
                    const finalParsed = JSON.parse(positionValue);
                    positionValue = finalParsed.text || finalParsed.value || finalParsed.name || positionValue;
                  } catch (e) {
                    // Ignore parsing errors
                  }
                }
              }
            }
          } else if (statusValue) {
            // Use Status column value as position (e.g., "Done", "Working on it", "Stuck")
            positionValue = statusValue;
          }
          
          // Final fallback: only use "Employee" if no position found
          if (!positionValue || positionValue.trim() === '') {
            positionValue = 'Employee';
          }

          // Extract department - similar to position extraction
          let departmentValue = 'General'; // Default fallback
          
          if (departmentColumn) {
            // First priority: text field (cell value)
            if (departmentColumn.text && departmentColumn.text.trim()) {
              const textValue = departmentColumn.text.trim();
              const columnTitle = (columnIdToTitle[departmentColumn.id] || '').toLowerCase().trim();
              // Check if text field contains actual value (not column header name)
              if (textValue.toLowerCase() !== columnTitle) {
                departmentValue = textValue;
              }
            }
            
            // Second priority: value field (JSON or plain text)
            if ((!departmentValue || departmentValue === 'General') && departmentColumn.value) {
              try {
                const parsed = JSON.parse(departmentColumn.value);
                let extractedValue = parsed.text || parsed.value || parsed.name || departmentColumn.value;
                
                // If extractedValue is still a JSON string, parse it again
                if (typeof extractedValue === 'string' && extractedValue.trim().startsWith('{')) {
                  try {
                    const nestedParsed = JSON.parse(extractedValue);
                    extractedValue = nestedParsed.text || nestedParsed.value || nestedParsed.name || extractedValue;
                  } catch (e) {
                    // Not nested JSON, use as is
                  }
                }
                
                departmentValue = extractedValue;
              } catch (e) {
                // If not JSON, use value directly as string
                departmentValue = departmentColumn.value;
              }
              
              // Clean up the value
              if (departmentValue) {
                departmentValue = String(departmentValue).trim();
                // Remove any remaining JSON-like structure if it's still a string
                if (departmentValue.startsWith('{') && departmentValue.includes('"text"')) {
                  try {
                    const finalParsed = JSON.parse(departmentValue);
                    departmentValue = finalParsed.text || finalParsed.value || finalParsed.name || departmentValue;
                  } catch (e) {
                    // Ignore parsing errors
                  }
                }
              }
            }
          }

          // Extract email - check both text and value fields
          let emailValue = null;
          if (emailColumn) {
            // First priority: text field
            if (emailColumn.text && emailColumn.text.trim()) {
              const textValue = emailColumn.text.trim();
              const columnTitle = (columnIdToTitle[emailColumn.id] || '').toLowerCase().trim();
              if (textValue.toLowerCase() !== columnTitle && textValue.includes('@')) {
                emailValue = textValue;
              }
            }
            
            // Second priority: value field
            if (!emailValue && emailColumn.value) {
              try {
                const parsed = JSON.parse(emailColumn.value);
                emailValue = parsed.email || parsed.text || parsed.value || emailColumn.value;
                if (emailValue && typeof emailValue === 'string' && !emailValue.includes('@')) {
                  emailValue = null; // Invalid email format
                }
              } catch (e) {
                // If not JSON, check if it's a valid email
                if (emailColumn.value.includes('@')) {
                  emailValue = emailColumn.value;
                }
              }
            }
          }

          // Extract phone - check both text and value fields
          let phoneValue = null;
          if (phoneColumn) {
            // First priority: text field
            if (phoneColumn.text && phoneColumn.text.trim()) {
              const textValue = phoneColumn.text.trim();
              const columnTitle = (columnIdToTitle[phoneColumn.id] || '').toLowerCase().trim();
              if (textValue.toLowerCase() !== columnTitle) {
                phoneValue = textValue;
              }
            }
            
            // Second priority: value field
            if (!phoneValue && phoneColumn.value) {
              try {
                const parsed = JSON.parse(phoneColumn.value);
                phoneValue = parsed.phone || parsed.text || parsed.value || phoneColumn.value;
              } catch (e) {
                // If not JSON, use value directly as string
                phoneValue = phoneColumn.value;
              }
            }
          }
          
          // Extract image - check file column value
          let imageValue = null;
          if (imageColumn) {
            // First priority: Check if FileValue fragment provided files directly
            if (imageColumn.files && Array.isArray(imageColumn.files) && imageColumn.files.length > 0) {
              // Try to get URL from FileAssetValue or FileDocValue
              const firstFile = imageColumn.files[0];
              if (firstFile.asset && firstFile.asset.url) {
                imageValue = firstFile.asset.url;
              } else if (firstFile.doc && firstFile.doc.url) {
                imageValue = firstFile.doc.url;
              }
            }
            
            // Second priority: File column value contains JSON with files array
            if (!imageValue && imageColumn.value) {
              try {
                const parsed = JSON.parse(imageColumn.value);
                // Check if files array exists and has at least one file
                if (parsed.files && Array.isArray(parsed.files) && parsed.files.length > 0) {
                  // Try to get URL from first file
                  const firstFile = parsed.files[0];
                  if (firstFile.url) {
                    imageValue = firstFile.url;
                  } else if (firstFile.asset && firstFile.asset.url) {
                    imageValue = firstFile.asset.url;
                  } else if (firstFile.doc && firstFile.doc.url) {
                    imageValue = firstFile.doc.url;
                  }
                }
              } catch (e) {
                // If not JSON, try to parse as string
                console.warn('Failed to parse image column value:', e);
              }
            }
          }
          
          // Collect all other columns as custom fields
          // List of columns that are already handled (should be skipped)
          const handledColumnIds = new Set([
            firstnameColumn?.id,
            lastnameColumn?.id,
            positionColumn?.id,
            departmentColumn?.id,
            emailColumn?.id,
            phoneColumn?.id,
            imageColumn?.id, // Add image column to handled list
            managerColumn?.id,
            statusColumn?.id
          ].filter(Boolean));
          
          const customFieldsData = {};
          const fieldNameToColumnIdLocal = {};
          
          // Process all column values that are not already handled
          item.column_values.forEach(col => {
            if (!col || !col.id) return;
            
            // Skip columns that are already handled
            if (handledColumnIds.has(col.id)) return;
            
            // Get column title from mapping
            const columnTitle = columnIdToTitle[col.id] || col.id;
            
            // Extract value from column
            let extractedValue = null;
            
            // First priority: text field (cell value)
            if (col.text && col.text.trim()) {
              const textValue = col.text.trim();
              const columnTitleLower = columnTitle.toLowerCase().trim();
              // Check if text field contains actual value (not column header name)
              if (textValue.toLowerCase() !== columnTitleLower) {
                extractedValue = textValue;
              }
            }
            
            // Second priority: value field (JSON or plain text)
            if (!extractedValue && col.value) {
              try {
                const parsed = JSON.parse(col.value);
                
                // Handle different column types
                if (col.type === 'dropdown' || col.type === 'status') {
                  // For dropdown/status, try to get label text
                  if (parsed.labels && Array.isArray(parsed.labels) && parsed.labels.length > 0) {
                    // If we have label IDs, try to get text from column settings
                    // For now, use the first label ID or text
                    extractedValue = parsed.labels[0];
                  } else {
                    extractedValue = parsed.text || parsed.value || col.value;
                  }
                } else if (col.type === 'email') {
                  extractedValue = parsed.email || parsed.text || parsed.value || col.value;
                } else if (col.type === 'phone') {
                  extractedValue = parsed.phone || parsed.text || parsed.value || col.value;
                } else {
                  // For other types, try common JSON structures
                  extractedValue = parsed.text || parsed.value || parsed.name || col.value;
                }
                
                // If extractedValue is still a JSON string, parse it again
                if (typeof extractedValue === 'string' && extractedValue.trim().startsWith('{')) {
                  try {
                    const nestedParsed = JSON.parse(extractedValue);
                    extractedValue = nestedParsed.text || nestedParsed.value || nestedParsed.name || extractedValue;
                  } catch (e) {
                    // Not nested JSON, use as is
                  }
                }
              } catch (e) {
                // If not JSON, use value directly as string
                extractedValue = col.value;
              }
            }
            
            // Clean up the value
            if (extractedValue) {
              extractedValue = String(extractedValue).trim();
              // Remove any remaining JSON-like structure if it's still a string
              if (extractedValue.startsWith('{') && extractedValue.includes('"text"')) {
                try {
                  const finalParsed = JSON.parse(extractedValue);
                  extractedValue = finalParsed.text || finalParsed.value || finalParsed.name || extractedValue;
                } catch (e) {
                  // Ignore parsing errors
                }
              }
              
              // Use column title as field name (sanitize for use as object key)
              const fieldName = columnTitle.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
              if (fieldName) {
                // Store mapping between field name and column ID
                fieldNameToColumnIdLocal[fieldName] = col.id;
                if (extractedValue) {
                  customFieldsData[fieldName] = extractedValue;
                }
              }
            } else {
              // Even if no value, store the mapping for future use
              const fieldName = columnTitle.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
              if (fieldName) {
                fieldNameToColumnIdLocal[fieldName] = col.id;
              }
            }
          });
          
          // Update field name to column ID mapping state
          if (Object.keys(fieldNameToColumnIdLocal).length > 0) {
            setFieldNameToColumnId(prev => ({ ...prev, ...fieldNameToColumnIdLocal }));
          }
          
          return {
            id: parseInt(item.id),
            mondayItemId: item.id, // Store Monday.com item ID for sync
            name: fullName,
            position: positionValue,
            department: departmentValue || 'General', // Use extracted department or default
            email: emailValue || `${fullName.toLowerCase().replace(/\s+/g, '.')}@company.com`, // Use extracted email or fallback
            phone: phoneValue || `+1-555-${String(100 + index).padStart(3, '0')}-${String(1000 + index).padStart(4, '0')}`, // Use extracted phone or fallback
            managerId: null, // Will be resolved in second pass
            managerName: managerName, // Store manager name for resolution
            image: imageValue || null, // Use extracted image URL or null
            ...customFieldsData // Spread all custom fields into employee object
          };
        });

        // Second pass: Apply structured hierarchical organization (like sample data)
        if (mondayEmployees.length > 0) {
          // Step 1: Identify and structure C-level executives
          const cLevelTitles = ['CTO', 'Chief Technology Officer', 'CFO', 'Chief Financial Officer', 'COO', 'Chief Operating Officer'];
          const vpTitles = ['VP', 'Vice President', 'Director'];

          // Find or create CEO
          let ceo = mondayEmployees.find(emp =>
            emp.position && (
              emp.position.toLowerCase().includes('ceo') ||
              emp.position.toLowerCase().includes('chief executive') ||
              emp.position.toLowerCase().includes('founder') ||
              emp.position.toLowerCase().includes('president')
            )
          );

          // If no CEO found, make first employee CEO
          if (!ceo) {
            ceo = mondayEmployees[0];
            ceo.managerId = null;
          } else {
            ceo.managerId = null;
          }

          // Step 2: Identify C-level executives (report to CEO)
          const cLevelEmployees = mondayEmployees.filter(emp =>
            emp !== ceo && emp.position && cLevelTitles.some(title =>
              emp.position.toLowerCase().includes(title.toLowerCase())
            )
          );

          cLevelEmployees.forEach(emp => {
            // Check if managerName is specified in Monday.com
            if (emp.managerName) {
              const managerNameLower = emp.managerName.toLowerCase().trim();
              
              // Try multiple matching strategies
              let manager = null;
              let matchingStrategy = '';
              
              // Strategy 1: Exact match (case-insensitive)
              manager = mondayEmployees.find(m =>
                m.name && m.name.toLowerCase().trim() === managerNameLower
              );
              if (manager) {
                matchingStrategy = 'exact match';
              }
              
              // Strategy 2: First name match - check if managerName is the first word of employee name
              // This handles cases like "Elene" matching "Elene Smith"
              if (!manager) {
                manager = mondayEmployees.find(m => {
                  if (!m.name) return false;
                  const employeeNameLower = m.name.toLowerCase().trim();
                  const employeeNameParts = employeeNameLower.split(/\s+/);
                  
                  // Check if managerName matches the first name (first word) of employee
                  if (employeeNameParts.length > 0) {
                    const firstName = employeeNameParts[0];
                    if (firstName === managerNameLower || firstName.startsWith(managerNameLower) || managerNameLower.startsWith(firstName)) {
                      return true;
                    }
                  }
                  return false;
                });
                if (manager) {
                  matchingStrategy = 'first name match';
                }
              }
              
              // Strategy 3: Starts with match - check if employee name starts with managerName
              if (!manager) {
                manager = mondayEmployees.find(m => {
                  if (!m.name) return false;
                  const employeeNameLower = m.name.toLowerCase().trim();
                  return employeeNameLower.startsWith(managerNameLower + ' ') || 
                         employeeNameLower === managerNameLower;
                });
                if (manager) {
                  matchingStrategy = 'starts with match';
                }
              }
              
              // Strategy 4: Partial match - managerName contains employee name or vice versa (strict: require at least 3 chars)
              if (!manager && managerNameLower.length >= 3) {
                manager = mondayEmployees.find(m => {
                  if (!m.name) return false;
                  const employeeNameLower = m.name.toLowerCase().trim();
                  // Require at least 3 characters for partial match
                  if (managerNameLower.length >= 3 && employeeNameLower.length >= 3) {
                    return employeeNameLower.includes(managerNameLower) || 
                           managerNameLower.includes(employeeNameLower);
                  }
                  return false;
                });
                if (manager) {
                  matchingStrategy = 'partial match';
                }
              }
              
              // Strategy 5: Fuzzy match - find by first name or last name (word-by-word, strict: exact word match)
              if (!manager) {
                const managerNameParts = managerNameLower.split(/\s+/);
                manager = mondayEmployees.find(m => {
                  if (!m.name) return false;
                  const employeeNameLower = m.name.toLowerCase().trim();
                  const employeeNameParts = employeeNameLower.split(/\s+/);
                  
                  // Only match if at least one word matches exactly
                  return managerNameParts.some(part => 
                    employeeNameParts.some(empPart => empPart === part)
                  );
                });
                if (manager) {
                  matchingStrategy = 'fuzzy match';
                }
              }
              
              if (manager) {
                emp.managerId = manager.id;
              } else {
                // Manager was specified but not found - leave as null
                emp.managerId = null;
              }
            }
            // If no managerName specified, leave as null (don't default to CEO)
          });

          // Step 3: Identify VPs/Directors (report to C-level or CEO)
          const vpEmployees = mondayEmployees.filter(emp =>
            emp !== ceo && !cLevelEmployees.includes(emp) && emp.position &&
            vpTitles.some(title => emp.position.toLowerCase().includes(title.toLowerCase()))
          );

          vpEmployees.forEach(vp => {
            let assignedManager = null;
            
            // First: Check if managerName is specified in Monday.com
            if (vp.managerName) {
              const managerNameLower = vp.managerName.toLowerCase().trim();
              
              // Try multiple matching strategies
              let manager = null;
              let matchingStrategy = '';
              
              // Strategy 1: Exact match (case-insensitive)
              manager = mondayEmployees.find(m =>
                m.name && m.name.toLowerCase().trim() === managerNameLower
              );
              if (manager) {
                matchingStrategy = 'exact match';
              }
              
              // Strategy 2: First name match - check if managerName is the first word of employee name
              if (!manager) {
                manager = mondayEmployees.find(m => {
                  if (!m.name) return false;
                  const employeeNameLower = m.name.toLowerCase().trim();
                  const employeeNameParts = employeeNameLower.split(/\s+/);
                  
                  if (employeeNameParts.length > 0) {
                    const firstName = employeeNameParts[0];
                    if (firstName === managerNameLower || firstName.startsWith(managerNameLower) || managerNameLower.startsWith(firstName)) {
                      return true;
                    }
                  }
                  return false;
                });
                if (manager) {
                  matchingStrategy = 'first name match';
                }
              }
              
              // Strategy 3: Starts with match - check if employee name starts with managerName
              if (!manager) {
                manager = mondayEmployees.find(m => {
                  if (!m.name) return false;
                  const employeeNameLower = m.name.toLowerCase().trim();
                  return employeeNameLower.startsWith(managerNameLower + ' ') || 
                         employeeNameLower === managerNameLower;
                });
                if (manager) {
                  matchingStrategy = 'starts with match';
                }
              }
              
              // Strategy 4: Partial match - managerName contains employee name or vice versa (strict: require at least 3 chars)
              if (!manager && managerNameLower.length >= 3) {
                manager = mondayEmployees.find(m => {
                  if (!m.name) return false;
                  const employeeNameLower = m.name.toLowerCase().trim();
                  // Require at least 3 characters for partial match
                  if (managerNameLower.length >= 3 && employeeNameLower.length >= 3) {
                    return employeeNameLower.includes(managerNameLower) || 
                           managerNameLower.includes(employeeNameLower);
                  }
                  return false;
                });
                if (manager) {
                  matchingStrategy = 'partial match';
                }
              }
              
              // Strategy 5: Fuzzy match - find by first name or last name (word-by-word, strict: exact word match)
              if (!manager) {
                const managerNameParts = managerNameLower.split(/\s+/);
                manager = mondayEmployees.find(m => {
                  if (!m.name) return false;
                  const employeeNameLower = m.name.toLowerCase().trim();
                  const employeeNameParts = employeeNameLower.split(/\s+/);
                  
                  // Only match if at least one word matches exactly
                  return managerNameParts.some(part => 
                    employeeNameParts.some(empPart => empPart === part)
                  );
                });
                if (manager) {
                  matchingStrategy = 'fuzzy match';
                }
              }
              
              if (manager) {
                assignedManager = manager;
              }
              // If manager not found, leave assignedManager as null
            }
            
            // Second: Only use department/position logic if managerName not specified
            if (!assignedManager && !vp.managerName) {
              const position = vp.position.toLowerCase();
              if (position.includes('engineering') || position.includes('technology') || position.includes('tech')) {
                assignedManager = cLevelEmployees.find(c =>
                  c.position && c.position.toLowerCase().includes('cto')
                ) || ceo;
              } else if (position.includes('finance') || position.includes('financial')) {
                assignedManager = cLevelEmployees.find(c =>
                  c.position && c.position.toLowerCase().includes('cfo')
                ) || ceo;
              } else if (position.includes('marketing') || position.includes('sales') || position.includes('operation')) {
                assignedManager = cLevelEmployees.find(c =>
                  c.position && c.position.toLowerCase().includes('coo')
                ) || ceo;
              } else if (position.includes('hr') || position.includes('human')) {
                assignedManager = cLevelEmployees.find(c =>
                  c.position && c.position.toLowerCase().includes('coo')
                ) || ceo;
              } else {
                assignedManager = ceo;
              }
            }

            // Set managerId (can be null if managerName was specified but not found)
            vp.managerId = assignedManager ? assignedManager.id : null;
          });

          // Step 4: Assign remaining employees based on department/position (like sample data)
          const remainingEmployees = mondayEmployees.filter(emp =>
            emp !== ceo && !cLevelEmployees.includes(emp) && !vpEmployees.includes(emp)
          );

          remainingEmployees.forEach(emp => {
            let assignedManager = null;
            let managerNameSpecified = false;

            if (emp.managerName) {
              managerNameSpecified = true;
              const managerNameLower = emp.managerName.toLowerCase().trim();
              
              // Try multiple matching strategies
                let manager = null;
              let matchingStrategy = '';
              
              // Strategy 1: Exact match (case-insensitive)
              manager = mondayEmployees.find(m =>
                m.name && m.name.toLowerCase().trim() === managerNameLower
              );
              if (manager) {
                matchingStrategy = 'exact match';
              }
              
              // Strategy 2: First name match - check if managerName is the first word of employee name
              // This handles cases like "Elene" matching "Elene Smith"
              if (!manager) {
                manager = mondayEmployees.find(m => {
                  if (!m.name) return false;
                  const employeeNameLower = m.name.toLowerCase().trim();
                  const employeeNameParts = employeeNameLower.split(/\s+/);
                  
                  // Check if managerName matches the first name (first word) of employee
                  if (employeeNameParts.length > 0) {
                    const firstName = employeeNameParts[0];
                    if (firstName === managerNameLower || firstName.startsWith(managerNameLower) || managerNameLower.startsWith(firstName)) {
                      return true;
                    }
                  }
                  return false;
                });
                if (manager) {
                  matchingStrategy = 'first name match';
                }
              }
              
              // Strategy 3: Starts with match - check if employee name starts with managerName
              if (!manager) {
                manager = mondayEmployees.find(m => {
                  if (!m.name) return false;
                  const employeeNameLower = m.name.toLowerCase().trim();
                  return employeeNameLower.startsWith(managerNameLower + ' ') || 
                         employeeNameLower === managerNameLower;
                });
                if (manager) {
                  matchingStrategy = 'starts with match';
                }
              }
              
              // Strategy 4: Partial match - managerName contains employee name or vice versa (strict: require at least 3 chars)
              if (!manager && managerNameLower.length >= 3) {
                manager = mondayEmployees.find(m => {
                  if (!m.name) return false;
                  const employeeNameLower = m.name.toLowerCase().trim();
                  // Require at least 3 characters for partial match
                  if (managerNameLower.length >= 3 && employeeNameLower.length >= 3) {
                    return employeeNameLower.includes(managerNameLower) || 
                           managerNameLower.includes(employeeNameLower);
                  }
                  return false;
                });
                if (manager) {
                  matchingStrategy = 'partial match';
                }
              }
              
              // Strategy 5: Fuzzy match - find by first name or last name (word-by-word, strict: exact word match)
              if (!manager) {
                const managerNameParts = managerNameLower.split(/\s+/);
                manager = mondayEmployees.find(m => {
                  if (!m.name) return false;
                  const employeeNameLower = m.name.toLowerCase().trim();
                  const employeeNameParts = employeeNameLower.split(/\s+/);
                  
                  // Only match if at least one word matches exactly
                  return managerNameParts.some(part => 
                    employeeNameParts.some(empPart => empPart === part)
                  );
                });
                if (manager) {
                  matchingStrategy = 'fuzzy match';
                }
              }
              
              if (manager) {
                assignedManager = manager;
              }
            }

            // Only use department/position logic if managerName was NOT specified in Monday.com
            // If managerName was specified but not found, leave managerId as null
            if (!assignedManager && !managerNameSpecified) {
              const position = emp.position ? emp.position.toLowerCase() : '';
              
              // Determine department based on position (since Monday.com doesn't have department)
              let department = 'Other';
              if (position.includes('engineer') || position.includes('developer') || position.includes('software') || 
                  position.includes('technical') || position.includes('programmer') || position.includes('architect') ||
                  position.includes('qa') || position.includes('devops')) {
                department = 'Technology';
              } else if (position.includes('marketing') || position.includes('brand') || position.includes('content') ||
                         position.includes('social media') || position.includes('seo') || position.includes('marketing specialist')) {
                department = 'Marketing';
                } else if (position.includes('sales') || position.includes('account executive') || 
                         position.includes('customer success') || position.includes('business development') ||
                         position.includes('representative')) {
                department = 'Sales';
                } else if (position.includes('hr') || position.includes('human resources') || 
                         position.includes('recruiter') || position.includes('talent') || position.includes('coordinator')) {
                department = 'Human Resources';
                } else if (position.includes('finance') || position.includes('accountant') || 
                           position.includes('financial') || position.includes('accounting')) {
                department = 'Finance';
              } else if (position.includes('operations') || position.includes('operation') ||
                         position.includes('project manager') || position.includes('scrum master')) {
                department = 'Operations';
              }

              // Assign manager based on department (like sample data logic)
              if (department === 'Technology' || department === 'Engineering') {
                // CTO or VP Engineering
                const vpEngineering = vpEmployees.find(vp =>
                  vp.position && vp.position.toLowerCase().includes('engineering')
                );
                const cto = cLevelEmployees.find(c =>
                  c.position && c.position.toLowerCase().includes('cto')
                );
                assignedManager = vpEngineering || cto || ceo;
              } else if (department === 'Marketing') {
                // VP Marketing
                const vpMarketing = vpEmployees.find(vp =>
                  vp.position && vp.position.toLowerCase().includes('marketing')
                );
                assignedManager = vpMarketing || ceo;
              } else if (department === 'Sales') {
                // VP Sales
                const vpSales = vpEmployees.find(vp =>
                  vp.position && vp.position.toLowerCase().includes('sales')
                );
                assignedManager = vpSales || ceo;
              } else if (department === 'Human Resources') {
                // VP HR
                const vpHr = vpEmployees.find(vp =>
                  vp.position && vp.position.toLowerCase().includes('hr')
                );
                assignedManager = vpHr || ceo;
              } else if (department === 'Finance') {
                // CFO
                const cfo = cLevelEmployees.find(c =>
                  c.position && c.position.toLowerCase().includes('cfo')
                );
                assignedManager = cfo || ceo;
              } else if (department === 'Operations') {
                // COO
                const coo = cLevelEmployees.find(c =>
                  c.position && c.position.toLowerCase().includes('coo')
                );
                assignedManager = coo || ceo;
              } else {
                // For other departments, assign to existing managers (like sample data)
                const existingManagers = mondayEmployees.filter(m => 
                  m !== emp && (
                    m.position && (
                      m.position.toLowerCase().includes('vp') || 
                      m.position.toLowerCase().includes('manager') || 
                      m.position.toLowerCase().includes('lead')
                    )
                  )
                );
                if (existingManagers.length > 0) {
                  // Randomly assign to one of the managers (like sample data)
                  assignedManager = existingManagers[Math.floor(Math.random() * existingManagers.length)];
                } else {
                  assignedManager = ceo; // Default to CEO
                }
              }
            }

            // Set manager ID - if managerName was specified but not found, leave as null
            if (assignedManager) {
              emp.managerId = assignedManager.id;
            } else {
              emp.managerId = null;
            }
          });

          // Step 5: Organize employees hierarchically (same as before)
          const organizeHierarchically = (employees) => {
            const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
            const organized = [];
            const processed = new Set();

            // Helper to get hierarchy level (distance from root)
            const getLevel = (employeeId) => {
              const emp = employeeMap.get(employeeId);
              if (!emp) return 999; // Invalid employee
              if (emp.managerId === null) return 0; // CEO (explicitly no manager)
              if (emp.managerId === undefined) return 999; // Unresolved manager (put at end)
              const manager = employeeMap.get(emp.managerId);
              if (!manager) return 999; // Manager not found
              return 1 + getLevel(emp.managerId);
            };

            // Sort by hierarchy level (CEO = 0, then 1, 2, etc.)
            const sorted = [...employees].sort((a, b) => {
              const levelA = getLevel(a.id);
              const levelB = getLevel(b.id);
              if (levelA !== levelB) {
                return levelA - levelB;
              }
              // Same level: sort by name
              return a.name.localeCompare(b.name);
            });

            return sorted;
          };

          const organizedEmployees = organizeHierarchically(mondayEmployees);

          // Remove managerName field (no longer needed)
          organizedEmployees.forEach(emp => {
            delete emp.managerName;
          });

          console.log(`✅ Monday.com-დან დატვირთული: ${organizedEmployees.length} თანამშრომელი`);
          setEmployees(organizedEmployees);
          localStorage.setItem('employees', JSON.stringify(organizedEmployees));
          lastSyncTimeRef.current = Date.now(); // Update last sync time
          
          // Update last manager values after reload
          const updatedManagerValues = {};
          mondayEmployees.forEach(emp => {
            if (emp.mondayItemId && emp.managerName) {
              updatedManagerValues[emp.mondayItemId] = emp.managerName;
            }
          });
          lastManagerValuesRef.current = updatedManagerValues;
        }
      }
    } catch (error) {
      console.error('❌ Error loading employees from Monday.com:', error.message || error);

      // Fall back to sample data if Monday.com data loading fails
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees));
      } else {
        // Generate sample data if no saved data exists
        resetToSampleData();
      }
    }
  };

  // Polling mechanism to sync changes from Monday.com - temporarily disabled
  // useEffect(() => {
  //   if (!mondayBoardId || isSyncing) return;
  //   // Sync functionality disabled due to code issues
  // }, [mondayBoardId, isSyncing]);

  const openSettingsModal = (section = 'field-management') => {
    setActiveSettingsSection(section);
    setShowSettingsModal(true);
    setShowSettingsMenu(false);
  };
      const phoneColumnId = findColumnIdByTitle('phone') || findColumnIdByTitle('mobile');
      const managerColumnId = findColumnIdByTitle('manager') || findColumnIdByTitle('reports_to');

      // Get manager name if exists
      const managerName = employee.managerId ? getEmployeeNameById(employee.managerId) : '';

      // Build column values JSON
      const columnValues = {};

      // Position column - Monday.com API requires JSON format {"text": "value"} for all text columns
      if (positionColumnId && employee.position) {
        // Each value must be a JSON string
        columnValues[positionColumnId] = JSON.stringify({ text: employee.position });
      }

      // Department column - handle dropdown or text type
      if (departmentColumnId && employee.department) {
        if (departmentColumnInfo && departmentColumnInfo.type === 'dropdown' && departmentColumnInfo.labels) {
          // Dropdown column - find matching label ID or text
          const labels = departmentColumnInfo.labels;
          let labelId = null;
          let labelText = null;
          
          // Try to find exact match (case-insensitive)
          for (const [id, text] of Object.entries(labels)) {
            const textStr = String(text || '');
            const departmentStr = String(employee.department || '');
            
            if (textStr === departmentStr || textStr.toLowerCase() === departmentStr.toLowerCase()) {
              labelId = parseInt(id);
              labelText = textStr;
              break;
            }
          }
          
          if (labelId !== null) {
            // Use label ID (preferred) - value must be JSON string
            columnValues[departmentColumnId] = JSON.stringify({ labels: [labelId] });
          } else if (labelText) {
            // Use label text as fallback - value must be JSON string
            columnValues[departmentColumnId] = JSON.stringify({ labels: [labelText] });
          }
          // If no match found, skip setting department column
        } else {
          // Text column - value must be JSON string
          columnValues[departmentColumnId] = JSON.stringify({ text: employee.department });
        }
      }

      // Email column
      if (emailColumnId && employee.email) {
        // Value must be JSON string
        columnValues[emailColumnId] = JSON.stringify({ email: employee.email });
      }

      // Phone column
      if (phoneColumnId && employee.phone) {
        // Value must be JSON string
        columnValues[phoneColumnId] = JSON.stringify({ phone: employee.phone, countryShortName: 'US' });
      }

      // Manager column - handle dropdown or text type
      if (managerColumnId && managerName) {
        if (managerColumnInfo && managerColumnInfo.type === 'dropdown' && managerColumnInfo.labels) {
          // Dropdown column - find matching label ID or text
          const labels = managerColumnInfo.labels;
          let labelId = null;
          let labelText = null;
          
          // Try to find exact match (case-insensitive)
          for (const [id, text] of Object.entries(labels)) {
            // Ensure both text and managerName are strings
            const textStr = String(text || '');
            const managerNameStr = String(managerName || '');
            
            if (textStr === managerNameStr || textStr.toLowerCase() === managerNameStr.toLowerCase()) {
              labelId = parseInt(id);
              labelText = textStr;
              break;
            }
          }
          
          if (labelId !== null) {
            // Use label ID (preferred) - value must be JSON string
            columnValues[managerColumnId] = JSON.stringify({ labels: [labelId] });
          } else if (labelText) {
            // Use label text as fallback - value must be JSON string
            columnValues[managerColumnId] = JSON.stringify({ labels: [labelText] });
          }
          // If no match found, skip setting manager column
        } else {
          // Text column - value must be JSON string
          columnValues[managerColumnId] = JSON.stringify({ text: managerName });
        }
      }

      // Handle custom fields - iterate through all employee properties
      const standardFields = ['id', 'mondayItemId', 'name', 'position', 'department', 'email', 'phone', 'managerId', 'managerName', 'image'];
      
      for (const [fieldName, fieldValue] of Object.entries(employee)) {
        // Skip standard fields
        if (standardFields.includes(fieldName)) continue;
        
        // Skip empty values
        if (!fieldValue || (typeof fieldValue === 'string' && !fieldValue.trim())) continue;
        
        // Find Monday.com column ID for this field
        let columnId = fieldNameToColumnId[fieldName];
        
        // If not found in mapping, try to find by title (case-insensitive, partial match)
        if (!columnId) {
          // Try exact match first (sanitized title)
          let entry = Object.entries(mondayColumnMapping).find(([id, colTitle]) => {
            const sanitizedTitle = (colTitle || '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
            return sanitizedTitle === fieldName;
          });
          
          // If not found, try case-insensitive partial match
          if (!entry) {
            entry = Object.entries(mondayColumnMapping).find(([id, colTitle]) => {
              const sanitizedTitle = (colTitle || '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
              const fieldNameLower = fieldName.toLowerCase();
              return sanitizedTitle.includes(fieldNameLower) || fieldNameLower.includes(sanitizedTitle);
            });
          }
          
          // If still not found, try reverse lookup - check if fieldName matches any column title
          if (!entry) {
            entry = Object.entries(mondayColumnMapping).find(([id, colTitle]) => {
              const colTitleLower = (colTitle || '').toLowerCase().trim();
              const fieldNameLower = fieldName.toLowerCase().replace(/_/g, ' ');
              return colTitleLower === fieldNameLower || colTitleLower.includes(fieldNameLower) || fieldNameLower.includes(colTitleLower);
            });
          }
          
          if (entry) {
            columnId = entry[0];
            // Update mapping for future use
            setFieldNameToColumnId(prev => ({ ...prev, [fieldName]: columnId }));
          }
        }
        
        if (!columnId) {
          console.warn('⚠️ Custom field not found in Monday.com:', {
            fieldName,
            fieldValue,
            availableFields: Object.keys(fieldNameToColumnId),
            availableColumns: Object.keys(mondayColumnMapping).map(id => ({ id, title: mondayColumnMapping[id] }))
          });
          continue; // Skip if column not found
        }
        
        // Get column type
        const columnType = columnIdToType[columnId] || 'text';
        
        // Format value according to column type - each value must be JSON string
        let formattedValue = null;
        
        if (columnType === 'email') {
          formattedValue = JSON.stringify({ email: String(fieldValue) });
        } else if (columnType === 'phone') {
          formattedValue = JSON.stringify({ phone: String(fieldValue), countryShortName: 'US' });
        } else if (columnType === 'dropdown' || columnType === 'status') {
          // For dropdown/status, try to find matching label
          // For now, use text format as fallback
          formattedValue = JSON.stringify({ text: String(fieldValue) });
        } else if (columnType === 'text') {
          // For text columns, Monday.com API expects JSON format {"text": "value"}
          formattedValue = JSON.stringify({ text: String(fieldValue) });
        } else {
          // Default: use JSON format for other types
          formattedValue = JSON.stringify({ text: String(fieldValue) });
        }
        
        if (formattedValue) {
          columnValues[columnId] = formattedValue; // Value is JSON string
        }
      }

      // Convert column values for Monday.com API
      // Monday.com API expects column_values as a JSON object where each value is a JSON object
      // Convert JSON strings to objects (like updateEmployeeInMonday does)
      // columnValues object structure: { "columnId": "{\"text\":\"value\"}" } -> { "columnId": {text: "value"} }
      let response;
      
      console.log('🔍 Column values prepared:', Object.keys(columnValues).length, 'columns');
      
      // Use Monday.com SDK's monday.api() method which handles token automatically
      // Convert JSON strings to objects for JSON! type variable (like updateEmployeeInMonday)
      if (Object.keys(columnValues).length > 0) {
        // Convert columnValues object - parse each JSON string value to object
        const columnValuesObj = {};
        for (const [columnId, jsonString] of Object.entries(columnValues)) {
          try {
            columnValuesObj[columnId] = JSON.parse(jsonString);
          } catch (e) {
            console.warn('⚠️ Failed to parse JSON string for column:', columnId, jsonString);
            // If parsing fails, try to use as-is
            columnValuesObj[columnId] = jsonString;
          }
        }
        
        const mutation = `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
          create_item(
            board_id: $boardId,
            item_name: $itemName,
            column_values: $columnValues
          ) {
            id
            name
          }
        }`;
        
        const variables = {
          boardId: String(mondayBoardId),
          itemName: employee.name,
          columnValues: columnValuesObj  // Pass raw object (like updateEmployeeInMonday)
        };
        
        console.log('🔍 Create Employee Mutation:', mutation);
        console.log('🔍 Column Values Object (with JSON strings):', columnValues);
        console.log('🔍 Column Values Object (parsed to objects):', columnValuesObj);
        console.log('🔍 Variables:', variables);
        
        // Use SDK's monday.api() which handles token automatically
        console.log('🔍 Using Monday.com SDK to create employee...');
        response = await monday.api(mutation, { variables });
        console.log('🔍 SDK response received:', response);
        
        if (response.errors) {
          console.error('❌ Monday.com API error:', response.errors);
          const errorMessage = response.errors[0]?.message || 'GraphQL validation errors';
          alert('Failed to create employee in Monday.com: ' + errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        // Create item without column values if no columns found
        const mutation = `mutation ($boardId: ID!, $itemName: String!) {
          create_item(
            board_id: $boardId,
            item_name: $itemName
          ) {
            id
            name
          }
        }`;
        
        const variables = {
          boardId: String(mondayBoardId),
          itemName: employee.name
        };
        
        console.log('🔍 Creating item without column values, variables:', variables);
        
        // Use SDK's monday.api() which handles token automatically
        console.log('🔍 Using Monday.com SDK to create employee (no column values)...');
        response = await monday.api(mutation, { variables });
        console.log('🔍 SDK response received:', response);
        
        if (response.errors) {
          console.error('❌ Monday.com API error:', response.errors);
          const errorMessage = response.errors[0]?.message || 'GraphQL validation errors';
          alert('Failed to create employee in Monday.com: ' + errorMessage);
          throw new Error(errorMessage);
        }
      }
      
      if (response && response.data && response.data.create_item) {
        const itemId = response.data.create_item.id;
        console.log('✅ createEmployeeInMonday completed successfully, returning item ID:', itemId);
        return itemId;
      }
      
      if (response && response.errors) {
        console.error('❌ Monday.com API error:', response.errors);
      }
      
      console.warn('⚠️ createEmployeeInMonday: No item ID in response');
      return null;
    } catch (error) {
      console.error('❌ Error creating employee in Monday.com:', error);
      console.error('❌ Error stack:', error.stack);
      // Don't show alert here - it's already shown in the fetch error handling above
      // Return null to allow the employee to be added locally even if Monday.com sync fails
      return null;
    }
  };

  // Update employee in Monday.com
  const updateEmployeeInMonday = async (employee) => {
    if (!mondayBoardId || !employee.mondayItemId) {
      return;
    }

    try {
      // Find column IDs from mapping (don't use fallback strings - they won't work)
      const positionColumnId = findColumnIdByTitle('position');
      const departmentColumnId = findColumnIdByTitle('department');
      const emailColumnId = findColumnIdByTitle('email');
      const phoneColumnId = findColumnIdByTitle('phone') || findColumnIdByTitle('mobile');
      const managerColumnId = findColumnIdByTitle('manager') || findColumnIdByTitle('reports_to');

      // Debug: Log found column IDs
      console.log('🔍 Found column IDs:', {
        position: positionColumnId,
        department: departmentColumnId,
        email: emailColumnId,
        phone: phoneColumnId,
        manager: managerColumnId,
        availableColumns: Object.entries(mondayColumnMapping).map(([id, title]) => ({ id, title }))
      });

      // Get manager name if exists
      const managerName = employee.managerId ? getEmployeeNameById(employee.managerId) : '';

      // Update each column value with unique aliases to avoid GraphQL conflicts
      // Use GraphQL variables with JSON! type and raw JavaScript objects
      // Monday.com SDK should serialize JSON! type variables correctly
      const updates = [];
      const variables = {};
      let aliasCounter = 1;
      let varCounter = 1;

      // Position column - Monday.com API requires JSON format {"text": "value"} for all text columns
      if (positionColumnId && employee.position) {
        // Use GraphQL variable with JSON! type and raw JavaScript object
        const positionValue = { text: employee.position };
        const varName = `value${varCounter++}`;
        variables[varName] = positionValue;
        updates.push(`update${aliasCounter++}: change_column_value(
          board_id: ${mondayBoardId},
          item_id: ${employee.mondayItemId},
          column_id: "${positionColumnId}",
          value: $${varName}
        ) { id }`);
      }

      // Department column - handle dropdown or text type
      if (departmentColumnId && employee.department) {
        console.log('🔍 Processing department:', {
          departmentColumnId,
          department: employee.department,
          hasDepartmentColumnInfo: !!departmentColumnInfo,
          departmentColumnInfoType: departmentColumnInfo?.type,
          hasLabels: !!departmentColumnInfo?.labels
        });
        
        let departmentValue = null;
        
        if (departmentColumnInfo && departmentColumnInfo.type === 'dropdown' && departmentColumnInfo.labels) {
          // Dropdown column - find matching label ID or text
          const labels = departmentColumnInfo.labels;
          let labelId = null;
          let labelText = null;
          
          // Normalize department value (trim and lowercase, replace & with and)
          const departmentStr = String(employee.department || '').trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, ' ');
          
          // Try to find exact match (case-insensitive, trimmed)
          for (const [id, text] of Object.entries(labels)) {
            const textStr = String(text || '').trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, ' ');
            
            // Exact match
            if (textStr === departmentStr) {
              labelId = parseInt(id);
              labelText = String(text || '').trim();
              break;
            }
            
            // Partial match (department contains label or label contains department)
            if (textStr.includes(departmentStr) || departmentStr.includes(textStr)) {
              labelId = parseInt(id);
              labelText = String(text || '').trim();
              break;
            }
          }
          
          console.log('🔍 Department dropdown match result:', {
            labelId,
            labelText,
            searchingFor: departmentStr,
            labels: Object.entries(labels).map(([id, text]) => ({ 
              id, 
              text: String(text || '').trim(),
              normalized: String(text || '').trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, ' ')
            }))
          });
          
          if (labelId !== null) {
            // Use label ID (preferred)
            departmentValue = JSON.stringify({ labels: [labelId] });
          } else if (labelText) {
            // Use label text as fallback
            departmentValue = JSON.stringify({ labels: [labelText] });
          } else {
            // No match found - use text format as fallback for dropdown
            console.log('⚠️ Department dropdown match not found, using text format');
            departmentValue = JSON.stringify({ text: employee.department });
          }
        } else {
          // Text column - use text format
          departmentValue = JSON.stringify({ text: employee.department });
          console.log('🔍 Department text value:', departmentValue);
        }
        
        if (departmentValue) {
          // Parse JSON string to object for JSON! type variable
          const departmentValueObj = JSON.parse(departmentValue);
          const varName = `value${varCounter++}`;
          variables[varName] = departmentValueObj;
          updates.push(`update${aliasCounter++}: change_column_value(
            board_id: ${mondayBoardId},
            item_id: ${employee.mondayItemId},
            column_id: "${departmentColumnId}",
            value: $${varName}
          ) { id }`);
          console.log('✅ Department added to updates:', departmentValueObj);
        } else {
          console.log('⚠️ Department value is null, not added');
        }
      } else {
        console.log('⚠️ Department not processed:', {
          hasColumnId: !!departmentColumnId,
          hasDepartment: !!employee.department,
          departmentValue: employee.department
        });
      }

      // Email column
      if (emailColumnId && employee.email) {
        // Use GraphQL variable with JSON! type and raw JavaScript object
        const emailValue = { email: employee.email };
        const varName = `value${varCounter++}`;
        variables[varName] = emailValue;
        updates.push(`update${aliasCounter++}: change_column_value(
          board_id: ${mondayBoardId},
          item_id: ${employee.mondayItemId},
          column_id: "${emailColumnId}",
          value: $${varName}
        ) { id }`);
      }

      // Phone column
      if (phoneColumnId && employee.phone) {
        // Use GraphQL variable with JSON! type and raw JavaScript object
        const phoneValue = { phone: employee.phone, countryShortName: 'US' };
        const varName = `value${varCounter++}`;
        variables[varName] = phoneValue;
        updates.push(`update${aliasCounter++}: change_column_value(
          board_id: ${mondayBoardId},
          item_id: ${employee.mondayItemId},
          column_id: "${phoneColumnId}",
          value: $${varName}
        ) { id }`);
      }

      // Manager column - handle dropdown or text type
      if (managerColumnId) {
        console.log('🔍 Processing manager:', {
          managerColumnId,
          managerName,
          hasManagerId: !!employee.managerId,
          hasManagerColumnInfo: !!managerColumnInfo,
          managerColumnInfoType: managerColumnInfo?.type,
          hasLabels: !!managerColumnInfo?.labels
        });
        
        let managerValue;
        
        if (managerName && managerColumnInfo && managerColumnInfo.type === 'dropdown' && managerColumnInfo.labels) {
          // Dropdown column - find matching label ID or text
          const labels = managerColumnInfo.labels;
          let labelId = null;
          let labelText = null;
          
          // Try to find exact match (case-insensitive)
          // Normalize manager name (trim and lowercase)
          const managerNameStr = String(managerName || '').trim().toLowerCase();
          
          // Try to find exact match (case-insensitive, trimmed)
          for (const [id, text] of Object.entries(labels)) {
            const textStr = String(text || '').trim().toLowerCase();
            
            // Exact match
            if (textStr === managerNameStr) {
              labelId = parseInt(id);
              labelText = String(text || '').trim();
              break;
            }
            
            // Partial match (manager name contains label or label contains manager name)
            if (textStr.includes(managerNameStr) || managerNameStr.includes(textStr)) {
              labelId = parseInt(id);
              labelText = String(text || '').trim();
              break;
            }
          }
          
          console.log('🔍 Manager dropdown match result:', {
            labelId,
            labelText,
            searchingFor: managerNameStr,
            labels: Object.entries(labels).map(([id, text]) => ({ 
              id, 
              text: String(text || '').trim(),
              normalized: String(text || '').trim().toLowerCase()
            }))
          });
          
          if (labelId !== null) {
            // Use label ID (preferred)
            managerValue = JSON.stringify({ labels: [labelId] });
          } else if (labelText) {
            // Use label text as fallback
            managerValue = JSON.stringify({ labels: [labelText] });
          } else {
            // No match found - use text format as fallback for dropdown
            console.log('⚠️ Manager dropdown match not found, using text format');
            managerValue = JSON.stringify({ text: managerName });
          }
        } else if (managerName) {
          // Text column - use text format
          managerValue = JSON.stringify({ text: managerName });
          console.log('🔍 Manager text value:', managerValue);
        } else {
          // No manager name, clear the column
          if (managerColumnInfo && managerColumnInfo.type === 'dropdown') {
            managerValue = JSON.stringify({ labels: [] });
          } else {
            managerValue = JSON.stringify({ text: '' });
          }
          console.log('🔍 Manager cleared (empty value):', managerValue);
        }
        
        console.log('🔍 Manager value result:', {
          managerValue,
          willBeAdded: !!managerValue
        });
        
        if (managerValue) {
          // Parse JSON string to object for JSON! type variable
          const managerValueObj = JSON.parse(managerValue);
          const varName = `value${varCounter++}`;
          variables[varName] = managerValueObj;
          updates.push(`update${aliasCounter++}: change_column_value(
            board_id: ${mondayBoardId},
            item_id: ${employee.mondayItemId},
            column_id: "${managerColumnId}",
            value: $${varName}
          ) { id }`);
          console.log('✅ Manager added to updates:', managerValueObj);
        } else {
          console.log('⚠️ Manager value is null, not added');
        }
      } else {
        console.log('⚠️ Manager column ID not found');
      }

      // Handle custom fields - iterate through all employee properties
      const standardFields = ['id', 'mondayItemId', 'name', 'position', 'department', 'email', 'phone', 'managerId', 'managerName', 'image'];
      
      for (const [fieldName, fieldValue] of Object.entries(employee)) {
        // Skip standard fields
        if (standardFields.includes(fieldName)) continue;
        
        // Skip empty values
        if (!fieldValue || (typeof fieldValue === 'string' && !fieldValue.trim())) continue;
        
        // Find Monday.com column ID for this field
        let columnId = fieldNameToColumnId[fieldName];
        
        // If not found in mapping, try to find by title (case-insensitive, partial match)
        if (!columnId) {
          // Try exact match first (sanitized title)
          let entry = Object.entries(mondayColumnMapping).find(([id, colTitle]) => {
            const sanitizedTitle = (colTitle || '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
            return sanitizedTitle === fieldName;
          });
          
          // If not found, try case-insensitive partial match
          if (!entry) {
            entry = Object.entries(mondayColumnMapping).find(([id, colTitle]) => {
              const sanitizedTitle = (colTitle || '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
              const fieldNameLower = fieldName.toLowerCase();
              return sanitizedTitle.includes(fieldNameLower) || fieldNameLower.includes(sanitizedTitle);
            });
          }
          
          // If still not found, try reverse lookup - check if fieldName matches any column title
          if (!entry) {
            entry = Object.entries(mondayColumnMapping).find(([id, colTitle]) => {
              const colTitleLower = (colTitle || '').toLowerCase().trim();
              const fieldNameLower = fieldName.toLowerCase().replace(/_/g, ' ');
              return colTitleLower === fieldNameLower || colTitleLower.includes(fieldNameLower) || fieldNameLower.includes(colTitleLower);
            });
          }
          
          if (entry) {
            columnId = entry[0];
            // Update mapping for future use
            setFieldNameToColumnId(prev => ({ ...prev, [fieldName]: columnId }));
          }
        }
        
        if (!columnId) {
          console.warn('⚠️ Custom field not found in Monday.com:', {
            fieldName,
            fieldValue,
            availableFields: Object.keys(fieldNameToColumnId),
            availableColumns: Object.keys(mondayColumnMapping).map(id => ({ id, title: mondayColumnMapping[id] }))
          });
          continue; // Skip if column not found
        }
        
        // Get column type
        const columnType = columnIdToType[columnId] || 'text';
        
        // Format value according to column type
        let formattedValue = null;
        
        if (columnType === 'email') {
          formattedValue = JSON.stringify({ email: String(fieldValue) });
        } else if (columnType === 'phone') {
          formattedValue = JSON.stringify({ phone: String(fieldValue), countryShortName: 'US' });
        } else if (columnType === 'dropdown' || columnType === 'status') {
          // For dropdown/status, try to find matching label
          // For now, use text format as fallback
          formattedValue = JSON.stringify({ text: String(fieldValue) });
        } else if (columnType === 'text') {
          // For text columns, Monday.com API expects JSON format {"text": "value"}
          formattedValue = JSON.stringify({ text: String(fieldValue) });
        } else {
          // Default: use JSON format for other types
          formattedValue = JSON.stringify({ text: String(fieldValue) });
        }
        
        if (formattedValue) {
          // Parse JSON string to object for JSON! type variable
          const formattedValueObj = JSON.parse(formattedValue);
          const varName = `value${varCounter++}`;
          variables[varName] = formattedValueObj;
          updates.push(`update${aliasCounter++}: change_column_value(
            board_id: ${mondayBoardId},
            item_id: ${employee.mondayItemId},
            column_id: "${columnId}",
            value: $${varName}
          ) { id }`);
        }
      }

      // Update item name - use JSON.stringify to properly handle Georgian and other Unicode characters
      // Note: change_simple_column_value requires board_id argument
      const itemNameJson = JSON.stringify(employee.name);
      updates.push(`update${aliasCounter++}: change_simple_column_value(
        board_id: ${mondayBoardId},
        item_id: ${employee.mondayItemId},
        column_id: "name",
        value: ${itemNameJson}
      ) { id }`);

      if (updates.length > 0) {
        // Build mutation with GraphQL variables for JSON! type
        // Build variable definitions for JSON! type
        const variableDefinitions = Object.keys(variables).map(varName => `$${varName}: JSON!`).join(', ');
        const mutation = `mutation (${variableDefinitions}) {
          ${updates.join('\n')}
        }`;

        // Debug: Log the mutation and variables to see what's being sent
        console.log('🔍 GraphQL Mutation:', mutation);
        console.log('🔍 GraphQL Variables:', variables);
        
        const response = await monday.api(mutation, { variables });
        
        if (response.errors) {
          console.error('❌ Monday.com API error:', response.errors);
        } else {
          console.log('✅ Employee updated successfully in Monday.com');
        }
      }
    } catch (error) {
      console.error('❌ Error updating employee in Monday.com:', error.message);
    }
  };

  // Upload image to Monday.com
  const uploadImageToMonday = async (employee, file) => {
    if (!employee || !employee.mondayItemId || !imageColumnId || !file) {
      console.error('❌ Missing required data for image upload:', { employee, imageColumnId, file });
      setIsUploadingImage(false);
      return null;
    }

    setIsUploadingImage(true);

    try {
      // Get Monday.com API token
      const token = await monday.get('token');
      if (!token) {
        throw new Error('Monday.com token not available');
      }

      // Monday.com API requires multipart/form-data with specific format:
      // - query: GraphQL mutation string
      // - map: JSON object mapping form field to GraphQL variable
      // - image: the actual file
      const mutation = `mutation add_file($file: File!) {
        add_file_to_column(
          item_id: ${employee.mondayItemId},
          column_id: "${imageColumnId}",
          file: $file
        ) {
          id
        }
      }`;

      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('query', mutation);
      formData.append('map', JSON.stringify({ image: 'variables.file' }));
      formData.append('image', file, file.name);

      console.log('🔍 Uploading image to Monday.com:', {
        itemId: employee.mondayItemId,
        columnId: imageColumnId,
        fileName: file.name,
        fileSize: file.size
      });

      // Add timeout to prevent hanging on "Uploading..."
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Upload timeout after 30 seconds'));
        }, 30000);
      });

      let response;
      try {
        const fetchPromise = fetch('https://api.monday.com/v2/file', {
          method: 'POST',
          headers: {
            'Authorization': token
          },
          body: formData
        });

        response = await Promise.race([fetchPromise, timeoutPromise]);
      } catch (fetchError) {
        // Catch CORS and network errors
        console.error('❌ Fetch error:', fetchError);
        if (fetchError.message.includes('timeout')) {
          throw new Error('Upload timeout after 30 seconds. This might be due to CORS restrictions.');
        } else if (fetchError.message.includes('Failed to fetch') || fetchError.name === 'TypeError') {
          throw new Error('CORS error: Cannot upload files directly from browser. Please upload images directly in Monday.com board.');
        }
        throw fetchError;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        console.error('❌ Monday.com API error during image upload:', result.errors);
        alert('Failed to upload image: ' + (result.errors[0]?.message || 'Unknown error'));
        setIsUploadingImage(false);
        return null;
      }

      console.log('✅ Image uploaded successfully:', result);
      
      // Reload employees to get updated image URL
      if (mondayBoardId) {
        await loadEmployeesFromBoard(mondayBoardId);
      }
      
      setIsUploadingImage(false);
      return result.data?.add_file_to_column?.id || null;
    } catch (error) {
      console.error('❌ Error uploading image to Monday.com:', error);
      
      // Better error messages
      let errorMessage = error.message;
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        errorMessage = 'Image upload failed due to CORS restrictions. Monday.com SDK does not support direct file uploads from browser. Please upload images directly in Monday.com board.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timeout. This might be due to CORS restrictions or network issues.';
      }
      
      alert(errorMessage);
      setIsUploadingImage(false);
      return null;
    }
  };

  // Delete employee from Monday.com
  const deleteEmployeeInMonday = async (mondayItemId) => {
    if (!mondayBoardId || !mondayItemId) {
      return;
    }

    try {
      const mutation = `mutation {
        delete_item(item_id: ${mondayItemId}) {
          id
        }
      }`;

      const response = await monday.api(mutation);
      
      if (response.errors) {
        console.error('❌ Monday.com API error:', response.errors);
      }
    } catch (error) {
      console.error('❌ Error deleting employee from Monday.com:', error.message);
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const toggleImportExportMenu = () => {
    setShowImportExportMenu(!showImportExportMenu);
  };

  const handleDropdownMouseEnter = () => {
    setShowImportExportMenu(true);
  };

  const handleDropdownContainerMouseLeave = () => {
    setShowImportExportMenu(false);
  };

  const handleViewDropdownMouseEnter = () => {
    setShowViewMenu(true);
  };

  const handleViewDropdownContainerMouseLeave = () => {
    setShowViewMenu(false);
  };

  const handleSettingsDropdownMouseEnter = () => {
    setShowSettingsMenu(true);
  };

  const handleSettingsDropdownContainerMouseLeave = () => {
    setShowSettingsMenu(false);
  };

  const openSettingsModal = (section = 'field-management') => {
    setActiveSettingsSection(section);
    setShowSettingsModal(true);
    setShowSettingsMenu(false);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };

  const handleSettingsTabChange = (section) => {
    setActiveSettingsSection(section);
  };

  const openViewPopup = (employee) => {
    setViewedEmployee(employee);
    setShowViewPopup(true);
  };

  const closeViewPopup = () => {
    setShowViewPopup(false);
    setViewedEmployee(null);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
  };

  const closeContextMenu = () => {
    setShowContextMenu(false);
  };

  const handleAddEmployeeFromContext = () => {
    setShowContextMenu(false);
    handleAddNew();
  };

  const handleSettingsFromContext = () => {
    setShowContextMenu(false);
            openSettingsModal('field-management');
  };

  const tourSteps = [
    {
      target: 'body',
      title: 'Welcome to OrgChart Pro',
      content: 'Welcome to the ultimate organizational chart management solution. This powerful tool helps you visualize and manage your team structure with ease.',
      position: 'center',
      isIntro: true
    },
    {
      target: 'body',
      title: 'Developed by Syncoora',
      content: 'This application is proudly developed by Syncoora. For support, feedback, or inquiries, reach out to us at team@syncoora.com',
      position: 'center',
      isIntro: true
    },
    {
      target: '.add-employee-btn',
      title: 'Add Employee',
      content: 'Click here to add new employees to your organization. This opens a form where you can enter employee details including custom fields.',
      position: 'bottom'
    },
    {
      target: '.view-dropdown-container',
      title: 'Switch Views',
      content: 'Switch between Chart View (visual hierarchy) and List View (tabular data) to see your organization in different formats.',
      position: 'bottom'
    },
    {
      target: '.data-dropdown-container',
      title: 'Data Management',
      content: 'Import/Export your employee data. You can backup your data as CSV or PDF files, or import from CSV.',
      position: 'bottom'
    },
    {
      target: '.settings-dropdown-container',
      title: 'Settings',
      content: 'Access settings to manage custom fields, design preferences, and other application configurations.',
      position: 'bottom'
    },
    {
      target: '.app-main',
      title: 'Main Content Area',
      content: 'This is where your organizational chart or employee list is displayed. Right-click anywhere here for quick access to main functions.',
      position: 'top'
    }
  ];

  const handleAppNavigatorFromContext = () => {
    setShowContextMenu(false);
    setShowAppNavigator(true);
    setCurrentTourStep(0);
  };

  const nextTourStep = () => {
    if (currentTourStep < tourSteps.length - 1) {
      setCurrentTourStep(currentTourStep + 1);
    } else {
      setShowAppNavigator(false);
      setCurrentTourStep(0);
    }
  };

  const prevTourStep = () => {
    if (currentTourStep > 0) {
      setCurrentTourStep(currentTourStep - 1);
    }
  };

  const closeTour = () => {
    setShowAppNavigator(false);
    setCurrentTourStep(0);
  };

  const addEmployee = async (employeeData) => {
    console.log('🔍 Add Employee called with data:', employeeData);
    
    const newEmployee = {
      ...employeeData,
      id: Date.now(),
      managerId: employeeData.managerId ? parseInt(employeeData.managerId) : null
    };

    console.log('🔍 New employee object:', newEmployee);

    console.log('🔍 Adding employee to local state');
    setEmployees([...employees, newEmployee]);

    // Sync to Monday.com if board is configured
    if (mondayBoardId) {
      try {
        console.log('🔄 Syncing new employee to Monday.com...');
        const mondayItemId = await createEmployeeInMonday(newEmployee);
        if (mondayItemId) {
          // Update the employee with the Monday.com item ID
          setEmployees(prevEmployees =>
            prevEmployees.map(emp =>
              emp.id === newEmployee.id
                ? { ...emp, mondayItemId }
                : emp
            )
          );
        }
      } catch (error) {
        console.error('❌ Failed to sync employee to Monday.com:', error);
        // Continue with local addition even if Monday.com sync fails
      }
    }

    console.log('🔍 Closing form');
    setShowForm(false);
    setSelectedEmployee(null);
    console.log('✅ Add Employee completed');
  };

  const updateEmployee = async (employeeData) => {
    const updatedEmployee = {
      ...employeeData,
      id: selectedEmployee.id,
      managerId: employeeData.managerId ? parseInt(employeeData.managerId) : null
    };

    const updatedEmployees = employees.map(emp => 
      emp.id === selectedEmployee.id ? updatedEmployee : emp
    );
    setEmployees(updatedEmployees);

    // Sync to Monday.com if board is configured and employee has Monday.com item ID
    if (mondayBoardId && updatedEmployee.mondayItemId) {
      try {
        console.log('🔄 Syncing updated employee to Monday.com...');
        await updateEmployeeInMonday(updatedEmployee);
      } catch (error) {
        console.error('❌ Failed to sync employee update to Monday.com:', error);
        // Continue with local update even if Monday.com sync fails
      }
    }

    setShowForm(false);
    setSelectedEmployee(null);
  };

  const confirmDeleteEmployee = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setEmployeeToDelete(employee);
    setShowDeleteConfirm(true);
  };

  const deleteEmployee = async (employeeId) => {
    // Check if employee has subordinates
    const hasSubordinates = employees.some(emp => emp.managerId === employeeId);
    
    if (hasSubordinates) {
      const employee = employees.find(emp => emp.id === employeeId);
      const subordinates = employees.filter(emp => emp.managerId === employeeId);
      setEmployeeWithSubordinates({ employee, subordinates });
      setShowSubordinatesError(true);
      setShowDeleteConfirm(false);
      setEmployeeToDelete(null);
      return;
    }

    const employeeToDelete = employees.find(emp => emp.id === employeeId);

    const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
    setEmployees(updatedEmployees);

    // Sync deletion to Monday.com if board is configured and employee has Monday.com item ID
    if (mondayBoardId && employeeToDelete?.mondayItemId) {
      try {
        console.log('🔄 Syncing employee deletion to Monday.com...');
        await deleteEmployeeInMonday(employeeToDelete.mondayItemId);
      } catch (error) {
        console.error('❌ Failed to sync employee deletion to Monday.com:', error);
        // Continue with local deletion even if Monday.com sync fails
      }
    }

    setSelectedEmployee(null);
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
  };

  const closeSubordinatesError = () => {
    setShowSubordinatesError(false);
    setEmployeeWithSubordinates(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };
  */

  const handleAddNew = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  const handleImportEmployees = (importedEmployees) => {
    setEmployees(importedEmployees);
  };

  const resetToSampleData = () => {
    // Generate 20 sample employees
    const generateSampleEmployees = () => {
      const names = [
        'John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Chen', 'David Wilson',
        'Emma Wilson', 'James Brown', 'Sophia Davis', 'Michael Johnson', 'Olivia Garcia',
        'Daniel Miller', 'Ava Rodriguez', 'Christopher Martinez', 'Isabella Anderson', 'Matthew Taylor',
        'Mia Thomas', 'Andrew Jackson', 'Charlotte White', 'Joshua Harris', 'Amelia Martin',
        'Ryan Thompson', 'Harper Garcia', 'Nicholas Moore', 'Evelyn Lee', 'Christopher Clark',
        'Grace Lewis', 'Kevin Hall', 'Chloe Allen', 'Steven Young', 'Zoe King',
        'Brian Wright', 'Lily Green', 'Timothy Baker', 'Hannah Adams', 'Jeffrey Nelson',
        'Victoria Carter', 'Mark Mitchell', 'Penelope Perez', 'Donald Roberts', 'Layla Turner',
        'Paul Phillips', 'Riley Campbell', 'George Parker', 'Nora Evans', 'Edward Edwards',
        'Scarlett Collins', 'Robert Stewart', 'Aria Morris', 'Thomas Rogers', 'Luna Reed'
      ];

      const positions = [
        'CEO', 'CTO', 'CFO', 'COO', 'VP of Engineering', 'VP of Marketing', 'VP of Sales', 'VP of HR',
        'Senior Software Engineer', 'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
        'Product Manager', 'Project Manager', 'Scrum Master', 'Business Analyst', 'Data Analyst',
        'UX Designer', 'UI Designer', 'Graphic Designer', 'Marketing Manager', 'Marketing Specialist',
        'Sales Manager', 'Sales Representative', 'Account Executive', 'Customer Success Manager',
        'HR Manager', 'HR Coordinator', 'Recruiter', 'Finance Manager', 'Financial Analyst',
        'Accountant', 'Operations Manager', 'Operations Specialist', 'DevOps Engineer',
        'QA Engineer', 'Technical Lead', 'Architect', 'Database Administrator', 'System Administrator',
        'Content Strategist', 'SEO Specialist', 'Social Media Manager', 'Brand Manager',
        'Legal Counsel', 'Compliance Officer', 'Security Engineer', 'Network Engineer', 'Support Engineer'
      ];

      const departments = [
        'Executive', 'Technology', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 
        'Human Resources', 'Finance', 'Operations', 'Customer Success', 'Business Development', 
        'Research & Development', 'Legal', 'Security', 'Support'
      ];

      const employees = [];
      
      // Create CEO (no manager)
      employees.push({
        id: 1,
        name: names[0],
        position: 'CEO',
        department: 'Executive',
        email: `${names[0].toLowerCase().replace(' ', '.')}@company.com`,
        phone: `+1-555-${String(100 + 1).padStart(3, '0')}-${String(1000 + 1).padStart(4, '0')}`,
        managerId: null,
        image: null
      });

      // Create C-level executives (report to CEO)
      const cLevelPositions = ['CTO', 'CFO', 'COO'];
      for (let i = 0; i < cLevelPositions.length; i++) {
        employees.push({
          id: i + 2,
          name: names[i + 1],
          position: cLevelPositions[i],
          department: cLevelPositions[i] === 'CTO' ? 'Technology' : cLevelPositions[i] === 'CFO' ? 'Finance' : 'Operations',
          email: `${names[i + 1].toLowerCase().replace(' ', '.')}@company.com`,
          phone: `+1-555-${String(100 + i + 2).padStart(3, '0')}-${String(1000 + i + 2).padStart(4, '0')}`,
          managerId: 1,
          image: null
        });
      }

      // Create VPs (report to C-level)
      const vpPositions = ['VP of Engineering', 'VP of Marketing', 'VP of Sales', 'VP of HR'];
      const vpDepartments = ['Technology', 'Marketing', 'Sales', 'Human Resources'];
      for (let i = 0; i < vpPositions.length; i++) {
        const managerId = i < 2 ? 2 : i < 3 ? 3 : 4; // CTO, CTO, CFO, COO
        employees.push({
          id: i + 5,
          name: names[i + 4],
          position: vpPositions[i],
          department: vpDepartments[i],
          email: `${names[i + 4].toLowerCase().replace(' ', '.')}@company.com`,
          phone: `+1-555-${String(100 + i + 5).padStart(3, '0')}-${String(1000 + i + 5).padStart(4, '0')}`,
          managerId: managerId,
          image: null
        });
      }

      // Create remaining employees (report to VPs and other managers)
      let currentId = 9;
      for (let i = 9; i < 21; i++) {
        const name = names[i];
        const position = positions[Math.floor(Math.random() * positions.length)];
        const department = departments[Math.floor(Math.random() * departments.length)];
        
        // Assign manager based on department and hierarchy
        let managerId;
        if (department === 'Technology' || department === 'Engineering') {
          managerId = Math.random() > 0.5 ? 2 : 5; // CTO or VP Engineering
        } else if (department === 'Marketing') {
          managerId = 6; // VP Marketing
        } else if (department === 'Sales') {
          managerId = 7; // VP Sales
        } else if (department === 'Human Resources') {
          managerId = 8; // VP HR
        } else if (department === 'Finance') {
          managerId = 3; // CFO
        } else if (department === 'Operations') {
          managerId = 4; // COO
        } else {
          // For other departments, randomly assign to existing managers
          const existingManagers = employees.filter(emp => 
            emp.position.includes('VP') || emp.position.includes('Manager') || emp.position.includes('Lead')
          );
          if (existingManagers.length > 0) {
            managerId = existingManagers[Math.floor(Math.random() * existingManagers.length)].id;
          } else {
            managerId = 1; // Default to CEO
          }
        }

        employees.push({
          id: currentId,
          name: name,
          position: position,
          department: department,
          email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
          phone: `+1-555-${String(100 + currentId).padStart(3, '0')}-${String(1000 + currentId).padStart(4, '0')}`,
          managerId: managerId,
          image: null
        });
        currentId++;
      }

      return employees;
    };

    const sampleEmployees = generateSampleEmployees();
    setEmployees(sampleEmployees);
    localStorage.setItem('employees', JSON.stringify(sampleEmployees));
    setSelectedEmployee(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>Organizational Chart</h1>
          <div className="header-actions">
            <div className="dropdown-container view-dropdown-container" ref={viewDropdownRef} onMouseLeave={handleViewDropdownContainerMouseLeave}>
              <button 
                className="dropdown-trigger"
                onClick={() => setShowViewMenu(!showViewMenu)}
                onMouseEnter={handleViewDropdownMouseEnter}
              >
                {viewMode === 'chart' ? <Users size={20} /> : <Settings size={20} />}
                {viewMode === 'chart' ? 'Chart View' : 'List View'}
              </button>
              
              {showViewMenu && (
                <div 
                  className="dropdown-menu"
                  onMouseEnter={handleViewDropdownMouseEnter}
                >
                  <div className="dropdown-menu-content">
                    <div className="menu-section">
                      <h4>View Mode</h4>
                      <button 
                        className={`menu-item ${viewMode === 'chart' ? 'active' : ''}`}
                        onClick={() => {
                          setViewMode('chart');
                          setShowViewMenu(false);
                        }}
                      >
                        <Users size={16} />
                        Chart View
                      </button>
                      <button 
                        className={`menu-item ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => {
                          setViewMode('list');
                          setShowViewMenu(false);
                        }}
                      >
                        <Settings size={16} />
                        List View
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button className="add-employee-btn" onClick={handleAddNew}>
              <Plus size={20} />
              Add Employee
            </button>
            
            <div className="dropdown-container data-dropdown-container" ref={dropdownRef} onMouseLeave={handleDropdownContainerMouseLeave}>
              <button 
                className="dropdown-trigger"
                onClick={toggleImportExportMenu}
                onMouseEnter={handleDropdownMouseEnter}
              >
                <Download size={20} />
                Data
              </button>
              
              {showImportExportMenu && (
                <div 
                  className="dropdown-menu"
                  onMouseEnter={handleDropdownMouseEnter}
                >
                  <ImportExport 
                    employees={employees}
                    onImportEmployees={handleImportEmployees}
                    onResetToSample={resetToSampleData}
                    isDropdown={true}
                    orgChartRef={orgChartRef}
                  />
                </div>
              )}
            </div>

            <div className="dropdown-container settings-dropdown-container" ref={settingsDropdownRef} onMouseLeave={handleSettingsDropdownContainerMouseLeave}>
              <button 
                className="dropdown-trigger"
                onClick={() => openSettingsModal('field-management')}
                onMouseEnter={handleSettingsDropdownMouseEnter}
              >
                <SettingsIcon size={20} />
                Settings
              </button>
              
              {showSettingsMenu && (
                <div 
                  className="dropdown-menu"
                  onMouseEnter={handleSettingsDropdownMouseEnter}
                >
                  <div className="dropdown-menu-content">
                    <div className="menu-section">
                      <h4>Fields & Forms</h4>
                      <button 
                        className="menu-item"
                        onClick={() => openSettingsModal('field-management')}
                      >
                        <List size={16} />
                        Field Management
                      </button>
                    </div>
                    <div className="menu-section">
                      <h4>Appearance</h4>
                      <button 
                        className="menu-item"
                        onClick={() => openSettingsModal('designer')}
                      >
                        <Palette size={16} />
                        Designer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              className={`theme-toggle-switch ${theme === 'dark' ? 'active' : ''}`} 
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              <div className="toggle-slider">
                {theme === 'light' ? <Sun size={12} /> : <Moon size={12} />}
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {showForm && (
          <div className="form-overlay">
            <div className="form-container">
              <EmployeeForm
                employee={selectedEmployee}
                employees={employees}
                onSubmit={selectedEmployee ? updateEmployee : addEmployee}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        )}

        {viewMode === 'chart' ? (
          <div className="org-chart-container" ref={orgChartRef}>
            <OrgChart
              employees={employees}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={confirmDeleteEmployee}
              onViewEmployee={openViewPopup}
              designSettings={designSettings}
            />
          </div>
        ) : (
          <div className="employee-list-container">
            <EmployeeList
              employees={employees}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={confirmDeleteEmployee}
              onViewEmployee={openViewPopup}
            />
          </div>
        )}

        <Settings
          isOpen={showSettingsModal}
          onClose={closeSettingsModal}
          activeSection={activeSettingsSection}
          onTabChange={handleSettingsTabChange}
          designSettings={designSettings}
          onDesignSettingsChange={setDesignSettings}
          mondayBoardId={mondayBoardId}
          monday={monday}
        />

        {/* Employee View Popup */}
        {showViewPopup && viewedEmployee && (
          <div className="view-popup-overlay">
            <div className="view-popup">
              <div className="view-popup-header">
                <div className="employee-avatar">
                  {viewedEmployee.image ? (
                    <img src={viewedEmployee.image} alt={viewedEmployee.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {viewedEmployee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>
                <div className="employee-header-info">
                  <h2>{viewedEmployee.name}</h2>
                  <p className="position">{viewedEmployee.position}</p>
                  <span className="department-badge">{viewedEmployee.department}</span>
                </div>
                <div className="view-popup-header-actions">
                  <button 
                    className="edit-view-btn" 
                    onClick={() => {
                      closeViewPopup();
                      handleEditEmployee(viewedEmployee);
                    }}
                    title="Edit Employee"
                  >
                    <Edit size={20} />
                  </button>
                  <button className="close-view-btn" onClick={closeViewPopup}>
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="view-popup-content">
                <div className="info-section">
                  <h3>Contact Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Email</label>
                      <span>{viewedEmployee.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <span>{viewedEmployee.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Organizational Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Manager</label>
                      <span>
                        {viewedEmployee.managerId ? 
                          employees.find(emp => emp.id === viewedEmployee.managerId)?.name || 'Unknown' 
                          : 'No Manager'
                        }
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Direct Reports</label>
                      <span>
                        {employees.filter(emp => emp.managerId === viewedEmployee.id).length} employees
                      </span>
                    </div>
                  </div>
                </div>

                {/* Custom Fields Section */}
                {(() => {
                  const customFields = JSON.parse(localStorage.getItem('customFields') || '[]');
                  const hasCustomFields = customFields.length > 0;
                  
                  if (hasCustomFields) {
                    return (
                      <div className="info-section">
                        <h3>Additional Information</h3>
                        <div className="info-grid">
                          {customFields.map(field => (
                            <div key={field.id} className="info-item">
                              <label>{field.name}</label>
                              <span>
                                {viewedEmployee[field.name] || '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="view-popup-actions">
                <button className="edit-employee-btn" onClick={() => {
                  closeViewPopup();
                  handleEditEmployee(viewedEmployee);
                }}>
                  <Edit size={16} />
                  Edit Employee
                </button>
                <button className="delete-employee-btn" onClick={() => {
                  closeViewPopup();
                  confirmDeleteEmployee(viewedEmployee.id);
                }}>
                  <Trash2 size={16} />
                  Delete Employee
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Context Menu */}
        {showContextMenu && (
          <div 
            className="context-menu-overlay"
            onClick={closeContextMenu}
          >
            <div 
              className="context-menu"
              style={{
                left: contextMenuPosition.x,
                top: contextMenuPosition.y
              }}
              onClick={(e) => e.stopPropagation()}
            >
                           <button 
               className="context-menu-item"
               onClick={handleAddEmployeeFromContext}
             >
               <Plus size={16} />
               Add Employee
             </button>
             <button 
               className="context-menu-item"
               onClick={handleSettingsFromContext}
             >
               <SettingsIcon size={16} />
               Settings
             </button>
             <button 
               className="context-menu-item"
               onClick={handleAppNavigatorFromContext}
             >
               <List size={16} />
               Product Tour
             </button>
            </div>
          </div>
        )}

        {/* App Navigator Tour */}
        {showAppNavigator && (
          <div className="tour-overlay">
            {!tourSteps[currentTourStep]?.isIntro && (
              <div className="tour-highlight" style={{
                left: document.querySelector(tourSteps[currentTourStep]?.target)?.getBoundingClientRect().left || 0,
                top: document.querySelector(tourSteps[currentTourStep]?.target)?.getBoundingClientRect().top || 0,
                width: document.querySelector(tourSteps[currentTourStep]?.target)?.offsetWidth || 0,
                height: document.querySelector(tourSteps[currentTourStep]?.target)?.offsetHeight || 0
              }}></div>
            )}
            
            <div className={`tour-tooltip ${tourSteps[currentTourStep]?.isIntro ? 'tour-tooltip-intro' : 'tour-tooltip-center'}`}>
              <div className="tour-header">
                <h3>{tourSteps[currentTourStep]?.title}</h3>
                <button className="tour-close" onClick={closeTour}>
                  <X size={20} />
                </button>
              </div>
              <p>{tourSteps[currentTourStep]?.content}</p>
              <div className="tour-navigation">
                <button 
                  className="tour-nav-btn tour-nav-arrow"
                  onClick={prevTourStep}
                  disabled={currentTourStep === 0}
                  title="Previous"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="tour-progress">
                  {currentTourStep + 1} of {tourSteps.length}
                </div>
                <button 
                  className="tour-nav-btn tour-nav-arrow"
                  onClick={nextTourStep}
                  title={currentTourStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {showDeleteConfirm && employeeToDelete && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <div className="delete-confirm-header">
                <h3>Delete Employee</h3>
                <button className="close-btn" onClick={cancelDelete}>
                  <X size={20} />
                </button>
              </div>
              <div className="delete-confirm-content">
                <div className="delete-warning">
                  <Trash2 size={48} />
                  <h4>Are you sure you want to delete this employee?</h4>
                  <p>
                    This action cannot be undone. The employee <strong>{employeeToDelete.name}</strong> will be permanently removed from the organization.
                  </p>
                </div>
                <div className="delete-confirm-actions">
                  <button className="cancel-btn" onClick={cancelDelete}>
                    Cancel
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => deleteEmployee(employeeToDelete.id)}
                  >
                    <Trash2 size={16} />
                    Delete Employee
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subordinates Error Popup */}
        {showSubordinatesError && employeeWithSubordinates && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal subordinates-error-modal">
              <div className="delete-confirm-header">
                <h3>Cannot Delete Employee</h3>
                <button className="close-btn" onClick={closeSubordinatesError}>
                  <X size={20} />
                </button>
              </div>
              <div className="delete-confirm-content">
                <div className="subordinates-warning">
                  <Users size={48} />
                  <h4>Employee has subordinates</h4>
                  <p>
                    <strong>{employeeWithSubordinates.employee.name}</strong> cannot be deleted because they have <strong>{employeeWithSubordinates.subordinates.length} subordinate(s)</strong> reporting to them.
                  </p>
                  <div className="subordinates-list">
                    <h5>Subordinates:</h5>
                    <ul>
                      {employeeWithSubordinates.subordinates.map(sub => (
                        <li key={sub.id}>
                          <span className="subordinate-name">{sub.name}</span>
                          <span className="subordinate-position">{sub.position}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="subordinates-help">
                    To delete this employee, you must first either:
                    <br />• Reassign their subordinates to another manager, or
                    <br />• Delete the subordinates first
                  </p>
                </div>
                <div className="delete-confirm-actions">
                  <button className="cancel-btn" onClick={closeSubordinatesError}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
