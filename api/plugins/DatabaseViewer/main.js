const { getDatabase } = require('../../classes/utils');

/**
 * Enhanced Database Service for admin operations
 */
class DatabaseService {
    constructor(database, logger) {
        this.database = database;
        this.logger = logger;
    }
    
    getTables(callback) {
        this.logger.info('Getting database tables');
        
        if (!this.database._session) {
            this.database.readNews(null, () => {
                this._getTables(callback);
            });
        } else {
            this._getTables(callback);
        }
    }
    
    _getTables(callback) {
        try {
            const schemaName = this.database.getSchemaName ? this.database.getSchemaName() : 'UlmNewsFlash';
            const schema = this.database._session.getSchema(schemaName);
            schema.getTables().then(tables => {
                const tableNames = tables.map(table => table.getName());
                this.logger.info(`Found tables: ${tableNames.join(', ')}`);
                callback(null, tableNames);
            }).catch(error => {
                this.logger.error(`Error getting tables: ${error.message}`);
                callback(error);
            });
        } catch (error) {
            callback(error);
        }
    }
    
    getTableData(tableName, limit = 50, offset = 0, callback) {
        this.logger.info(`Getting data from table: ${tableName}`);
        
        if (!this.database._session) {
            this.database.readNews(null, () => {
                this._getTableData(tableName, limit, offset, callback);
            });
        } else {
            this._getTableData(tableName, limit, offset, callback);
        }
    }
    
    _getTableData(tableName, limit, offset, callback) {
        try {
            const schemaName = this.database.getSchemaName ? this.database.getSchemaName() : 'UlmNewsFlash';
            const table = this.database._session.getSchema(schemaName).getTable(tableName);
            table.select().limit(limit).offset(offset).execute().then(result => {
                const rows = [];
                result.fetchAll().forEach(row => {
                    const rowData = {};
                    const columns = result.getColumns();
                    columns.forEach((column, index) => {
                        rowData[column.getColumnName()] = row[index];
                    });
                    rows.push(rowData);
                });
                
                callback(null, {
                    table: tableName,
                    rows: rows,
                    count: rows.length,
                    limit: limit,
                    offset: offset
                });
            }).catch(error => {
                callback(error);
            });
        } catch (error) {
            callback(error);
        }
    }
    
    getTableStructure(tableName, callback) {
        this.logger.info(`Getting structure for table: ${tableName}`);
        
        if (!this.database._session) {
            this.database.readNews(null, () => {
                this._getTableStructure(tableName, callback);
            });
        } else {
            this._getTableStructure(tableName, callback);
        }
    }
    
    _getTableStructure(tableName, callback) {
        try {
            const schemaName = this.database.getSchemaName ? this.database.getSchemaName() : 'UlmNewsFlash';
            // Use SQL to get column information
            this.database._session.sql(`
                SELECT 
                    COLUMN_NAME as name,
                    DATA_TYPE as type,
                    IS_NULLABLE as nullable,
                    COLUMN_DEFAULT as defaultValue,
                    COLUMN_KEY as key_type
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            `).bind(schemaName, tableName).execute().then(result => {
                const columns = [];
                result.fetchAll().forEach(row => {
                    columns.push({
                        name: row[0],
                        type: row[1],
                        nullable: row[2] === 'YES',
                        default: row[3],
                        key: row[4]
                    });
                });
                callback(null, columns);
            }).catch(error => {
                callback(error);
            });
        } catch (error) {
            callback(error);
        }
    }
    
    executeQuery(query, limit, callback) {
        this.logger.info(`Executing query: ${query.substring(0, 100)}...`);
        
        if (!this.database._session) {
            this.database.readNews(null, () => {
                this._executeQuery(query, limit, callback);
            });
        } else {
            this._executeQuery(query, limit, callback);
        }
    }
    
    _executeQuery(query, limit, callback) {
        try {
            // Add LIMIT if not present and limit is specified
            let finalQuery = query;
            if (limit && !query.toUpperCase().includes('LIMIT')) {
                finalQuery += ` LIMIT ${limit}`;
            }
            
            this.database._session.sql(finalQuery).execute().then(result => {
                const rows = [];
                const columns = result.getColumns();
                
                result.fetchAll().forEach(row => {
                    const rowData = {};
                    columns.forEach((column, index) => {
                        rowData[column.getColumnName()] = row[index];
                    });
                    rows.push(rowData);
                });
                
                callback(null, {
                    query: finalQuery,
                    rows: rows,
                    count: rows.length,
                    columns: columns.map(col => ({
                        name: col.getColumnName(),
                        type: col.getType()
                    }))
                });
            }).catch(error => {
                callback(error);
            });
        } catch (error) {
            callback(error);
        }
    }
}

function register({ express, mount, manifest, app, getConfig, logger }) {
    const mountPath = manifest?.route || `/${manifest?.name || 'database-viewer'}`;
    const enabled = manifest?.enabled !== false;

    if (!enabled) {
        logger.warn(`Plugin ${manifest?.name} ist deaktiviert - nicht gemountet`);
        return;
    }

    // Get singleton database connection
    const database = getDatabase(app);
    
    logger.info('Database Viewer plugin loaded');
    
    // Enhanced database service with more capabilities
    const dbService = new DatabaseService(database, logger);
    
    const router = express.Router();
    
    // Mount routes
    router.get('/tables', (_req, res) => {
        dbService.getTables((error, tables) => {
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }
            res.json({ tables });
        });
    });
    
    router.get('/table/:tableName', (req, res) => {
        const { tableName } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        dbService.getTableData(tableName, limit, offset, (error, data) => {
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }
            res.json(data);
        });
    });
    
    router.get('/table/:tableName/structure', (req, res) => {
        const { tableName } = req.params;
        
        dbService.getTableStructure(tableName, (error, structure) => {
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }
            res.json({ table: tableName, columns: structure });
        });
    });
    
    router.post('/query', (req, res) => {
        
        const { query, limit = 100 } = req.body;
        
        if (!query || typeof query !== 'string') {
            res.status(400).json({ error: 'Query is required' });
            return;
        }
        
        // Basic safety check - only allow SELECT queries
        const trimmedQuery = query.trim().toUpperCase();
        if (!trimmedQuery.startsWith('SELECT')) {
            res.status(403).json({ error: 'Only SELECT queries are allowed' });
            return;
        }
        
        dbService.executeQuery(query, limit, (error, result) => {
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }
            res.json(result);
        });
    });

    // Maintenance: run migrations
    router.post('/maintenance/migrate', async (_req, res) => {
        try {
            const changes = await database.runMigrations();
            res.json({ success: true, changes });
        } catch (error) {
            logger.error('Migration error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Maintenance: truncate scraping history
    router.post('/maintenance/truncate-history', async (_req, res) => {
        try {
            await new Promise(resolve => database.clearScrapingHistory(() => resolve()))
            res.json({ success: true, message: 'scraping_history cleared' });
        } catch (error) {
            logger.error('Truncate history error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // Serve the web interface
    router.get('/', (_req, res) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.send(generateWebInterface());
    });

    // List applied migrations
    router.get('/migrations', async (_req, res) => {
        try {
            const schemaName = database.getSchemaName ? database.getSchemaName() : 'UlmNewsFlash';
            await database.runMigrations(); // ensure table exists; does nothing if up-to-date
            const result = await database._session
                .sql(`SELECT version, description, applied_at FROM \`${schemaName}\`.\`schema_migrations\` ORDER BY applied_at DESC`)
                .execute();
            const rows = result.fetchAll().map(r => ({ version: r[0], description: r[1], applied_at: r[2] }));
            res.json({ success: true, rows });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    mount(mountPath, router);
    logger.success(`Database Viewer Plugin gemountet auf "${mountPath}"`);
}

module.exports = { register };

/**
 * Generate the web interface HTML
 */
function generateWebInterface() {
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NewsFlash Database Admin</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 1rem;
            margin-bottom: 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .header h1 {
            color: white;
            text-align: center;
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            color: rgba(255, 255, 255, 0.9);
            text-align: center;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        .tabs {
            display: flex;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 2rem;
        }
        
        .tab {
            flex: 1;
            padding: 1rem;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 1rem;
        }
        
        .tab:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .tab.active {
            background: rgba(255, 255, 255, 0.2);
            font-weight: bold;
        }
        
        .tab-content {
            display: none;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .tab-content.active {
            display: block;
        }
        
        .table-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .table-card {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1.5rem;
            border-radius: 10px;
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
            text-align: center;
        }
        
        .table-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
        }
        
        .table-card h3 {
            margin-bottom: 0.5rem;
            font-size: 1.2rem;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .data-table th {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
        }
        
        .data-table td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #eee;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .data-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .data-table tr:hover {
            background: #e3f2fd;
        }
        
        .query-form {
            margin-bottom: 2rem;
        }
        
        .query-textarea {
            width: 100%;
            min-height: 150px;
            padding: 1rem;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            resize: vertical;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s;
            margin-top: 1rem;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .pagination button {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .pagination button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .loading {
            text-align: center;
            padding: 2rem;
            color: #666;
        }
        
        .error {
            background: #fee;
            color: #c00;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border-left: 4px solid #c00;
        }
        
        .success {
            background: #efe;
            color: #060;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border-left: 4px solid #060;
        }
        
        .table-info {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .column-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .column-card {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🗄️ NewsFlash Database Admin</h1>
        <p>Datenbank-Verwaltungsinterface zum Anzeigen und Durchsuchen der Tabellen</p>
    </div>
    
    <div class="container">
        <div class="tabs">
            <button class="tab active" onclick="showTab('tables')">Tabellen</button>
            <button class="tab" onclick="showTab('query')">SQL Query</button>
            <button class="tab" onclick="showTab('maintenance')">Wartung</button>
        </div>
        
        <div id="tables-tab" class="tab-content active">
            <h2>Verfügbare Tabellen</h2>
            <div id="tables-list" class="loading">Lade Tabellen...</div>
            
            <div id="table-data" style="display: none;">
                <div id="table-info"></div>
                <div id="table-content"></div>
                <div id="pagination"></div>
            </div>
        </div>
        
        <div id="query-tab" class="tab-content">
            <h2>SQL Query Ausführen</h2>
            <div class="query-form">
                <textarea id="query-input" class="query-textarea" placeholder="SELECT * FROM news LIMIT 10;"></textarea>
                <button class="btn" onclick="executeQuery()">Query Ausführen</button>
            </div>
            <div id="query-results"></div>
        </div>

        <div id="maintenance-tab" class="tab-content">
            <h2>Datenbank Wartung</h2>
            <div id="maint-messages"></div>
            <div class="query-form">
                <button class="btn" onclick="runMigrations()">Migration ausführen</button>
                <button class="btn" style="margin-left: .5rem; background: #444" onclick="truncateHistory()">History leeren</button>
                <button class="btn" style="margin-left: .5rem; background: #2c3e50" onclick="loadMigrations()">Migrationsliste</button>
            </div>
            <div id="maint-results" class="table-info"></div>
            <div id="migrations-list" class="table-info" style="margin-top:1rem;"></div>
        </div>
    </div>
    
    <script>
        let currentTable = null;
        let currentOffset = 0;
        const limit = 50;
        
        // Load tables on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadTables();
        });
        
        function showTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab
            document.getElementById(tabName + '-tab').classList.add('active');
            event.target.classList.add('active');
        }
        
        async function loadTables() {
            try {
                const response = await fetch('/api/db-admin/tables');
                const data = await response.json();
                
                if (data.error) {
                    document.getElementById('tables-list').innerHTML = '<div class="error">Fehler: ' + data.error + '</div>';
                    return;
                }
                
                const tablesList = document.getElementById('tables-list');
                tablesList.innerHTML = '';
                tablesList.className = 'table-list';
                
                data.tables.forEach(table => {
                    const card = document.createElement('div');
                    card.className = 'table-card';
                    card.innerHTML = '<h3>' + table + '</h3><p>Klicken zum Anzeigen</p>';
                    card.onclick = () => loadTableData(table);
                    tablesList.appendChild(card);
                });
                
            } catch (error) {
                document.getElementById('tables-list').innerHTML = '<div class="error">Fehler beim Laden der Tabellen: ' + error.message + '</div>';
            }
        }
        
        async function loadTableData(tableName, offset = 0) {
            currentTable = tableName;
            currentOffset = offset;
            
            const tableData = document.getElementById('table-data');
            const tableContent = document.getElementById('table-content');
            const tableInfo = document.getElementById('table-info');
            
            tableContent.innerHTML = '<div class="loading">Lade Daten...</div>';
            tableData.style.display = 'block';
            
            try {
                // Load table structure and data in parallel
                const [structureResponse, dataResponse] = await Promise.all([
                    fetch('/api/db-admin/table/' + tableName + '/structure'),
                    fetch('/api/db-admin/table/' + tableName + '?limit=' + limit + '&offset=' + offset)
                ]);
                
                const structure = await structureResponse.json();
                const data = await dataResponse.json();
                
                if (structure.error || data.error) {
                    tableContent.innerHTML = '<div class="error">Fehler: ' + (structure.error || data.error) + '</div>';
                    return;
                }
                
                // Display table info
                tableInfo.innerHTML = '<div class="table-info"><h3>' + tableName + '</h3>' +
                    '<p><strong>Spalten:</strong> ' + structure.columns.length + ' | ' +
                    '<strong>Angezeigte Zeilen:</strong> ' + data.count + ' (ab Zeile ' + (offset + 1) + ')</p>' +
                    '<div class="column-info">' +
                    structure.columns.map(col => 
                        '<div class="column-card">' +
                        '<strong>' + col.name + '</strong><br>' +
                        'Typ: ' + col.type + '<br>' +
                        (col.nullable ? 'NULL erlaubt' : 'NOT NULL') +
                        (col.key ? '<br>Key: ' + col.key : '') +
                        '</div>'
                    ).join('') +
                    '</div></div>';
                
                // Display table data
                if (data.rows.length === 0) {
                    tableContent.innerHTML = '<p>Keine Daten in dieser Tabelle.</p>';
                    return;
                }
                
                let html = '<table class="data-table"><thead><tr>';
                const columns = Object.keys(data.rows[0]);
                columns.forEach(col => {
                    html += '<th>' + col + '</th>';
                });
                html += '</tr></thead><tbody>';
                
                data.rows.forEach(row => {
                    html += '<tr>';
                    columns.forEach(col => {
                        let value = row[col];
                        if (value === null) value = '<em>NULL</em>';
                        else if (typeof value === 'object') value = JSON.stringify(value);
                        else if (typeof value === 'string' && value.length > 50) {
                            value = value.substring(0, 47) + '...';
                        }
                        html += '<td title="' + (row[col] || '') + '">' + value + '</td>';
                    });
                    html += '</tr>';
                });
                
                html += '</tbody></table>';
                tableContent.innerHTML = html;
                
                // Update pagination
                updatePagination(data.count);
                
            } catch (error) {
                tableContent.innerHTML = '<div class="error">Fehler beim Laden der Daten: ' + error.message + '</div>';
            }
        }
        
        function updatePagination(count) {
            const pagination = document.getElementById('pagination');
            
            let html = '<div class="pagination">';
            
            // Previous button
            if (currentOffset > 0) {
                html += '<button onclick="loadTableData(\\''+currentTable+'\\', ' + Math.max(0, currentOffset - limit) + ')">← Vorherige</button>';
            } else {
                html += '<button disabled>← Vorherige</button>';
            }
            
            html += '<span>Zeilen ' + (currentOffset + 1) + '-' + (currentOffset + count) + '</span>';
            
            // Next button
            if (count === limit) {
                html += '<button onclick="loadTableData(\\''+currentTable+'\\', ' + (currentOffset + limit) + ')">Nächste →</button>';
            } else {
                html += '<button disabled>Nächste →</button>';
            }
            
            html += '</div>';
            pagination.innerHTML = html;
        }
        
        async function executeQuery() {
            const query = document.getElementById('query-input').value.trim();
            const results = document.getElementById('query-results');
            
            if (!query) {
                results.innerHTML = '<div class="error">Bitte geben Sie eine SQL-Query ein.</div>';
                return;
            }
            
            results.innerHTML = '<div class="loading">Führe Query aus...</div>';
            
            try {
                const response = await fetch('/api/db-admin/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: query, limit: 100 })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    results.innerHTML = '<div class="error">Fehler: ' + data.error + '</div>';
                    return;
                }
                
                if (data.rows.length === 0) {
                    results.innerHTML = '<div class="success">Query erfolgreich ausgeführt. Keine Ergebnisse zurückgegeben.</div>';
                    return;
                }
                
                let html = '<div class="success">Query erfolgreich ausgeführt. ' + data.count + ' Zeilen zurückgegeben.</div>';
                html += '<table class="data-table"><thead><tr>';
                
                data.columns.forEach(col => {
                    html += '<th>' + col.name + '</th>';
                });
                html += '</tr></thead><tbody>';
                
                data.rows.forEach(row => {
                    html += '<tr>';
                    data.columns.forEach(col => {
                        let value = row[col.name];
                        if (value === null) value = '<em>NULL</em>';
                        else if (typeof value === 'object') value = JSON.stringify(value);
                        else if (typeof value === 'string' && value.length > 100) {
                            value = value.substring(0, 97) + '...';
                        }
                        html += '<td title="' + (row[col.name] || '') + '">' + value + '</td>';
                    });
                    html += '</tr>';
                });
                
                html += '</tbody></table>';
                results.innerHTML = html;
                
            } catch (error) {
                results.innerHTML = '<div class="error">Fehler beim Ausführen der Query: ' + error.message + '</div>';
            }
        }

        async function runMigrations() {
            const msg = document.getElementById('maint-messages');
            const resBox = document.getElementById('maint-results');
            msg.innerHTML = '<div class="loading">Starte Migration…</div>';
            resBox.innerHTML = '';
            try {
                const response = await fetch('/api/db-admin/maintenance/migrate', { method: 'POST' });
                const data = await response.json();
                if (!data.success) throw new Error(data.error || 'Migration fehlgeschlagen');
                msg.innerHTML = '<div class="success">Migration erfolgreich</div>';
                resBox.innerHTML = '<ul>' + data.changes.map(c => '<li>' + c + '</li>').join('') + '</ul>';
            } catch (e) {
                msg.innerHTML = '<div class="error">' + e.message + '</div>';
            }
        }

        async function truncateHistory() {
            const msg = document.getElementById('maint-messages');
            msg.innerHTML = '<div class="loading">Leere History…</div>';
            try {
                const response = await fetch('/api/db-admin/maintenance/truncate-history', { method: 'POST' });
                const data = await response.json();
                if (!data.success) throw new Error(data.error || 'Löschen fehlgeschlagen');
                msg.innerHTML = '<div class="success">History geleert</div>';
            } catch (e) {
                msg.innerHTML = '<div class="error">' + e.message + '</div>';
            }
        }

        async function loadMigrations() {
            const box = document.getElementById('migrations-list');
            box.innerHTML = '<div class="loading">Lade Migrationshistorie…</div>';
            try {
                const response = await fetch('/api/db-admin/migrations');
                const data = await response.json();
                if (!data.success) throw new Error(data.error || 'Laden fehlgeschlagen');
                if (!data.rows.length) { box.innerHTML = '<div>Keine Migrationen angewendet.</div>'; return; }
                let html = '<h3 style="margin-bottom:.5rem">Angewendete Migrationen</h3><table class="data-table"><thead><tr><th>Version</th><th>Beschreibung</th><th>Applied At</th></tr></thead><tbody>';
                data.rows.forEach(r => {
                    const ts = r.applied_at ? new Date(Number(r.applied_at)).toLocaleString('de-DE') : '';
                    html += '<tr><td>' + r.version + '</td><td>' + (r.description || '') + '</td><td>' + ts + '</td></tr>';
                });
                html += '</tbody></table>';
                box.innerHTML = html;
            } catch (e) {
                box.innerHTML = '<div class="error">' + e.message + '</div>';
            }
        }
    </script>
</body>
</html>`;
}
