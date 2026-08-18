"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";
import { handleOverlayOpenAutoFocus } from "../../lib/touch";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, onOpenAutoFocus, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      onOpenAutoFocus={(e) => handleOverlayOpenAutoFocus(e, onOpenAutoFocus)}
      className={cn(
        // Três correções de mobile, todas no primitivo:
        // · `max-h` + `overflow-y-auto`: sem isso um modal mais alto que a tela
        //   ficava centralizado por translate -50% e vazava para fora em cima e
        //   embaixo, SEM rolagem — o conteúdo era simplesmente inalcançável.
        // · `dvh` (e não `vh`): no celular `vh` é a altura COM a barra de endereço
        //   recolhida, então 100vh é maior que a área realmente visível.
        // · `w-[calc(100%-2rem)]`: dá margem lateral em vez de encostar nas bordas.
        // Padding numa classe ÚNICA e fluida (16px→24px) de propósito: com o par
        // `p-4 sm:p-6`, um `p-0` do call site anularia só a base e o `sm:p-6`
        // sobreviveria, estourando o layout dos modais sem padding no desktop.
        "fixed left-[50%] top-[50%] z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto rounded-lg border bg-background p-[clamp(1rem,4vw,1.5rem)] shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    >
      {children}
      {/* Três correções neste botão:
          · `focus-visible` no lugar de `focus`: ao abrir, o Radix move o foco para
            cá, e com `focus:ring` o X nascia com um anel dourado, parecendo
            "selecionado". Com `focus-visible` o anel só aparece na navegação por
            teclado, que é quando ele realmente serve.
          · sem `data-[state=open]:bg-accent`: `--accent` neste tema é o dourado, o
            que pintava o fundo do X de laranja.
          · `z-10` + área de toque própria: o X ficava atrás/por cima do conteúdo do
            cabeçalho; agora tem camada própria e o DialogHeader reserva o espaço. */}
      <DialogPrimitive.Close className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-70 ring-offset-background transition-opacity hover:bg-muted/50 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Fechar</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// Reserva a faixa ocupada pelo botão de fechar para o título não correr por baixo
// dele: no mobile o X mede 44px (alvo de toque) + 12px da borda = 56px (`pr-14`);
// no desktop são 32px + 12px = 44px (`pr-11`).
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 pr-14 text-center sm:text-left md:pr-11", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
