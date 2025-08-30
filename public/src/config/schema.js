// Database Schema Configuration
const SCHEMA = {
    employees: {
        columns: ['id (PK)', 'first_name', 'last_name', 'email', 'department_id (FK)', 'salary', 'hire_date', 'manager_id (FK)']
    },
    departments: {
        columns: ['id (PK)', 'name', 'budget', 'location']
    },
    projects: {
        columns: ['id (PK)', 'name', 'start_date', 'end_date', 'budget', 'department_id (FK)']
    },
    employee_projects: {
        columns: ['employee_id (FK)', 'project_id (FK)', 'role', 'hours_worked']
    },
    customers: {
        columns: ['id (PK)', 'company_name', 'contact_name', 'email', 'phone', 'country']
    },
    orders: {
        columns: ['id (PK)', 'customer_id (FK)', 'order_date', 'total_amount', 'status']
    },
    order_items: {
        columns: ['id (PK)', 'order_id (FK)', 'product_name', 'quantity', 'unit_price']
    },
    logs: {
        columns: ['id (PK)', 'user_id (FK)', 'action', 'timestamp', 'ip_address', 'success']
    },
    weather: {
        columns: ['id (PK)', 'city', 'temperature', 'humidity', 'date', 'conditions']
    },
    activity: {
        columns: ['id (PK)', 'user_id (FK)', 'activity_type', 'duration', 'date', 'calories']
    }
};

// Schema display functions
class SchemaViewer {
    static renderSchema(tables = null) {
        const schemaViewer = document.getElementById('schemaViewer');
        if (!schemaViewer) return;

        const tablesToShow = tables || Object.keys(SCHEMA);
        let html = '<h3>🗄️ Database Schema</h3>';
        
        tablesToShow.forEach(tableName => {
            if (SCHEMA[tableName]) {
                html += `
                    <div class="table-schema">
                        <div class="table-name">${tableName}</div>
                        ${SCHEMA[tableName].columns.map(col => {
                            let className = 'column';
                            if (col.includes('PK')) className += ' primary-key';
                            if (col.includes('FK')) className += ' foreign-key';
                            return `<div class="${className}">${col}</div>`;
                        }).join('')}
                    </div>
                `;
            }
        });
        
        schemaViewer.innerHTML = html;
    }
}

// Export for global access
window.SCHEMA = SCHEMA;
window.SchemaViewer = SchemaViewer;
// moved to public/src for Next.js
