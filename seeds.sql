-- Insert some departments
INSERT INTO departments (name) VALUES
  ('Engineering'),
  ('Marketing'),
  ('Finance');

-- Insert some roles
INSERT INTO roles (title, salary, department_id) VALUES
  ('Software Engineer', 80000.00, 1),
  ('Marketing Manager', 75000.00, 2),
  ('Financial Analyst', 60000.00, 3);

-- Insert some employees
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
  ('John', 'Doe', 1, NULL),
  ('Jane', 'Smith', 2, 1),
  ('Mike', 'Johnson', 3, 1);

