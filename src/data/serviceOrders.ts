export type ServiceStatus =
  | "recebido"
  | "diagnostico"
  | "aguardando_aprovacao"
  | "em_reparo"
  | "aguardando_peca"
  | "teste_qualidade"
  | "pronto"
  | "entregue"
  | "sem_conserto"
  | "orcamento_reprovado"
  | "aguardando_retirada"
  | "entregue_sem_reparo"
  | "abandonado";

export const STATUS_FLOW: ServiceStatus[] = [
  "recebido",
  "diagnostico",
  "aguardando_aprovacao",
  "em_reparo",
  "aguardando_peca",
  "teste_qualidade",
  "pronto",
  "entregue",
];

export const STATUS_LABEL: Record<ServiceStatus, string> = {
  recebido: "Recebido",
  diagnostico: "Diagnóstico",
  aguardando_aprovacao: "Aguardando aprovação",
  em_reparo: "Em reparo",
  aguardando_peca: "Aguardando Peça",
  teste_qualidade: "Teste de qualidade",
  pronto: "Pronto",
  entregue: "Entregue",
  sem_conserto: "Sem conserto",
  orcamento_reprovado: "Orçamento reprovado",
  aguardando_retirada: "Aguardando retirada",
  entregue_sem_reparo: "Devolvido sem reparo",
  abandonado: "Abandonado",
};

export type ServiceEvent = {
  id: string;
  status: ServiceStatus;
  note?: string;
  photos?: string[];
  at: string;
};

export type ChecklistItem = { id: string; label: string; value: string };
export type ServiceLine = { id: string; name: string; price: number };
export type DiagnosisPart = { name: string; quantity?: number; productId?: string; unitCost?: number };

export type Diagnosis = {
  summary?: string;
  checklist: ChecklistItem[];
  observations: string[];
  services: ServiceLine[];
  parts: DiagnosisPart[];
  warranty?: string;
  warrantyDays?: number;
  photos: string[];
  accessPassword?: string;
  approvedServices?: string[];
};

export type PaymentEntry = {
  id: string;
  method: "pix" | "dinheiro" | "cartao";
  amount: number;
  note?: string;
};

// Tipo de aparelho da OS — define qual template de checklist manual é usado.
export type DeviceType = "celular" | "tablet" | "notebook" | "desktop" | "outro";

export type ServiceOrder = {
  id?: string;
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerCpf?: string;
  device: string;
  deviceType?: DeviceType;
  imei?: string;
  issue: string;
  accessPassword?: string;
  currentStatus: ServiceStatus;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  events: ServiceEvent[];
  diagnosis?: Diagnosis;
  paymentStatus: "pendente" | "parcial" | "pago";
  paymentMethod?: "pix" | "dinheiro" | "cartao";
  amountPaid?: number;
  payments?: PaymentEntry[];
  technicianName?: string;
  customerId?: string;
  priority: "normal" | "urgente";
  internalNotes?: string;
  entryChecklist?: Array<{ item: string; value: "ok" | "parcial" | "sem_funcao" }>;
  entryNotes?: string;
  exitChecklist?: Array<{ label: string; checked: boolean }>;
  accessories?: Array<{ label: string; checked: boolean }>;
  entryPhotos?: string[];
  intakeAccepted?: boolean;
  intakeAcceptedAt?: string;
  warrantyOf?: string;
  partSupplier?: string;
  partOrderRef?: string;
  partExpectedAt?: string;
  passwordViewCount?: number;
  signatureUrl?: string;
  budgetExpiresAt?: string;
  budgetSignatureUrl?: string;
  warrantySignedAt?: string | null;
  warrantySignatureUrl?: string | null;
  rating?: { stars: number; comment?: string };
  deviceId?: string;
  deviceRec?: { id: string; brand: string; model: string; imei?: string; orders?: Array<{ code: string; currentStatus: string; createdAt: string; issue: string }> } | null;
  osParts?: Array<{ id: string; name: string; quantity: number; unitCost?: number; salePrice?: number; productId?: string }>;
  stockUnits?: Array<{ id: string; serial: string; productName?: string }>;
  motivoSemConserto?: string;
  taxaAvaliacao?: number;
  transferredFromRef?: string;
  transferredToRef?: string;
  deviceChecklist?: DeviceChecklist | null;
  checklistSignatureUrl?: string | null;
  checklistSignedAt?: string | null;
  checklistToken?: string | null;
  // Fase 2.1: token do orçamento (Quote) vinculado pendente → link direto de aprovação (/orcamento/:token).
  quoteApprovalToken?: string | null;
};

// Checklist de diagnóstico feito no aparelho do cliente (via QR/código da OS).
export type ChecklistResult = "ok" | "falha" | "na";
export type ChecklistTest = { key: string; label: string; result: ChecklistResult; note?: string };
export type ChecklistDamage = { view: string; x: number; y: number; type: string; note?: string };
export type DeviceChecklist = {
  tests: ChecklistTest[];
  damages: ChecklistDamage[];
  deviceInfo?: Record<string, unknown> | null;
  technicianName?: string | null;
  notes?: string | null;
  submittedAt?: string;
};

export const EXIT_CHECKLIST_ITEMS: readonly string[] = [
  "Tela e display",
  "Bateria",
  "Câmera",
  "Microfone/Áudio",
  "Alto-falantes",
  "Conector de carregamento",
  "Botões físicos",
  "WiFi/Sinal",
  "Aparência geral",
] as const;

export function getNextStatus(current: ServiceStatus): ServiceStatus | null {
  if (current === "em_reparo") return "teste_qualidade";
  if (current === "aguardando_peca") return "em_reparo";
  if (current === "aguardando_retirada") return "entregue";
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

const now = new Date();
const daysAgo = (d: number) =>
  new Date(now.getTime() - d * 86400_000).toISOString();

export const SEED_ORDERS: ServiceOrder[] = [
  {
    code: "OS-2026-0001",
    customerName: "Rafael Almeida",
    customerPhone: "11987650001",
    customerEmail: "rafael@example.com",
    device: "iPhone 13 Pro 128GB",
    imei: "356789104567890",
    issue: "Tela trincada após queda, touch funcionando parcialmente.",
    currentStatus: "em_reparo",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    technicianName: "Carlos Mendes",
    priority: "urgente",
    paymentStatus: "parcial",
    paymentMethod: "pix",
    amountPaid: 400,
    accessPassword: "1234",
    events: [
      { id: "e1", status: "recebido", at: daysAgo(3), note: "Aparelho recebido na recepção" },
      { id: "e2", status: "diagnostico", at: daysAgo(2) },
      { id: "e3", status: "aguardando_aprovacao", at: daysAgo(2) },
      { id: "e4", status: "em_reparo", at: daysAgo(1), note: "Cliente aprovou orçamento" },
    ],
    diagnosis: {
      summary: "Necessária troca do display original.",
      checklist: [
        { id: "c1", label: "Touch", value: "Falha parcial" },
        { id: "c2", label: "Bateria", value: "87% saúde" },
        { id: "c3", label: "Câmeras", value: "OK" },
      ],
      observations: ["Pequenas marcas na lateral", "Face ID funcional"],
      services: [
        { id: "s1", name: "Troca de tela original", price: 850 },
        { id: "s2", name: "Mão de obra", price: 150 },
      ],
      parts: [{ name: "Display iPhone 13 Pro" }],
      warranty: "90 dias para o serviço executado",
      photos: [],
      accessPassword: "DIA-2026-A1",
    },
  },
  {
    code: "OS-2026-0002",
    customerName: "Juliana Pereira",
    customerPhone: "11987650002",
    device: "Samsung Galaxy S22",
    issue: "Não carrega na tomada, somente sem fio.",
    currentStatus: "pronto",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
    technicianName: "Ana Lima",
    priority: "normal",
    paymentStatus: "pago",
    paymentMethod: "cartao",
    amountPaid: 320,
    events: [
      { id: "e1", status: "recebido", at: daysAgo(7) },
      { id: "e2", status: "diagnostico", at: daysAgo(6) },
      { id: "e3", status: "em_reparo", at: daysAgo(4) },
      { id: "e4", status: "teste_qualidade", at: daysAgo(2) },
      { id: "e5", status: "pronto", at: daysAgo(1), note: "Aguardando retirada" },
    ],
    diagnosis: {
      summary: "Troca do conector de carga.",
      checklist: [{ id: "c1", label: "Bateria", value: "92%" }],
      observations: [],
      services: [{ id: "s1", name: "Troca de flex de carga", price: 320 }],
      parts: [{ name: "Flex carga S22" }],
      photos: [],
    },
  },
  {
    code: "OS-2026-0003",
    customerName: "Marcos Oliveira",
    customerPhone: "11987650003",
    device: "Xiaomi Redmi Note 12",
    issue: "Aparelho não liga após atualização.",
    currentStatus: "diagnostico",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0),
    technicianName: "João Tech",
    priority: "normal",
    paymentStatus: "pendente",
    events: [
      { id: "e1", status: "recebido", at: daysAgo(1) },
      { id: "e2", status: "diagnostico", at: daysAgo(0) },
    ],
  },
  {
    code: "OS-2026-0004",
    customerName: "Rafael Almeida",
    customerPhone: "11987650001",
    device: "iPhone 11",
    issue: "Bateria viciada, descarrega rápido.",
    currentStatus: "entregue",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(15),
    technicianName: "Carlos Mendes",
    priority: "normal",
    paymentStatus: "pago",
    paymentMethod: "pix",
    amountPaid: 280,
    events: [
      { id: "e1", status: "recebido", at: daysAgo(20) },
      { id: "e2", status: "em_reparo", at: daysAgo(18) },
      { id: "e3", status: "pronto", at: daysAgo(16) },
      { id: "e4", status: "entregue", at: daysAgo(15) },
    ],
  },
  {
    code: "OS-2026-0005",
    customerName: "Patrícia Souza",
    customerPhone: "11987650005",
    device: "Motorola Edge 30",
    issue: "Câmera traseira embaçada.",
    currentStatus: "aguardando_aprovacao",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
    technicianName: "Marina Souza",
    priority: "normal",
    paymentStatus: "pendente",
    events: [
      { id: "e1", status: "recebido", at: daysAgo(2) },
      { id: "e2", status: "diagnostico", at: daysAgo(1) },
      { id: "e3", status: "aguardando_aprovacao", at: daysAgo(1) },
    ],
  },
];