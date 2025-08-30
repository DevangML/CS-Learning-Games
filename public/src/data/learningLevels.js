// SQL Tutorial Learning Levels Data - 23 Level Roadmap (Problematic Levels Removed)
const LEARNING_LEVELS = {
    1: {
        title: "🧮 Arithmetic Operators",
        description: "Master mathematical operations in SQL",
        difficulty: "Beginner",
        questions: [
            {
                question: "Calculate each employee's annual bonus as 10% of their salary using addition (+).",
                solution: "SELECT name, salary, salary * 0.10 as bonus, salary + (salary * 0.10) as total_compensation FROM \"Employee\";",
                hint: "Use + for addition, * for multiplication",
                concept: {
                    title: "Arithmetic Operations",
                    content: "SQL supports basic arithmetic: + (addition), - (subtraction), * (multiplication), / (division), % (modulo). Use parentheses to control order of operations."
                }
            },
            {
                question: "Find the salary difference between each employee and the highest paid employee (80000).",
                solution: "SELECT name, salary, 80000 - salary as salary_gap FROM \"Employee\";",
                hint: "Use - for subtraction",
                concept: {
                    title: "Subtraction Operations",
                    content: "Subtraction (-) can be used to find differences, calculate remainders, or perform date arithmetic."
                }
            },
            {
                question: "Calculate monthly salary by dividing annual salary by 12.",
                solution: "SELECT name, salary, salary / 12 as monthly_salary FROM \"Employee\";",
                hint: "Use / for division",
                concept: {
                    title: "Division Operations",
                    content: "Division (/) returns decimal results. Be careful with integer division in some SQL databases."
                }
            },
            {
                question: "Find employees whose employee ID is even using modulo operator (%).",
                solution: "SELECT * FROM \"Employee\" WHERE id % 2 = 0;",
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
                solution: "SELECT * FROM \"Employee\" WHERE salary = 75000;",
                hint: "Use = for equality comparison",
                concept: {
                    title: "Equality Operator",
                    content: "The = operator checks for exact matches. Be careful with floating-point numbers and case sensitivity."
                }
            },
            {
                question: "Find employees with salary not equal to 50000 using != operator.",
                solution: "SELECT * FROM \"Employee\" WHERE salary != 50000;",
                hint: "Both != and <> mean 'not equal to'. They are interchangeable",
                concept: {
                    title: "Inequality Operators",
                    content: "Both != and <> check for inequality. <> is SQL standard, != is more common in programming languages."
                }
            },
            {
                question: "Find employees with salary less than 60000 and greater than or equal to 70000.",
                solution: "SELECT * FROM \"Employee\" WHERE salary < 60000 OR salary >= 70000;",
                hint: "Use < for less than, >= for greater than or equal to",
                concept: {
                    title: "Range Comparisons",
                    content: "Use <, >, <=, >= for range comparisons. Combine with AND/OR for complex conditions."
                }
            },
            {
                question: "Show employees hired on or before '2021-01-01'.",
                solution: "SELECT * FROM \"Employee\" WHERE hire_date <= '2021-01-01';",
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
                question: "Find employees in Engineering (departmentId=1) AND with salary > 70000.",
                solution: "SELECT * FROM \"Employee\" WHERE \"departmentId\" = 1 AND salary > 70000;",
                hint: "AND requires both conditions to be true",
                concept: {
                    title: "AND Operator",
                    content: "AND returns true only when all conditions are true. Use parentheses for complex logic."
                }
            },
            {
                question: "Find employees in either Marketing (department_id=2) OR Sales (department_id=3).",
                solution: "SELECT * FROM \"Employee\" WHERE \"departmentId\" = 2 OR \"departmentId\" = 3;",
                hint: "OR requires at least one condition to be true",
                concept: {
                    title: "OR Operator",
                    content: "OR returns true when at least one condition is true. Useful for multiple alternatives."
                }
            },
            {
                question: "Find employees NOT in the HR department (department_id=4).",
                solution: "SELECT * FROM \"Employee\" WHERE NOT \"departmentId\" = 4;",
                hint: "NOT reverses the truth value of a condition",
                concept: {
                    title: "NOT Operator",
                    content: "NOT negates boolean expressions. Can be combined with other operators like NOT IN, NOT EXISTS."
                }
            },
            {
                question: "Find if ANY employee has salary greater than 60000.",
                solution: "SELECT EXISTS(SELECT 1 FROM \"Employee\" WHERE salary > 60000) as has_high_salary;",
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
        difficulty: "Beginner",
        questions: [
            {
                question: "Find employees whose name starts with 'J' using LIKE.",
                solution: "SELECT * FROM \"Employee\" WHERE name LIKE 'J%';",
                hint: "% matches any number of characters",
                concept: {
                    title: "LIKE with Wildcards",
                    content: "LIKE uses % (any characters) and _ (single character) wildcards for pattern matching."
                }
            },
            {
                question: "Find employees whose name does NOT contain 'Smith' using NOT LIKE.",
                solution: "SELECT * FROM \"Employee\" WHERE name NOT LIKE '%Smith%';",
                hint: "NOT LIKE negates pattern matching",
                concept: {
                    title: "NOT LIKE",
                    content: "NOT LIKE excludes rows that match the pattern. Useful for filtering out specific patterns."
                }
            },
            {
                question: "Find employees with exactly 9-character names using LIKE with underscore.",
                solution: "SELECT * FROM \"Employee\" WHERE name LIKE '_________';",
                hint: "Each _ represents exactly one character",
                concept: {
                    title: "Underscore Wildcard",
                    content: "The _ wildcard matches exactly one character, useful for fixed-length patterns."
                }
            },
            {
                question: "Find employees whose name contains 'ohn' using REGEXP.",
                solution: "SELECT * FROM \"Employee\" WHERE name REGEXP 'ohn';",
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
                solution: "SELECT * FROM \"Employee\" WHERE salary BETWEEN 60000 AND 80000;",
                hint: "BETWEEN includes both boundary values",
                concept: {
                    title: "BETWEEN Operator",
                    content: "BETWEEN is inclusive of both endpoints. Equivalent to >= AND <=."
                }
            },
            {
                question: "Find employees with salary NOT BETWEEN 50000 and 70000.",
                solution: "SELECT * FROM \"Employee\" WHERE salary NOT BETWEEN 50000 AND 70000;",
                hint: "NOT BETWEEN excludes the range",
                concept: {
                    title: "NOT BETWEEN",
                    content: "NOT BETWEEN finds values outside the specified range."
                }
            },
            {
                question: "Find employees in specific departments using IN operator.",
                solution: "SELECT * FROM \"Employee\" WHERE \"departmentId\" IN (1, 3);",
                hint: "IN checks if value exists in a list",
                concept: {
                    title: "IN Operator",
                    content: "IN tests if a value matches any value in a list or subquery. More concise than multiple OR conditions."
                }
            },
            {
                question: "Find employees NOT in Marketing or Sales departments.",
                solution: "SELECT * FROM \"Employee\" WHERE \"departmentId\" NOT IN (2, 3);",
                hint: "NOT IN excludes values in the list",
                concept: {
                    title: "NOT IN Operator", 
                    content: "NOT IN excludes rows where the value matches any in the list. Be careful with NULL values."
                }
            }
        ]
    },
    6: {
        title: "🕳️ NULL Handling",
        description: "Master NULL checking and handling functions",
        difficulty: "Intermediate",
        questions: [
            {
                question: "Find all employees (department_id can be anything including NULL).",
                solution: "SELECT * FROM \"Employee\";",
                hint: "This shows all data including NULL values",
                concept: {
                    title: "Understanding NULL",
                    content: "NULL represents missing or unknown data. It's different from empty string or zero."
                }
            },
            {
                question: "Find employees where department_id IS NOT NULL.",
                solution: "SELECT * FROM \"Employee\" WHERE \"departmentId\" IS NOT NULL;",
                hint: "Use IS NOT NULL to exclude NULL values",
                concept: {
                    title: "IS NOT NULL",
                    content: "IS NOT NULL finds rows with non-NULL values. Essential for data quality checks."
                }
            },
            {
                question: "Use COALESCE to show 'Unassigned' for employees without department_id.",
                solution: "SELECT name, COALESCE(\"departmentId\", 'Unassigned') as dept FROM \"Employee\";",
                hint: "COALESCE returns first non-NULL value",
                concept: {
                    title: "COALESCE Function",
                    content: "COALESCE returns the first non-NULL value from a list of expressions."
                }
            },
            {
                question: "Use NULLIF to return NULL when salary equals 50000, otherwise return salary.",
                solution: "SELECT name, NULLIF(salary, 50000) as modified_salary FROM \"Employee\";",
                hint: "NULLIF returns NULL if both values are equal",
                concept: {
                    title: "NULLIF Function",
                    content: "NULLIF returns NULL if the two arguments are equal, otherwise returns the first argument."
                }
            }
        ]
    },
    7: {
        title: "🔤 String Operations",
        description: "String concatenation and manipulation",
        difficulty: "Intermediate",
        questions: [
            {
                question: "Concatenate employee name with their \"departmentId\" using CONCAT.",
                solution: "SELECT CONCAT(name, ' - Dept: ', \"departmentId\") as employee_info FROM \"Employee\";",
                hint: "CONCAT joins multiple strings together",
                concept: {
                    title: "String Concatenation",
                    content: "CONCAT function joins strings together. MySQL also supports CONCAT_WS for separator-based joining."
                }
            },
            {
                question: "Create a formatted string showing employee name and salary with CONCAT_WS.",
                solution: "SELECT CONCAT_WS(' - ', name, CONCAT('$', salary)) as employee_detail FROM \"Employee\";",
                hint: "CONCAT_WS uses a separator between strings",
                concept: {
                    title: "CONCAT_WS Function",
                    content: "CONCAT_WS (With Separator) joins strings with a specified separator, ignoring NULL values."
                }
            },
            {
                question: "Find employees whose name contains 'John' using string matching.",
                solution: "SELECT * FROM \"Employee\" WHERE name LIKE '%John%';",
                hint: "LIKE with % wildcards for substring matching",
                concept: {
                    title: "String Pattern Matching",
                    content: "Use LIKE with wildcards for flexible string matching within larger text."
                }
            },
            {
                question: "Get the length of each employee's name using LENGTH function.",
                solution: "SELECT name, LENGTH(name) as name_length FROM \"Employee\";",
                hint: "LENGTH returns the number of characters in a string",
                concept: {
                    title: "String Functions",
                    content: "SQL provides many string functions: LENGTH, UPPER, LOWER, SUBSTRING, TRIM, etc."
                }
            }
        ]
    },
    8: {
        title: "🔢 Bitwise Operations", 
        description: "Binary operations on integer values",
        difficulty: "Intermediate",
        questions: [
            {
                question: "Find employees where department_id AND 1 equals 1 (odd department IDs).",
                solution: "SELECT * FROM \"Employee\" WHERE \"departmentId\" & 1 = 1;",
                hint: "& is bitwise AND. Odd numbers have bit 1 set",
                concept: {
                    title: "Bitwise AND",
                    content: "Bitwise & performs AND operation on each bit. Useful for checking specific bit patterns."
                }
            },
            {
                question: "Calculate \"departmentId\" OR 8 using bitwise OR for each employee.",
                solution: "SELECT name, \"departmentId\", \"departmentId\" | 8 as dept_or_8 FROM \"Employee\";",
                hint: "| is bitwise OR operator",
                concept: {
                    title: "Bitwise OR",
                    content: "Bitwise | sets bits that are set in either operand. Useful for setting specific bits."
                }
            },
            {
                question: "Calculate \"departmentId\" XOR 3 using bitwise XOR.",
                solution: "SELECT name, \"departmentId\", \"departmentId\" ^ 3 as dept_xor_3 FROM \"Employee\";",
                hint: "^ is bitwise XOR (exclusive OR)",
                concept: {
                    title: "Bitwise XOR",
                    content: "Bitwise ^ returns 1 when bits differ, 0 when they're the same. Useful for toggling bits."
                }
            },
            {
                question: "Find employees where id left-shifted by 1 is greater than 10.",
                solution: "SELECT * FROM \"Employee\" WHERE id << 1 > 10;",
                hint: "<< is left shift operator (multiplies by 2^n)",
                concept: {
                    title: "Bit Shifting",
                    content: "Left shift << multiplies by powers of 2, right shift >> divides by powers of 2."
                }
            }
        ]
    },
    9: {
        title: "🔄 Set Operations",
        description: "Combine query results with UNION",
        difficulty: "Intermediate",
        questions: [
            {
                question: "Combine employees from Marketing and Sales using UNION.",
                solution: "SELECT name FROM \"Employee\" WHERE \"departmentId\" = 2 UNION SELECT name FROM \"Employee\" WHERE \"departmentId\" = 3;",
                hint: "UNION removes duplicates, UNION ALL keeps them",
                concept: {
                    title: "UNION Operations",
                    content: "UNION combines results from multiple queries, removing duplicates. UNION ALL keeps duplicates."
                }
            },
            {
                question: "Get all names from employees and departments using UNION ALL.",
                solution: "SELECT name FROM \"Employee\" UNION ALL SELECT name FROM \"Department\";",
                hint: "UNION ALL keeps all rows including duplicates",
                concept: {
                    title: "UNION ALL",
                    content: "UNION ALL is faster than UNION as it doesn't remove duplicates. Use when duplicates are acceptable."
                }
            },
            {
                question: "Find unique department names across employees and departments tables.",
                solution: "SELECT DISTINCT name FROM (SELECT name FROM \"Department\" UNION ALL SELECT CONCAT('Dept ', \"departmentId\") as name FROM \"Employee\" WHERE \"departmentId\" IS NOT NULL) as combined;",
                hint: "Use subquery with UNION ALL then DISTINCT for unique values",
                concept: {
                    title: "Complex Set Operations",
                    content: "Combine UNION with subqueries and DISTINCT for complex set manipulations."
                }
            },
            {
                question: "Find employees in Engineering but not working on any projects.",
                solution: "SELECT e.* FROM \"Employee\" e WHERE \"departmentId\" = 1 AND NOT EXISTS (SELECT 1 FROM \"employee_projects\" ep WHERE ep.employeeId = e.id);",
                hint: "Use NOT EXISTS to simulate EXCEPT/MINUS",
                concept: {
                    title: "Simulating EXCEPT",
                    content: "MySQL lacks EXCEPT, but NOT EXISTS or LEFT JOIN with NULL checks achieve similar results."
                }
            }
        ]
    },
    10: {
        title: "🔗 Advanced Joins",
        description: "Master all JOIN types and techniques",
        difficulty: "Advanced",
        questions: [
            {
                question: "INNER JOIN employees with departments to show matching records only.",
                solution: "SELECT e.name, d.name as dept_name FROM \"Employee\" e INNER JOIN \"Department\" d ON e.\"departmentId\" = d.id;",
                hint: "INNER JOIN returns only matching records from both tables",
                concept: {
                    title: "INNER JOIN",
                    content: "INNER JOIN returns rows where the join condition matches in both tables. Most restrictive join type."
                }
            },
            {
                question: "LEFT JOIN to show all departments and their employees (including empty departments).",
                solution: "SELECT d.name as dept, e.name as employee FROM \"Department\" d LEFT JOIN \"Employee\" e ON d.id = e.\"departmentId\";",
                hint: "LEFT JOIN keeps all rows from left table",
                concept: {
                    title: "LEFT JOIN",
                    content: "LEFT JOIN returns all rows from left table and matching rows from right table. NULLs for non-matches."
                }
            },
            {
                question: "RIGHT JOIN to show all employees and their departments (including unassigned).",
                solution: "SELECT d.name as dept, e.name as employee FROM \"Department\" d RIGHT JOIN \"Employee\" e ON d.id = e.\"departmentId\";",
                hint: "RIGHT JOIN keeps all rows from right table",
                concept: {
                    title: "RIGHT JOIN",
                    content: "RIGHT JOIN returns all rows from right table and matching rows from left table."
                }
            },
            {
                question: "CROSS JOIN to get all possible combinations of employees and departments.",
                solution: "SELECT e.name as employee, d.name as dept FROM \"Employee\" e CROSS JOIN \"Department\" d;",
                hint: "CROSS JOIN creates Cartesian product (all combinations)",
                concept: {
                    title: "CROSS JOIN",
                    content: "CROSS JOIN creates a Cartesian product, pairing every row from first table with every row from second table."
                }
            }
        ]
    },
    12: {
        title: "⚡ Denormalization Strategies",
        description: "Learn when and how to denormalize for performance",
        difficulty: "Advanced",
        questions: [
            {
                question: "Create a denormalized view combining employees with department names for faster queries.",
                solution: "CREATE VIEW employee_dept_denormalized AS SELECT e.id, e.name, e.salary, d.name as department_name FROM \"Employee\" e JOIN \"Department\" d ON e.\"departmentId\" = d.id;",
                hint: "Use CREATE VIEW to denormalize without changing base tables",
                concept: {
                    title: "Controlled Denormalization",
                    content: "Views allow denormalization benefits (faster reads) while maintaining normalized base tables for data integrity."
                }
            },
            {
                question: "Calculate and store aggregate data: Add total_employees column to departments.",
                solution: "ALTER TABLE departments ADD COLUMN total_employees INT; UPDATE departments SET total_employees = (SELECT COUNT(*) FROM \"Employee\" WHERE \"departmentId\" = departments.id);",
                hint: "Store computed aggregates to avoid expensive calculations",
                concept: {
                    title: "Aggregate Denormalization",
                    content: "Storing calculated values like counts, sums, or averages can significantly improve query performance at the cost of storage and update complexity."
                }
            },
            {
                question: "Create a materialized summary table for reporting: Monthly employee counts by department.",
                solution: "CREATE TABLE monthly_dept_summary (year_month DATE, \"departmentId\" INT, employee_count INT, avg_salary DECIMAL(10,2));",
                hint: "Pre-calculate and store summary data for complex reports",
                concept: {
                    title: "Summary Tables",
                    content: "Summary tables pre-calculate complex aggregations and are updated periodically for fast reporting queries."
                }
            },
            {
                question: "Implement redundant storage: Store department_name directly in employees table.",
                solution: "ALTER TABLE employees ADD COLUMN department_name VARCHAR(100); UPDATE \"Employee\" e SET department_name = (SELECT name FROM \"Department\" d WHERE d.id = e.\"departmentId\");",
                hint: "Sometimes redundancy improves performance despite normalization rules",
                concept: {
                    title: "Strategic Redundancy",
                    content: "Controlled redundancy can eliminate JOINs and improve query performance, but requires careful maintenance of data consistency."
                }
            }
        ]
    },
    14: {
        title: "👁️ Views & Query Optimization",
        description: "Advanced views, indexes, and query performance",
        difficulty: "Advanced",
        questions: [
            {
                question: "Create a complex view showing employee performance metrics.",
                solution: "CREATE VIEW employee_performance AS SELECT e.name, e.salary, d.name as dept, (e.salary / (SELECT AVG(salary) FROM \"Employee\")) as salary_ratio FROM \"Employee\" e JOIN \"Department\" d ON e.\"departmentId\" = d.id;",
                hint: "Views can include joins, subqueries, and calculated fields",
                concept: {
                    title: "Complex Views",
                    content: "Views can encapsulate complex logic including joins, subqueries, and calculations, providing a simplified interface to complex data."
                }
            },
            {
                question: "Create an index to optimize salary-based queries on employees table.",
                solution: "CREATE INDEX idx_employee_salary ON employees (salary DESC);",
                hint: "Indexes speed up WHERE, ORDER BY, and JOIN operations",
                concept: {
                    title: "Query Optimization with Indexes",
                    content: "Indexes create sorted data structures that dramatically speed up searches, sorts, and joins on indexed columns."
                }
            },
            {
                question: "Use EXPLAIN to analyze query performance for a complex JOIN.",
                solution: "EXPLAIN SELECT e.name, d.name FROM \"Employee\" e JOIN \"Department\" d ON e.\"departmentId\" = d.id WHERE e.salary > 60000;",
                hint: "EXPLAIN shows how MySQL executes a query and identifies performance bottlenecks",
                concept: {
                    title: "Query Execution Analysis",
                    content: "EXPLAIN reveals query execution plans, helping identify missing indexes, inefficient joins, and optimization opportunities."
                }
            },
            {
                question: "Create a covering index for a specific query pattern.",
                solution: "CREATE INDEX idx_emp_dept_salary_covering ON employees (\"departmentId\", salary) INCLUDE (name);",
                hint: "Covering indexes include all columns needed by a query",
                concept: {
                    title: "Covering Indexes",
                    content: "Covering indexes contain all columns referenced by a query, eliminating the need to access the base table data."
                }
            }
        ]
    },
    16: {
        title: "📊 Advanced Aggregations",
        description: "Master complex aggregate functions and window operations",
        difficulty: "Advanced",
        questions: [
            {
                question: "Use GROUP_CONCAT to list all employees in each department.",
                solution: "SELECT d.name, GROUP_CONCAT(e.name SEPARATOR ', ') as employees FROM \"Department\" d LEFT JOIN \"Employee\" e ON d.id = e.\"departmentId\" GROUP BY d.id, d.name;",
                hint: "GROUP_CONCAT combines multiple rows into a single string",
                concept: {
                    title: "String Aggregation",
                    content: "GROUP_CONCAT aggregates multiple string values from grouped rows into a single concatenated string with customizable separators."
                }
            },
            {
                question: "Calculate running average of salaries using window functions.",
                solution: "SELECT name, salary, AVG(salary) OVER (ORDER BY hire_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as running_avg FROM \"Employee\" ORDER BY hire_date;",
                hint: "Window functions with frames calculate running aggregates",
                concept: {
                    title: "Running Aggregates",
                    content: "Window functions with frame specifications can calculate running totals, averages, and other cumulative statistics across ordered data sets."
                }
            },
            {
                question: "Find the median salary using window functions.",
                solution: "SELECT DISTINCT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) OVER() as median_salary FROM \"Employee\";",
                hint: "PERCENTILE_CONT calculates percentiles including median (50th percentile)",
                concept: {
                    title: "Statistical Functions",
                    content: "Advanced aggregate functions like PERCENTILE_CONT, PERCENTILE_DISC provide statistical analysis capabilities."
                }
            },
            {
                question: "Create a pivot table showing salary ranges by department using conditional aggregation.",
                solution: "SELECT d.name, SUM(CASE WHEN e.salary < 60000 THEN 1 ELSE 0 END) as low_salary, SUM(CASE WHEN e.salary BETWEEN 60000 AND 80000 THEN 1 ELSE 0 END) as mid_salary, SUM(CASE WHEN e.salary > 80000 THEN 1 ELSE 0 END) as high_salary FROM \"Department\" d LEFT JOIN \"Employee\" e ON d.id = e.\"departmentId\" GROUP BY d.id, d.name;",
                hint: "Use CASE with SUM to create pivot-like results",
                concept: {
                    title: "Conditional Aggregation",
                    content: "Conditional aggregation with CASE statements enables pivot table functionality and complex data summarization."
                }
            }
        ]
    },
    17: {
        title: "🔬 Relational Algebra",
        description: "Understand theoretical foundations with practical SQL",
        difficulty: "Advanced",
        questions: [
            {
                question: "Demonstrate SELECTION operation: σ(salary > 70000)(employees).",
                solution: "SELECT * FROM \"Employee\" WHERE salary > 70000;",
                hint: "Selection (σ) filters rows based on a condition",
                concept: {
                    title: "Selection Operation",
                    content: "The selection operation (σ) in relational algebra corresponds to the WHERE clause in SQL, filtering tuples that satisfy a given condition."
                }
            },
            {
                question: "Demonstrate PROJECTION operation: π(name, salary)(employees).",
                solution: "SELECT DISTINCT name, salary FROM \"Employee\";",
                hint: "Projection (π) selects specific columns and eliminates duplicates",
                concept: {
                    title: "Projection Operation",
                    content: "The projection operation (π) selects specified attributes (columns) and eliminates duplicate tuples, corresponding to SELECT DISTINCT in SQL."
                }
            },
            {
                question: "Demonstrate CARTESIAN PRODUCT: employees × departments.",
                solution: "SELECT * FROM \"Employee\" CROSS JOIN departments;",
                hint: "Cartesian product combines every row from first table with every row from second",
                concept: {
                    title: "Cartesian Product",
                    content: "Cartesian product (×) creates all possible combinations of tuples from two relations, implemented as CROSS JOIN in SQL."
                }
            },
            {
                question: "Demonstrate NATURAL JOIN with employee and department relationship.",
                solution: "SELECT e.name as employee_name, d.name as department_name FROM \"Employee\" e JOIN \"Department\" d ON e.\"departmentId\" = d.id;",
                hint: "Natural join combines tables on common attributes",
                concept: {
                    title: "Natural Join Operation",
                    content: "Natural join (⋈) combines relations on common attributes, automatically matching columns with the same name and compatible types."
                }
            }
        ]
    },
    18: {
        title: "🏆 Window Functions & Ranking",
        description: "Master analytical functions for advanced data analysis",
        difficulty: "Expert",
        questions: [
            {
                question: "Find the 2nd highest salary using ROW_NUMBER() window function.",
                solution: "SELECT salary FROM (SELECT salary, ROW_NUMBER() OVER (ORDER BY salary DESC) as row_num FROM \"Employee\") ranked WHERE row_num = 2;",
                hint: "Use ROW_NUMBER() OVER (ORDER BY salary DESC) and filter for row 2",
                concept: {
                    title: "ROW_NUMBER Window Function",
                    content: "ROW_NUMBER() assigns unique sequential numbers to rows within a result set, ordered by specified columns. Essential for finding Nth highest/lowest values."
                }
            },
            {
                question: "Rank employees by salary within their department using RANK().",
                solution: "SELECT name, \"departmentId\", salary, RANK() OVER (PARTITION BY \"departmentId\" ORDER BY salary DESC) as salary_rank FROM \"Employee\";",
                hint: "Use RANK() with PARTITION BY department_id",
                concept: {
                    title: "RANK with PARTITION BY",
                    content: "RANK() assigns rank values with gaps for ties. PARTITION BY creates separate ranking groups, essential for departmental comparisons."
                }
            },
            {
                question: "Calculate running total of salaries ordered by hire date using SUM() window function.",
                solution: "SELECT name, hire_date, salary, SUM(salary) OVER (ORDER BY hire_date ROWS UNBOUNDED PRECEDING) as running_total FROM \"Employee\" ORDER BY hire_date;",
                hint: "Use SUM() OVER with ORDER BY and ROWS frame",
                concept: {
                    title: "Running Totals with Window Functions",
                    content: "Window functions with ORDER BY create cumulative calculations. ROWS UNBOUNDED PRECEDING includes all previous rows in the running calculation."
                }
            },
            {
                question: "Find each employee's previous and next salary using LAG() and LEAD().",
                solution: "SELECT name, salary, LAG(salary, 1) OVER (ORDER BY salary) as prev_salary, LEAD(salary, 1) OVER (ORDER BY salary) as next_salary FROM \"Employee\" ORDER BY salary;",
                hint: "LAG looks backward, LEAD looks forward in the ordered result set",
                concept: {
                    title: "LAG and LEAD Functions",
                    content: "LAG() and LEAD() access previous and next row values without self-joins. Essential for comparing consecutive records and trend analysis."
                }
            }
        ]
    },
    19: {
        title: "🔍 Advanced Subqueries",
        description: "Master correlated subqueries and complex EXISTS patterns",
        difficulty: "Expert",
        questions: [
            {
                question: "Find employees earning more than their department's average salary using correlated subquery.",
                solution: "SELECT e1.name, e1.salary, e1.\"departmentId\" FROM \"Employee\" e1 WHERE e1.salary > (SELECT AVG(e2.salary) FROM \"Employee\" e2 WHERE e2.\"departmentId\" = e1.\"departmentId\");",
                hint: "Use correlated subquery that references outer query table",
                concept: {
                    title: "Correlated Subqueries",
                    content: "Correlated subqueries reference columns from the outer query, executing once for each outer row. Essential for row-by-row comparisons."
                }
            },
            {
                question: "Find departments where ALL employees earn more than 50000 using ALL operator.",
                solution: "SELECT DISTINCT d.name FROM \"Department\" d WHERE 50000 < ALL (SELECT e.salary FROM \"Employee\" e WHERE e.\"departmentId\" = d.id);",
                hint: "ALL operator requires condition to be true for every row in subquery",
                concept: {
                    title: "ALL Operator with Subqueries",
                    content: "ALL operator checks if condition is true for every row returned by subquery. Useful for universal conditions across groups."
                }
            },
            {
                question: "Find employees who work in departments that have ANY employee earning > 75000.",
                solution: "SELECT e.name FROM \"Employee\" e WHERE e.\"departmentId\" = ANY (SELECT DISTINCT e2.\"departmentId\" FROM \"Employee\" e2 WHERE e2.salary > 75000);",
                hint: "ANY returns true if condition matches at least one subquery row",
                concept: {
                    title: "ANY Operator",
                    content: "ANY (equivalent to SOME) returns true if the condition is satisfied for at least one row in the subquery result."
                }
            },
            {
                question: "Find departments that have employees working on projects using EXISTS.",
                solution: "SELECT d.name FROM \"Department\" d WHERE EXISTS (SELECT 1 FROM \"Employee\" e JOIN \"employee_projects\" ep ON e.id = ep.employeeId WHERE e.\"departmentId\" = d.id);",
                hint: "EXISTS checks if subquery returns any rows, doesn't need actual data",
                concept: {
                    title: "EXISTS with Complex Joins",
                    content: "EXISTS is optimized for checking row existence. More efficient than IN for complex subqueries with joins."
                }
            }
        ]
    },
    20: {
        title: "📅 Date & Time Mastery",
        description: "Master date arithmetic and time-based analysis",
        difficulty: "Expert",
        questions: [
            {
                question: "Find employees hired in the last 2 years using date arithmetic.",
                solution: "SELECT name, hire_date FROM \"Employee\" WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 2 YEAR);",
                hint: "Use DATE_SUB with INTERVAL for date calculations",
                concept: {
                    title: "Date Arithmetic",
                    content: "MySQL provides DATE_ADD, DATE_SUB, and INTERVAL for date calculations. Essential for time-based filtering and analysis."
                }
            },
            {
                question: "Calculate each employee's years of service using DATEDIFF.",
                solution: "SELECT name, hire_date, ROUND(DATEDIFF(CURDATE(), hire_date) / 365.25, 1) as years_of_service FROM \"Employee\";",
                hint: "DATEDIFF returns difference in days, divide by 365.25 for years",
                concept: {
                    title: "DATEDIFF Function",
                    content: "DATEDIFF calculates the difference between two dates in days. Common in age calculations and service duration analysis."
                }
            },
            {
                question: "Group employees by hire year and count them.",
                solution: "SELECT YEAR(hire_date) as hire_year, COUNT(*) as employees_hired FROM \"Employee\" GROUP BY YEAR(hire_date) ORDER BY hire_year;",
                hint: "Use YEAR() function to extract year from date",
                concept: {
                    title: "Date Extraction Functions",
                    content: "YEAR(), MONTH(), DAY() extract specific parts of dates. Essential for grouping and filtering by time periods."
                }
            },
            {
                question: "Find employees hired in the same month as their department was created (simulated with department_id).",
                solution: "SELECT e.name, e.hire_date, e.\"departmentId\" FROM \"Employee\" e JOIN \"Department\" d ON e.\"departmentId\" = d.id WHERE MONTH(e.hire_date) = d.id;",
                hint: "Use MONTH() function and compare with numeric values",
                concept: {
                    title: "Date Comparison Patterns",
                    content: "Comparing extracted date parts enables complex temporal relationships analysis, common in business logic."
                }
            }
        ]
    },
    21: {
        title: "🔧 Complex Conditional Logic",
        description: "Master advanced CASE statements and conditional expressions",
        difficulty: "Expert",
        questions: [
            {
                question: "Classify employees into salary tiers using nested CASE statements.",
                solution: "SELECT name, salary, CASE WHEN salary >= 80000 THEN 'Senior' WHEN salary >= 60000 THEN 'Mid-Level' WHEN salary >= 40000 THEN 'Junior' ELSE 'Entry-Level' END as salary_tier FROM \"Employee\";",
                hint: "Use nested CASE WHEN with multiple conditions",
                concept: {
                    title: "Multi-tier CASE Statements",
                    content: "Nested CASE statements enable complex classification logic. Order matters - conditions are evaluated top to bottom."
                }
            },
            {
                question: "Calculate bonuses based on department and performance using complex CASE.",
                solution: "SELECT name, \"departmentId\", salary, CASE WHEN \"departmentId\" = 1 AND salary > 70000 THEN salary * 0.15 WHEN \"departmentId\" = 1 THEN salary * 0.10 WHEN \"departmentId\" IN (2,3) AND salary > 60000 THEN salary * 0.12 WHEN \"departmentId\" IN (2,3) THEN salary * 0.08 ELSE salary * 0.05 END as bonus FROM \"Employee\";",
                hint: "Combine AND, IN operators with CASE for complex logic",
                concept: {
                    title: "Complex Conditional Logic",
                    content: "CASE statements can include complex boolean expressions with AND, OR, IN operators for sophisticated business rules."
                }
            },
            {
                question: "Create pivot table showing count of employees by department and salary range.",
                solution: "SELECT \"departmentId\", SUM(CASE WHEN salary < 60000 THEN 1 ELSE 0 END) as low_salary, SUM(CASE WHEN salary BETWEEN 60000 AND 80000 THEN 1 ELSE 0 END) as mid_salary, SUM(CASE WHEN salary > 80000 THEN 1 ELSE 0 END) as high_salary FROM \"Employee\" GROUP BY \"departmentId\";",
                hint: "Use SUM(CASE WHEN...) pattern for conditional counting",
                concept: {
                    title: "Conditional Aggregation",
                    content: "SUM(CASE WHEN condition THEN 1 ELSE 0 END) creates conditional counts. Essential for pivot table functionality."
                }
            },
            {
                question: "Use IF() function to create a simple binary classification.",
                solution: "SELECT name, salary, IF(salary > (SELECT AVG(salary) FROM \"Employee\"), 'Above Average', 'Below Average') as performance FROM \"Employee\";",
                hint: "IF(condition, true_value, false_value) for binary logic",
                concept: {
                    title: "IF Function vs CASE",
                    content: "IF() function provides simpler syntax for binary conditions. CASE is more flexible for multiple conditions."
                }
            }
        ]
    },
    22: {
        title: "📊 Advanced Grouping Patterns", 
        description: "Master complex GROUP BY with ROLLUP and advanced HAVING",
        difficulty: "Expert",
        questions: [
            {
                question: "Calculate department salary totals with grand total using GROUP BY with ROLLUP.",
                solution: "SELECT COALESCE(d.name, 'TOTAL') as department, SUM(e.salary) as total_salary FROM \"Employee\" e LEFT JOIN \"Department\" d ON e.\"departmentId\" = d.id GROUP BY d.name WITH ROLLUP;",
                hint: "WITH ROLLUP adds subtotals and grand total rows",
                concept: {
                    title: "GROUP BY with ROLLUP",
                    content: "ROLLUP creates hierarchical aggregations with subtotals. COALESCE handles NULL values in rollup rows."
                }
            },
            {
                question: "Find departments with average salary higher than company average using HAVING with subquery.",
                solution: "SELECT d.name, AVG(e.salary) as avg_salary FROM \"Department\" d JOIN \"Employee\" e ON d.id = e.\"departmentId\" GROUP BY d.id, d.name HAVING AVG(e.salary) > (SELECT AVG(salary) FROM \"Employee\");",
                hint: "HAVING can use subqueries for complex aggregate filtering",
                concept: {
                    title: "HAVING with Subqueries",
                    content: "HAVING clause can include subqueries for dynamic filtering based on calculated values from other data."
                }
            },
            {
                question: "Group by multiple dimensions: department and salary tier.",
                solution: "SELECT d.name as department, CASE WHEN e.salary >= 70000 THEN 'High' WHEN e.salary >= 50000 THEN 'Medium' ELSE 'Low' END as salary_tier, COUNT(*) as employee_count, AVG(e.salary) as avg_salary FROM \"Department\" d JOIN \"Employee\" e ON d.id = e.\"departmentId\" GROUP BY d.id, d.name, CASE WHEN e.salary >= 70000 THEN 'High' WHEN e.salary >= 50000 THEN 'Medium' ELSE 'Low' END;",
                hint: "GROUP BY can include calculated expressions and CASE statements",
                concept: {
                    title: "Multi-dimensional Grouping",
                    content: "GROUP BY supports calculated columns and expressions, enabling complex dimensional analysis."
                }
            },
            {
                question: "Find departments with both high-paid (>70k) and low-paid (<50k) employees.",
                solution: "SELECT d.name FROM \"Department\" d JOIN \"Employee\" e ON d.id = e.\"departmentId\" GROUP BY d.id, d.name HAVING SUM(CASE WHEN e.salary > 70000 THEN 1 ELSE 0 END) > 0 AND SUM(CASE WHEN e.salary < 50000 THEN 1 ELSE 0 END) > 0;",
                hint: "Use conditional aggregation in HAVING for complex group filtering",
                concept: {
                    title: "Conditional HAVING Clauses",
                    content: "HAVING with conditional aggregation enables filtering groups based on multiple criteria within the same group."
                }
            }
        ]
    },
    23: {
        title: "🔗 Self-Joins & Hierarchies",
        description: "Master complex self-joins and hierarchical data structures",
        difficulty: "Expert",
        questions: [
            {
                question: "Find all manager-employee pairs using self-join (simulate with salary comparison).",
                solution: "SELECT m.name as manager, e.name as employee FROM \"Employee\" m JOIN \"Employee\" e ON m.salary > e.salary AND m.\"departmentId\" = e.\"departmentId\";",
                hint: "Self-join with different aliases and meaningful join conditions",
                concept: {
                    title: "Self-Join Patterns",
                    content: "Self-joins connect table to itself with different aliases. Essential for hierarchical relationships and comparisons within same entity."
                }
            },
            {
                question: "Find employees who earn more than at least one other employee in the same department.",
                solution: "SELECT DISTINCT e1.name FROM \"Employee\" e1 JOIN \"Employee\" e2 ON e1.\"departmentId\" = e2.\"departmentId\" AND e1.salary > e2.salary;",
                hint: "Self-join to compare each employee with others in same department",
                concept: {
                    title: "Comparative Self-Joins",
                    content: "Self-joins enable comparisons between rows in the same table, essential for ranking and competitive analysis."
                }
            },
            {
                question: "Create employee hierarchy levels by salary within departments.",
                solution: "SELECT e1.name, e1.\"departmentId\", e1.salary, COUNT(e2.id) + 1 as hierarchy_level FROM \"Employee\" e1 LEFT JOIN \"Employee\" e2 ON e1.\"departmentId\" = e2.\"departmentId\" AND e1.salary < e2.salary GROUP BY e1.id, e1.name, e1.\"departmentId\", e1.salary ORDER BY e1.\"departmentId\", hierarchy_level;",
                hint: "Count how many employees earn more to determine hierarchy level",
                concept: {
                    title: "Hierarchy Building with Self-Joins",
                    content: "Self-joins can create hierarchical levels by counting superior records, useful for organizational structure analysis."
                }
            },
            {
                question: "Find pairs of employees with similar salaries (within 5000 difference).",
                solution: "SELECT e1.name as employee1, e2.name as employee2, e1.salary, e2.salary, ABS(e1.salary - e2.salary) as salary_diff FROM \"Employee\" e1 JOIN \"Employee\" e2 ON e1.id < e2.id AND ABS(e1.salary - e2.salary) <= 5000 ORDER BY salary_diff;",
                hint: "Use ABS() for absolute difference and e1.id < e2.id to avoid duplicates",
                concept: {
                    title: "Similarity Matching with Self-Joins",
                    content: "Self-joins with mathematical conditions can find similar records. Use id comparison to avoid duplicate pairs."
                }
            }
        ]
    },
    24: {
        title: "🔤 Advanced String Operations",
        description: "Master complex string manipulation and pattern matching",
        difficulty: "Expert",
        questions: [
            {
                question: "Extract domain names from employee emails using SUBSTRING_INDEX.",
                solution: "SELECT name, CONCAT(name, '@company.com') as email, SUBSTRING_INDEX(CONCAT(name, '@company.com'), '@', -1) as domain FROM \"Employee\";",
                hint: "SUBSTRING_INDEX splits strings by delimiter and returns specified part",
                concept: {
                    title: "String Extraction Functions",
                    content: "SUBSTRING_INDEX extracts parts of delimited strings. Essential for parsing email addresses, URLs, and structured text."
                }
            },
            {
                question: "Find employees whose names match specific patterns using advanced REGEXP.",
                solution: "SELECT name FROM \"Employee\" WHERE name REGEXP '^[A-Z][a-z]+ [A-Z][a-z]+$';",
                hint: "REGEXP uses regular expressions for complex pattern matching",
                concept: {
                    title: "Regular Expression Patterns",
                    content: "REGEXP enables powerful pattern matching with regex syntax. Essential for data validation and complex text searches."
                }
            },
            {
                question: "Clean and standardize employee names using multiple string functions.",
                solution: "SELECT name, UPPER(TRIM(REPLACE(REPLACE(name, '  ', ' '), '.', ''))) as clean_name FROM \"Employee\";",
                hint: "Combine TRIM, REPLACE, UPPER for comprehensive text cleaning",
                concept: {
                    title: "String Data Cleaning",
                    content: "Combining multiple string functions enables comprehensive data cleaning and standardization workflows."
                }
            },
            {
                question: "Create initials from employee names using SUBSTRING and LOCATE.",
                solution: "SELECT name, CONCAT(LEFT(name, 1), '.', LEFT(SUBSTRING(name, LOCATE(' ', name) + 1), 1), '.') as initials FROM \"Employee\" WHERE LOCATE(' ', name) > 0;",
                hint: "LOCATE finds position of space, SUBSTRING extracts parts",
                concept: {
                    title: "Dynamic String Parsing",
                    content: "LOCATE finds character positions, enabling dynamic string parsing for names, addresses, and structured text."
                }
            }
        ]
    },
    25: {
        title: "🎯 LeetCode Pattern Recognition",
        description: "Master specific LeetCode SQL problem patterns",
        difficulty: "Expert",
        questions: [
            {
                question: "Solve 'Nth Highest Salary' pattern: Find 3rd highest salary.",
                solution: "SELECT DISTINCT salary as SecondHighestSalary FROM \"Employee\" ORDER BY salary DESC LIMIT 1 OFFSET 2;",
                hint: "Use DISTINCT, ORDER BY DESC, LIMIT with OFFSET for Nth highest patterns",
                concept: {
                    title: "Nth Highest Value Pattern",
                    content: "Classic LeetCode pattern using LIMIT OFFSET or window functions to find Nth highest/lowest values in datasets."
                }
            },
            {
                question: "Solve 'Department Highest Salary' pattern: Find highest paid employee per department.",
                solution: "SELECT d.name as Department, e.name as Employee, e.salary as Salary FROM \"Employee\" e JOIN \"Department\" d ON e.\"departmentId\" = d.id WHERE (e.\"departmentId\", e.salary) IN (SELECT \"departmentId\", MAX(salary) FROM \"Employee\" GROUP BY \"departmentId\");",
                hint: "Use tuple IN with GROUP BY MAX to find highest in each group",
                concept: {
                    title: "Group Maximum Pattern",
                    content: "Common LeetCode pattern using tuple matching with GROUP BY and aggregate functions to find extremes within groups."
                }
            },
            {
                question: "Solve 'Consecutive Numbers' pattern: Find sequences of 3 consecutive equal values.",
                solution: "SELECT DISTINCT l1.id FROM \"Log\" l1 JOIN logs l2 ON l1.id = l2.id - 1 JOIN logs l3 ON l2.id = l3.id - 1 WHERE l1.num = l2.num AND l2.num = l3.num;",
                hint: "Self-join with consecutive id conditions and value equality",
                concept: {
                    title: "Consecutive Sequence Pattern",
                    content: "LeetCode pattern using self-joins with sequential conditions to identify consecutive occurrences or sequences."
                }
            },
            {
                question: "Solve 'Ranking' pattern: Rank employees with no gaps (DENSE_RANK equivalent).",
                solution: "SELECT name, salary, (SELECT COUNT(DISTINCT e2.salary) FROM \"Employee\" e2 WHERE e2.salary >= e1.salary) as dense_rank FROM \"Employee\" e1 ORDER BY salary DESC;",
                hint: "Count distinct higher values to create dense ranking without gaps",
                concept: {
                    title: "Dense Ranking Pattern",
                    content: "LeetCode pattern for creating rankings without gaps using correlated subqueries and COUNT DISTINCT."
                }
            }
        ]
    }
};

// Export for global access
window.LEARNING_LEVELS = LEARNING_LEVELS;
// moved to public/src for Next.js
