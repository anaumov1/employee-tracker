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


// Gets all employee data from database
const viewAllEmployees = () => {
    const sql = `SELECT employee.id, employee.first_name, employee.last_name,
                role.title AS title,
                department.name AS department, role.salary,
                CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                FROM employee
                LEFT JOIN (employee manager) ON manager.id = employee.manager_id
                LEFT JOIN role on employee.role_id = role.id
                LEFT JOIN department ON department.id = role.department_id;`

    

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(``);
        console.log(``);
        console.log(`                                   ` + 'All Employees');
        console.log(`=============================================================================================`)
        console.table(result);
        console.log(`=============================================================================================`)
        initialPrompt();
    });
};

// Gets all department data from database
const viewAllDepartments = () => {
    const sql = `SELECT * FROM department;`

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(``);
        console.log(``);
        console.log(`                   ` + 'All Departments');
        console.log(`========================================================`)
        console.table(result);
        console.log(`========================================================`)
        initialPrompt();
    });
};


// Gets all role data from database
const viewAllRoles = () => {
    const sql = `SELECT role.id, role.title, role.salary, department.name AS department
                FROM role
                LEFT JOIN department ON department.id = role.department_id;`

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(``);
        console.log(`                     ` + 'All Roles');
        console.log(`========================================================`)
        console.table(result);
        console.log(`========================================================`);
        initialPrompt();
    });
};


// Views employees by manager
const viewEmployeesMgr = () => {
    const mgrArr = [];
    
    // Query to get employees
    const sqlMgr = `SELECT * FROM employee;`;
    db.query(sqlMgr, (err, response) => {
        if (err) throw err;
        response.forEach((employee) => mgrArr.push(employee.first_name + ' ' + employee.last_name));
        inquirer.prompt([
            {
                type: 'list',
                name: 'mgrData',
                message: "Which manager would you like to see the employee's under?",
                choices: mgrArr
            }
        ])
        .then(result => {
            let firstName = (result.mgrData).split(' ')[0];
            let lastName = (result.mgrData).split(' ').pop();
            let mgrID;
            
            // Gets mgr id
            response.forEach((employee) => {
                if ((firstName === employee.first_name) && (lastName === employee.last_name)) {
                    mgrID = employee.id;
                }
            })

            // Query to view data
            const sql = `SELECT * FROM employee WHERE manager_id = ?;`;
            db.query(sql, mgrID, (err, result) =>{
                if (err) throw err;
                console.log(``);
                console.log(`                     ` + 'Employees By Manager');
                console.log(`========================================================`)
                console.table(result);
                console.log(`========================================================`);
                initialPrompt();
            })
        })
    });
};

// View employees by department
const viewEmployeesDept = () => {
    const deptArr = [];
    
    // Query to get departments
    const sqlDept = `SELECT * FROM department;`;
    db.query(sqlDept, (err, response) => {
        if (err) throw err;
        response.forEach((department) => deptArr.push(department.name));
        inquirer.prompt([
            {
                type: 'list',
                name: 'deptData',
                message: "Which department would you like to see the employee's under?",
                choices: deptArr
            }
        ])
        .then(result => {
            const roleArr = [];
            let deptID;
            
            // Gets department id
            response.forEach((department) => {
                if (result.deptData === department.name) {
                    deptID = department.id;
                }
            })

            // Query to get roles associate with department ID
            const sqlRole = `SELECT * FROM role WHERE department_id = ?;`;
            db.query(sqlRole, deptID, (err, responseRole) => {
                if (err) throw err;
                // Loops through roles and pushes ids to array
                responseRole.forEach((role) => roleArr.push(role.id));

                // Query to get employees associate with the roles and display in table
                const sqlEmp = `SELECT * FROM employee WHERE role_id = ? OR role_id = ?;`;
                db.query(sqlEmp, roleArr, (err, responseEmp) => {
                    if (err) throw err;
                    console.log(``);
                    console.log(`                     ` + 'Employees By Department');
                    console.log(`========================================================`)
                    console.table(responseEmp);
                    console.log(`========================================================`);
                    initialPrompt();
                })
            })
        })
    }); 
};


// View total salary cost of department
const salaryDept = () => {
    const deptArr = [];
    
    // Query to get departments
    const sqlDept = `SELECT * FROM department;`;
    db.query(sqlDept, (err, response) => {
        if (err) throw err;
        response.forEach((department) => deptArr.push(department.name));
        inquirer.prompt([
            {
                type: 'list',
                name: 'deptData',
                message: "Which department would you like to see the total salary cost for?",
                choices: deptArr
            }
        ])
        .then(result => {
            let deptID;
            let roleArr = [];
            
            // Gets department id
            response.forEach((department) => {
                if (result.deptData === department.name) {
                    deptID = department.id;
                }
            })

            // Query to get roles associate with department ID
            const sqlRole = `SELECT * FROM role WHERE department_id = ?;`;
            db.query(sqlRole, deptID, (err, responseRole) => {
                if (err) throw err;
                // Loops through roles and pushes ids to array
                responseRole.forEach((role) => roleArr.push(role.id));
                
                // Query to get total salary
                const sql = `SELECT SUM(salary) AS total_salary_cost FROM role WHERE id = ? OR id = ?;`;
                db.query(sql, roleArr, (err, result) => {
                    if (err) throw err;
                    console.log(``);
                    console.log(`                     ` + 'Total Salary From Department');
                    console.log(`========================================================`)
                    console.table(result);
                    console.log(`========================================================`);
                    initialPrompt();
                })  
            })
        })
    });
};

