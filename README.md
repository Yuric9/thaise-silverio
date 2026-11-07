# Thaise Silvério — Micropigmentação e Estética

Site institucional independente desenvolvido com Next.js 16, React 19 e TypeScript.

## Estrutura

```
app/          layout, página principal e estilos globais
components/   seções da página (Header, Hero, About, Services, Courses, Contact, Footer)
lib/site.ts   dados editáveis: número do WhatsApp e lista de procedimentos
public/       imagens e logo
```

## Publicação na Cloudflare Pages

O projeto está configurado para exportação estática do Next.js. A cada build, o Next.js gera a pasta `out`, que contém os arquivos prontos para publicação.

No painel da Cloudflare:

1. Acesse **Workers & Pages** e crie um projeto Pages conectado ao GitHub.
2. Selecione o repositório `Yuric9/thaise-silverio` e a branch `main`.
3. Configure:
   - Framework preset: **Next.js (Static HTML Export)**, se disponível.
   - Build command: `npm run build`.
   - Build output directory: `out`.
   - Root directory: `/` (raiz do repositório).
   - A versão do Node.js (22) é lida automaticamente do arquivo `.nvmrc`.
4. Salve e inicie a implantação.

O projeto usa exportação estática; recursos que exigem servidor Next.js não estão habilitados nesta configuração.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

Para gerar a versão estática localmente:

```bash
npm run build
```

O resultado será salvo em `out/`.

Para formatar o código:

```bash
npm run format
```

## Antes de publicar

- Adicione fotografias próprias e autorizadas.
- Confirme biografia, endereço, redes sociais e textos dos procedimentos.

O site de referência foi utilizado somente como inspiração de estrutura e experiência. Marca, textos e conteúdo visual foram preparados para Thaise Silvério.
