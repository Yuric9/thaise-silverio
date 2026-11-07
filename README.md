# Thaise Silvério — Micropigmentação e Estética

Site e sistema de gestão de uma profissional de micropigmentação e estética.

- **Site público:** apresenta os procedimentos, mostra resultados reais de antes e
  depois e leva a cliente direto para uma conversa no WhatsApp, com a mensagem pronta.
- **Painel (`/admin`):** agenda, caixa, relatórios, clientes, remarketing e produtos,
  além da edição do conteúdo do site sem mexer em código.

🔗 **Site no ar:** https://thaise-silverio.pages.dev

![Página inicial no computador](docs/screenshots/desktop.webp)

<p align="center">
  <img src="docs/screenshots/celular.webp" alt="Página inicial no celular" width="280">
</p>

## O problema que o site resolve

Uma rede social mostra o trabalho, mas espalhado entre muitas publicações. O site
reúne num endereço próprio tudo o que uma cliente precisa para decidir: quem é a profissional, quais procedimentos
ela faz, resultados reais e um caminho curto até o agendamento. Cada botão
"Saiba mais" abre o WhatsApp com o nome do procedimento escrito, para a cliente não
precisar explicar o que quer.

## Funcionalidades

### Site público

- **Página única** com as seções Início, Sobre, Procedimentos, Resultados, Cursos e Contato.
- **Agendamento pelo WhatsApp** com mensagem pronta para cada procedimento e para os cursos.
- **Galeria "Antes & depois"** com fotos reais, autorizadas pelas clientes.
- **Biografia** da profissional, com destaques (+500 clientes, 6 anos de experiência).
- **Layout responsivo**: 3, 2 ou 1 coluna conforme o tamanho da tela.
- **Prévia de compartilhamento** (Open Graph), favicon e ícone para a tela inicial.
- **Sempre no ar:** se o banco de dados falhar, o site mostra o conteúdo padrão.

### Painel de gestão (`/admin`)

Baseado no sistema da Yuri Barbershop, adaptado para uma profissional que atende sozinha.

| Tela              | O que faz                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Início**        | Faturamento do dia, da semana e do mês, lançamento rápido de atendimentos e lançamentos de hoje.                                               |
| **Agenda**        | Agendamentos por dia, horários livres calculados pelo servidor, confirmar, finalizar (com pagamento) e cancelar.                               |
| **Caixa**         | Entradas e saídas, atendimento avulso e despesas fixas do mês.                                                                                 |
| **Relatórios**    | Resultado mensal e anual, por forma de pagamento e por procedimento.                                                                           |
| **Clientes**      | Ficha da cliente, histórico, cartão fidelidade e importação de contatos.                                                                       |
| **Remarketing**   | Listas prontas com mensagem no WhatsApp: pós-atendimento, **retoque**, **manutenção anual**, retorno, aniversariantes, fidelidade e indicação. |
| **Procedimentos** | Preço, duração e dias até o retoque (agenda) e descrição, etiqueta e ordem (cards do site).                                                    |
| **Produtos**      | Estoque, fotos e venda no balcão.                                                                                                              |
| **Site**          | Textos e biografia, galeria (envio de fotos), destaques e contatos (WhatsApp e Instagram).                                                     |
| **Configurações** | Horário de atendimento por dia da semana.                                                                                                      |

![Seção de resultados](docs/screenshots/resultados.webp)

## Tecnologias

| Área           | Tecnologia                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org/) (App Router) com [vinext](https://github.com/cloudflare/vinext) |
| Interface      | React 19 + TypeScript                                                                             |
| Servidor       | Cloudflare Worker                                                                                 |
| Banco de dados | Cloudflare D1 (SQLite) com Drizzle ORM e migrações em `drizzle/`                                  |
| Fotos          | Cloudflare R2                                                                                     |
| Validação      | Zod                                                                                               |
| Estilo         | CSS puro, com variáveis para a paleta (site e painel em arquivos separados)                       |

## Decisões técnicas

- **Um projeto só para site e painel.** O painel edita o mesmo banco que o site lê,
  então uma mudança salva no painel aparece no site na hora.
- **Site que nunca cai.** A página pública busca o conteúdo no banco; se o banco
  estiver indisponível, ela mostra o conteúdo padrão (`lib/site-content.ts`).
- **Reaproveitamento.** Login, agenda, caixa, clientes e relatórios vêm do sistema
  da Yuri Barbershop, sem a parte de equipe e comissões.
- **Agenda sem conflito.** Cada agendamento reserva faixas de 30 minutos numa tabela
  com índice único: dois atendimentos nunca ocupam o mesmo horário, mesmo se forem
  marcados ao mesmo tempo.
- **Fotos tratadas no navegador.** Antes do envio, a foto é reduzida (até 1200 px),
  convertida para WebP e redesenhada, o que apaga os metadados (como a localização GPS).
- **Segurança.** Senha com PBKDF2, sessão em cookie `httpOnly`, limite de tentativas
  de login, bloqueio de escritas vindas de outros sites, validação de tudo o que
  chega à API e cabeçalhos de segurança em todas as respostas.
- **Acessibilidade.** Tamanho mínimo de texto, enfeites ignorados por leitores de tela
  (`aria-hidden`), links com nome completo e HTML semântico.

## Estrutura

```
app/
  (site)/           site público (página, layout e CSS do site)
  admin/            painel: login ou painel, conforme a sessão (CSS próprio)
  api/              rotas da API, uma pasta por recurso
components/
  site/             seções do site (Header, Hero, About, Services...)
  admin/            telas do painel (sections/) e modais
  ui/, auth/        componentes genéricos e tela de login
lib/
  site-content.ts   conteúdo padrão do site e tipos
  domain/           regras puras: datas, agenda, retoque, dinheiro, finanças...
  server/           código do servidor: sessão, senhas, validação, banco
  client/           comunicação do painel com a API
db/schema.ts        tabelas do banco (Drizzle)
drizzle/            migrações SQL
worker/index.ts     entrada do Worker (banco, fotos, segredos e cabeçalhos)
tests/              testes de regras (*.test.ts) e do Worker (*.test.mjs)
```

## Como rodar localmente

Requer **Node.js 22.18 ou superior**.

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Gere o build e crie o banco local:
   ```bash
   npm run build
   ```
   ```bash
   npm run db:migrate:local
   ```
3. Crie o arquivo `dist/server/.dev.vars` com um login de teste. Gere o hash da senha
   com `npm run admin:hash-password` e escreva:
   ```
   ADMIN_EMAIL=seu-email@exemplo.com
   ADMIN_PASSWORD_HASH=pbkdf2-sha256$100000$...
   ```
4. Rode o Worker localmente:
   ```bash
   npx wrangler dev --config dist/server/wrangler.json --local
   ```
5. Acesse http://localhost:8787 (site) e http://localhost:8787/admin (painel).

| Comando               | O que faz                                        |
| --------------------- | ------------------------------------------------ |
| `npm run build`       | Gera o Worker e os arquivos em `dist/`           |
| `npm test`            | Testes de regras, build e testes do Worker       |
| `npm run typecheck`   | Verifica os tipos do TypeScript                  |
| `npm run db:generate` | Cria uma migração depois de mudar `db/schema.ts` |
| `npm run format`      | Formata o código com o Prettier                  |

## Como editar o conteúdo

Pelo painel, em **/admin → Site** (textos, biografia, galeria, destaques e contatos) e
**/admin → Procedimentos** (cards do site). Nos textos, `*palavras*` ficam em destaque
rosé e `**palavras**` em negrito.

No código ficam só as cores (`app/(site)/site.css` e `app/admin/admin.css`) e o
conteúdo padrão (`lib/site-content.ts`), usado enquanto nada foi salvo no painel.

## Publicação na Cloudflare

O projeto roda como **Cloudflare Worker** com banco **D1** e fotos no **R2**.
Primeira publicação:

1. Crie o banco D1 `thaise-silverio-db` e o bucket R2 `thaise-silverio-fotos`.
2. Coloque o `database_id` do banco em `CLOUDFLARE_DATABASE_ID` (`vite.config.ts`).
3. Gere o hash da senha da administradora (`npm run admin:hash-password`) e cadastre
   os segredos do Worker `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH`.
4. Publique com `npm run deploy` (build, migrações do banco e envio do Worker) ou
   conecte o repositório em **Workers & Pages → Create → Workers → Import a repository**,
   com build `npm run build` e deploy
   `npx wrangler d1 migrations apply DB --remote --config dist/server/wrangler.json && npx wrangler deploy --config dist/server/wrangler.json`.
5. Depois de conferir o novo endereço, atualize `SITE_URL` em `lib/site-content.ts`.

**Voltar a uma versão anterior:** no painel da Cloudflare, abra o Worker, vá em
**Deployments** e use **Rollback**.

## Próximos passos

- Cidade e endereço de atendimento (melhora a busca local no Google).
- Técnicas de micropigmentação que a profissional domina.
- Perguntas frequentes ("Dói?", "Quanto tempo dura?", "Quais os cuidados depois?").
- Menu recolhível (hambúrguer) no celular.
- Domínio próprio.
- Depoimentos de clientes.

## Autor

Desenvolvido por [Yuric9](https://github.com/Yuric9), com apoio de IA (Claude Code).

Conteúdo, fotos e marca pertencem a Thaise Silvério. O site de referência foi usado
somente como inspiração de estrutura e experiência. Marca, textos e conteúdo visual
foram preparados para Thaise Silvério.
