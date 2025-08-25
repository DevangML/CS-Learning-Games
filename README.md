# SQL Mastery Quest - MySQL Integration

An interactive SQL tutorial application that connects to MySQL database to execute real queries and compare results.

## Features

- Interactive SQL tutorials with multiple levels
- Real MySQL database integration
- Automatic query execution and result display
- Result comparison with expected outputs
- Progress tracking and achievements
- Database table creation and sample data population

## Prerequisites

- Node.js (v14 or higher)
- MySQL server running locally
- MySQL user with database creation privileges (non-root recommended)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. MySQL Database Setup

Create a MySQL user and database:

```sql
-- Connect to MySQL as root or admin user
CREATE DATABASE sql_tutor;
CREATE USER 'sql_tutor_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON sql_tutor.* TO 'sql_tutor_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configure Environment Variables

Edit the `.env` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=sql_tutor_user
DB_PASSWORD=your_password_here
DB_NAME=sql_tutor
PORT=3000
```

### 4. Start the Application

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### 5. Access the Application

Open your browser and navigate to: `http://localhost:3000`

## Database Schema

The application automatically creates the following tables with sample data:

- `employees` - Employee information with departments and salaries
- `departments` - Department details
- `projects` - Project information
- `employee_projects` - Many-to-many relationship between employees and projects

## Features

### Query Execution
- All queries are executed against the real MySQL database
- Only SELECT queries are allowed for security
- Results are displayed in formatted tables

### Result Comparison
- Compares user query results with expected outputs
- Highlights differences when results don't match exactly
- Provides detailed analysis of mismatches

### Security Features
- Only SELECT statements allowed
- Input sanitization
- Non-root database user recommended
- Connection pooling and error handling

## Troubleshooting

### Connection Issues
1. Ensure MySQL server is running
2. Verify database credentials in `.env`
3. Check if the database and user exist
4. Test connection endpoint: `http://localhost:3000/test-connection`

### Permission Issues
```sql
-- If you get permission errors:
GRANT SELECT, INSERT, CREATE, DROP ON sql_tutor.* TO 'sql_tutor_user'@'localhost';
FLUSH PRIVILEGES;
```

## API Endpoints

- `POST /execute-query` - Execute SQL query
- `GET /test-connection` - Test database connection
- `GET /` - Serve the main application

## Development

The application consists of:
- `server.js` - Express.js backend with MySQL integration
- `index.html` - Frontend with interactive tutorial interface
- `package.json` - Dependencies and scripts
- `.env` - Environment configuration (create from template)

## Adding New Tutorial Questions

To add new questions, modify the `learningLevels` array in `index.html` and add corresponding expected results in `server.js`.