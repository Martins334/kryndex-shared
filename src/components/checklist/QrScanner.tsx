import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

// Lê o QR e devolve o texto bruto (normalmente a URL .../checklist/<code>?t=<token>),
// preservando o token para o chamador decidir a navegação.
export function QrScanner({ onScan }: { onScan: (text: string) => void }) {
  const containerId = "qr-reader";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const doneRef = useRef(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        (text) => {
          if (doneRef.current) return;
          doneRef.current = true;
          onScan(text);
        },
        () => {},
      )
      .catch(() => setErr("Não foi possível abrir a câmera. Digite o código abaixo."));
    return () => {
      scanner.stop().then(() => scanner.clear()).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2">
      <div id={containerId} className="overflow-hidden rounded-xl border border-border bg-black" />
      {err && <p className="text-center text-xs text-red-500">{err}</p>}
    </div>
  );
}
