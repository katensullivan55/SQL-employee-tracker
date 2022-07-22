const db = require('./config/connection');
const cTable = require('console.table');
const inquirer = require('inquirer');

class Tracker {
    mainMenu(){
        inquirer.prompt([
            {
                type: 'list',
                name: 'task',
                message: 'What would you like to do?',
                choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role', 'Exit']
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
                case 'Add a department':
                    this.addNewDepartmentPrompt();
                    break;
                case 'Add a role':
                    this.addNewRolePrompt();
                    break;
                case 'Add an employee':
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
            return this.mainMenu();
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
                    console.log('Please enter the department name.');
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
                return this.mainMenu();
            }); 
    };
    viewAllRoles(){
        const sql = `SELECT role.id, role.title, role.salary, department.name AS department_name FROM role LEFT JOIN department ON role.department_id = department.id`;

        db.query(sql, (err, result) => {
            if(err) {
                console.log(err);
                return;
            }
            console.table(result);
            return this.mainMenu();
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
                    return this.mainMenu();
                });
    };

}


function init() {
    const tracker = new Tracker;
    tracker.mainMenu();
}

init();

module.exports = Tracker;