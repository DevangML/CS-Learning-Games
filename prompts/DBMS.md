# DBMS & SQL Theory + Practice Content Generator

Generate interview-grade Database Management Systems content with both theoretical concepts and practical SQL implementation.

## Context & Requirements
You are generating content for SQL Mastery Quest, an interactive learning platform that combines:
- **Theory Hub**: Deep DBMS concepts with interactive explanations  
- **Practice Levels**: SQL queries with real database execution
- **Integrated Quizzes**: Both concept understanding and practical application

**Target Audience**: Students preparing for database interviews at FAANG+ companies
**Content Authority**: All theoretical content must reference GeeksforGeeks DBMS articles as authoritative sources

## Output Structure

Generate **{COUNT} levels** as JSON object with stringified keys ("1", "2", etc.):

```json
{
  "1": {
    "title": "Database Fundamentals & SQL Basics",
    "description": "Master core database concepts and basic SQL operations",
    "difficulty": "Beginner",
    "objectives": ["Understand DBMS vs File Systems", "Write basic SELECT queries", "Apply fundamental constraints"],
    "prerequisites": ["Basic computer science knowledge"],
    "theory": [...],
    "quizzes": [...],
    "sqlPractice": [...],
    "missionCandidates": ["1-0", "1-1", "1-2"]
  }
}
```

### Level Object Schema

- **title**: Descriptive level name combining theory + practice
- **description**: 1-2 sentences explaining what students learn
- **difficulty**: `["Beginner","Intermediate","Advanced","Expert"]`
- **objectives**: 3-5 learning outcomes (mix theory + SQL skills)
- **prerequisites**: 0-4 previous concepts needed
- **theory**: 2-3 theoretical concepts with GeeksforGeeks alignment
- **quizzes**: 4-6 mixed questions (theory + SQL comprehension)
- **sqlPractice**: 3-5 hands-on SQL challenges with real queries
- **missionCandidates**: 3 quiz IDs for daily missions

### Theory Object Schema

```json
{
  "id": 0,
  "title": "ACID Properties in Database Transactions",
  "summary": "Four fundamental properties ensuring reliable transaction processing",
  "content": "Detailed explanation matching GeeksforGeeks definitions...",
  "keyPoints": ["Atomicity ensures all-or-nothing execution", "Consistency maintains data integrity"],
  "pitfalls": ["Misunderstanding isolation levels", "Confusing consistency with durability"],
  "gfgReference": "https://www.geeksforgeeks.org/acid-properties-in-dbms/",
  "verified": true
}
```

### Quiz Object Schema

```json
{
  "id": 0,
  "type": "mcq_single",
  "question": "Which ACID property ensures all operations complete or none do?",
  "choices": ["Atomicity", "Consistency", "Isolation", "Durability"],
  "correctAnswer": "Atomicity",
  "hints": {
    "t1": "Think about transaction completeness",
    "t2": "Consider the 'all or nothing' principle",
    "t3": "This property prevents partial transaction execution"
  },
  "explanation": "Atomicity ensures either all operations succeed or all fail, preventing partial updates that could corrupt data integrity.",
  "tags": ["ACID", "transactions", "atomicity", "database-integrity"],
  "sources": [{"name": "GeeksforGeeks ACID Properties"}],
  "verified": true
}
```

### SQL Practice Object Schema

```json
{
  "id": 0,
  "title": "Basic SELECT Operations",
  "description": "Write queries to retrieve and filter employee data",
  "query": "SELECT name, salary FROM employees WHERE department_id = 1;",
  "expectedResult": "Returns names and salaries of Engineering department employees",
  "hints": {
    "t1": "Use SELECT to choose columns",
    "t2": "WHERE clause filters rows by condition", 
    "t3": "Remember to specify the exact column names needed"
  },
  "concept": {
    "title": "SELECT Statement Fundamentals",
    "content": "SELECT retrieves data from database tables. Use WHERE to filter rows and specify exact columns needed."
  },
  "difficulty": "Beginner",
  "tags": ["SELECT", "WHERE", "basic-queries", "data-retrieval"]
}
```

## Content Requirements

### Theory Coverage (Research-Based)
Select high-impact DBMS topics from GeeksforGeeks interview collections:

**Foundation**: Database basics, DBMS vs file systems, relational model
**Transactions**: ACID properties, isolation levels, concurrency control  
**Design**: Normalization forms (1NF-BCNF), ER diagrams, schema design
**Performance**: Indexing strategies, query optimization, execution plans
**Advanced**: Stored procedures, triggers, backup/recovery, distributed systems

### SQL Practice Coverage
**DDL**: CREATE, ALTER, DROP table operations with constraints
**DML**: SELECT with joins, subqueries, aggregation, window functions
**Query Optimization**: Index usage, execution plan analysis
**Real Scenarios**: Complex business queries, data analysis patterns

### Verification Standards
- **Theory**: Must align with GeeksforGeeks authoritative definitions
- **SQL**: Executable queries with expected results
- **Sources**: Reference specific GfG articles by name (no direct links)
- **Verified Flag**: Set `verified: true` for all content

### Difficulty Progression
- **Beginner (3 levels)**: Database fundamentals, basic SQL, simple constraints
- **Intermediate (5 levels)**: ACID properties, normalization, joins, indexing  
- **Advanced (2 levels)**: Query optimization, complex scenarios, stored procedures
- **Expert (1 level)**: Distributed systems, advanced performance tuning

## Quality Standards

### Explanations
- Address common misconceptions about database concepts
- Connect theory to practical SQL implementation
- Reference interview scenarios and real-world applications

### Questions  
- Test both conceptual understanding and practical application
- Include SQL query analysis and optimization scenarios
- Mix difficulty within each level for comprehensive assessment

### Hints System
1. **Conceptual**: High-level approach or key concept
2. **Tactical**: Specific technique or SQL clause to use  
3. **Implementation**: Near-solution guidance for complex queries

Generate **{COUNT}** comprehensive levels that prepare students for database roles at top technology companies, combining solid theoretical foundation with hands-on SQL expertise.