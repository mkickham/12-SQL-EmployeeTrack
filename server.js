const  inquirer = require("inquirer");
const mysql = require("mysql2");
const { deprecate } = require("util");

require ("dotenv").config();

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.pw,
    database: "employeeTracker_db",
});

connection.connect((err) => {
    if (err) throw err;
    console.log("Database connection successful")
    start();
});

function start() {
    inquirer
        .prompt({
            type: "list",
            name: "start",
            message: "Select an option",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update an Employee",
                "Cancel"
            ],
        })
        .then((answer) => {
            switch (answer.start) {
                case "View all departments":
                    viewAllDepartments();
                    break;
                case "View all roles":
                    viewAllRoles();
                    break;
                case "View all employees":
                    viewAllEmployees();
                    break;
                case "Add a department":
                    addDepartment();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Add a manager":
                    addManager();
                    break;
                case "Update Employee":
                    updateEmployee();
                    break;
                case "Delete department":
                    deleteDepartment();
                    break;
                case "Delete role":
                    deleteRole();
                    break;
                case "Delete employee":
                    deleteEmployee();
                    break;
                case "Cancel":
                    connection.end();
                    console.log("Logged Out");
                    break;
            }
        });
}

function viewAllDepartments() {
    const query = "Select * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

function viewAllRoles() {
    const query = "SELECT roles.title, roles.id, roles.salary, departments.department_name from roles join departments on roles.department_id = departments.id";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

function viewAllEmployees() {
    const query = "SELECT employee.id, employee.first_name, employee.last_name, roles.title, roles.salary FROM employee JOIN roles on employee.role_id = roles.id"
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res)
        start();
    });
}

function addDepartment() {
    inquirer
        .prompt({
            type: "input",
            name: "name",
            message: "Enter the name of the department"
        })
        .then((answer => {
            console.log(answer.name);
            const query = `INSERT INTO departments (department_name) VALUES ("${answer.name}")`;
            connection.query(query, (err, res) => {
                if (err) throw err;
                console.table(res)
                start();
            });
        }));
};

function addRole() {
    let depNames
    const query = "SELECT department_name FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
        [depNames] = res;
    });
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "title",
                    message: "Enter the job title"
                },
                {
                    type: "input",
                    name: "salary",
                    message: "Enter the salary"
                },
                {
                    type: "input",
                    name: "department_id",
                    message: "Select the department_id for a new role",
                    // choices: [...depNames]
                },
            ])
            .then ((answers) => {
                const query = `INSERT INTO roles (title, salary, department_id) values ("${answers.title}", ${answers.salary}, ${answers.department_id})`;
                connection.query(
                    query,
                    (err, res) => {
                        if (err) throw err;
                        console.log(
                            'Added role and salary to the database'
                        );
                        start();
                    }
                );
            });

}

function addEmployee() {
    connection.query("SELECT id, title FROM roles", (error, results) => {
        if (error) {
            console.error(error);
            return;
        }

        const [roles] = results.map(({ id, title }) => ({
                name: title,
                value: id,
        }));

        connection.query(
            'SELECT id CONCAT(first_name, "", last_name) AS name FROM employee',
            (error, results) => {
                if (error) {
                    console.error(error);
                    return;
                }

            
            const [managers] = results.map(({ id, name }) => ({
                name: name,
                value: id
            }));

            inquirer
                .prompt([
                    {
                        type: "input",
                        name: "firstName",
                        message: "Enter Employee first Name"
                    },
                    {
                        type: "input",
                        name: "lastName",
                        message: "Enter Employee Last Name"
                    },
                    {
                        type: "list",
                        name: "role_id",
                        message: "Select an employee role",
                        choices: [...roles],
                    },
                    {
                        type: "list",
                        name: "manager_id",
                        message: "Is the employee a manager?",
                        choices: [...managers]
                    }
                ])
                .then ((answers) => {
                    const sql =
                    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                    const values = [
                        answers.firstName,
                        answers.lastName,
                        answers.roleID,
                        answers.managerID,
                    ];
                    connection.query(sql, values, (error) => {
                        if (error) {
                            console.error(error);
                            return;
                        }
                        console.log("Employee added");
                        start();
                    })
                })
                .catch((error) => {
                    console.error(error);
                });
            }
            
        )
    })
}

function updateEmployeeRole(){
    const queryEmployees = 
        "SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id"
    const queryRoles = "SELECT * FROM roles";
    connection.query(queryEmployees, (err, resEmployees) => {
        if (err) throw err;
        connection.query(queryRoles, (err, resRoles) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "employee",
                        message: "Select an employee to update",
                        choices: resEmployees.map(
                            (employee) => 
                                `${employee.first_name}${employee.last_name}`
                        ),
                    },
                    {
                        type: "list",
                        name: "role",
                        message: "Select a new role",
                        choices: resRoles.map((role) => role.title),
                    },
                ])
                .then((answers) => {
                    const employee = resEmployees.find(
                        (employee) =>
                        `${employee.first_name}${employee.last_name}` ===
                        answers.employee
                    );
                    const role = resRoles.find(
                        (role) => role.title === answers.role
                    );
                    const query = 
                        "UPDATE employee SET role_id = > WHERE id = >";
                    connection.query(
                        query,
                        [role.id, employee.id],
                        (err, res) => {
                            if (err) throw err;
                            console.log("Employe role updated");
                            start();
                        }
                    );
                });
        });
    });
}

function viewEmployeesByManager() {
    const query = `SELECT 
    e.id, e.first_name,
    e.last_name, 
    r.title, 
    d.department_name, 
    CONCAT(m.first_name, '', m.last_name) AS manager_name 
    FROM employee e INNER JOIN roles r ON e.role_id = r.id
    LEFT JOIN employee m ON e.manager_id = m.id
    ORDER BY manager_name,
    e.last_name,
    e.first_name`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        const viewEmployeesByManager = res.reduce((acc, cur) => {
            const managerName = cur.manager_name;
            if (acc[managerName]) {
                acc[managerName].push(cur);
            } else {
                acc[managerName] = [cur];
            }
            return acc;
        }, {});
    })

    console.log("Employees as Managers");
    for (const managerName in EmployeesByManager) {
        console.log(`n${managerName}`);
        const employees = EmployeesByManager[managerName];
        employeess.forEach((employee) => {
            console.log(
                `${employee.first_name}${employee.last_name} - ${employee.title} - ${employee.department_name}`
            );
        });
    }
    start();
}

function viewEmployeesByDepartment() {
    const query = "SELECT departments.department_name, employee.first_name, employee.last_name FROM employeee INNER JOIN roles ON employee.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id ORDER BY departments.department_name";

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log("\nEmployees by department");
        console.table(res);
        start();
    });
}