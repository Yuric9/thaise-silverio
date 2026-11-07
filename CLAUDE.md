# Site Thaise Silvério — guia para agentes

Site institucional de uma página (Next.js 16 + React 19 + TypeScript), exportado
como site estático (`output: "export"` → pasta `out/`) e publicado na
Cloudflare Pages a partir da branch `main` (deploy automático a cada merge).

A dona do repositório está aprendendo programação: explique as mudanças em
português, de forma simples, e mostre capturas de tela do resultado.

## Estrutura

- `app/layout.tsx` — metadados, SEO e prévia de compartilhamento (Open Graph)
- `app/page.tsx` — monta as seções na ordem
- `app/globals.css` — todo o CSS; a paleta fica em variáveis no `:root`
- `components/` — uma seção por arquivo (Header, Hero, About, Services,
  Results, Courses, Contact, Footer)
- `lib/site.ts` — dados editáveis: SITE_URL, WhatsApp, Instagram,
  procedimentos e galeria de resultados
- `public/images/` — logo oficial (versão horizontal), foto da Thaise e fotos
  de resultados (WebP)
- `app/icon.png` e `app/apple-icon.png` — ícones feitos do monograma "TS" da logo
- `public/_headers` — cabeçalhos de segurança e cache lidos pela Cloudflare Pages

## Comandos

```bash
npm install
npm run build    # gera out/ — rode sempre antes de commitar
npm run format   # Prettier
```

## Regras do projeto

- Não invente dados sobre a Thaise (números, cursos, prêmios, endereço).
  Use apenas o que estiver no site ou o que a dona informar.
- Fotos novas: converter para WebP (até ~1000px), remover metadados (EXIF/GPS)
  e escrever texto alternativo (`alt`) descritivo. As clientes das fotos atuais
  autorizaram o uso de imagem.
- Mantenha a paleta rosé + dourado (variáveis em `app/globals.css`).
- Links de WhatsApp: use `whatsappLink(mensagem)` de `lib/site.ts`; nunca
  repita o número no código.
- Textos: mínimo de 10px (11px no celular). Enfeites (setas, ✳, "TS")
  levam `aria-hidden="true"`.
- Ao trocar para domínio próprio, atualize `SITE_URL` em `lib/site.ts`.

## Dados confirmados

- Thaise Silvério: esteticista e cosmetóloga, especialista em micropigmentação
  há 6 anos, mais de 500 clientes atendidas.
- WhatsApp: +55 62 8123-1427 · Instagram: @thaisesilverio_estetica

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
