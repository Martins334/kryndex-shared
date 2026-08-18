import { Link, type LinkProps } from "@tanstack/react-router";
import { forwardRef, type ReactNode } from "react";

// Link do portal do cliente: aceita um `href` string já resolvido (ex.: "/produto/abc",
// "/acompanhar/OS123"). O roteador do TanStack é fortemente tipado (exige to="/produto/$id"
// + params); como o portal público navega por caminhos dinâmicos resolvidos em runtime,
// concentramos aqui o único ponto de "escape" de tipos — o runtime casa o caminho com a rota.
type PortalLinkProps = {
  // Aceita `to` (compatível com o antigo react-router) ou `href` — ambos são um
  // caminho já resolvido (ex.: "/produto/abc"). Um dos dois deve ser informado.
  to?: string;
  href?: string;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  title?: string;
  "aria-label"?: string;
  children?: ReactNode;
};

export const PortalLink = forwardRef<HTMLAnchorElement, PortalLinkProps>(function PortalLink(
  { to, href, children, ...rest },
  ref,
) {
  const dest = (to ?? href ?? "") as unknown as LinkProps["to"];
  return (
    <Link ref={ref} to={dest} {...rest}>
      {children}
    </Link>
  );
});
