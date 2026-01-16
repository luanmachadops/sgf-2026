const { Client } = require('pg');

const connectionStrings = [
  // Transaction pooler (porta 6543)
  'postgresql://postgres.ghvbydtytdxdgviuunvm:xNpQnqr81FAh9Lnl@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
  // Session pooler (porta 5432)  
  'postgresql://postgres.ghvbydtytdxdgviuunvm:xNpQnqr81FAh9Lnl@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
  // Direct connection
  'postgresql://postgres:xNpQnqr81FAh9Lnl@db.ghvbydtytdxdgviuunvm.supabase.co:5432/postgres',
  // Port 6543 com postgres simples
  'postgresql://postgres:xNpQnqr81FAh9Lnl@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
  // Port 5432 com postgres simples
  'postgresql://postgres:xNpQnqr81FAh9Lnl@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
];

async function testConnection(connString, index) {
  const client = new Client({ connectionString: connString, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    const result = await client.query('SELECT current_user, current_database(), version()');
    console.log(`\n✅ SUCESSO - Config ${index + 1}:`);
    console.log(`Connection string: ${connString.substring(0, 50)}...`);
    console.log('Resultado:', result.rows[0]);
    await client.end();
    return true;
  } catch (error) {
    console.log(`\n❌ FALHOU - Config ${index + 1}: ${error.message}`);
    try { await client.end(); } catch {}
    return false;
  }
}

(async () => {
  console.log('Testando conexões com Supabase...\n');
  for (let i = 0; i < connectionStrings.length; i++) {
    const success = await testConnection(connectionStrings[i], i);
    if (success) {
      console.log('\n🎉 Encontramos a configuração correta!');
      process.exit(0);
    }
  }
  console.log('\n⚠️  Nenhuma configuração funcionou.');
  process.exit(1);
})();
