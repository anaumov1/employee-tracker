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


// Adds new employee
const addEmployee = () => {
    const sqlR = `SELECT * FROM role;`;
    const roleArr = [];
  
    // Gets all current roles and pushes to roleArr
    db.query(sqlR, (err, roleData) => {
        if (err) throw err;
        roleData.forEach((role) => roleArr.push(role.title));
    })
  
      return inquirer.prompt([
          {
              type: 'input',
              name: 'addFirstName',
              message: "Please enter new employee's first name.",
              validate: firstNameInput => {
                  if (firstNameInput) {
                      if (firstNameInput.charAt(0) === firstNameInput.charAt(0).toUpperCase()) {
                          return true;
                      } else {
                          console.log("  Please capitalize the first name.");
                          return false
                      }
                  } else {
                      console.log("  You must enter the first name of the new employee.")
                      return false
                  }
              }
          },
          {
              type: 'input',
              name: 'addLastName',
              message: "Please enter new employee's last name.",
              validate: lastNameInput => {
                  if (lastNameInput) {
                      if (lastNameInput.charAt(0) === lastNameInput.charAt(0).toUpperCase()) {
                          return true;
                      } else {
                          console.log("  Please capitalize the last name.");
                          return false
                      }
                  } else {
                      console.log("  You must enter the last name of the new employee.")
                      return false
                  }
              }
          },
          {
              type: 'list',
              name: 'roleSelect',
              message: "Please select new employee's role.",
              choices: roleArr
          },
      ])
      .then(response => {
          const mgrArr = [];
          const roleResponse = response.roleSelect;
          let roleId;
          let mgrId;
        
          const sqlRole = `SELECT * FROM role;`
  
          // Query to find role id
          db.query(sqlRole, (err, result) => {
              if (err) throw err;
  
              // Loops through roles to find matching id
              result.forEach((role) => {
                  if (roleResponse === role.title) {
                      roleId = role.id
                  }
              })
  
              // To get employee data to use for selection of employee's manager
              sqlMgr = `SELECT * FROM employee;`;
              db.query(sqlMgr, (err, mgrData) => {
                  if (err) throw err;
                  const mgr = mgrData.map(({ first_name, last_name }) => 
                  ({ name: first_name + ' ' + last_name}));
  
                  // Mgr question
                  return inquirer.prompt([
                      {
                          type: 'list',
                          name: 'mgrSelect',
                          message: "Please select new employee's manager.",
                          choices: mgr
                      }
                  ])
                  .then(mgrResult => {
                      const mgrResponse = mgrResult.mgrSelect;
                  
                      // Gets the first and last name from the manager response to use to find the id
                      firstName = mgrResponse.split(' ')[0];
                      lastName = mgrResponse.split(' ').pop();
                  
  
                      // Loops through employees to find ID based on the first name and last name
                      mgrData.forEach((employee) => {
                          if ((firstName === employee.first_name) && (lastName === employee.last_name)) {
                              mgrId = employee.id;
                          }
                      })
                  
                      const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                   VALUES (?,?,?,?)`;
                      const params = [response.addFirstName, response.addLastName, roleId, mgrId];
        
                      // Query to add employee
                      db.query(sql, params, (err, result) => {
                          if (err) throw err;
                          console.log("New employee added successfully!")
                          initialPrompt();
                      })
                  })
              })
          })   
      });
  };
  