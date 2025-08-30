// Theory-Based SQL Levels - Combining DBMS Concepts with SQL Practice
const THEORY_LEVELS = {
    26: {
        title: "🏗️ DDL Operations & Schema Design",
        description: "Master Data Definition Language and table design",
        difficulty: "Intermediate",
        questions: [
            {
                question: "Create a new table 'products' with columns: id (AUTO_INCREMENT PRIMARY KEY), name (VARCHAR 100), price (DECIMAL 10,2), category_id (INT).",
                solution: "CREATE TABLE products (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, price DECIMAL(10,2), category_id INT);",
                hint: "Use CREATE TABLE with appropriate data types and constraints",
                concept: {
                    title: "Data Definition Language (DDL)",
                    content: "DDL statements define database structure. CREATE, ALTER, DROP modify database objects like tables, indexes, and constraints."
                }
            },
            {
                question: "Add a foreign key constraint to products table linking category_id to categories(id).",
                solution: "ALTER TABLE products ADD CONSTRAINT FK_products_category FOREIGN KEY (category_id) REFERENCES categories(id);",
                hint: "Use ALTER TABLE ADD CONSTRAINT FOREIGN KEY",
                concept: {
                    title: "Foreign Key Constraints",
                    content: "Foreign keys maintain referential integrity by ensuring values exist in the referenced table."
                }
            },
            {
                question: "Create an index on the products table for the name column to speed up searches.",
                solution: "CREATE INDEX idx_products_name ON products(name);",
                hint: "Use CREATE INDEX for faster query performance",
                concept: {
                    title: "Database Indexing",
                    content: "Indexes create data structures that speed up data retrieval but consume additional storage and slow down writes."
                }
            },
            {
                question: "Add a CHECK constraint to ensure product prices are greater than 0.",
                solution: "ALTER TABLE products ADD CONSTRAINT chk_price_positive CHECK (price > 0);",
                hint: "Use ALTER TABLE ADD CONSTRAINT CHECK",
                concept: {
                    title: "Check Constraints",
                    content: "CHECK constraints enforce business rules at the database level, ensuring data validity."
                }
            }
        ]
    },

    27: {
        title: "🔒 Transaction Management & ACID",
        description: "Practice transaction control and ACID properties",
        difficulty: "Advanced",
        questions: [
            {
                question: "Start a transaction, update employee salary where id=1 to 75000, but don't commit yet.",
                solution: "START TRANSACTION; UPDATE employees SET salary = 75000 WHERE id = 1;",
                hint: "Use START TRANSACTION followed by UPDATE",
                concept: {
                    title: "Transaction Control",
                    content: "Transactions group SQL statements into atomic units. All statements succeed or all fail together (Atomicity)."
                }
            },
            {
                question: "Check if the update was successful, then COMMIT the transaction.",
                solution: "SELECT * FROM \"Employee\" WHERE id = 1; COMMIT;",
                hint: "Use SELECT to verify, then COMMIT to make changes permanent",
                concept: {
                    title: "Transaction Durability",
                    content: "COMMIT makes transaction changes permanent and durable, surviving system failures."
                }
            },
            {
                question: "Create a transaction that transfers $500 from account 1 to account 2 (simulate with salary updates).",
                solution: "START TRANSACTION; UPDATE employees SET salary = salary - 500 WHERE id = 1; UPDATE employees SET salary = salary + 500 WHERE id = 2; COMMIT;",
                hint: "Use START TRANSACTION, two UPDATEs, and COMMIT",
                concept: {
                    title: "Atomic Operations",
                    content: "Both operations must succeed or both must fail. This ensures consistency in money transfers."
                }
            },
            {
                question: "Demonstrate transaction isolation by setting isolation level to READ committed.",
                solution: "SET TRANSACTION ISOLATION LEVEL READ COMMITTED; START TRANSACTION; SELECT * FROM \"Employee\"; COMMIT;",
                hint: "Use SET TRANSACTION ISOLATION LEVEL",
                concept: {
                    title: "Transaction Isolation",
                    content: "Isolation levels control how transactions see changes made by other concurrent transactions."
                }
            }
        ]
    },

    28: {
        title: "📊 Database Normalization in Practice",
        description: "Apply normalization principles to real data",
        difficulty: "Advanced",
        questions: [
            {
                question: "Identify the violation: A table has StudentID, StudentName, CourseID, CourseName, Grade. What normal form is violated?",
                solution: "SELECT 'This violates 2NF because CourseName depends only on CourseID (partial dependency)' as violation;",
                hint: "CourseName depends only on part of the composite key (CourseID)",
                concept: {
                    title: "Second Normal Form (2NF)",
                    content: "2NF eliminates partial dependencies. Non-key attributes must depend on the entire primary key, not just part of it."
                }
            },
            {
                question: "Fix the 2NF violation by creating separate tables. Create a courses table with CourseID and CourseName.",
                solution: "CREATE TABLE courses (CourseID INT PRIMARY KEY, CourseName VARCHAR(100));",
                hint: "Create a separate table for course information",
                concept: {
                    title: "Normalization Design",
                    content: "Separate entities into their own tables to eliminate redundancy and update anomalies."
                }
            },
            {
                question: "Now create the enrollment table linking students to courses with grades.",
                solution: "CREATE TABLE enrollments (StudentID INT, CourseID INT, Grade CHAR(2), PRIMARY KEY (StudentID, CourseID), FOREIGN KEY (StudentID) REFERENCES students(StudentID), FOREIGN KEY (CourseID) REFERENCES courses(CourseID));",
                hint: "Create junction table with composite primary key and foreign keys",
                concept: {
                    title: "Junction Tables",
                    content: "Junction tables resolve many-to-many relationships and store relationship-specific data like grades."
                }
            },
            {
                question: "Demonstrate denormalization: Add CourseName to enrollments for reporting performance.",
                solution: "ALTER TABLE enrollments ADD COLUMN CourseName VARCHAR(100); UPDATE enrollments e SET CourseName = (SELECT CourseName FROM courses c WHERE c.CourseID = e.CourseID);",
                hint: "Sometimes denormalization improves read performance",
                concept: {
                    title: "Strategic Denormalization",
                    content: "Controlled denormalization can improve query performance but requires careful maintenance of data consistency."
                }
            }
        ]
    },

    29: {
        title: "⚡ Index Optimization & Performance",
        description: "Optimize queries with strategic indexing",
        difficulty: "Expert",
        questions: [
            {
                question: "Create a composite index on employees table for \"departmentId\" and salary to optimize department salary queries.",
                solution: "CREATE INDEX idx_dept_salary ON employees(\"departmentId\", salary);",
                hint: "Use CREATE INDEX with multiple columns",
                concept: {
                    title: "Composite Indexes",
                    content: "Composite indexes combine multiple columns. Order matters - most selective column first."
                }
            },
            {
                question: "Analyze query performance: EXPLAIN the query 'SELECT * FROM \"Employee\" WHERE \"departmentId\" = 1 ORDER BY salary DESC'.",
                solution: "EXPLAIN SELECT * FROM \"Employee\" WHERE \"departmentId\" = 1 ORDER BY salary DESC;",
                hint: "Use EXPLAIN to see query execution plan",
                concept: {
                    title: "Query Execution Plans",
                    content: "EXPLAIN shows how MySQL executes queries, revealing index usage and optimization opportunities."
                }
            },
            {
                question: "Create a covering index for the query 'SELECT name, salary FROM \"Employee\" WHERE \"departmentId\" = 1'.",
                solution: "CREATE INDEX idx_covering_dept ON employees(\"departmentId\", name, salary);",
                hint: "Include all columns needed by the query in the index",
                concept: {
                    title: "Covering Indexes",
                    content: "Covering indexes contain all columns needed by a query, eliminating table lookups."
                }
            },
            {
                question: "Create a partial index for active employees only: WHERE status = 'active'.",
                solution: "CREATE INDEX idx_active_employees ON employees(name) WHERE status = 'active';",
                hint: "Not all databases support partial indexes, but the concept is important",
                concept: {
                    title: "Partial Indexes",
                    content: "Partial indexes only include rows meeting specific criteria, saving space and improving performance."
                }
            }
        ]
    },

    30: {
        title: "🔐 Database Security & Permissions",
        description: "Implement database security best practices",
        difficulty: "Advanced",
        questions: [
            {
                question: "Create a new database user 'report_user' with password 'secure_pass123'.",
                solution: "CREATE USER 'report_user'@'localhost' IDENTIFIED BY 'secure_pass123';",
                hint: "Use CREATE USER with IDENTIFIED BY",
                concept: {
                    title: "User Management",
                    content: "Database users should have unique accounts with strong passwords for accountability and security."
                }
            },
            {
                question: "Grant SELECT permission on employees table to report_user.",
                solution: "GRANT SELECT ON sql_tutor.employees TO 'report_user'@'localhost';",
                hint: "Use GRANT SELECT ON table TO user",
                concept: {
                    title: "Principle of Least Privilege",
                    content: "Users should have only the minimum permissions necessary to perform their job functions."
                }
            },
            {
                question: "Create a view that hides salary information and grant access to it instead of the full table.",
                solution: "CREATE VIEW employee_public AS SELECT id, name, \"departmentId\", hire_date FROM \"Employee\"; GRANT SELECT ON sql_tutor.employee_public TO 'report_user'@'localhost';",
                hint: "Views can hide sensitive columns while allowing access to needed data",
                concept: {
                    title: "Data Hiding with Views",
                    content: "Views provide security by exposing only necessary columns and rows to specific users."
                }
            },
            {
                question: "Revoke direct table access and show current permissions for report_user.",
                solution: "REVOKE SELECT ON sql_tutor.employees FROM 'report_user'@'localhost'; SHOW GRANTS FOR 'report_user'@'localhost';",
                hint: "Use REVOKE to remove permissions and SHOW GRANTS to display current permissions",
                concept: {
                    title: "Permission Auditing",
                    content: "Regularly review and audit user permissions to ensure security compliance and prevent privilege creep."
                }
            }
        ]
    },

    31: {
        title: "💾 Backup & Recovery Strategies",
        description: "Implement data protection and recovery procedures",
        difficulty: "Expert",
        questions: [
            {
                question: "Create a backup of the employees table structure (schema only).",
                solution: "SHOW CREATE TABLE employees;",
                hint: "Use SHOW CREATE TABLE to see the table structure",
                concept: {
                    title: "Schema Backup",
                    content: "Backing up table structures ensures you can recreate tables even if data is lost."
                }
            },
            {
                question: "Demonstrate point-in-time recovery by creating a savepoint before making changes.",
                solution: "START TRANSACTION; SAVEPOINT before_update; UPDATE employees SET salary = salary * 1.1 WHERE \"departmentId\" = 1;",
                hint: "Use SAVEPOINT within a transaction",
                concept: {
                    title: "Savepoints",
                    content: "Savepoints allow partial rollback within transactions, useful for complex operations."
                }
            },
            {
                question: "Simulate a mistake and rollback to the savepoint.",
                solution: "UPDATE employees SET salary = 0 WHERE id = 1; ROLLBACK TO SAVEPOINT before_update;",
                hint: "Use ROLLBACK TO SAVEPOINT to undo changes",
                concept: {
                    title: "Transaction Recovery",
                    content: "Savepoints provide granular recovery options within transactions for error handling."
                }
            },
            {
                question: "Complete the transaction successfully and commit all changes.",
                solution: "SELECT * FROM \"Employee\" WHERE \"departmentId\" = 1; COMMIT;",
                hint: "Verify the changes look correct, then COMMIT",
                concept: {
                    title: "Recovery Testing",
                    content: "Always verify data integrity before committing changes, especially after recovery operations."
                }
            }
        ]
    },

    32: {
        title: "🌐 Distributed Database Concepts",
        description: "Understanding database scaling and distribution",
        difficulty: "Expert",
        questions: [
            {
                question: "Simulate horizontal partitioning: Create employees_dept1 table for department 1 employees only.",
                solution: "CREATE TABLE employees_dept1 AS SELECT * FROM \"Employee\" WHERE \"departmentId\" = 1;",
                hint: "Use CREATE TABLE AS SELECT with a WHERE condition",
                concept: {
                    title: "Horizontal Partitioning (Sharding)",
                    content: "Horizontal partitioning splits tables by rows, distributing data across multiple databases for scalability."
                }
            },
            {
                question: "Create a union view to query across partitioned tables.",
                solution: "CREATE VIEW all_employees AS SELECT * FROM \"Employee\"_dept1 UNION ALL SELECT * FROM \"Employee\" WHERE \"departmentId\" != 1;",
                hint: "Use UNION ALL to combine partitioned data",
                concept: {
                    title: "Federated Queries",
                    content: "Views can combine data from multiple sources, providing a unified interface to distributed data."
                }
            },
            {
                question: "Simulate vertical partitioning: Create employee_personal with id, name and employee_work with id, salary, \"departmentId\".",
                solution: "CREATE TABLE employee_personal AS SELECT id, name FROM \"Employee\"; CREATE TABLE employee_work AS SELECT id, salary, \"departmentId\", hire_date FROM \"Employee\";",
                hint: "Split columns into separate tables by usage patterns",
                concept: {
                    title: "Vertical Partitioning",
                    content: "Vertical partitioning splits tables by columns, optimizing for different access patterns and security requirements."
                }
            },
            {
                question: "Demonstrate eventual consistency: Update salary in employee_work and show it doesn't immediately reflect in the main view.",
                solution: "UPDATE employee_work SET salary = 85000 WHERE id = 1; SELECT * FROM all_employees WHERE id = 1;",
                hint: "In distributed systems, changes may not be immediately consistent everywhere",
                concept: {
                    title: "Eventual Consistency",
                    content: "Distributed systems often trade immediate consistency for availability and partition tolerance (CAP theorem)."
                }
            }
        ]
    }
};

// Export for global access
window.THEORY_LEVELS = THEORY_LEVELS;
// moved to public/src for Next.js
