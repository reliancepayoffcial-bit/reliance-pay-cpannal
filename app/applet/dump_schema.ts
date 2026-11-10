import Database from 'better-sqlite3';
const db = new Database('reliance_pay.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
for (const table of tables as any[]) {
  console.log(`--- Table: ${table.name} ---`);
  const schema = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${table.name}'`).get() as any;
  console.log(schema?.sql);
  console.log('\n');
}
