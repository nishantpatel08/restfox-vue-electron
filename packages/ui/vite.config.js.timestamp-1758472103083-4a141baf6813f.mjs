// vite.config.js
import { defineConfig } from "file:///D:/restfox/Restfox/packages/ui/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/restfox/Restfox/packages/ui/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import copy from "file:///D:/restfox/Restfox/packages/ui/node_modules/rollup-plugin-copy/dist/index.commonjs.js";
import { VitePWA } from "file:///D:/restfox/Restfox/packages/ui/node_modules/vite-plugin-pwa/dist/index.js";

// vite-plugin-revision.js
import { execSync } from "child_process";
import process2 from "process";
function execShellCommandSync(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch (error) {
    return "unknown";
  }
}
var ViteRevisionPlugin = (mode) => ({
  name: "vite-revision",
  config() {
    const latestTag = mode === "development" ? "development" : execShellCommandSync("git describe --tags --abbrev=0");
    const latestCommitHash = mode === "development" ? "development" : execShellCommandSync("git rev-parse HEAD");
    process2.env.VITE_GIT_TAG = latestTag === "unknown" ? "latest" : latestTag;
    process2.env.VITE_GIT_COMMIT_HASH = latestCommitHash === "unknown" ? "unknown" : latestCommitHash.substring(0, 7);
  }
});

// vite.config.js
import checker from "file:///D:/restfox/Restfox/packages/ui/node_modules/vite-plugin-checker/dist/esm/main.js";
var __vite_injected_original_dirname = "D:\\restfox\\Restfox\\packages\\ui";
var vite_config_default = defineConfig(({ mode }) => {
  const config = {
    plugins: [
      process.env.VITEST ? null : ViteRevisionPlugin(mode),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ["alert-confirm-prompt"].includes(tag)
          }
        }
      }),
      VitePWA({
        includeAssets: [
          "favicon.png",
          "favicon.ico",
          "robots.txt",
          "apple-touch-icon.png",
          "css/fontawesome-free-6.6.0-web/webfonts/fa-solid-900.woff2",
          "images/*"
        ],
        manifest: {
          name: "RestSpark",
          short_name: "RestSpark",
          description: "A REST Client for the Web",
          theme_color: "#ffffff",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png"
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable"
            }
          ]
        },
        workbox: {
          // default limit is 2 MB (https://vite-plugin-pwa.netlify.app/guide/faq.html#missing-assets-from-sw-precache-manifest)
          maximumFileSizeToCacheInBytes: 4e6
          // increase to 4 MB
        }
      }),
      process.env.VITEST ? null : checker({
        typescript: true
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    define: process.env.VITEST ? {
      "window": {}
    } : {
      "process.env": {}
    },
    base: "",
    test: {
      reporters: "verbose",
      exclude: [
        "node_modules",
        "tests"
      ]
    },
    build: {
      target: "es2022"
    },
    esbuild: {
      target: "es2022",
      minifyIdentifiers: false
    }
  };
  if (mode === "desktop") {
    config.plugins.push(
      copy({
        targets: [
          { src: "dist/*", dest: "../electron/ui" },
          { src: "dist/*", dest: "../tauri/ui" },
          { src: "dist/*", dest: "../browser-extension/v3-app/src/ui" }
        ],
        hook: "writeBundle"
      })
    );
  }
  if (mode === "desktop-electron") {
    config.plugins.push(
      copy({
        targets: [
          { src: "dist/*", dest: "../electron/ui" }
        ],
        hook: "writeBundle"
      })
    );
  }
  if (mode === "web-standalone") {
    config.plugins.push(
      copy({
        targets: [
          { src: "dist/*", dest: "../web-standalone/public" }
        ],
        hook: "buildEnd"
      })
    );
  }
  return config;
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAidml0ZS1wbHVnaW4tcmV2aXNpb24uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxyZXN0Zm94XFxcXFJlc3Rmb3hcXFxccGFja2FnZXNcXFxcdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHJlc3Rmb3hcXFxcUmVzdGZveFxcXFxwYWNrYWdlc1xcXFx1aVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovcmVzdGZveC9SZXN0Zm94L3BhY2thZ2VzL3VpL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBjb3B5IGZyb20gJ3JvbGx1cC1wbHVnaW4tY29weSdcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXG5pbXBvcnQgeyBWaXRlUmV2aXNpb25QbHVnaW4gfSBmcm9tICcuL3ZpdGUtcGx1Z2luLXJldmlzaW9uJ1xuaW1wb3J0IGNoZWNrZXIgZnJvbSAndml0ZS1wbHVnaW4tY2hlY2tlcidcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICAgIHByb2Nlc3MuZW52LlZJVEVTVCA/IG51bGwgOiBWaXRlUmV2aXNpb25QbHVnaW4obW9kZSksXG4gICAgICAgICAgICB2dWUoe1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNDdXN0b21FbGVtZW50OiAodGFnKSA9PiBbJ2FsZXJ0LWNvbmZpcm0tcHJvbXB0J10uaW5jbHVkZXModGFnKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBWaXRlUFdBKHtcbiAgICAgICAgICAgICAgICBpbmNsdWRlQXNzZXRzOiBbXG4gICAgICAgICAgICAgICAgICAgICdmYXZpY29uLnBuZycsXG4gICAgICAgICAgICAgICAgICAgICdmYXZpY29uLmljbycsXG4gICAgICAgICAgICAgICAgICAgICdyb2JvdHMudHh0JyxcbiAgICAgICAgICAgICAgICAgICAgJ2FwcGxlLXRvdWNoLWljb24ucG5nJyxcbiAgICAgICAgICAgICAgICAgICAgJ2Nzcy9mb250YXdlc29tZS1mcmVlLTYuNi4wLXdlYi93ZWJmb250cy9mYS1zb2xpZC05MDAud29mZjInLFxuICAgICAgICAgICAgICAgICAgICAnaW1hZ2VzLyonLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1Jlc3RTcGFyaycsXG4gICAgICAgICAgICAgICAgICAgIHNob3J0X25hbWU6ICdSZXN0U3BhcmsnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0EgUkVTVCBDbGllbnQgZm9yIHRoZSBXZWInLFxuICAgICAgICAgICAgICAgICAgICB0aGVtZV9jb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICAgICAgICAgICAgICBpY29uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogJ3B3YS0xOTJ4MTkyLnBuZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiAncHdhLTUxMng1MTIucG5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6ICdwd2EtNTEyeDUxMi5wbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZGVmYXVsdCBsaW1pdCBpcyAyIE1CIChodHRwczovL3ZpdGUtcGx1Z2luLXB3YS5uZXRsaWZ5LmFwcC9ndWlkZS9mYXEuaHRtbCNtaXNzaW5nLWFzc2V0cy1mcm9tLXN3LXByZWNhY2hlLW1hbmlmZXN0KVxuICAgICAgICAgICAgICAgICAgICBtYXhpbXVtRmlsZVNpemVUb0NhY2hlSW5CeXRlczogNDAwMDAwMCAvLyBpbmNyZWFzZSB0byA0IE1CXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBwcm9jZXNzLmVudi5WSVRFU1QgPyBudWxsIDogY2hlY2tlcih7XG4gICAgICAgICAgICAgICAgdHlwZXNjcmlwdDogdHJ1ZVxuICAgICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGFsaWFzOiB7XG4gICAgICAgICAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkZWZpbmU6IHByb2Nlc3MuZW52LlZJVEVTVCA/IHtcbiAgICAgICAgICAgICd3aW5kb3cnOiB7fSxcbiAgICAgICAgfSA6IHtcbiAgICAgICAgICAgICdwcm9jZXNzLmVudic6IHt9XG4gICAgICAgIH0sXG4gICAgICAgIGJhc2U6ICcnLFxuICAgICAgICB0ZXN0OiB7XG4gICAgICAgICAgICByZXBvcnRlcnM6ICd2ZXJib3NlJyxcbiAgICAgICAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgICAgICAgICAnbm9kZV9tb2R1bGVzJyxcbiAgICAgICAgICAgICAgICAndGVzdHMnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgIHRhcmdldDogJ2VzMjAyMicsXG4gICAgICAgIH0sXG4gICAgICAgIGVzYnVpbGQ6IHtcbiAgICAgICAgICAgIHRhcmdldDogJ2VzMjAyMicsXG4gICAgICAgICAgICBtaW5pZnlJZGVudGlmaWVyczogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgfVxuXG4gICAgaWYobW9kZSA9PT0gJ2Rlc2t0b3AnKSB7XG4gICAgICAgIGNvbmZpZy5wbHVnaW5zLnB1c2goXG4gICAgICAgICAgICBjb3B5KHtcbiAgICAgICAgICAgICAgICB0YXJnZXRzOiBbXG4gICAgICAgICAgICAgICAgICAgIHsgc3JjOiAnZGlzdC8qJywgZGVzdDogJy4uL2VsZWN0cm9uL3VpJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IHNyYzogJ2Rpc3QvKicsIGRlc3Q6ICcuLi90YXVyaS91aScgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBzcmM6ICdkaXN0LyonLCBkZXN0OiAnLi4vYnJvd3Nlci1leHRlbnNpb24vdjMtYXBwL3NyYy91aScgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgaG9vazogJ3dyaXRlQnVuZGxlJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgIH1cblxuICAgIGlmKG1vZGUgPT09ICdkZXNrdG9wLWVsZWN0cm9uJykge1xuICAgICAgICBjb25maWcucGx1Z2lucy5wdXNoKFxuICAgICAgICAgICAgY29weSh7XG4gICAgICAgICAgICAgICAgdGFyZ2V0czogW1xuICAgICAgICAgICAgICAgICAgICB7IHNyYzogJ2Rpc3QvKicsIGRlc3Q6ICcuLi9lbGVjdHJvbi91aScgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGhvb2s6ICd3cml0ZUJ1bmRsZSdcbiAgICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICB9XG5cbiAgICBpZihtb2RlID09PSAnd2ViLXN0YW5kYWxvbmUnKSB7XG4gICAgICAgIGNvbmZpZy5wbHVnaW5zLnB1c2goXG4gICAgICAgICAgICBjb3B5KHtcbiAgICAgICAgICAgICAgICB0YXJnZXRzOiBbXG4gICAgICAgICAgICAgICAgICAgIHsgc3JjOiAnZGlzdC8qJywgZGVzdDogJy4uL3dlYi1zdGFuZGFsb25lL3B1YmxpYycgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGhvb2s6ICdidWlsZEVuZCdcbiAgICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnXG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxyZXN0Zm94XFxcXFJlc3Rmb3hcXFxccGFja2FnZXNcXFxcdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHJlc3Rmb3hcXFxcUmVzdGZveFxcXFxwYWNrYWdlc1xcXFx1aVxcXFx2aXRlLXBsdWdpbi1yZXZpc2lvbi5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovcmVzdGZveC9SZXN0Zm94L3BhY2thZ2VzL3VpL3ZpdGUtcGx1Z2luLXJldmlzaW9uLmpzXCI7aW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IHByb2Nlc3MgZnJvbSAncHJvY2VzcydcblxuZnVuY3Rpb24gZXhlY1NoZWxsQ29tbWFuZFN5bmMoY21kKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGV4ZWNTeW5jKGNtZCwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pLnRyaW0oKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiAndW5rbm93bidcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBWaXRlUmV2aXNpb25QbHVnaW4gPSAobW9kZSkgPT4gKHtcbiAgICBuYW1lOiAndml0ZS1yZXZpc2lvbicsXG4gICAgY29uZmlnKCkge1xuICAgICAgICBjb25zdCBsYXRlc3RUYWcgPSBtb2RlID09PSAnZGV2ZWxvcG1lbnQnID8gJ2RldmVsb3BtZW50JyA6IGV4ZWNTaGVsbENvbW1hbmRTeW5jKCdnaXQgZGVzY3JpYmUgLS10YWdzIC0tYWJicmV2PTAnKVxuICAgICAgICBjb25zdCBsYXRlc3RDb21taXRIYXNoID0gbW9kZSA9PT0gJ2RldmVsb3BtZW50JyA/ICdkZXZlbG9wbWVudCcgOiBleGVjU2hlbGxDb21tYW5kU3luYygnZ2l0IHJldi1wYXJzZSBIRUFEJylcblxuICAgICAgICBwcm9jZXNzLmVudi5WSVRFX0dJVF9UQUcgPSBsYXRlc3RUYWcgPT09ICd1bmtub3duJyA/ICdsYXRlc3QnIDogbGF0ZXN0VGFnXG4gICAgICAgIHByb2Nlc3MuZW52LlZJVEVfR0lUX0NPTU1JVF9IQVNIID0gbGF0ZXN0Q29tbWl0SGFzaCA9PT0gJ3Vua25vd24nID8gJ3Vua25vd24nIDogbGF0ZXN0Q29tbWl0SGFzaC5zdWJzdHJpbmcoMCwgNylcbiAgICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzUixTQUFTLG9CQUFvQjtBQUNuVCxPQUFPLFNBQVM7QUFDaEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sVUFBVTtBQUNqQixTQUFTLGVBQWU7OztBQ0pnUixTQUFTLGdCQUFnQjtBQUNqVSxPQUFPQSxjQUFhO0FBRXBCLFNBQVMscUJBQXFCLEtBQUs7QUFDL0IsTUFBSTtBQUNBLFdBQU8sU0FBUyxLQUFLLEVBQUUsVUFBVSxPQUFPLENBQUMsRUFBRSxLQUFLO0FBQUEsRUFDcEQsU0FBUyxPQUFPO0FBQ1osV0FBTztBQUFBLEVBQ1g7QUFDSjtBQUVPLElBQU0scUJBQXFCLENBQUMsVUFBVTtBQUFBLEVBQ3pDLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFDTCxVQUFNLFlBQVksU0FBUyxnQkFBZ0IsZ0JBQWdCLHFCQUFxQixnQ0FBZ0M7QUFDaEgsVUFBTSxtQkFBbUIsU0FBUyxnQkFBZ0IsZ0JBQWdCLHFCQUFxQixvQkFBb0I7QUFFM0csSUFBQUMsU0FBUSxJQUFJLGVBQWUsY0FBYyxZQUFZLFdBQVc7QUFDaEUsSUFBQUEsU0FBUSxJQUFJLHVCQUF1QixxQkFBcUIsWUFBWSxZQUFZLGlCQUFpQixVQUFVLEdBQUcsQ0FBQztBQUFBLEVBQ25IO0FBQ0o7OztBRGRBLE9BQU8sYUFBYTtBQU5wQixJQUFNLG1DQUFtQztBQVN6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN0QyxRQUFNLFNBQVM7QUFBQSxJQUNYLFNBQVM7QUFBQSxNQUNMLFFBQVEsSUFBSSxTQUFTLE9BQU8sbUJBQW1CLElBQUk7QUFBQSxNQUNuRCxJQUFJO0FBQUEsUUFDQSxVQUFVO0FBQUEsVUFDTixpQkFBaUI7QUFBQSxZQUNiLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxTQUFTLEdBQUc7QUFBQSxVQUNuRTtBQUFBLFFBQ0o7QUFBQSxNQUNKLENBQUM7QUFBQSxNQUNELFFBQVE7QUFBQSxRQUNKLGVBQWU7QUFBQSxVQUNYO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNKO0FBQUEsUUFDQSxVQUFVO0FBQUEsVUFDTixNQUFNO0FBQUEsVUFDTixZQUFZO0FBQUEsVUFDWixhQUFhO0FBQUEsVUFDYixhQUFhO0FBQUEsVUFDYixPQUFPO0FBQUEsWUFDSDtBQUFBLGNBQ0ksS0FBSztBQUFBLGNBQ0wsT0FBTztBQUFBLGNBQ1AsTUFBTTtBQUFBLFlBQ1Y7QUFBQSxZQUNBO0FBQUEsY0FDSSxLQUFLO0FBQUEsY0FDTCxPQUFPO0FBQUEsY0FDUCxNQUFNO0FBQUEsWUFDVjtBQUFBLFlBQ0E7QUFBQSxjQUNJLEtBQUs7QUFBQSxjQUNMLE9BQU87QUFBQSxjQUNQLE1BQU07QUFBQSxjQUNOLFNBQVM7QUFBQSxZQUNiO0FBQUEsVUFDSjtBQUFBLFFBQ0o7QUFBQSxRQUNBLFNBQVM7QUFBQTtBQUFBLFVBRUwsK0JBQStCO0FBQUE7QUFBQSxRQUNuQztBQUFBLE1BQ0osQ0FBQztBQUFBLE1BQ0QsUUFBUSxJQUFJLFNBQVMsT0FBTyxRQUFRO0FBQUEsUUFDaEMsWUFBWTtBQUFBLE1BQ2hCLENBQUM7QUFBQSxJQUNMO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDTCxPQUFPO0FBQUEsUUFDSCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDeEM7QUFBQSxJQUNKO0FBQUEsSUFDQSxRQUFRLFFBQVEsSUFBSSxTQUFTO0FBQUEsTUFDekIsVUFBVSxDQUFDO0FBQUEsSUFDZixJQUFJO0FBQUEsTUFDQSxlQUFlLENBQUM7QUFBQSxJQUNwQjtBQUFBLElBQ0EsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLE1BQ0YsV0FBVztBQUFBLE1BQ1gsU0FBUztBQUFBLFFBQ0w7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNILFFBQVE7QUFBQSxJQUNaO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixtQkFBbUI7QUFBQSxJQUN2QjtBQUFBLEVBQ0o7QUFFQSxNQUFHLFNBQVMsV0FBVztBQUNuQixXQUFPLFFBQVE7QUFBQSxNQUNYLEtBQUs7QUFBQSxRQUNELFNBQVM7QUFBQSxVQUNMLEVBQUUsS0FBSyxVQUFVLE1BQU0saUJBQWlCO0FBQUEsVUFDeEMsRUFBRSxLQUFLLFVBQVUsTUFBTSxjQUFjO0FBQUEsVUFDckMsRUFBRSxLQUFLLFVBQVUsTUFBTSxxQ0FBcUM7QUFBQSxRQUNoRTtBQUFBLFFBQ0EsTUFBTTtBQUFBLE1BQ1YsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBRUEsTUFBRyxTQUFTLG9CQUFvQjtBQUM1QixXQUFPLFFBQVE7QUFBQSxNQUNYLEtBQUs7QUFBQSxRQUNELFNBQVM7QUFBQSxVQUNMLEVBQUUsS0FBSyxVQUFVLE1BQU0saUJBQWlCO0FBQUEsUUFDNUM7QUFBQSxRQUNBLE1BQU07QUFBQSxNQUNWLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQUVBLE1BQUcsU0FBUyxrQkFBa0I7QUFDMUIsV0FBTyxRQUFRO0FBQUEsTUFDWCxLQUFLO0FBQUEsUUFDRCxTQUFTO0FBQUEsVUFDTCxFQUFFLEtBQUssVUFBVSxNQUFNLDJCQUEyQjtBQUFBLFFBQ3REO0FBQUEsUUFDQSxNQUFNO0FBQUEsTUFDVixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFFQSxTQUFPO0FBQ1gsQ0FBQzsiLAogICJuYW1lcyI6IFsicHJvY2VzcyIsICJwcm9jZXNzIl0KfQo=
