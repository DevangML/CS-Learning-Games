// SQL Tutorial Learning Levels Data - Clean Logical Roadmap
const LEARNING_LEVELS = {
    1: {
        title: "🧮 Arithmetic Operators",
        description: "Master mathematical operations in SQL",
        difficulty: "Beginner",
        questions: [
            {
                question: "Calculate each employee's annual bonus as 10% of their salary using addition (+).",
                solution: "SELECT name, salary, salary * 0.10 as bonus, salary + (salary * 0.10) as total_compensation FROM employees;",
                hint: "Use + for addition, * for multiplication",
                concept: {
                    title: "Arithmetic Operations",
                    content: "SQL supports basic arithmetic: + (addition), - (subtraction), * (multiplication), / (division), % (modulo). Use parentheses to control order of operations."
                }
            },
            {
                question: "Find the salary difference between each employee and the highest paid employee (80000).",
                solution: "SELECT name, salary, 80000 - salary as salary_gap FROM employees;",
                hint: "Use - for subtraction",
                concept: {
                    title: "Subtraction Operations",
                    content: "Subtraction (-) can be used to find differences, calculate remainders, or perform date arithmetic."
                }
            },
            {
                question: "Calculate monthly salary by dividing annual salary by 12.",
                solution: "SELECT name, salary, salary / 12 as monthly_salary FROM employees;",
                hint: "Use / for division",
                concept: {
                    title: "Division Operations",
                    content: "Division (/) returns decimal results. Be careful with integer division in some SQL databases."
                }
            },
            {
                question: "Find employees whose employee ID is even using modulo operator (%).",
                solution: "SELECT * FROM employees WHERE id % 2 = 0;",
                hint: "Use % for modulo (remainder). Even numbers have remainder 0 when divided by 2",
                concept: {
                    title: "Modulo Operations",
                    content: "Modulo (%) returns the remainder after division. Useful for finding even/odd numbers, cycling through values, or pagination."
                }
            }
        ]
    },
    2: {
        title: "⚖️ Comparison Operators",
        description: "Master all comparison operations",
        difficulty: "Beginner",
        questions: [
            {
                question: "Find employees with salary equal to exactly 75000.",
                solution: "SELECT * FROM employees WHERE salary = 75000;",
                hint: "Use = for equality comparison",
                concept: {
                    title: "Equality Operator",
                    content: "The = operator checks for exact matches. Be careful with floating-point numbers and case sensitivity."
                }
            },
            {
                question: "Find employees with salary not equal to 50000 using != operator.",
                solution: "SELECT * FROM employees WHERE salary != 50000;",
                hint: "Both != and <> mean 'not equal to'. They are interchangeable",
                concept: {
                    title: "Inequality Operators",
                    content: "Both != and <> check for inequality. <> is SQL standard, != is more common in programming languages."
                }
            },
            {
                question: "Find employees with salary less than 60000 and greater than or equal to 70000.",
                solution: "SELECT * FROM employees WHERE salary < 60000 OR salary >= 70000;",
                hint: "Use < for less than, >= for greater than or equal to",
                concept: {
                    title: "Range Comparisons",
                    content: "Use <, >, <=, >= for range comparisons. Combine with AND/OR for complex conditions."
                }
            },
            {
                question: "Show employees hired on or before '2021-01-01'.",
                solution: "SELECT * FROM employees WHERE hire_date <= '2021-01-01';",
                hint: "Use <= for 'less than or equal to'",
                concept: {
                    title: "Date Comparisons",
                    content: "Comparison operators work with dates. Use proper date format: 'YYYY-MM-DD'."
                }
            }
        ]
    },
    3: {
        title: "🧠 Logical Operators", 
        description: "Combine conditions with AND, OR, NOT",
        difficulty: "Beginner",
        questions: [
            {
                question: "Find employees in Engineering (department_id=1) AND with salary > 70000.",
                solution: "SELECT * FROM employees WHERE department_id = 1 AND salary > 70000;",
                hint: "AND requires both conditions to be true",
                concept: {
                    title: "AND Operator",
                    content: "AND returns true only when all conditions are true. Use parentheses for complex logic."
                }
            },
            {
                question: "Find employees in either Marketing (dept_id=2) OR Sales (dept_id=3).",
                solution: "SELECT * FROM employees WHERE department_id = 2 OR department_id = 3;",
                hint: "OR requires at least one condition to be true",
                concept: {
                    title: "OR Operator",
                    content: "OR returns true when at least one condition is true. Useful for multiple alternatives."
                }
            },
            {
                question: "Find employees NOT in the HR department (dept_id=4).",
                solution: "SELECT * FROM employees WHERE NOT department_id = 4;",
                hint: "NOT reverses the truth value of a condition",
                concept: {
                    title: "NOT Operator",
                    content: "NOT negates boolean expressions. Can be combined with other operators like NOT IN, NOT EXISTS."
                }
            },
            {
                question: "Find if ANY employee has salary greater than 60000.",
                solution: "SELECT EXISTS(SELECT 1 FROM employees WHERE salary > 60000) as has_high_salary;",
                hint: "Use EXISTS to check if ANY record matches condition",
                concept: {
                    title: "ANY/EXISTS Operators",
                    content: "EXISTS returns true if subquery returns any rows. More efficient than COUNT(*) > 0."
                }
            }
        ]
    },
    4: {
        title: "🎭 Pattern Matching",
        description: "Master LIKE, REGEXP and wildcard patterns",
        difficulty: "Intermediate",
        questions: [
            {
                question: "Find employees whose name starts with 'J' using LIKE.",
                solution: "SELECT * FROM employees WHERE name LIKE 'J%';",
                hint: "% matches any number of characters",
                concept: {
                    title: "LIKE with Wildcards",
                    content: "LIKE uses % (any characters) and _ (single character) wildcards for pattern matching."
                }
            },
            {
                question: "Find employees whose name does NOT contain 'Smith' using NOT LIKE.",
                solution: "SELECT * FROM employees WHERE name NOT LIKE '%Smith%';",
                hint: "NOT LIKE negates pattern matching",
                concept: {
                    title: "NOT LIKE",
                    content: "NOT LIKE excludes rows that match the pattern. Useful for filtering out specific patterns."
                }
            },
            {
                question: "Find employees with exactly 9-character names using LIKE with underscore.",
                solution: "SELECT * FROM employees WHERE name LIKE '_________';",
                hint: "Each _ represents exactly one character",
                concept: {
                    title: "Underscore Wildcard",
                    content: "The _ wildcard matches exactly one character, useful for fixed-length patterns."
                }
            },
            {
                question: "Find employees whose name contains 'ohn' using REGEXP.",
                solution: "SELECT * FROM employees WHERE name REGEXP 'ohn';",
                hint: "REGEXP uses regular expressions for pattern matching",
                concept: {
                    title: "Regular Expressions",
                    content: "REGEXP/RLIKE allows complex pattern matching using regular expression syntax."
                }
            }
        ]
    },
    5: {
        title: "📊 Range & Set Operators",
        description: "Work with ranges and sets of values",
        difficulty: "Intermediate",
        questions: [
            {
                question: "Find employees with salary BETWEEN 60000 and 80000.",
                solution: "SELECT * FROM employees WHERE salary BETWEEN 60000 AND 80000;",
                hint: "BETWEEN includes both boundary values",
                concept: {
                    title: "BETWEEN Operator",
                    content: "BETWEEN is inclusive of both endpoints. Equivalent to >= AND <=."
                }
            },
            {
                question: "Find employees with salary NOT BETWEEN 50000 and 70000.",
                solution: "SELECT * FROM employees WHERE salary NOT BETWEEN 50000 AND 70000;",
                hint: "NOT BETWEEN excludes the range",
                concept: {
                    title: "NOT BETWEEN",
                    content: "NOT BETWEEN finds values outside the specified range."
                }
            },
            {
                question: "Find employees in specific departments using IN operator.",
                solution: "SELECT * FROM employees WHERE department_id IN (1, 3);",
                hint: "IN checks if value exists in a list",
                concept: {
                    title: "IN Operator",
                    content: "IN tests if a value matches any value in a list or subquery. More concise than multiple OR conditions."
                }
            },
            {
                question: "Find employees NOT in Marketing or Sales departments.",
                solution: "SELECT * FROM employees WHERE department_id NOT IN (2, 3);",
                hint: "NOT IN excludes values in the list",
                concept: {
                    title: "NOT IN Operator", 
                    content: "NOT IN excludes rows where the value matches any in the list. Be careful with NULL values."
                }
            }
        ]
    },
    6: {
        title: "🔗 JOIN Operations",
        description: "Master all JOIN types and techniques",
        difficulty: "Intermediate",
        questions: [
            {
                question: "INNER JOIN employees with departments to show matching records only.",
                solution: "SELECT e.name, d.name as dept_name FROM employees e INNER JOIN departments d ON e.department_id = d.id;",
                hint: "INNER JOIN returns only matching records from both tables",
                concept: {
                    title: "INNER JOIN",
                    content: "INNER JOIN returns rows where the join condition matches in both tables. Most restrictive join type."
                }
            },
            {
                question: "LEFT JOIN to show all departments and their employees (including empty departments).",
                solution: "SELECT d.name as dept, e.name as employee FROM departments d LEFT JOIN employees e ON d.id = e.department_id;",
                hint: "LEFT JOIN keeps all rows from left table",
                concept: {
                    title: "LEFT JOIN",
                    content: "LEFT JOIN returns all rows from left table and matching rows from right table. NULLs for non-matches."
                }
            },
            {
                question: "RIGHT JOIN to show all employees and their departments (including unassigned).",
                solution: "SELECT d.name as dept, e.name as employee FROM departments d RIGHT JOIN employees e ON d.id = e.department_id;",
                hint: "RIGHT JOIN keeps all rows from right table",
                concept: {
                    title: "RIGHT JOIN",
                    content: "RIGHT JOIN returns all rows from right table and matching rows from left table."
                }
            },
            {
                question: "CROSS JOIN to get all possible combinations of employees and departments.",
                solution: "SELECT e.name as employee, d.name as dept FROM employees e CROSS JOIN departments d;",
                hint: "CROSS JOIN creates Cartesian product (all combinations)",
                concept: {
                    title: "CROSS JOIN",
                    content: "CROSS JOIN creates a Cartesian product, pairing every row from first table with every row from second table."
                }
            }
        ]
    },
    7: {
        title: "📊 Grouping & Aggregation",
        description: "GROUP BY with aggregate functions",
        difficulty: "Intermediate",
        questions: [
            {
                question: "Count the number of employees in each department.",
                solution: "SELECT department_id, COUNT(*) as employee_count FROM employees GROUP BY department_id;",
                hint: "Use COUNT(*) with GROUP BY",
                concept: {
                    title: "Basic Aggregation",
                    content: "GROUP BY groups rows with same values. Aggregate functions like COUNT, SUM, AVG work on each group."
                }
            },
            {
                question: "Find the average salary for each department.",
                solution: "SELECT department_id, AVG(salary) as avg_salary FROM employees GROUP BY department_id;",
                hint: "Use AVG() function with GROUP BY",
                concept: {
                    title: "AVG Function",
                    content: "AVG() calculates the arithmetic mean of numeric values in each group."
                }
            },
            {
                question: "Find the highest and lowest salary in each department.",
                solution: "SELECT department_id, MAX(salary) as highest, MIN(salary) as lowest FROM employees GROUP BY department_id;",
                hint: "Use MAX() and MIN() functions",
                concept: {
                    title: "MIN/MAX Functions",
                    content: "MIN() and MAX() find the minimum and maximum values in each group."
                }
            },
            {
                question: "Find departments with more than 2 employees using HAVING.",
                solution: "SELECT department_id, COUNT(*) as emp_count FROM employees GROUP BY department_id HAVING COUNT(*) > 2;",
                hint: "Use HAVING to filter groups after aggregation",
                concept: {
                    title: "HAVING Clause",
                    content: "HAVING filters groups after GROUP BY, while WHERE filters rows before grouping."
                }
            }
        ]
    },
    8: {
        title: "🔍 Subqueries",
        description: "Master nested queries and correlated subqueries",
        difficulty: "Advanced",
        questions: [
            {
                question: "Find employees earning more than the average salary.",
                solution: "SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);",
                hint: "Use a subquery to calculate the average first",
                concept: {
                    title: "Simple Subqueries",
                    content: "Subqueries are queries inside other queries. They execute first and return values to the outer query."
                }
            },
            {
                question: "Find employees earning more than their department's average salary.",
                solution: "SELECT e1.name, e1.salary, e1.department_id FROM employees e1 WHERE e1.salary > (SELECT AVG(e2.salary) FROM employees e2 WHERE e2.department_id = e1.department_id);",
                hint: "Use correlated subquery that references outer query table",
                concept: {
                    title: "Correlated Subqueries",
                    content: "Correlated subqueries reference columns from the outer query, executing once for each outer row."
                }
            },
            {
                question: "Find employees who work in departments that have ANY employee earning > 75000.",
                solution: "SELECT e.name FROM employees e WHERE e.department_id = ANY (SELECT DISTINCT e2.department_id FROM employees e2 WHERE e2.salary > 75000);",
                hint: "ANY returns true if condition matches at least one subquery row",
                concept: {
                    title: "ANY Operator",
                    content: "ANY (equivalent to SOME) returns true if the condition is satisfied for at least one row in the subquery result."
                }
            },
            {
                question: "Find departments that have employees using EXISTS.",
                solution: "SELECT d.name FROM departments d WHERE EXISTS (SELECT 1 FROM employees e WHERE e.department_id = d.id);",
                hint: "EXISTS checks if subquery returns any rows",
                concept: {
                    title: "EXISTS Operator",
                    content: "EXISTS is optimized for checking row existence. More efficient than IN for complex subqueries."
                }
            }
        ]
    },
    9: {
        title: "🏆 Window Functions",
        description: "Master analytical functions for advanced data analysis",
        difficulty: "Advanced",
        questions: [
            {
                question: "Find the 2nd highest salary using ROW_NUMBER() window function.",
                solution: "SELECT salary FROM (SELECT salary, ROW_NUMBER() OVER (ORDER BY salary DESC) as row_num FROM employees) ranked WHERE row_num = 2;",
                hint: "Use ROW_NUMBER() OVER (ORDER BY salary DESC) and filter for row 2",
                concept: {
                    title: "ROW_NUMBER Window Function",
                    content: "ROW_NUMBER() assigns unique sequential numbers to rows within a result set, ordered by specified columns."
                }
            },
            {
                question: "Rank employees by salary within their department using RANK().",
                solution: "SELECT name, department_id, salary, RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as salary_rank FROM employees;",
                hint: "Use RANK() with PARTITION BY department_id",
                concept: {
                    title: "RANK with PARTITION BY",
                    content: "RANK() assigns rank values with gaps for ties. PARTITION BY creates separate ranking groups."
                }
            },
            {
                question: "Calculate running total of salaries ordered by hire date.",
                solution: "SELECT name, hire_date, salary, SUM(salary) OVER (ORDER BY hire_date ROWS UNBOUNDED PRECEDING) as running_total FROM employees ORDER BY hire_date;",
                hint: "Use SUM() OVER with ORDER BY and ROWS frame",
                concept: {
                    title: "Running Totals",
                    content: "Window functions with ORDER BY create cumulative calculations. ROWS UNBOUNDED PRECEDING includes all previous rows."
                }
            },
            {
                question: "Find each employee's previous and next salary using LAG() and LEAD().",
                solution: "SELECT name, salary, LAG(salary, 1) OVER (ORDER BY salary) as prev_salary, LEAD(salary, 1) OVER (ORDER BY salary) as next_salary FROM employees ORDER BY salary;",
                hint: "LAG looks backward, LEAD looks forward in the ordered result set",
                concept: {
                    title: "LAG and LEAD Functions",
                    content: "LAG() and LEAD() access previous and next row values without self-joins. Essential for comparing consecutive records."
                }
            }
        ]
    },
    10: {
        title: "📅 Date & Time Functions",
        description: "Master date arithmetic and time-based analysis",
        difficulty: "Advanced",
        questions: [
            {
                question: "Find employees hired in the last 5 years using date arithmetic.",
                solution: "SELECT name, hire_date FROM employees WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR);",
                hint: "Use DATE_SUB with INTERVAL for date calculations",
                concept: {
                    title: "Date Arithmetic",
                    content: "MySQL provides DATE_ADD, DATE_SUB, and INTERVAL for date calculations. Essential for time-based filtering."
                }
            },
            {
                question: "Calculate each employee's years of service using DATEDIFF.",
                solution: "SELECT name, hire_date, ROUND(DATEDIFF(CURDATE(), hire_date) / 365.25, 1) as years_of_service FROM employees;",
                hint: "DATEDIFF returns difference in days, divide by 365.25 for years",
                concept: {
                    title: "DATEDIFF Function",
                    content: "DATEDIFF calculates the difference between two dates in days. Common in age calculations and duration analysis."
                }
            },
            {
                question: "Group employees by hire year and count them.",
                solution: "SELECT YEAR(hire_date) as hire_year, COUNT(*) as employees_hired FROM employees GROUP BY YEAR(hire_date) ORDER BY hire_year;",
                hint: "Use YEAR() function to extract year from date",
                concept: {
                    title: "Date Extraction Functions",
                    content: "YEAR(), MONTH(), DAY() extract specific parts of dates. Essential for grouping and filtering by time periods."
                }
            },
            {
                question: "Find employees hired in the same month as their department was created (using department_id as month).",
                solution: "SELECT e.name, e.hire_date, e.department_id FROM employees e WHERE MONTH(e.hire_date) = e.department_id;",
                hint: "Use MONTH() function and compare with numeric values",
                concept: {
                    title: "Date Comparison Patterns",
                    content: "Comparing extracted date parts enables complex temporal relationships analysis, common in business logic."
                }
            }
        ]
    },
    11: {
        title: "🎯 LeetCode SQL Patterns",
        description: "Master specific SQL problem-solving patterns",
        difficulty: "Expert",
        questions: [
            {
                question: "Solve 'Nth Highest Salary' pattern: Find 3rd highest salary.",
                solution: "SELECT DISTINCT salary as ThirdHighestSalary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 2;",
                hint: "Use DISTINCT, ORDER BY DESC, LIMIT with OFFSET for Nth highest patterns",
                concept: {
                    title: "Nth Highest Value Pattern",
                    content: "Classic pattern using LIMIT OFFSET or window functions to find Nth highest/lowest values in datasets."
                }
            },
            {
                question: "Solve 'Department Highest Salary' pattern: Find highest paid employee per department.",
                solution: "SELECT d.name as Department, e.name as Employee, e.salary as Salary FROM employees e JOIN departments d ON e.department_id = d.id WHERE (e.department_id, e.salary) IN (SELECT department_id, MAX(salary) FROM employees GROUP BY department_id);",
                hint: "Use tuple IN with GROUP BY MAX to find highest in each group",
                concept: {
                    title: "Group Maximum Pattern",
                    content: "Common pattern using tuple matching with GROUP BY and aggregate functions to find extremes within groups."
                }
            },
            {
                question: "Find pairs of employees with similar salaries (within 5000 difference).",
                solution: "SELECT e1.name as employee1, e2.name as employee2, e1.salary, e2.salary, ABS(e1.salary - e2.salary) as salary_diff FROM employees e1 JOIN employees e2 ON e1.id < e2.id AND ABS(e1.salary - e2.salary) <= 5000 ORDER BY salary_diff;",
                hint: "Use self-join with ABS() and e1.id < e2.id to avoid duplicates",
                concept: {
                    title: "Similarity Matching Pattern",
                    content: "Self-joins with mathematical conditions can find similar records. Use id comparison to avoid duplicate pairs."
                }
            },
            {
                question: "Create employee hierarchy levels by salary within departments.",
                solution: "SELECT e1.name, e1.department_id, e1.salary, COUNT(e2.id) + 1 as hierarchy_level FROM employees e1 LEFT JOIN employees e2 ON e1.department_id = e2.department_id AND e1.salary < e2.salary GROUP BY e1.id, e1.name, e1.department_id, e1.salary ORDER BY e1.department_id, hierarchy_level;",
                hint: "Count how many employees earn more to determine hierarchy level",
                concept: {
                    title: "Hierarchy Building Pattern",
                    content: "Self-joins can create hierarchical levels by counting superior records, useful for organizational analysis."
                }
            }
        ]
    }
};

// Export for global access
window.LEARNING_LEVELS = LEARNING_LEVELS;
// moved to public/src for Next.js
