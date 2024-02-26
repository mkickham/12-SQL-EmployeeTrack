const  inquirer = require("inquirer");
const mysql = require("mysql2");

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
    
}