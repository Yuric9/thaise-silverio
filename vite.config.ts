import vinext from "vinext";
import { defineConfig } from "vite";

/**
 * Banco D1 e armazenamento de fotos R2 da Cloudflare.
 * O `database_id` é preenchido depois de criar o banco na Cloudflare
 * (veja o README, seção "Publicação"). Localmente, o Wrangler simula os dois.
 */
const CLOUDFLARE_DATABASE_ID = "00000000-0000-0000-0000-000000000000";

const bindingConfig = {
  main: "./worker/index.ts",
  d1_databases: [
    {
      binding: "DB",
      database_name: "thaise-silverio-db",
      database_id: CLOUDFLARE_DATABASE_ID,
      // A configuração gerada para publicação fica em dist/server.
      migrations_dir: "../../drizzle",
    },
  ],
  r2_buckets: [{ binding: "BUCKET", bucket_name: "thaise-silverio-fotos" }],
};

export default defineConfig(async () => {
  // Mantém os arquivos do Wrangler e do Miniflare dentro do projeto.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: { host: "0.0.0.0" },
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: bindingConfig,
      }),
    ],
  };
});
