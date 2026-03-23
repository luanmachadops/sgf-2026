-- Instrução:
-- 1. Vá ao Supabase Dashboard (https://supabase.com/dashboard/project/ghvbydtytdxdgviuunvm/auth/users)
-- 2. Clique em "Add user" -> "Create new user"
-- 3. Insira o email (ex: admin@sgf2026.gov.br) e uma senha segura.
-- 4. Copie o User ID gerado.
-- 5. No SQL Editor do Supabase, substitua 'COLE-O-UUID-DO-AUTH-AQUI' pelo ID copiado e rode este script:

INSERT INTO public.users (
  id,                -- uuid aleatório pra tabela
  user_id,           -- uuid que você copiou do auth.users
  name, 
  email,
  role,
  department_id
) VALUES (
  gen_random_uuid(),
  '3696dd93-113f-454b-9b29-fc4bbc1b04dc', 
  'Administrador SGF',
  'admin@sgf2026.gov.br',
  'ADMIN',
  NULL               -- ADMIN não precisa estar vinculado a 1 depto apenas
);

-- Sucesso! Agora o RLS de admin será aplicado quando esse usuário entrar na conta web.
