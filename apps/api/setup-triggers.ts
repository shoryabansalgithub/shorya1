import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('Connecting to MySQL directly...');
  // Parse DATABASE_URL
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }
  
  const connection = await mysql.createConnection(url);

  console.log('Setting up LedgerTransaction immutability triggers...');

  try {
    // Drop them if they exist
    await connection.query(`DROP TRIGGER IF EXISTS prevent_ledger_update;`);
    await connection.query(`DROP TRIGGER IF EXISTS prevent_ledger_delete;`);

    // Create Update Trigger
    await connection.query(`
      CREATE TRIGGER prevent_ledger_update
      BEFORE UPDATE ON LedgerTransaction
      FOR EACH ROW
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ledger records are strictly immutable.';
    `);
    console.log('Update trigger created successfully.');

    // Create Delete Trigger
    await connection.query(`
      CREATE TRIGGER prevent_ledger_delete
      BEFORE DELETE ON LedgerTransaction
      FOR EACH ROW
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ledger records are strictly immutable.';
    `);
    console.log('Delete trigger created successfully.');

  } catch (error) {
    console.error('Failed to setup triggers:', error);
  } finally {
    await connection.end();
  }
}

main();
