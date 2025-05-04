const mysql = require('mysql2/promise');

async function createDbConnection() {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '416511',
      database: 'YuexuanLu_161034_DB'
    });
    console.log('Connected to MySQL database!');
    return conn;
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
}

module.exports = createDbConnection();