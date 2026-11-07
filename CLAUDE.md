# Site Thaise Silvério — guia para agentes

Site público + painel de gestão (`/admin`) em um só projeto: Next.js 16 + React 19

- TypeScript, executado pelo **vinext** em um **Cloudflare Worker**, com banco
  **D1** (Drizzle ORM) e fotos no **R2**. O painel foi portado do projeto
  `Yuric9/yuri-barbershop-app`, sem equipe e comissões (a Thaise atende sozinha).

A dona do repositório está aprendendo programação: explique as mudanças em
português, de forma simples, e mostre capturas de tela do resultado.

## Estrutura

- `app/(site)/` — site público (página, layout com SEO/Open Graph e `site.css`)
- `app/admin/` — painel: login ou painel conforme a sessão (`admin.css`)
- `app/api/` — rotas da API; as do painel usam `adminRoute` (`lib/server/http.ts`)
- `components/site/` — seções do site; recebem o conteúdo por props
- `components/admin/` — telas do painel (`sections/`), modais e componentes
- `lib/site-content.ts` — conteúdo padrão do site, tipos e links (WhatsApp, Instagram)
- `lib/server/site.ts` — lê/salva conteúdo e galeria; cria os padrões no banco vazio
- `lib/domain/` — regras puras (agenda com horário configurável, retoque, finanças)
- `db/schema.ts` + `drizzle/` — tabelas e migrações
- `worker/index.ts` — bindings (`DB`, `BUCKET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`)
- `public/images/` — logo (monograma), foto da Thaise e fotos de resultados originais

## Comandos

```bash
npm install
npm run typecheck
npm test          # testes de regras + build + testes do Worker
npm run db:generate   # depois de mudar db/schema.ts
```

Teste local completo: `npm run build`, `npm run db:migrate:local`, criar
`dist/server/.dev.vars` (ADMIN_EMAIL e ADMIN_PASSWORD_HASH) e rodar
`npx wrangler dev --config dist/server/wrangler.json --local`. Se o runtime local
recusar a data de compatibilidade, use `--compatibility-date` com a data que ele
aceita (só no teste local).

## Regras do projeto

- Não invente dados sobre a Thaise (números, cursos, prêmios, endereço).
  Use apenas o que estiver no site ou o que a dona informar.
- Fotos novas: converter para WebP (até ~1000px), remover metadados (EXIF/GPS)
  e escrever texto alternativo (`alt`) descritivo. As clientes das fotos atuais
  autorizaram o uso de imagem.
- Mantenha a paleta rosé + dourado (variáveis em `app/globals.css`).
- Links de WhatsApp do site: `whatsappLink(numero, mensagem)` de
  `lib/site-content.ts`, com o número vindo do conteúdo salvo (`contact`).
  Nunca escreva o número fixo em componentes.
- Conteúdo editável pelo painel não deve ficar fixo nos componentes do site:
  adicione o campo em `lib/site-content.ts`, valide em `lib/server/site.ts` e
  crie o campo na tela `components/admin/sections/site.tsx`.
- Mudou `db/schema.ts`? Gere a migração (`npm run db:generate`) e faça commit dela.
- Textos: mínimo de 10px (11px no celular). Enfeites (setas, ✳, "TS")
  levam `aria-hidden="true"`.
- Ao trocar de endereço, atualize `SITE_URL` em `lib/site-content.ts`.

## Dados confirmados

- Thaise Silvério: esteticista e cosmetóloga, especialista em micropigmentação
  há 6 anos, mais de 500 clientes atendidas.
- WhatsApp: +55 62 8123-1427 · Instagram: @thaisesilverio_estetica

## Pendências da publicação

- Criar D1 e R2 na Cloudflare, preencher `CLOUDFLARE_DATABASE_ID` em
  `vite.config.ts` e cadastrar os segredos do Worker (veja o README).
- A `main` ainda publica a versão estática na Cloudflare Pages: só fazer merge
  desta versão depois que o Worker estiver configurado.
- Preços e durações dos procedimentos vieram como "a definir" e o horário de
  atendimento veio com um padrão: a Thaise precisa ajustar no painel.

## Ideias para o futuro (ainda não implementadas)

- **Cidade/endereço de atendimento** na bio e no contato (melhora o SEO local).
  Aguardando a dona confirmar.
- **Técnicas que ela domina** (ex.: fio a fio, shadow, revitalização labial)
  na bio ou nos cards de procedimentos. Aguardando confirmação.
- **Biossegurança** (material descartável, esterilização, pigmentos
  certificados), só se for confirmado.
- **Depoimentos de clientes (prova social):** seção "O que dizem as clientes"
  com prints autorizados do Instagram/WhatsApp. A dona não considera prioridade
  agora, mas aceita que seja implementado no futuro.
- **Perguntas frequentes:** "Dói?", "Quanto tempo dura?", "Cuidados pós".
- **Menu hambúrguer no celular** (hoje os links só quebram de linha).
- **Domínio próprio** (ex.: thaisesilverio.com.br) apontando para a Cloudflare.
