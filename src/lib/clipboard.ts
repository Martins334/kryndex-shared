import { toast } from "sonner";

// Cópia para a área de transferência com fallback.
//
// `navigator.clipboard` só existe em contexto seguro (HTTPS ou localhost). Num
// celular acessando o painel pelo IP da rede (http://192.168.x.x) ela é
// `undefined`, e chamar `.writeText` direto lança TypeError — o clique não
// copiava nada e nem exibia erro. Aqui caímos no `execCommand("copy")`, que
// funciona em http, e devolvemos um booleano para o chamador avisar o usuário.
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* cai no fallback abaixo */
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    // Fora da tela, mas precisa estar no DOM e ser selecionável para o execCommand.
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length); // iOS ignora select() sozinho
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// Copia e avisa o usuário. Existe para que a falha REALMENTE apareça: antes o
// `toast.success` vinha logo após a chamada e era exibido mesmo quando a cópia
// não acontecia, dando a impressão de que o link estava na área de transferência.
export async function copyWithToast(text: string, okMsg = "Copiado!"): Promise<void> {
  if (await copyText(text)) toast.success(okMsg);
  else toast.error("Não foi possível copiar — toque e segure para copiar manualmente.");
}
