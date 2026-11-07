import vinext from "vinext";
import { defineConfig } from "vite";

/**
 * Banco D1 e armazenamento de fotos R2 da Cloudflare.
 * O banco `thaise-silverio-db` e o bucket `thaise-silverio-fotos` já existem na
 * conta da Cloudflare. Localmente, o Wrangler simula os dois.
 */
const CLOUDFLARE_DATABASE_ID = "44cba372-1f26-449d-a504-b8f58380900f";

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
