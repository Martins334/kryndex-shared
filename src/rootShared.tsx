import { Link, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { reportError } from "./lib/error-reporting";
import { canRecoverFromChunkError, reloadForChunkError } from "./lib/chunkError";

// Peças de root comuns aos três apps (informativo, painel, portal).
//
// Cada app tem o seu `__root.tsx` porque o que os separa é justamente o que não deve ser
// compartilhado: o painel registra service worker e declara o manifesto do PWA; informativo
// e portal não podem carregar nada disso. O que é igual — casca do documento, 404, tela de
// erro e o cabeçalho básico — mora aqui, para não virar três cópias que divergem.

export function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  // Decidido no primeiro render (não num efeito) para a tela de erro não piscar antes
  // do recarregamento. O `useState` congela a resposta: `reloadForChunkError` grava a
  // marca de tempo, o que faria uma segunda checagem responder `false`.
  const [recovering] = useState(() => canRecoverFromChunkError(error));

  useEffect(() => {
    reportError(error, { boundary: "tanstack_root_error_component", chunkReload: recovering });
    if (recovering) reloadForChunkError();
  }, [error, recovering]);

  if (recovering) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
