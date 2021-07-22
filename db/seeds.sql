INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Alex', 'Jones', 7, NULL),
('Tina', 'Belcher', 6, NULL),
('Fiona', 'Gallagher', 5, 2),
('Beth', 'Sanchez', 1, 5),
('Jared', 'Dunn', 2, NULL),
('Richard', 'Harrow', 4, NULL),
('Jessica', 'Huang', 3, 4),
('Andre', 'Holt', 8, 9),
('Jason', 'Mendoza', 9, NULL),
('Walter', 'White', 10, NULL),
('Michael', 'Scott', 11, 10);

INSERT INTO role (title, salary, department_id)
VALUES
('Salesperson', '50000', 1),
('Sales Lead', '70000', 1),
('Software Engineer', '90000', 2),
('Software Engineer Lead', '120000', 2),
('Generalist', '60000', 3),
('Team Leader', '80000', 3),
('Benefits Coordinator', '80000', 3),
('Accountant', '40000', 4),
('Bookkeeper', '50000', 4),
('Lawyer', '150000', 5),
('Paralegal', '40000', 5);


