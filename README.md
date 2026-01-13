# Gestor de Negócios Naralbiza

Sistema de gestão empresarial completo integrado com Supabase.

## Acesso Admin

**URL:** http://localhost:3000/login
**Email:** admin@naralbiza.com
**Senha:** Naralbiza2024!

## Funcionalidades

- Dashboard Geral
- CRM & Vendas
- Clientes & Relacionamento
- Financeiro
- Gestão de Projetos
- Produção
- E muito mais.

## Instalação e Execução

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure as variáveis de ambiente em `.env.local` (Já configurado).
3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Banco de Dados (Supabase)

O esquema do banco de dados foi recriado para suportar todos os módulos.
As tabelas incluem: `users`, `leads`, `clients`, `transactions`, `agenda_eventos`, etc.
RLS (Row Level Security) está atualmente desabilitado para garantir o funcionamento correto das permissões iniciais.
