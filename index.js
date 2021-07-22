const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');

// Connect to database
db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database.');
});


// Initial options at start of application
const initialPrompt = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'prompt',
            message: "What would you like to do?",
            choices: [
              'View All Departments', 
              'View All Roles', 
              'View All Employees',
              'View Employees By Manager',
              'View Employees By Department',
              'View Total Salary Cost by Department', 
              'Add A Department', 
              'Add A Role', 
              'Add An Employee', 
              'Update An Employee Role',
              'Update An Employees Manager',
              'Delete An Employee',
              'Delete A Role',
              'Delete A Department',
              'Exit'
            ]
        }
    ])
    .then(response => {
        const answer = (response.prompt).toString();

        if (answer === 'View All Employees') {
            viewAllEmployees();
        } else if (answer === 'View All Departments') {
            viewAllDepartments();
        } else if (answer === 'View All Roles') {
            viewAllRoles();
        } else if (answer === 'Add A Department') {
            addDepartment()
        } else if (answer === 'Add A Role') {
            addRole()
        } else if (answer === 'Add An Employee') {
            addEmployee()
        } else if (answer === 'Update An Employee Role') {
            updateRole()
        } else if (answer === 'Delete An Employee') {
            deleteEmployee()
        } else if (answer === 'Delete A Role') {
            deleteRole()
        } else if (answer === 'Delete A Department') {
            deleteDepartment()
        } else if (answer === 'Update An Employees Manager') {
            updateManager()
        } else if (answer === 'View Employees By Manager') {
            viewEmployeesMgr()
        } else if (answer === 'View Employees By Department') {
            viewEmployeesDept()
        } else if (answer === 'View Total Salary Cost by Department') {
            salaryDept()
        } else if (answer === 'Exit') {
            db.end();
        }
    });
};