require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidos no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function migrateUsers() {
    console.log('🔄 Migrando usuários para Supabase Auth...\n');

    try {
        // 1. Buscar todos os usuários do painel
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*');

        if (usersError) {
            throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
        }

        console.log(`📋 Encontrados ${users.length} usuários do painel\n`);

        // 2. Criar usuários no Supabase Auth
        for (const user of users) {
            console.log(`  Criando: ${user.email}...`);

            const { data, error } = await supabase.auth.admin.createUser({
                email: user.email,
                password: 'admin123', // Senha padrão conforme seed
                email_confirm: true,
                user_metadata: {
                    name: user.name,
                    role: user.role,
                    department_id: user.department_id,
                }
            });

            if (error) {
                console.log(`    ⚠️  Erro: ${error.message}`);
            } else {
                console.log(`    ✅ Criado: ${data.user.email}`);
            }
        }

        // 3. Buscar todos os motoristas
        const { data: drivers, error: driversError } = await supabase
            .from('drivers')
            .select('*');

        if (driversError) {
            throw new Error(`Erro ao buscar motoristas: ${driversError.message}`);
        }

        console.log(`\n📋 Encontrados ${drivers.length} motoristas\n`);

        // 4. Criar motoristas no Supabase Auth
        for (const driver of drivers) {
            const email = `driver-${driver.cpf}@internal.sgf2026.local`;
            console.log(`  Criando: ${email} (${driver.name})...`);

            const { data, error } = await supabase.auth.admin.createUser({
                email: email,
                password: 'senha123', // Senha padrão conforme seed
                email_confirm: true,
                user_metadata: {
                    name: driver.name,
                    cpf: driver.cpf,
                    department_id: driver.department_id,
                }
            });

            if (error) {
                console.log(`    ⚠️  Erro: ${error.message}`);
            } else {
                console.log(`    ✅ Criado: ${email}`);
            }
        }

        console.log('\n✅ Migração concluída!\n');
        console.log('📌 Credenciais de teste:');
        console.log('   Painel Web: admin@prefeitura.gov.br / admin123');
        console.log('   Motoristas: CPF (ex: 12345678901) / senha123\n');

    } catch (error) {
        console.error('❌ Erro na migração:', error.message);
        process.exit(1);
    }
}

migrateUsers();
