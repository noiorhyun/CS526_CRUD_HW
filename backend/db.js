const mysql = require('mysql2/promise');

async function createDbConnection() {
  try {
    // Create a new connection with the specified configuration
    const conn = await mysql.createConnection({
      host: '127.0.0.1', 
      user: 'root',          
      password: '416511',     
      database: 'YuexuanLu_161034_DB'  
    });
    
    // Log successful connection
    console.log('Connected to MySQL database!');
    return conn;
  } catch (err) {
    // Log connection error and exit the process
    console.error('Error connecting to MySQL:', err);
    process.exit(1);  // Exit with error code 1
  }
}

module.exports = createDbConnection();