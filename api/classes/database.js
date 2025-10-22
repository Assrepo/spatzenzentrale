//var mysql = require('mysql');
var mysqlx = require('@mysql/xdevapi');
var process = require('node:process');

// Database configuration
const dbConfig = {
    user: process.env.DB_USER || 'newsflash',
    password: process.env.DB_PASSWORD || '88C!I13vR1fq',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '33060', 10),
    schema: process.env.DB_SCHEMA || 'UlmNewsFlash'
};

/**
 * Connects to the database and provides the session object as a starting point for any databaes manipulation
 * 
 * @returns a promise when creating the session will finish
 */
function connect() {
    return mysqlx.getSession({
        user: dbConfig.user,
        password: dbConfig.password,
        host: dbConfig.host,
        port: dbConfig.port
    });
}

//Public
module.exports = Database;
function Database() {
    // Private properties
    this._session = null;

    // Listen for exit of the application to shut down the database connection
    process.on('exit', (code) => {
        if (this._session) {
            this._session.close();
            console.log('Database connection closed due to the end signal with code: ', code);
        }
    });

    // Initialize database tables on startup
    this.initializeTables();
}

/**
 * Get configured schema name (from env or default)
 */
Database.prototype.getSchemaName = function getSchemaName() {
    return dbConfig.schema;
}

/**
 * Reads available news from the database with the selection provided by the queryColumns
 * 
 * @param {*} queryColumns The columsn with the respective information for the query
 * @param {*} callback The callback function which should receive the result
 */
Database.prototype.readNews = function readNews(queryColumns, callback) {
    if (!this._session) {
        connect().then(session => {
            this._session = session;
            // Check if there are query columns provided. If not, then an select all is requested
            if (queryColumns) {
                executeSelectStatementWhere("news", prepareReadNewsQuery(queryColumns), session, callback);
            } else {
                executeSelectStatementAll("news", session, callback);
            }
        });
    } else {
        // Check if there are query columns provided. If not, then an select all is requested
        if (queryColumns) {
            executeSelectStatementWhere("news", prepareReadNewsQuery(queryColumns), this._session, callback);
        } else {
            executeSelectStatementAll("news", this._session, callback);
        }
    }
};

/**
 * Checks if there are any new news entries
 * TODO: Take care of any other querycolumns
 * 
 * @param {*} differenceTimestamp the timestamp as long, as starting point to search for new news
 * @param {*} callback the callback method to call when the query finished
 */
Database.prototype.getDifferencesFrom = function getDifferencesFrom(differenceTimestamp, callback) {
    let query = "created >= " + differenceTimestamp;
    if (!this._session) {
        connect().then(session => {
            this._session = session;
            executeSelectStatementWhere("news", query, session, callback);
        });
    } else {
        executeSelectStatementWhere("news", query, this._session, callback);
    }
}

/**
 * Prepares a query which should be executed against the dbms
 * 
 * @param {*} queryColumns The columsn with the respective information for the query
 */
function prepareReadNewsQuery(queryColumns) {
    // Create the correct date time string for quering the database
    let preparedDate = queryColumns.date.replace(/(.*)\.(.*)\.(.*)/, '$3-$2-$1');
    preparedDate = preparedDate + "T00:00:00.000Z";
    let publishDate = new Date(preparedDate);

    // Create the sql query and return the value for accessing the database
    return "title = '" + queryColumns.title + "' AND publishDate = " + publishDate.getTime();
}

/**
 * Executes a select with the provided statement on the provided table
 * 
 * @param {*} table The name of the table which should be queried
 * @param {*} statement The statement which should be executed
 * @param {*} session The session to the database system to execute the query
 * @param {*} callback The callback function which should receive the result
 */
function executeSelectStatementWhere(table, statement, session, callback) {
    var table = session.getSchema(dbConfig.schema).getTable(table);
    table.select().where(statement).execute().then(result => {
        callback(result);
    });
}

/**
 * 
 * @param {*} table 
 * @param {*} session 
 * @param {*} callback 
 */
function executeSelectStatementAll(table, session, callback) {
    var table = session.getSchema(dbConfig.schema).getTable(table);
    table.select().execute().then(result => {
        callback(result);
    });
}

/**
 * Executes a select with limit on the provided table
 * 
 * @param {*} table The name of the table which should be queried
 * @param {*} limit Maximum number of rows to return
 * @param {*} session The session to the database system to execute the query
 * @param {*} callback The callback function which should receive the result
 */
function executeSelectStatementAllWithLimit(table, limit, session, callback) {
    var table = session.getSchema(dbConfig.schema).getTable(table);
    table.select().orderBy('timestamp DESC').limit(limit).execute().then(result => {
        callback(result);
    });
}

/**
 * Executes the insert statement into the provided table with the provided record information
 * 
 * @param {*} table The name of the table where the insert should be performed
 * @param {*} record The information of the record which should be inserted
 * @param {*} session The session to the database system to execute the query
 * @param {*} callback The callback function which should receive the result
 */
function executeInsertStatement(table, record, session, callback) {
    var table = session.getSchema(dbConfig.schema).getTable(table);
    // Fix deprecation warning by using column names and values arrays
    const columns = Object.keys(record);
    const values = Object.values(record);
    table.insert(columns).values(values).execute().then(result => {
        // Callback is not necessary. If the result is not of interest of the insert statement, then simply pass no callback
        if (callback) {
            callback(result);
        }
    });
}

/**
 * Writes a new news to the database
 * 
 * @param {*} record The record/news which should be written. Currently an object of keys as column names and values as the value for the column
 * @param {*} callback The callback function which should be called when the insert statement finished (regardless if successful or errorneous)
 */
Database.prototype.writeNews = function writeNews(record, callback) {
    if (!this._session) {
        connect().then(session => {
            this._session = session;
            executeInsertStatement("news", record, session, callback);
        });
    } else {
        executeInsertStatement("news", record, this._session, callback);
    }
}

/**
 * Writes a scraping history entry to the database
 * 
 * @param {*} record The history record to be written
 * @param {*} callback The callback function which should be called when the insert statement finished
 */
Database.prototype.writeScrapingHistory = function writeScrapingHistory(record, callback) {
    if (!this._session) {
        connect().then(session => {
            this._session = session;
            executeInsertStatement("scraping_history", record, session, callback);
        });
    } else {
        executeInsertStatement("scraping_history", record, this._session, callback);
    }
}

/**
 * Reads scraping history from the database
 * 
 * @param {*} limit Maximum number of entries to return
 * @param {*} callback The callback function which should receive the result
 */
Database.prototype.readScrapingHistory = function readScrapingHistory(limit = 10, callback) {
    if (!this._session) {
        connect().then(session => {
            this._session = session;
            executeSelectStatementAllWithLimit("scraping_history", limit, session, callback);
        });
    } else {
        executeSelectStatementAllWithLimit("scraping_history", limit, this._session, callback);
    }
}

/**
 * Clear all scraping history entries
 *
 * @param {*} callback The callback function which should receive the result
 */
Database.prototype.clearScrapingHistory = function clearScrapingHistory(callback) {
    if (!this._session) {
        connect().then(session => {
            this._session = session;
            this.clearScrapingHistory(callback);
        });
        return;
    }

    const schema = this._session.getSchema(dbConfig.schema);
    const table = schema.getTable('scraping_history');

    // Try fast TRUNCATE first
    this._session.sql(`TRUNCATE TABLE \`${dbConfig.schema}\`.\`scraping_history\``)
        .execute()
        .then(() => {
            callback && callback({ deleted: 0 });
        })
        .catch((_truncateErr) => {
            // Fallback to delete with where(true)
            table.delete()
                .where('true')
                .execute()
                .then(result => {
                    const affected = typeof result.getAffectedItemsCount === 'function' ? result.getAffectedItemsCount() : 0;
                    callback && callback({ deleted: affected });
                })
                .catch(error => {
                    console.error('Error clearing scraping_history:', error);
                    // Final fallback via raw SQL
                    this._session.sql(`DELETE FROM \`${dbConfig.schema}\`.\`scraping_history\` WHERE 1`)
                        .execute()
                        .then(() => callback && callback({ deleted: 0 }))
                        .catch(err2 => {
                            console.error('Fallback SQL delete failed:', err2);
                            callback && callback({ error });
                        });
                });
        });
}

/**
 * Run database migrations/normalizations
 */
Database.prototype.runMigrations = async function runMigrations() {
    if (!this._session) {
        this._session = await connect();
    }
    const { runMigrations } = require('./migrations');
    return runMigrations(this._session, console, dbConfig.schema);
}

/**
 * Initialize required database tables
 */
Database.prototype.initializeTables = async function initializeTables() {
    try {
        if (!this._session) {
            this._session = await connect();
        }
        
        await this.createScrapingHistoryTable();
        await this.initializeQRProxyTable();
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.warn('Failed to initialize database tables:', error.message);
    }
}

/**
 * Create scraping_logs table if it doesn't exist
 */
Database.prototype.createScrapingHistoryTable = async function createScrapingHistoryTable() {
    try {
        const schema = this._session.getSchema(dbConfig.schema);
        
        // Check if table exists
        const tables = await schema.getTables();
        const tableExists = tables.some(table => table.getName() === 'scraping_history');
        
        if (!tableExists) {
            console.log('Creating scraping_history table...');
            
            // Create table using SQL
            await this._session.sql(`
                CREATE TABLE \`${dbConfig.schema}\`.\`scraping_history\` (
                    id VARCHAR(36) PRIMARY KEY,
                    timestamp BIGINT NOT NULL,
                    method VARCHAR(50) NOT NULL,
                    chatbotId VARCHAR(100),
                    question TEXT,
                    newsCount INT DEFAULT 0,
                    saved INT DEFAULT 0,
                    status VARCHAR(20) DEFAULT 'success',
                    error TEXT,
                    newsData JSON,
                    INDEX idx_timestamp (timestamp),
                    INDEX idx_method (method),
                    INDEX idx_status (status)
                )
            `).execute();
            
            console.log('scraping_history table created successfully');
        } else {
            console.log('scraping_history table already exists');
        }
    } catch (error) {
        console.error('Failed to create scraping_history table:', error.message);
        throw error;
    }
}

/**
 * Initialize QR codes table
 */
Database.prototype.initializeQRProxyTable = async function() {
    try {
        const schema = this._session.getSchema(dbConfig.schema);
        
        // Check if table exists
        const tables = await schema.getTables();
        const tableExists = tables.some(table => table.getName() === 'qr_proxy');
        
        if (!tableExists) {
            console.log('Creating qr_proxy table...');
            
            // Create table using SQL
            await this._session.sql(`
                CREATE TABLE \`${dbConfig.schema}\`.\`qr_proxy\` (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    target_url TEXT NOT NULL,
                    proxy_url TEXT NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    click_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_is_active (is_active),
                    INDEX idx_created_at (created_at),
                    INDEX idx_click_count (click_count)
                )
            `).execute();
            
            console.log('qr_proxy table created successfully');
        } else {
            console.log('qr_proxy table already exists');
        }
    } catch (error) {
        console.error('Failed to create qr_proxy table:', error.message);
        throw error;
    }
}

/**
 * Create a new QR-Code Proxy entry
 */
Database.prototype.createQRProxy = function(qrData, callback) {
    if (!this._session) {
        connect().then(session => {
            this._session = session;
            this.createQRProxy(qrData, callback);
        });
        return;
    }

    const schema = this._session.getSchema(dbConfig.schema);
    const table = schema.getTable('qr_proxy');

    table.insert([
        'id', 'name', 'description', 'target_url', 'proxy_url', 'is_active', 'click_count'
    ]).values([
        qrData.id, qrData.name, qrData.description, qrData.targetUrl, qrData.proxyUrl, 
        qrData.isActive, qrData.clickCount || 0
    ]).execute()
    .then(result => {
        callback(null, qrData);
    })
    .catch(error => {
        console.error('Error creating QR-Code Proxy:', error);
        callback(error, null);
    });
}

/**
 * Read all QR-Code Proxy entries
 */
Database.prototype.readQRProxies = function(callback) {
    if (!this._session) {
        connect().then(session => {
            this._session = session;
            this.readQRProxies(callback);
        });
        return;
    }

    const schema = this._session.getSchema(dbConfig.schema);
    const table = schema.getTable('qr_proxy');

    table.select()
        .orderBy('created_at DESC')
        .execute()
    .then(result => {
        const qrCodes = result.fetchAll().map(row => ({
            id: row[0],
            name: row[1],
            description: row[2],
            targetUrl: row[3],
            proxyUrl: row[4],
            isActive: row[5],
            clickCount: row[6],
            createdAt: row[7] ? new Date(row[7]).toISOString() : new Date().toISOString(),
            updatedAt: row[8] ? new Date(row[8]).toISOString() : new Date().toISOString()
        }));
        callback(null, qrCodes);
    })
    .catch(error => {
        console.error('Error reading QR-Code Proxies:', error);
        callback(error, null);
    });
}

/**
 * Read a single QR-Code Proxy entry by ID
 */
Database.prototype.readQRProxy = function(id, callback) {
    if (!this._session) {
        connect().then(session => {
            this._session = session;
            this.readQRProxy(id, callback);
        });
        return;
    }

    const schema = this._session.getSchema(dbConfig.schema);
    const table = schema.getTable('qr_proxy');

    table.select()
        .where('id = :id')
        .bind('id', id)
        .execute()
    .then(result => {
        const rows = result.fetchAll();
        if (rows.length === 0) {
            callback(new Error('QR-Code not found'), null);
            return;
        }
        
        const row = rows[0];
        const qrCode = {
            id: row[0],
            name: row[1],
            description: row[2],
            targetUrl: row[3],
            proxyUrl: row[4],
            isActive: row[5],
            clickCount: row[6],
            createdAt: row[7] ? new Date(row[7]).toISOString() : new Date().toISOString(),
            updatedAt: row[8] ? new Date(row[8]).toISOString() : new Date().toISOString()
        };
        callback(null, qrCode);
    })
    .catch(error => {
        console.error('Error reading QR-Code Proxy:', error);
        callback(error, null);
    });
}

/**
 * Update a QR-Code Proxy entry
 */
Database.prototype.updateQRProxy = function(id, updateData, callback) {
    if (!this._session) {
        connect().then(session => {
            this._session = session;
            this.updateQRProxy(id, updateData, callback);
        });
        return;
    }

    const schema = this._session.getSchema(dbConfig.schema);
    const table = schema.getTable('qr_proxy');

    let updateQuery = table.update();
    
    if (updateData.name !== undefined) updateQuery = updateQuery.set('name', updateData.name);
    if (updateData.description !== undefined) updateQuery = updateQuery.set('description', updateData.description);
    if (updateData.targetUrl !== undefined) updateQuery = updateQuery.set('target_url', updateData.targetUrl);
    if (updateData.isActive !== undefined) updateQuery = updateQuery.set('is_active', updateData.isActive);
    if (updateData.clickCount !== undefined) updateQuery = updateQuery.set('click_count', updateData.clickCount);

    updateQuery.where('id = :id')
        .bind('id', id)
        .execute()
    .then(result => {
        if (result.getAffectedItemsCount() === 0) {
            callback(new Error('QR-Code not found'), null);
            return;
        }
        
        // Read updated record
        this.readQRProxy(id, callback);
    })
    .catch(error => {
        console.error('Error updating QR-Code Proxy:', error);
        callback(error, null);
    });
}

/**
 * Delete a QR-Code Proxy entry
 */
Database.prototype.deleteQRProxy = function(id, callback) {
    if (!this._session) {
        connect().then(session => {
            this._session = session;
            this.deleteQRProxy(id, callback);
        });
        return;
    }

    const schema = this._session.getSchema(dbConfig.schema);
    const table = schema.getTable('qr_proxy');

    table.delete()
        .where('id = :id')
        .bind('id', id)
        .execute()
    .then(result => {
        if (result.getAffectedItemsCount() === 0) {
            callback(new Error('QR-Code not found'), null);
            return;
        }
        callback(null, { success: true });
    })
    .catch(error => {
        console.error('Error deleting QR-Code Proxy:', error);
        callback(error, null);
    });
}

/**
 * Increment click count for a QR-Code Proxy
 */
Database.prototype.incrementQRProxyClicks = function(id, callback) {
    if (!this._session) {
        connect().then(session => {
            this._session = session;
            this.incrementQRProxyClicks(id, callback);
        });
        return;
    }

    const schema = this._session.getSchema(dbConfig.schema);
    const table = schema.getTable('qr_proxy');

    table.update()
        .set('click_count', mysqlx.expr('click_count + 1'))
        .where('id = :id')
        .bind('id', id)
        .execute()
    .then(result => {
        callback(null, { success: true, affectedRows: result.getAffectedItemsCount() });
    })
    .catch(error => {
        console.error('Error incrementing QR-Code Proxy clicks:', error);
        callback(error, null);
    });
}
