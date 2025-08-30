// SQL Editor with Real-time Formatting and Intellisense
class SQLEditor {
    constructor(textareaId, options = {}) {
        this.textarea = document.getElementById(textareaId);
        this.options = {
            autoFormat: true,
            showSuggestions: true,
            showErrors: true,
            autoComplete: true,
            ...options
        };
        
        this.formatter = new SQLFormatter();
        this.suggestions = [];
        this.currentSuggestionIndex = -1;
        this.suggestionBox = null;
        this.errorBox = null;
        
        this.init();
    }

    init() {
        if (!this.textarea) return;

        // Create suggestion box
        this.createSuggestionBox();
        
        // Create error box
        this.createErrorBox();
        
        // Add event listeners
        this.addEventListeners();
        
        // Initial validation
        this.validateAndFormat();
    }

    createSuggestionBox() {
        this.suggestionBox = document.createElement('div');
        this.suggestionBox.className = 'sql-suggestions';
        this.suggestionBox.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        `;
        
        this.textarea.parentNode.style.position = 'relative';
        this.textarea.parentNode.appendChild(this.suggestionBox);
    }

    createErrorBox() {
        this.errorBox = document.createElement('div');
        this.errorBox.className = 'sql-errors';
        this.errorBox.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 8px;
            margin-top: 4px;
            font-size: 12px;
            color: #856404;
            display: none;
            z-index: 999;
        `;
        
        this.textarea.parentNode.appendChild(this.errorBox);
    }

    addEventListeners() {
        // Input events
        this.textarea.addEventListener('input', () => {
            this.handleInput();
        });

        this.textarea.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        this.textarea.addEventListener('blur', () => {
            setTimeout(() => this.hideSuggestions(), 200);
        });

        // Focus events
        this.textarea.addEventListener('focus', () => {
            this.validateAndFormat();
        });

        // Paste events
        this.textarea.addEventListener('paste', () => {
            setTimeout(() => this.validateAndFormat(), 100);
        });
    }

    handleInput() {
        if (this.options.autoFormat) {
            this.formatQuery();
        }
        
        if (this.options.showSuggestions) {
            this.updateSuggestions();
        }
        
        if (this.options.showErrors) {
            this.validateQuery();
        }
    }

    handleKeydown(e) {
        if (this.suggestions.length > 0 && this.suggestionBox.style.display !== 'none') {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectNextSuggestion();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectPreviousSuggestion();
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.applySuggestion();
                    break;
                case 'Tab':
                    e.preventDefault();
                    this.applySuggestion();
                    break;
                case 'Escape':
                    this.hideSuggestions();
                    break;
            }
        }
    }

    formatQuery() {
        const cursorPosition = this.textarea.selectionStart;
        const query = this.textarea.value;
        const formatted = this.formatter.formatQuery(query);
        
        if (formatted !== query) {
            this.textarea.value = formatted;
            // Try to maintain cursor position
            this.textarea.setSelectionRange(cursorPosition, cursorPosition);
        }
    }

    updateSuggestions() {
        const cursorPosition = this.textarea.selectionStart;
        const query = this.textarea.value;
        this.suggestions = this.formatter.getSuggestions(query, cursorPosition);
        
        if (this.suggestions.length > 0) {
            this.showSuggestions();
        } else {
            this.hideSuggestions();
        }
    }

    showSuggestions() {
        if (this.suggestions.length === 0) return;

        this.suggestionBox.innerHTML = '';
        this.currentSuggestionIndex = -1;

        this.suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            const textSpan = document.createElement('span');
            textSpan.textContent = suggestion.text;
            textSpan.style.fontWeight = 'bold';
            
            const descSpan = document.createElement('span');
            descSpan.textContent = suggestion.description;
            descSpan.style.color = '#666';
            descSpan.style.fontSize = '12px';
            
            item.appendChild(textSpan);
            item.appendChild(descSpan);
            
            item.addEventListener('click', () => {
                this.currentSuggestionIndex = index;
                this.applySuggestion();
            });
            
            item.addEventListener('mouseenter', () => {
                this.currentSuggestionIndex = index;
                this.highlightSuggestion();
            });
            
            this.suggestionBox.appendChild(item);
        });

        this.positionSuggestionBox();
        this.suggestionBox.style.display = 'block';
    }

    hideSuggestions() {
        this.suggestionBox.style.display = 'none';
        this.currentSuggestionIndex = -1;
    }

    positionSuggestionBox() {
        const rect = this.textarea.getBoundingClientRect();
        const cursorPosition = this.textarea.selectionStart;
        const query = this.textarea.value.substring(0, cursorPosition);
        const lines = query.split('\n');
        const currentLine = lines[lines.length - 1];
        
        // Calculate position based on cursor
        const lineHeight = parseInt(getComputedStyle(this.textarea).lineHeight);
        const top = rect.top + (lines.length - 1) * lineHeight;
        
        this.suggestionBox.style.top = `${top}px`;
        this.suggestionBox.style.left = `${rect.left}px`;
        this.suggestionBox.style.width = `${rect.width}px`;
    }

    selectNextSuggestion() {
        this.currentSuggestionIndex = (this.currentSuggestionIndex + 1) % this.suggestions.length;
        this.highlightSuggestion();
    }

    selectPreviousSuggestion() {
        this.currentSuggestionIndex = this.currentSuggestionIndex <= 0 
            ? this.suggestions.length - 1 
            : this.currentSuggestionIndex - 1;
        this.highlightSuggestion();
    }

    highlightSuggestion() {
        const items = this.suggestionBox.querySelectorAll('.suggestion-item');
        items.forEach((item, index) => {
            if (index === this.currentSuggestionIndex) {
                item.style.backgroundColor = '#e3f2fd';
            } else {
                item.style.backgroundColor = 'white';
            }
        });
    }

    applySuggestion() {
        if (this.currentSuggestionIndex < 0 || this.currentSuggestionIndex >= this.suggestions.length) {
            return;
        }

        const suggestion = this.suggestions[this.currentSuggestionIndex];
        const cursorPosition = this.textarea.selectionStart;
        const query = this.textarea.value;
        const currentWord = this.formatter.getCurrentWord(query, cursorPosition);
        
        if (currentWord) {
            const beforeWord = query.substring(0, cursorPosition - currentWord.length);
            const afterWord = query.substring(cursorPosition);
            const newQuery = beforeWord + suggestion.text + afterWord;
            
            this.textarea.value = newQuery;
            const newCursorPosition = beforeWord.length + suggestion.text.length;
            this.textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }

        this.hideSuggestions();
        this.validateAndFormat();
    }

    validateQuery() {
        const query = this.textarea.value;
        const validation = this.formatter.validateQuery(query);
        
        if (validation.errors.length > 0 || validation.warnings.length > 0) {
            this.showErrors(validation);
        } else {
            this.hideErrors();
        }
    }

    showErrors(validation) {
        let errorHtml = '';
        
        if (validation.errors.length > 0) {
            errorHtml += '<div style="color: #d32f2f; margin-bottom: 4px;"><strong>Errors:</strong></div>';
            validation.errors.forEach(error => {
                errorHtml += `<div style="color: #d32f2f; margin-left: 8px;">• ${error}</div>`;
            });
        }
        
        if (validation.warnings.length > 0) {
            errorHtml += '<div style="color: #f57c00; margin-bottom: 4px;"><strong>Warnings:</strong></div>';
            validation.warnings.forEach(warning => {
                errorHtml += `<div style="color: #f57c00; margin-left: 8px;">• ${warning}</div>`;
            });
        }
        
        this.errorBox.innerHTML = errorHtml;
        this.errorBox.style.display = 'block';
    }

    hideErrors() {
        this.errorBox.style.display = 'none';
    }

    validateAndFormat() {
        this.validateQuery();
        if (this.options.autoFormat) {
            this.formatQuery();
        }
    }

    // Public methods
    getValue() {
        return this.textarea.value;
    }

    setValue(value) {
        this.textarea.value = value;
        this.validateAndFormat();
    }

    getFormattedValue() {
        return this.formatter.formatQuery(this.textarea.value);
    }

    getAutoCorrectedValue() {
        return this.formatter.autoCorrect(this.textarea.value);
    }

    // Auto-correct the current query
    autoCorrect() {
        const corrected = this.formatter.autoCorrect(this.textarea.value);
        if (corrected !== this.textarea.value) {
            this.textarea.value = corrected;
            this.validateAndFormat();
            return true;
        }
        return false;
    }

    // Show available tables
    showTableInfo() {
        const tables = this.formatter.getAvailableTables();
        let info = 'Available Tables:\n\n';
        
        tables.forEach(table => {
            info += `📋 ${table.name}\n`;
            info += `   Description: ${table.description}\n`;
            info += `   Columns: ${table.columns.join(', ')}\n\n`;
        });
        
        alert(info);
    }

    // Insert a table template
    insertTableTemplate(tableName) {
        const columns = this.formatter.getTableColumns(tableName);
        if (columns.length > 0) {
            const template = `SELECT ${columns.join(', ')}\nFROM ${tableName}`;
            this.textarea.value = template;
            this.validateAndFormat();
        }
    }
}

// Global SQL Formatter instance
window.SQLFormatter = SQLFormatter;
window.SQLEditor = SQLEditor;
