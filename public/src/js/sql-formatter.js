// Client-side SQL Formatter with Intellisense and Suggestions
class SQLFormatter {
    constructor() {
        this.tables = {
            'Employee': {
                columns: ['id', 'name', 'departmentId', 'salary', 'hire_date'],
                description: 'Employee information table'
            },
            'Department': {
                columns: ['id', 'name', 'managerId'],
                description: 'Department information table'
            },
            'Project': {
                columns: ['id', 'name', 'budget', 'start_date', 'end_date'],
                description: 'Project information table'
            },
            'employee_projects': {
                columns: ['employeeId', 'projectId', 'role'],
                description: 'Employee-project assignments'
            },
            'Log': {
                columns: ['id', 'num'],
                description: 'Log entries for practice'
            },
            'Weather': {
                columns: ['id', 'record_date', 'temperature'],
                description: 'Weather data for practice'
            },
            'Activity': {
                columns: ['user_id', 'session_id', 'activity_date', 'activity_type'],
                description: 'User activity tracking'
            }
        };

        this.keywords = [
            'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
            'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT',
            'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'AS', 'ON', 'AND', 'OR', 'NOT',
            'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL', 'EXISTS', 'UNION',
            'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE',
            'INDEX', 'VIEW', 'PRIMARY KEY', 'FOREIGN KEY', 'CONSTRAINT',
            'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'COALESCE', 'NULLIF',
            'CONCAT', 'SUBSTRING', 'LENGTH', 'UPPER', 'LOWER', 'TRIM',
            'DATE', 'YEAR', 'MONTH', 'DAY', 'CURDATE', 'NOW', 'DATEDIFF'
        ];

        this.functions = [
            'COUNT(*)', 'SUM()', 'AVG()', 'MAX()', 'MIN()', 'CONCAT()', 'SUBSTRING()',
            'LENGTH()', 'UPPER()', 'LOWER()', 'TRIM()', 'YEAR()', 'MONTH()', 'DAY()',
            'DATEDIFF()', 'CURDATE()', 'NOW()', 'COALESCE()', 'NULLIF()', 'IF()',
            'CASE WHEN', 'EXISTS()', 'IN()', 'BETWEEN', 'LIKE'
        ];
    }

    // Format SQL query with proper indentation and spacing
    formatQuery(query) {
        if (!query || typeof query !== 'string') return query;

        let formatted = query.trim();
        
        // Basic formatting
        formatted = formatted.replace(/\s+/g, ' '); // Remove extra spaces
        formatted = formatted.replace(/\s*([,()])\s*/g, '$1 '); // Space around commas and parentheses
        formatted = formatted.replace(/\s*([=<>!])\s*/g, ' $1 '); // Space around operators
        
        // Keyword formatting
        this.keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            formatted = formatted.replace(regex, keyword.toUpperCase());
        });

        // Indentation for better readability
        const lines = formatted.split(';');
        const formattedLines = lines.map(line => {
            line = line.trim();
            if (!line) return line;
            
            // Add indentation for clauses
            line = line.replace(/\b(FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET)\b/gi, '\n  $1');
            line = line.replace(/\b(AND|OR)\b/gi, '\n    $1');
            
            return line;
        });

        return formattedLines.join(';\n');
    }

    // Get suggestions based on current input
    getSuggestions(input, cursorPosition) {
        const suggestions = [];
        const currentWord = this.getCurrentWord(input, cursorPosition);
        
        if (!currentWord) return suggestions;

        const word = currentWord.toLowerCase();

        // Table suggestions
        Object.keys(this.tables).forEach(tableName => {
            if (tableName.toLowerCase().includes(word)) {
                suggestions.push({
                    text: `"${tableName}"`,
                    type: 'table',
                    description: this.tables[tableName].description
                });
            }
        });

        // Column suggestions
        Object.keys(this.tables).forEach(tableName => {
            this.tables[tableName].columns.forEach(column => {
                if (column.toLowerCase().includes(word)) {
                    suggestions.push({
                        text: `"${column}"`,
                        type: 'column',
                        description: `Column from ${tableName}`,
                        table: tableName
                    });
                }
            });
        });

        // Keyword suggestions
        this.keywords.forEach(keyword => {
            if (keyword.toLowerCase().includes(word)) {
                suggestions.push({
                    text: keyword,
                    type: 'keyword',
                    description: 'SQL keyword'
                });
            }
        });

        // Function suggestions
        this.functions.forEach(func => {
            if (func.toLowerCase().includes(word)) {
                suggestions.push({
                    text: func,
                    type: 'function',
                    description: 'SQL function'
                });
            }
        });

        return suggestions.slice(0, 10); // Limit to 10 suggestions
    }

    // Get current word at cursor position
    getCurrentWord(input, cursorPosition) {
        const beforeCursor = input.substring(0, cursorPosition);
        const words = beforeCursor.split(/\s+/);
        return words[words.length - 1] || '';
    }

    // Validate SQL syntax and provide error suggestions
    validateQuery(query) {
        const errors = [];
        const warnings = [];

        if (!query || typeof query !== 'string') {
            return { errors, warnings, isValid: true }; // Don't show error for empty queries
        }

        const trimmed = query.trim();
        if (!trimmed) {
            return { errors, warnings, isValid: true }; // Don't show error for empty queries
        }

        // Check for basic syntax issues
        const lowerQuery = trimmed.toLowerCase();

        // Check for missing SELECT
        if (!lowerQuery.startsWith('select') && 
            !lowerQuery.startsWith('insert') && 
            !lowerQuery.startsWith('update') && 
            !lowerQuery.startsWith('delete') && 
            !lowerQuery.startsWith('create') && 
            !lowerQuery.startsWith('alter') && 
            !lowerQuery.startsWith('drop') && 
            !lowerQuery.startsWith('show') && 
            !lowerQuery.startsWith('describe') && 
            !lowerQuery.startsWith('explain')) {
            errors.push('Query must start with SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, SHOW, DESCRIBE, or EXPLAIN');
        }

        // Check for missing FROM clause in SELECT
        if (lowerQuery.startsWith('select') && !lowerQuery.includes('from')) {
            errors.push('SELECT query must include FROM clause');
        }

        // Check for unmatched parentheses
        const openParens = (trimmed.match(/\(/g) || []).length;
        const closeParens = (trimmed.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            errors.push('Unmatched parentheses detected');
        }

        // Check for common table name issues
        const tableMatches = trimmed.match(/from\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);
        if (tableMatches) {
            tableMatches.forEach(match => {
                const tableName = match.replace(/from\s+/i, '');
                if (!this.tables[tableName] && !this.tables[`"${tableName}"`]) {
                    warnings.push(`Table "${tableName}" not found. Available tables: ${Object.keys(this.tables).join(', ')}`);
                }
            });
        }

        // Check for common column name issues
        const columnMatches = trimmed.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gi);
        if (columnMatches) {
            columnMatches.forEach(match => {
                const columnName = match.replace(/\s*=/i, '');
                let found = false;
                Object.values(this.tables).forEach(table => {
                    if (table.columns.includes(columnName) || table.columns.includes(`"${columnName}"`)) {
                        found = true;
                    }
                });
                if (!found && !this.keywords.includes(columnName.toUpperCase())) {
                    warnings.push(`Column "${columnName}" not found in any table`);
                }
            });
        }

        return {
            errors,
            warnings,
            isValid: errors.length === 0
        };
    }

    // Auto-correct common mistakes
    autoCorrect(query) {
        if (!query || typeof query !== 'string') return query;

        let corrected = query;

        // Fix common table name issues - handle both quoted and unquoted versions
        Object.keys(this.tables).forEach(tableName => {
            const unquotedName = tableName.replace(/"/g, '');
            const quotedName = `"${tableName}"`;
            
            // Replace unquoted table names with quoted ones
            const regex = new RegExp(`\\bfrom\\s+${unquotedName}\\b`, 'gi');
            corrected = corrected.replace(regex, `FROM ${quotedName}`);
            
            const regex2 = new RegExp(`\\bjoin\\s+${unquotedName}\\b`, 'gi');
            corrected = corrected.replace(regex2, `JOIN ${quotedName}`);
            
            // Fix incorrect casing in quoted table names (e.g., "employee" -> "Employee", "department" -> "Department")
            const incorrectCaseRegex = new RegExp(`"${unquotedName.toLowerCase()}"`, 'gi');
            corrected = corrected.replace(incorrectCaseRegex, quotedName);
        });

        // Fix common column name issues
        Object.values(this.tables).forEach(table => {
            table.columns.forEach(column => {
                const unquotedColumn = column.replace(/"/g, '');
                const quotedColumn = `"${column}"`;
                
                // Replace unquoted column names with quoted ones where needed
                const regex = new RegExp(`\\b${unquotedColumn}\\s*=`, 'gi');
                corrected = corrected.replace(regex, `${quotedColumn} =`);
            });
        });

        // Fix common keyword casing
        this.keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            corrected = corrected.replace(regex, keyword.toUpperCase());
        });

        // Fix common spacing issues
        corrected = corrected.replace(/\s+/g, ' '); // Remove extra spaces
        corrected = corrected.replace(/\s*([,()])\s*/g, '$1 '); // Space around commas and parentheses
        corrected = corrected.replace(/\s*([=<>!])\s*/g, ' $1 '); // Space around operators

        return corrected.trim();
    }

    // Get table schema information
    getTableSchema(tableName) {
        const cleanTableName = tableName.replace(/"/g, '');
        return this.tables[cleanTableName] || this.tables[tableName];
    }

    // Get all available tables
    getAvailableTables() {
        return Object.keys(this.tables).map(name => ({
            name: `"${name}"`,
            description: this.tables[name].description,
            columns: this.tables[name].columns
        }));
    }

    // Get columns for a specific table
    getTableColumns(tableName) {
        const cleanTableName = tableName.replace(/"/g, '');
        const table = this.tables[cleanTableName] || this.tables[tableName];
        return table ? table.columns.map(col => `"${col}"`) : [];
    }
}

// Make it available globally
window.SQLFormatter = SQLFormatter;
