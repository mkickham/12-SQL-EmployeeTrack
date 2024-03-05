const  inquirer = require("inquirer");
const mysql = require("mysql2");
const { deprecate } = require("util");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3030,
    user: "root",
    password: "",
    database: "employeeeTracker_db",
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
                "Add a manager",
                "Update an Employee",
                "Delete a department",
                "Delete a role",
                "Delete an employee",
                "Cancel"
            ],
        })
        .then((answer) => {
            switch (answer.action) {
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
                case "Add a Role":
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
    const query = "SELECT roles.title roles.id departments.department_name, roles.salary from roles join departments on roles.department_id = departments.id";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

function viewAllEmployees() {
    const query = "SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary"
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
                if (err) throw err;
                console.log('Department added to the database')
                start();
        }));
};

function addRole() {
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
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
                    type: "list",
                    name: "department",
                    message: "Select the department for a new role",
                    choices: res.map(
                        (department) => department.department_name
                    ),
                },
            ])
            .then ((answers) => {
                const department = res.find(
                    (department) => department.name === answers.department
                );
                const query = "INSERT INTO roles SET";
                connection.query(
                    query,
                    {
                        title: answers.title,
                        salary: answers.salary,
                        department_id: department,
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log(
                            'Added role and salary to the database'
                        );
                        start();
                    }
                );
            });
    });
}

function addEmployee() {
    connection.query("SELECT id, title FROM roles", (error, results) => {
        if (error) {
            console.error(error);
            return;
        }

        const roles = results.map(({ id, title }) => ({
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
            }
            
            const managers = results.map(({ id, name }) => ({
                name,
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
                        name: "roleID",
                        message: "Select an employee role",
                        choices: roles,
                    },
                    {
                        type: Boolean,
                        name: "managerID",
                        message: "Is the employee a manager?",
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
}

function addManager() {
    const queryDepartments = "SELECT * FROM departments";
    const queryEmployees = "SELECT * FROM employee";

    connection.query(queryDepartments, (err, resDepartments) => {
        if (err) throw err;
        connection.query(queryEmployees, (err, resEmployees) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "department",
                        message: "Select a department",
                        choices: resDepartments.map(
                            (department) => department.department_name
                        ),
                    },
                    {
                        type: "list",
                        name: "employee",
                        message: "Select the employee to become a manager",
                        choices: resEmployees.map(
                            (employee) =>
                                `${employee.first_name} ${employee.last_name}`
                        ),
                    },
                ])
                .then((answers) => {
                    const department = resDepartments.find(
                        (department) =>
                        department.department_name === answers.department
                    );
                    const employee = resEmployees.find(
                        (employee) =>
                        `${employee.first_name}${employee.last_name}` ===
                        answers.employee
                    );
                    const manager = resEmployees.find(
                        (employee) =>
                        `${employee.first_name}${employee.last_name}` ===
                        answers.manager
                    );
                    const query = 
                        "UPDATE employee SET manager_id = > WHERE id = ? AND role_id IN (SELECT id FROM roles WHERE department_id = ?)";
                        connection.query(
                            query,
                            [manager.id, employee.id, department.id],
                            (err, res) => {
                                if (err) throw err;
                                console.log("Added manager");
                                start();
                            }
                        )
                })
        })
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

function deleteDepartmentRolesEmployeees() {
    inquirer
        .prompt({
            type: "list",
            name: "data",
            message: "Select to delete:",
            choices: ["Employee", "Role", "Department"],
        })
        .then((answer) => {
            switch (answer.data) {
                case "Employee":
            }
        })
}