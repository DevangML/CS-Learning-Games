// DBMS Theory Topics - Comprehensive Interview Preparation
const THEORY_TOPICS = {
    1: {
        id: "database-fundamentals",
        title: "📚 Database Fundamentals",
        category: "Basics",
        difficulty: "Beginner",
        estimatedTime: "15 min",
        description: "Essential database concepts and terminology",
        content: `
        <h2>What is a Database?</h2>
        <p>A <strong>database</strong> is an organized collection of structured information or data, typically stored electronically in a computer system. It's managed by a Database Management System (DBMS).</p>
        
        <h3>Key Characteristics:</h3>
        <ul>
            <li><strong>Organized:</strong> Data is structured and follows a logical organization</li>
            <li><strong>Persistent:</strong> Data survives system crashes and shutdowns</li>
            <li><strong>Shared:</strong> Multiple users can access simultaneously</li>
            <li><strong>Controlled:</strong> Access is managed through permissions and constraints</li>
        </ul>
        
        <h3>Types of Databases:</h3>
        <div class="comparison-table">
            <table>
                <tr><th>Type</th><th>Structure</th><th>Use Case</th><th>Example</th></tr>
                <tr><td>Relational</td><td>Tables with relationships</td><td>Traditional applications</td><td>MySQL, PostgreSQL</td></tr>
                <tr><td>NoSQL</td><td>Flexible schema</td><td>Big data, real-time apps</td><td>MongoDB, Cassandra</td></tr>
                <tr><td>Graph</td><td>Nodes and edges</td><td>Social networks, fraud detection</td><td>Neo4j, ArangoDB</td></tr>
                <tr><td>Time-Series</td><td>Time-stamped data</td><td>IoT, monitoring</td><td>InfluxDB, TimescaleDB</td></tr>
            </table>
        </div>
        
        <h3>Database vs File System:</h3>
        <div class="pros-cons">
            <div class="pros">
                <h4>Database Advantages:</h4>
                <ul>
                    <li>Data integrity and consistency</li>
                    <li>Concurrent access control</li>
                    <li>Query optimization</li>
                    <li>Backup and recovery</li>
                    <li>Security and access control</li>
                </ul>
            </div>
        </div>
        `,
        quiz: [
            {
                question: "What is the primary advantage of using a DBMS over a file system?",
                options: [
                    "Faster data access",
                    "Less storage space",
                    "Data integrity and consistency",
                    "Simpler programming"
                ],
                correct: 2,
                explanation: "DBMS ensures data integrity and consistency through constraints, transactions, and normalization, which file systems cannot guarantee."
            },
            {
                question: "Which database type is best suited for social network applications?",
                options: [
                    "Relational Database",
                    "Graph Database", 
                    "Time-Series Database",
                    "Key-Value Store"
                ],
                correct: 1,
                explanation: "Graph databases excel at modeling relationships between entities, making them perfect for social networks where connections between users are crucial."
            }
        ]
    },

    2: {
        id: "acid-properties",
        title: "🔒 ACID Properties",
        category: "Transactions",
        difficulty: "Intermediate",
        estimatedTime: "20 min",
        description: "Understanding transaction properties for data integrity",
        content: `
        <h2>ACID Properties Explained</h2>
        <p>ACID properties ensure reliable transaction processing in database systems. Every database transaction must guarantee these four properties:</p>
        
        <div class="acid-cards">
            <div class="property-card atomicity">
                <h3>🔬 Atomicity</h3>
                <p><strong>All or Nothing:</strong> A transaction is treated as a single, indivisible unit.</p>
                <div class="example">
                    <h4>Example: Bank Transfer</h4>
                    <code>
                    BEGIN TRANSACTION;<br>
                    UPDATE account SET balance = balance - 100 WHERE id = 1;<br>
                    UPDATE account SET balance = balance + 100 WHERE id = 2;<br>
                    COMMIT; -- Both updates succeed or both fail
                    </code>
                </div>
                <p>If any part fails, the entire transaction is rolled back.</p>
            </div>
            
            <div class="property-card consistency">
                <h3>⚖️ Consistency</h3>
                <p><strong>Valid State:</strong> Database remains in a consistent state before and after transaction.</p>
                <div class="example">
                    <h4>Constraints Maintained:</h4>
                    <ul>
                        <li>Primary key uniqueness</li>
                        <li>Foreign key references</li>
                        <li>Check constraints</li>
                        <li>Business rules</li>
                    </ul>
                </div>
            </div>
            
            <div class="property-card isolation">
                <h3>🔐 Isolation</h3>
                <p><strong>Concurrent Execution:</strong> Transactions execute independently without interference.</p>
                <div class="isolation-levels">
                    <h4>Isolation Levels:</h4>
                    <table>
                        <tr><th>Level</th><th>Dirty Read</th><th>Non-Repeatable Read</th><th>Phantom Read</th></tr>
                        <tr><td>Read Uncommitted</td><td>✓</td><td>✓</td><td>✓</td></tr>
                        <tr><td>Read Committed</td><td>✗</td><td>✓</td><td>✓</td></tr>
                        <tr><td>Repeatable Read</td><td>✗</td><td>✗</td><td>✓</td></tr>
                        <tr><td>Serializable</td><td>✗</td><td>✗</td><td>✗</td></tr>
                    </table>
                </div>
            </div>
            
            <div class="property-card durability">
                <h3>💾 Durability</h3>
                <p><strong>Persistent Changes:</strong> Committed transactions survive system failures.</p>
                <div class="example">
                    <h4>Implementation:</h4>
                    <ul>
                        <li>Write-Ahead Logging (WAL)</li>
                        <li>Regular checkpoints</li>
                        <li>Backup and recovery</li>
                        <li>Disk-based storage</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <h3>Transaction States:</h3>
        <div class="transaction-flow">
            <div class="flow-diagram">
                Active → Partially Committed → Committed<br>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Failed → Aborted
            </div>
        </div>
        `,
        quiz: [
            {
                question: "Which ACID property ensures that either all operations in a transaction complete or none do?",
                options: [
                    "Atomicity",
                    "Consistency", 
                    "Isolation",
                    "Durability"
                ],
                correct: 0,
                explanation: "Atomicity ensures all-or-nothing execution. If any part of a transaction fails, the entire transaction is rolled back."
            },
            {
                question: "What isolation level prevents dirty reads but allows phantom reads?",
                options: [
                    "Read Uncommitted",
                    "Read Committed",
                    "Repeatable Read",
                    "Serializable"
                ],
                correct: 1,
                explanation: "Read Committed prevents dirty reads by only allowing reads of committed data, but still permits phantom reads and non-repeatable reads."
            }
        ]
    },

    3: {
        id: "normalization",
        title: "🎯 Database Normalization",
        category: "Design",
        difficulty: "Intermediate", 
        estimatedTime: "25 min",
        description: "Eliminate redundancy and improve data integrity",
        content: `
        <h2>Database Normalization</h2>
        <p>Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity by dividing large tables into smaller, related tables.</p>
        
        <h3>Why Normalize?</h3>
        <div class="benefits">
            <ul>
                <li><strong>Eliminate Redundancy:</strong> Store each piece of data only once</li>
                <li><strong>Prevent Anomalies:</strong> Avoid insertion, update, and deletion problems</li>
                <li><strong>Save Storage:</strong> Reduce database size</li>
                <li><strong>Maintain Integrity:</strong> Ensure data consistency</li>
            </ul>
        </div>
        
        <h3>Normal Forms:</h3>
        
        <div class="normal-form">
            <h4>1️⃣ First Normal Form (1NF)</h4>
            <p><strong>Rule:</strong> Each column contains atomic (indivisible) values, no repeating groups.</p>
            
            <div class="before-after">
                <div class="before">
                    <h5>❌ Not in 1NF:</h5>
                    <table>
                        <tr><th>StudentID</th><th>Name</th><th>Courses</th></tr>
                        <tr><td>1</td><td>John</td><td>Math, Physics, Chemistry</td></tr>
                        <tr><td>2</td><td>Jane</td><td>English, History</td></tr>
                    </table>
                </div>
                
                <div class="after">
                    <h5>✅ In 1NF:</h5>
                    <table>
                        <tr><th>StudentID</th><th>Name</th><th>Course</th></tr>
                        <tr><td>1</td><td>John</td><td>Math</td></tr>
                        <tr><td>1</td><td>John</td><td>Physics</td></tr>
                        <tr><td>1</td><td>John</td><td>Chemistry</td></tr>
                        <tr><td>2</td><td>Jane</td><td>English</td></tr>
                        <tr><td>2</td><td>Jane</td><td>History</td></tr>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="normal-form">
            <h4>2️⃣ Second Normal Form (2NF)</h4>
            <p><strong>Rules:</strong> Must be in 1NF + No partial dependencies on composite primary keys.</p>
            
            <div class="example">
                <h5>Problem: StudentID + CourseID → Grade (good)</h5>
                <h5>But: StudentID → StudentName (partial dependency)</h5>
                
                <div class="solution">
                    <h6>Solution: Split into separate tables</h6>
                    <strong>Students:</strong> StudentID → StudentName<br>
                    <strong>Enrollments:</strong> StudentID + CourseID → Grade
                </div>
            </div>
        </div>
        
        <div class="normal-form">
            <h4>3️⃣ Third Normal Form (3NF)</h4>
            <p><strong>Rules:</strong> Must be in 2NF + No transitive dependencies.</p>
            
            <div class="example">
                <h5>Problem:</h5>
                <p>StudentID → DepartmentID → DepartmentName</p>
                <p>StudentName depends on DepartmentName through DepartmentID (transitive)</p>
                
                <div class="solution">
                    <h6>Solution:</h6>
                    <strong>Students:</strong> StudentID, Name, DepartmentID<br>
                    <strong>Departments:</strong> DepartmentID, DepartmentName
                </div>
            </div>
        </div>
        
        <div class="normal-form">
            <h4>🎯 Boyce-Codd Normal Form (BCNF)</h4>
            <p><strong>Rule:</strong> Every determinant is a candidate key.</p>
            <p>Stricter version of 3NF that handles certain anomalies that 3NF misses.</p>
        </div>
        
        <h3>Denormalization Trade-offs:</h3>
        <div class="tradeoffs">
            <div class="pros-cons">
                <div class="pros">
                    <h4>When to Denormalize:</h4>
                    <ul>
                        <li>Read performance is critical</li>
                        <li>Complex joins are expensive</li>
                        <li>Data warehouse scenarios</li>
                        <li>Reporting requirements</li>
                    </ul>
                </div>
                <div class="cons">
                    <h4>Costs of Denormalization:</h4>
                    <ul>
                        <li>Increased storage requirements</li>
                        <li>Update complexity</li>
                        <li>Data inconsistency risk</li>
                        <li>More complex maintenance</li>
                    </ul>
                </div>
            </div>
        </div>
        `,
        quiz: [
            {
                question: "What is the main requirement for a table to be in First Normal Form (1NF)?",
                options: [
                    "No partial dependencies",
                    "Each column contains atomic values",
                    "No transitive dependencies", 
                    "Every determinant is a candidate key"
                ],
                correct: 1,
                explanation: "1NF requires that each column contains atomic (indivisible) values and no repeating groups exist in any row."
            },
            {
                question: "A table has a composite primary key (A, B). Column C depends only on A. What normal form violation is this?",
                options: [
                    "1NF violation",
                    "2NF violation",
                    "3NF violation",
                    "BCNF violation"
                ],
                correct: 1,
                explanation: "This is a partial dependency where a non-prime attribute (C) depends on only part of the primary key (A), violating 2NF."
            }
        ]
    },

    4: {
        id: "indexing",
        title: "⚡ Database Indexing",
        category: "Performance",
        difficulty: "Advanced",
        estimatedTime: "20 min",
        description: "Optimize query performance with smart indexing strategies",
        content: `
        <h2>Database Indexing</h2>
        <p>An <strong>index</strong> is a database object that improves the speed of data retrieval operations by creating shortcuts to find data without scanning every row.</p>
        
        <h3>How Indexes Work:</h3>
        <div class="analogy">
            <p>📖 <strong>Book Index Analogy:</strong> Like an index in a book that helps you find topics quickly without reading every page, database indexes point directly to where data is stored.</p>
        </div>
        
        <h3>Types of Indexes:</h3>
        
        <div class="index-types">
            <div class="index-type">
                <h4>🌳 Clustered Index</h4>
                <ul>
                    <li>Physically reorders table data</li>
                    <li>Only ONE per table</li>
                    <li>Usually on Primary Key</li>
                    <li>Data pages stored in order of index key</li>
                </ul>
                <div class="code-example">
                    <code>CREATE CLUSTERED INDEX IX_Employee_ID ON Employees(EmployeeID);</code>
                </div>
            </div>
            
            <div class="index-type">
                <h4>🔗 Non-Clustered Index</h4>
                <ul>
                    <li>Separate structure pointing to data</li>
                    <li>Multiple indexes per table</li>
                    <li>Doesn't change physical data order</li>
                    <li>Contains pointers to actual data</li>
                </ul>
                <div class="code-example">
                    <code>CREATE NONCLUSTERED INDEX IX_Employee_LastName ON Employees(LastName);</code>
                </div>
            </div>
        </div>
        
        <h3>Index Data Structures:</h3>
        
        <div class="data-structures">
            <div class="structure">
                <h4>🌲 B-Tree Index (Most Common)</h4>
                <ul>
                    <li>Balanced tree structure</li>
                    <li>Excellent for range queries</li>
                    <li>Maintains sorted order</li>
                    <li>O(log n) lookup time</li>
                </ul>
                <div class="use-cases">
                    <strong>Best for:</strong> WHERE, ORDER BY, JOIN conditions
                </div>
            </div>
            
            <div class="structure">
                <h4>🏠 Hash Index</h4>
                <ul>
                    <li>Hash function maps keys to locations</li>
                    <li>Very fast equality lookups</li>
                    <li>O(1) average lookup time</li>
                    <li>Cannot handle range queries</li>
                </ul>
                <div class="use-cases">
                    <strong>Best for:</strong> Exact match queries (=)
                </div>
            </div>
            
            <div class="structure">
                <h4>🔍 Full-Text Index</h4>
                <ul>
                    <li>Specialized for text searches</li>
                    <li>Supports natural language queries</li>
                    <li>Handles stemming and synonyms</li>
                    <li>CONTAINS, FREETEXT operations</li>
                </ul>
                <div class="use-cases">
                    <strong>Best for:</strong> Text search, document search
                </div>
            </div>
        </div>
        
        <h3>Index Strategies:</h3>
        
        <div class="strategies">
            <div class="strategy">
                <h4>📊 Composite Indexes</h4>
                <p>Multiple columns in single index. Column order matters!</p>
                <div class="code-example">
                    <code>CREATE INDEX IX_Name_Salary ON Employees(LastName, FirstName, Salary);</code>
                </div>
                <p><strong>Tip:</strong> Most selective column first, or match your WHERE clause order.</p>
            </div>
            
            <div class="strategy">
                <h4>🎯 Covering Index</h4>
                <p>Index contains all columns needed for a query (no table lookup required).</p>
                <div class="code-example">
                    <code>CREATE INDEX IX_Covering ON Employees(DepartmentID) INCLUDE (FirstName, LastName, Salary);</code>
                </div>
            </div>
            
            <div class="strategy">
                <h4>🔍 Partial Index</h4>
                <p>Index only subset of rows based on condition.</p>
                <div class="code-example">
                    <code>CREATE INDEX IX_Active_Employees ON Employees(LastName) WHERE IsActive = 1;</code>
                </div>
            </div>
        </div>
        
        <h3>Index Trade-offs:</h3>
        <div class="tradeoffs">
            <div class="pros-cons">
                <div class="pros">
                    <h4>✅ Benefits:</h4>
                    <ul>
                        <li>Faster SELECT queries</li>
                        <li>Faster JOIN operations</li>
                        <li>Faster ORDER BY</li>
                        <li>Unique constraint enforcement</li>
                    </ul>
                </div>
                <div class="cons">
                    <h4>❌ Costs:</h4>
                    <ul>
                        <li>Additional storage space</li>
                        <li>Slower INSERT/UPDATE/DELETE</li>
                        <li>Index maintenance overhead</li>
                        <li>Memory usage</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <h3>When to Use Indexes:</h3>
        <div class="guidelines">
            <div class="do">
                <h4>✅ Create indexes for:</h4>
                <ul>
                    <li>Frequently queried columns</li>
                    <li>JOIN conditions</li>
                    <li>WHERE clause columns</li>
                    <li>ORDER BY columns</li>
                    <li>Foreign key columns</li>
                </ul>
            </div>
            <div class="dont">
                <h4>❌ Avoid indexes on:</h4>
                <ul>
                    <li>Frequently updated columns</li>
                    <li>Very small tables</li>
                    <li>Low-selectivity columns</li>
                    <li>Columns with many NULLs</li>
                </ul>
            </div>
        </div>
        `,
        quiz: [
            {
                question: "What is the main difference between clustered and non-clustered indexes?",
                options: [
                    "Clustered indexes are faster",
                    "Clustered indexes physically reorder table data",
                    "Non-clustered indexes are larger",
                    "Clustered indexes work better with text"
                ],
                correct: 1,
                explanation: "Clustered indexes physically reorder and store table data in the order of the index key, while non-clustered indexes create a separate structure that points to the actual data."
            },
            {
                question: "For the composite index on (LastName, FirstName, Salary), which query will be most efficient?",
                options: [
                    "WHERE FirstName = 'John'",
                    "WHERE LastName = 'Smith' AND FirstName = 'John'",
                    "WHERE Salary > 50000",
                    "WHERE FirstName = 'John' AND Salary > 50000"
                ],
                correct: 1,
                explanation: "Composite indexes are most efficient when queries use columns from left to right. The query using LastName (first column) and FirstName (second column) matches the index structure perfectly."
            }
        ]
    }
};

// Theory-based quiz questions for integrated challenges
const THEORY_QUIZZES = {
    "database-design": {
        title: "🎯 Database Design Mastery",
        difficulty: "Intermediate",
        timeLimit: 300, // 5 minutes
        questions: [
            {
                question: "Which normal form eliminates partial dependencies?",
                options: ["1NF", "2NF", "3NF", "BCNF"],
                correct: 1,
                explanation: "2NF eliminates partial dependencies where non-prime attributes depend on part of a composite primary key."
            },
            {
                question: "What type of index physically reorders table data?",
                options: ["Non-clustered", "Clustered", "Hash", "Bitmap"],
                correct: 1,
                explanation: "Clustered indexes physically reorder and store table data in the order of the index key values."
            },
            {
                question: "Which ACID property ensures all-or-nothing execution?",
                options: ["Atomicity", "Consistency", "Isolation", "Durability"],
                correct: 0,
                explanation: "Atomicity ensures that either all operations in a transaction complete successfully or none do."
            },
            {
                question: "What isolation level allows dirty reads?",
                options: ["Read Committed", "Read Uncommitted", "Repeatable Read", "Serializable"],
                correct: 1,
                explanation: "Read Uncommitted allows dirty reads, where a transaction can read uncommitted changes from other transactions."
            },
            {
                question: "In which scenario would you consider denormalization?",
                options: [
                    "When data integrity is most important",
                    "When read performance is critical and joins are expensive", 
                    "When storage space is limited",
                    "When data changes frequently"
                ],
                correct: 1,
                explanation: "Denormalization is typically considered when read performance is critical and the cost of complex joins outweighs the benefits of normalization."
            }
        ]
    }
};

// Export for global access
window.THEORY_TOPICS = THEORY_TOPICS;
window.THEORY_QUIZZES = THEORY_QUIZZES;