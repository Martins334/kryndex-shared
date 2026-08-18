import * as React from "react";
import { Input } from "./input";

// Input de moeda controlado por NÚMERO, mas que mantém um buffer de texto interno.
// Um `<Input type="number">` cujo `value` é o número reformata a cada tecla: ao digitar
// "350." o React reescreve como "350" e o ponto some — impossível chegar nos centavos.
// Aqui o que aparece é o texto digitado (com "." ou ",") e o onChange emite o número.
type Props = Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: number | null | undefined;
  onValueChange: (value: number) => void;
};

function parseMoney(text: string): number {
  const n = parseFloat(text.replace(",", "."));
  return Number.isNaN(n) ? 0 : n;
}

function numToText(v: number | null | undefined): string {
  if (v == null || v === 0 || Number.isNaN(v)) return "";
  return String(v).replace(".", ",");
}

export function MoneyInput({ value, onValueChange, ...rest }: Props) {
  const [text, setText] = React.useState(() => numToText(value));

  // Ressincroniza quando o valor numérico muda por fora (ex.: preço sugerido),
  // sem sobrescrever o que o usuário está digitando (mesmo número → mantém o texto).
  React.useEffect(() => {
    if (parseMoney(text) !== (value ?? 0)) setText(numToText(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        // Só dígitos, ponto e vírgula (vírgula = separador decimal brasileiro).
        const raw = e.target.value.replace(/[^\d.,]/g, "");
        setText(raw);
        onValueChange(parseMoney(raw));
      }}
      {...rest}
    />
  );
}
