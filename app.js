const db = require('./config/connection');
const cTable = require('console.table');
const inquirer = require('inquirer');

class Tracker {
    menuMain(){
        inquirer.prompt([
            {
                type: 'list',
                name: 'task',
                message: 'Choose and option',
                choices: ['View all departments', 'View all roles', 'View all employees', 'Add department', 'Add role', 'Add employee', 'Update an employee role', 'Exit']
            }
        ]).then(selectedTask => {
            switch(selectedTask.task){
                case 'View all departments':
                    this.viewAllDepartments();
                    break;
                case 'View all roles':
                    this.viewAllRoles();
                    break;
                case 'View all employees':
                    this.viewAllEmployees();
                    break;
                case 'Add department':
                    this.addNewDepartmentPrompt();
                    break;
                case 'Add role':
                    this.addNewRolePrompt();
                    break;
                case 'Add employee':
                    this.addNewEmployeePrompt();
                    break;
                case 'Update an employee role':
                    this.updateEmployeeRolePrompt();
                    break;
                default:
                    console.log('Goodbye!')
                    db.end();
                    break;
            };
        });
    };
    viewAllDepartments(){
        const sql = `SELECT * FROM department`;

        db.query(sql, (err, result) => {
            if(err) {
                console.log(err);
                return;
            }
            console.table(result);
            return this.menuMain();
        });
    };
    addNewDepartmentPrompt(){
        inquirer.prompt({
            type: 'input',
            name: 'name',
            message: 'What is the name of the department?',
            validate: input => {
                if(input) {
                    return true;
                } else {
                    console.log('Please enter department name.');
                    return false;
                }
            }
        })
        .then(department => {
            this.addNewDepartmentQuery(department.name);
        })
    };
    addNewDepartmentQuery(department){
        const sql = `INSERT INTO department (name)
            VALUES(?)`;
            const params = department;
        
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log('Department has been added');
                return this.menuMain();
            }); 
    }
    viewAllRoles(){
        const sql = `SELECT role.id, role.title, role.salary, department.name AS department_name FROM role LEFT JOIN department ON role.department_id = department.id`;

        db.query(sql, (err, result) => {
            if(err) {
                console.log(err);
                return;
            }
            console.table(result);
            return this.menuMain();
        });
    };

    addNewRolePrompt(){
                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'title',
                        message: 'What is the title of the role?',
                        validate: input => {
                            if(input) {
                                return true;
                            } else {
                                console.log('Please enter the role title.');
                                return false;
                            }
                        }
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: 'What is the salary for this role?',
                        validate: input => {
                            if(input) {
                                return true;
                            } else {
                                console.log('Please enter the salary.');
                                return false;
                            }
                        }
                    },
                    {
                        type: 'input',
                        name: 'department',
                        message: 'What is the id of the department you would like to add?',
                    }
                ]).then((res) => {
                    console.log("Adding a new role")
                   
                    db.query( 'INSERT INTO role SET ?',
                    {
                        title: res.title,
                        salary: res.salary,
                        department_id: res.department
                    });
                    return this.menuMain();
                });
    };
    viewAllEmployees(){
        const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, 
        department.name AS department_name, CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee
        LEFT JOIN role ON employee.role_id = role.id 
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee m ON m.id = employee.manager_id`;

        db.query(sql, (err, result) => {
            if(err) {
                console.log(err);
                return;
            }
            console.table(result);
            return this.menuMain();
        });
    };

    addNewEmployeePrompt(){
                        inquirer.prompt([
                            {
                                type: 'input',
                                name: 'firstName',
                                message: "What is the employee's first name?",
                                validate: input => {
                                    if (input){
                                        return true;
                                    } else {
                                        console.log("Please enter employee's first name.");
                                        return false;
                                    }
                                }
                            },
                            {
                                type: 'input',
                                name: 'lastName',
                                message: "What is the employee's last name?",
                                validate: input => {
                                    if (input){
                                        return true;
                                    } else {
                                        console.log("Please enter employee's last name.");
                                        return false;
                                    }
                                }
                            },
                            {
                                type: "input",
                                name: "role",
                                message: "What is the id of the employee's role?",
                                validate: input => {
                                    if (input) {
                                        return true;
                                    } else {
                                        console.log("Please enter a role id.");
                                        return false;
                                    }
                                }
                            },
                            {
                                type: "input",
                                name: "manager",
                                message: "What is the id of the employee's manager?",
                            validate: input => {
                                if (input) {
                                    return true;
                                } else {
                                    console.log("Please enter a manager id.");
                                    return false;
                                }
                            }
                        }
                        ]).then((res) =>{
                            console.log("Adding a new role")
                   
                            db.query( 'INSERT INTO employee SET ?',
                            {
                               first_name: res.first_name,
                               last_name: res.last_name,
                               role_id: res.role,
                               manager_id: res.manager,
                            });
                            return this.menuMain();
                                });    
                    }

    updateEmployeeRolePrompt(){
        inquirer.prompt([
            {
                type: "input",
                name: "old_id",
                message: "What is the id number of the employee you'd like to update?",
            },
            {
                type: "input",
                name: "new_role",
                message: "What is the id number of the new role for this employee?",
            }
         ]).then( (res) => {
             console.log("Updating the employee's role")
            db.query(`UPDATE employee SET role_id=${res.new_role} WHERE id=${res.old_id}`);
            return this.menuMain();
         });
     };
}


function init() {
    const tracker = new Tracker;
    tracker.menuMain();
}

init();

module.exports = Tracker;