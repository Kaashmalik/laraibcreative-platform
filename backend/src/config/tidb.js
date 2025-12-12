/**
 * TiDB Cloud Database Configuration
 * 
 * MySQL-compatible connection for Products, Orders, Analytics
 * Uses mysql2 driver with connection pooling
 * 
 * @module config/tidb
 */

const mysql = require('mysql2/promise');

let pool = null;

/**
 * TiDB connection configuration
 */
const getTiDBConfig = () => {
  // TiDB Cloud connection string format:
  // mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}
  
  const config = {
    host: process.env.TIDB_HOST,
    port: parseInt(process.env.TIDB_PORT || '4000'),
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE || 'laraibcreative',
    ssl: {
      rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
  };
  
  return config;
};

/**
 * Initialize TiDB connection pool
 */
const initTiDB = async () => {
  if (pool) {
    console.log('✅ TiDB: Using existing connection pool');
    return pool;
  }
  
  try {
    // Check if TiDB is configured
    if (!process.env.TIDB_HOST) {
      console.log('⚠️  TiDB: Not configured (TIDB_HOST missing)');
      return null;
    }
    
    console.log('🔌 TiDB: Connecting to TiDB Cloud...');
    console.log(`📍 Host: ${process.env.TIDB_HOST}`);
    console.log(`💾 Database: ${process.env.TIDB_DATABASE || 'laraibcreative'}`);
    
    pool = mysql.createPool(getTiDBConfig());
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ TiDB: Connected successfully');
    
    // Check database exists
    const [rows] = await connection.query('SELECT DATABASE() as db');
    console.log(`📊 TiDB: Using database "${rows[0].db}"`);
    
    connection.release();
    
    return pool;
    
  } catch (error) {
    console.error('❌ TiDB Connection Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Check if TiDB Cloud cluster is running');
    }
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   💡 Check username and password in .env');
    }
    
    return null;
  }
};

/**
 * Get TiDB connection pool
 */
const getTiDB = () => {
  if (!pool) {
    throw new Error('TiDB not initialized. Call initTiDB() first.');
  }
  return pool;
};

/**
 * Execute a query on TiDB
 */
const query = async (sql, params = []) => {
  const db = getTiDB();
  const [results] = await db.execute(sql, params);
  return results;
};

/**
 * Get a single row
 */
const queryOne = async (sql, params = []) => {
  const results = await query(sql, params);
  return results[0] || null;
};

/**
 * Close TiDB connection pool
 */
const closeTiDB = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ TiDB: Connection pool closed');
  }
};

/**
 * Check TiDB connection status
 */
const getTiDBStatus = async () => {
  try {
    if (!pool) {
      return { connected: false, message: 'Not initialized' };
    }
    
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 as test');
    connection.release();
    
    return {
      connected: true,
      message: 'Connected to TiDB Cloud',
      host: process.env.TIDB_HOST,
      database: process.env.TIDB_DATABASE
    };
  } catch (error) {
    return {
      connected: false,
      message: error.message
    };
  }
};

module.exports = {
  initTiDB,
  getTiDB,
  query,
  queryOne,
  closeTiDB,
  getTiDBStatus
};
