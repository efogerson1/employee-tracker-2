const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
    user: 'root',
    password: 'Beaverton1!',
    database: 'employee_db',
});

// Connect to the database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database.');
  startApp();
});

// Function to display the main menu and handle user choices
function startApp() {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit',
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case 'View all departments':
          viewAllDepartments();
          break;
        case 'View all roles':
          viewAllRoles();
          break;
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          connection.end();
          break;
        default:
          console.log('Invalid choice. Please try again.');
          startApp();
      }
    });
}

// Function to view all departments
function viewAllDepartments() {
  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) throw err;
    console.log('\nDepartments:\n');
    console.table(results);
    startApp();
  });
}

// Function to view all roles
function viewAllRoles() {
  // Join the roles table with the departments table to display the department name for each role
  const query = `
    SELECT roles.id, roles.title, roles.salary, departments.name AS department
    FROM roles
    INNER JOIN departments ON roles.department_id = departments.id
  `;

  connection.query(query, (err, results) => {
    if (err) throw err;
    console.log('\nRoles:\n');
    console.table(results);
    startApp();
  });
}

// Function to view all employees
function viewAllEmployees() {
  // Join the employees table with the roles and departments tables to display relevant data
  const query = `
    SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary,
    CONCAT(managers.first_name, ' ', managers.last_name) AS manager
    FROM employees
    LEFT JOIN roles ON employees.role_id = roles.id
    LEFT JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees AS managers ON employees.manager_id = managers.id
  `;

  connection.query(query, (err, results) => {
    if (err) throw err;
    console.log('\nEmployees:\n');
    console.table(results);
    startApp();
  });
}

// Function to add a department
function addDepartment() {
  inquirer
    .prompt({
      name: 'departmentName',
      type: 'input',
      message: 'Enter the name of the department:',
    })
    .then((answer) => {
      connection.query(
        'INSERT INTO departments (name) VALUES (?)',
        [answer.departmentName],
        (err) => {
          if (err) throw err;
          console.log('Department added successfully.');
          startApp();
        }
      );
    });
}

// function to add a role
function addRole() {
    // get the list of departments for the prompt
    connection.query('SELECT * FROM departments', (err, results) => {
      if (err) throw err;
  
      const departmentChoices = results.map((department) => ({
        name: department.name,
        value: department.id, // Make sure the value is the department ID, not the department name
      }));
  
      inquirer
        .prompt([
          {
            name: 'roleTitle',
            type: 'input',
            message: 'Enter the title of the role:',
          },
          {
            name: 'roleSalary',
            type: 'input',
            message: 'Enter the salary for this role:',
          },
          {
            name: 'departmentId',
            type: 'list',
            message: 'Select the department for this role:',
            choices: departmentChoices, // The `departmentChoices` array is used here as choices
          },
        ])
        .then((answers) => {
          connection.query(
            'INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)',
            [answers.roleTitle, answers.roleSalary, answers.departmentId],
            (err) => {
              if (err) throw err;
              console.log('Role added successfully.');
              startApp();
            }
          );
        });
    });
  }
  

// Function to add an employee
function addEmployee() {
  inquirer
    .prompt([
      {
        name: 'firstName',
        type: 'input',
        message: "Enter the employee's first name:",
      },
      {
        name: 'lastName',
        type: 'input',
        message: "Enter the employee's last name:",
      },
      {
        name: 'roleId',
        type: 'input',
        message: "Enter the employee's role id:",
      },
      {
        name: 'managerId',
        type: 'input',
        message: "Enter the employee's manager's id:",
      },
    ])
    .then((answers) => {
      connection.query(
        'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
        [answers.firstName, answers.lastName, answers.roleId, answers.managerId],
        (err) => {
          if (err) throw err;
          console.log('Employee added successfully.');
          startApp();
        }
      );
    });
}

// Function to update an employee role
function updateEmployeeRole() {
  // Fetch the list of employees for the prompt
  connection.query('SELECT * FROM employees', (err, results) => {
    if (err) throw err;

    const employeeChoices = results.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));

    inquirer
      .prompt([
        {
          name: 'employeeId',
          type: 'list',
          message: 'Select the employee to update their role:',
          choices: employeeChoices,
        },
        {
          name: 'roleId',
          type: 'input',
          message: 'Enter the new role id for this employee:',
        },
      ])
      .then((answers) => {
        connection.query(
          'UPDATE employees SET role_id = ? WHERE id = ?',
          [answers.roleId, answers.employeeId],
          (err) => {
            if (err) throw err;
            console.log('Employee role updated successfully.');
            startApp();
          }
        );
      });
  });
}
