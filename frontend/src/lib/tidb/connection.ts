/**
 * TiDB Cloud Connection
 * 
 * Uses @tidbcloud/serverless for edge-compatible, connection-pooled access
 * Supports both serverless functions and traditional pooled connections
 */

import { connect } from '@tidbcloud/serverless'

// Validate required environment variables
function validateEnv() {
  const required = ['TIDB_HOST', 'TIDB_USER', 'TIDB_PASSWORD', 'TIDB_DATABASE']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing TiDB environment variables: ${missing.join(', ')}`)
  }
}

// Serverless connection (for Vercel Edge Functions)
let serverlessConnection: ReturnType<typeof connect> | null = null

export function getTiDBConnection() {
  if (!serverlessConnection) {
    validateEnv()
    
    serverlessConnection = connect({
      host: process.env.TIDB_HOST!,
      username: process.env.TIDB_USER!,
      password: process.env.TIDB_PASSWORD!,
      database: process.env.TIDB_DATABASE!,
    })
  }
  
  return serverlessConnection
}

// Alias for convenience
export const tidb = {
  /**
   * Execute a SQL query
   * @param sql - SQL query string with ? placeholders
   * @param params - Array of parameters
   */
  async execute<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    const conn = getTiDBConnection()
    const result = await conn.execute(sql, params)
    return result as T[]
  },
  
  /**
   * Execute a single query and return first result
   */
  async queryOne<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
    const results = await this.execute<T>(sql, params)
    return results[0] || null
  },
  
  /**
   * Execute a query and return affected rows count
   */
  async executeUpdate(sql: string, params: unknown[] = []): Promise<number> {
    const conn = getTiDBConnection()
    const result = await conn.execute(sql, params) as { affectedRows?: number }
    return result.affectedRows || 0
  }
}

// Types for TiDB results
export interface TiDBResult {
  affectedRows: number
  insertId: number
}

// Connection health check
export async function checkTiDBConnection(): Promise<boolean> {
  try {
    await tidb.execute('SELECT 1 as health')
    return true
  } catch (error) {
    console.error('TiDB connection failed:', error)
    return false
  }
}
