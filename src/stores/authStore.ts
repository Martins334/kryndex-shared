import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch, setToken, clearToken, setRefreshToken, clearRefreshToken } from "../lib/api";

export type UserRole = "admin" | "gerente" | "tecnico" | "balconista";

export type StoreInfo = { id: string; name: string; slug: string };

type AuthUser = {
  username: string;
  name?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  permissions: string[];
  roleName?: string | null;
  technicianId?: string | null;
  planSlug?: string | null;
  emailVerified?: boolean;
  superAdmin?: boolean;
  trialExpired?: boolean;
  subscriptionInvalid?: boolean;
  isDemo?: boolean;
};

// Formato do objeto `user` devolvido pela API (login/signup/google).
type ApiUser = {
  username: string;
  name?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  permissions?: string[];
  roleName?: string | null;
  technicianId?: string | null;
  tenantId: string;
  planSlug?: string | null;
  emailVerified?: boolean;
  superAdmin?: boolean;
  trialExpired?: boolean;
  subscriptionInvalid?: boolean;
  isDemo?: boolean;
};

function mapUser(u: ApiUser): AuthUser {
  return {
    username: u.username,
    name: u.name ?? null,
    avatarUrl: u.avatarUrl ?? null,
    role: u.role ?? "balconista",
    permissions: u.permissions ?? [],
    roleName: u.roleName ?? null,
    technicianId: u.technicianId ?? null,
    planSlug: u.planSlug ?? null,
    emailVerified: u.emailVerified ?? false,
    superAdmin: u.superAdmin ?? false,
    trialExpired: u.trialExpired ?? false,
    subscriptionInvalid: u.subscriptionInvalid ?? false,
    isDemo: u.isDemo ?? false,
  };
}

export type SignupPayload = {
  shopName: string;
  ownerName?: string;
  username?: string;
  password?: string;
  googleTicket?: string;
  phone?: string;
  documentType: "cpf" | "cnpj";
  document: string;
  legalName?: string;
  planSlug?: string;
  zipCode?: string;
  address?: string;
  addressNumber?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
};

// Prefill transitório do cadastro via Google (não persistido).
export type GoogleSignup = { email: string; name?: string; picture?: string; ticket: string };

type GoogleAuthResult =
  | { status: "login"; result: "ok" | "select-store" }
  | { status: "signup"; google: GoogleSignup }
  | { status: "trial-expired" | "suspended" | "error" };

type AuthState = {
  user: AuthUser | null;
  stores: StoreInfo[];
  activeStore: StoreInfo | null;
  homeTenantId: string | null;
  pendingStoreSelection: boolean;
  googleSignup: GoogleSignup | null;
  login: (u: string, p: string) => Promise<"ok" | "select-store" | "trial-expired" | "suspended" | false>;
  loginDemo: () => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<GoogleAuthResult>;
  signup: (payload: SignupPayload) => Promise<"ok" | { error: string }>;
  resendVerification: () => Promise<boolean>;
  markEmailVerified: () => void;
  refreshUser: () => Promise<void>;
  setGoogleSignup: (g: GoogleSignup | null) => void;
  selectStore: (store: StoreInfo, token: string, refreshToken?: string) => void;
  switchStore: (tenantId: string) => Promise<boolean>;
  refreshStores: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      stores: [],
      activeStore: null,
      homeTenantId: null,
      pendingStoreSelection: false,
      googleSignup: null,

      login: async (u, p) => {
        try {
          const data = await apiFetch<{
            token: string;
            refreshToken?: string;
            user: ApiUser;
            stores: StoreInfo[];
          }>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ username: u, password: p }),
          });

          const authUser = mapUser(data.user);

          setToken(data.token);
          if (data.refreshToken) setRefreshToken(data.refreshToken);

          if (data.stores.length > 1) {
            set({
              user: authUser,
              stores: data.stores,
              activeStore: null,
              homeTenantId: data.user.tenantId ?? null,
              pendingStoreSelection: true,
            });
            return "select-store";
          }

          // Single store — go straight in
          const activeStore = data.stores[0] ?? null;
          set({ user: authUser, stores: data.stores, activeStore, homeTenantId: data.user.tenantId ?? null, pendingStoreSelection: false });
          return "ok";
        } catch (err: unknown) {
          const code = (err as { body?: { code?: string } })?.body?.code;
          if (code === "TRIAL_EXPIRED") return "trial-expired";
          if (code === "TENANT_SUSPENDED") return "suspended";
          return false;
        }
      },

      // Entra na loja de demonstração sem cadastro. `/auth/demo` devolve o mesmo payload de
      // `/auth/login` (o backend compartilha o emissor de sessão), então aqui é o caminho de
      // sucesso do login sem usuário/senha. A demo tem sempre uma loja só — nada de
      // seleção de loja. Falha (404 = demo não semeada neste ambiente) devolve false.
      loginDemo: async () => {
        try {
          const data = await apiFetch<{
            token: string;
            refreshToken?: string;
            user: ApiUser;
            stores: StoreInfo[];
          }>("/auth/demo", { method: "POST" });

          setToken(data.token);
          if (data.refreshToken) setRefreshToken(data.refreshToken);
          set({
            user: mapUser(data.user),
            stores: data.stores,
            activeStore: data.stores[0] ?? null,
            homeTenantId: data.user.tenantId ?? null,
            pendingStoreSelection: false,
          });
          return true;
        } catch {
          return false;
        }
      },

      signup: async (payload) => {
        try {
          const data = await apiFetch<{
            token: string;
            refreshToken?: string;
            user: ApiUser;
            stores: StoreInfo[];
          }>("/auth/signup", { method: "POST", body: JSON.stringify(payload) });

          setToken(data.token);
          if (data.refreshToken) setRefreshToken(data.refreshToken);
          set({
            user: mapUser(data.user),
            stores: data.stores,
            activeStore: data.stores[0] ?? null,
            homeTenantId: data.user.tenantId ?? null,
            pendingStoreSelection: false,
            googleSignup: null,
          });
          return "ok";
        } catch (err: unknown) {
          const msg = (err as { body?: { error?: string } })?.body?.error ?? "Falha ao criar conta";
          return { error: msg };
        }
      },

      loginWithGoogle: async (credential) => {
        try {
          const data = await apiFetch<
            | { status: "login"; token: string; refreshToken?: string; user: ApiUser; stores: StoreInfo[] }
            | { status: "signup"; google: { email: string; name?: string; picture?: string }; ticket: string }
          >("/auth/google", { method: "POST", body: JSON.stringify({ credential }) });

          if (data.status === "signup") {
            const g: GoogleSignup = { email: data.google.email, name: data.google.name, picture: data.google.picture, ticket: data.ticket };
            set({ googleSignup: g });
            return { status: "signup", google: g };
          }

          setToken(data.token);
          if (data.refreshToken) setRefreshToken(data.refreshToken);
          const authUser = mapUser(data.user);
          if (data.stores.length > 1) {
            set({ user: authUser, stores: data.stores, activeStore: null, homeTenantId: data.user.tenantId ?? null, pendingStoreSelection: true });
            return { status: "login", result: "select-store" };
          }
          set({ user: authUser, stores: data.stores, activeStore: data.stores[0] ?? null, homeTenantId: data.user.tenantId ?? null, pendingStoreSelection: false });
          return { status: "login", result: "ok" };
        } catch (err: unknown) {
          const code = (err as { body?: { code?: string } })?.body?.code;
          if (code === "TRIAL_EXPIRED") return { status: "trial-expired" };
          if (code === "TENANT_SUSPENDED") return { status: "suspended" };
          return { status: "error" };
        }
      },

      resendVerification: async () => {
        try {
          const r = await apiFetch<{ ok: boolean; sent?: boolean }>("/auth/resend-verification", { method: "POST" });
          return !!r.ok;
        } catch {
          return false;
        }
      },

      markEmailVerified: () =>
        set((s) => (s.user ? { user: { ...s.user, emailVerified: true } } : {})),

      // Reobtém o usuário (/auth/me) — usado após assinar p/ limpar o `trialExpired`.
      refreshUser: async () => {
        try {
          const u = await apiFetch<ApiUser>("/auth/me");
          set((s) => (s.user ? { user: { ...s.user, ...mapUser(u) } } : {}));
        } catch {
          /* ignora */
        }
      },

      setGoogleSignup: (g) => set({ googleSignup: g }),

      selectStore: (store, token, refreshToken) => {
        setToken(token);
        if (refreshToken) setRefreshToken(refreshToken);
        set({ activeStore: store, pendingStoreSelection: false });
      },

      switchStore: async (tenantId) => {
        try {
          const data = await apiFetch<{ token: string; refreshToken?: string; store: StoreInfo }>(
            "/auth/switch-store",
            { method: "POST", body: JSON.stringify({ tenantId }) },
          );
          setToken(data.token);
          if (data.refreshToken) setRefreshToken(data.refreshToken);
          set({ activeStore: data.store, pendingStoreSelection: false });
          return true;
        } catch {
          return false;
        }
      },

      refreshStores: async () => {
        try {
          const { stores: s, activeStore: a, homeTenantId: h } =
            await apiFetch<{ stores: StoreInfo[]; activeStore: StoreInfo | null; homeTenantId: string }>("/auth/my-stores");
          set({ stores: s, activeStore: a ?? get().activeStore, homeTenantId: h });
        } catch {}
      },

      logout: () => {
        // Invalida o refresh token no servidor (best-effort) antes de limpar local.
        apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
        clearToken();
        clearRefreshToken();
        set({ user: null, stores: [], activeStore: null, homeTenantId: null, pendingStoreSelection: false });
      },
    }),
    {
      // Prefixo da marca antiga MANTIDO de propósito: renomear a chave descarta a sessão
      // persistida de todo mundo. Ver a nota em lib/api.ts.
      name: "elitecell-auth-v5",
      version: 1,
      // Não persiste o prefill/ticket transitório do Google (só a sessão durável).
      partialize: (s) => ({
        user: s.user,
        stores: s.stores,
        activeStore: s.activeStore,
        homeTenantId: s.homeTenantId,
        pendingStoreSelection: s.pendingStoreSelection,
      }),
      migrate: () => ({ user: null, stores: [], activeStore: null, homeTenantId: null, pendingStoreSelection: false, googleSignup: null }),
    },
  ),
);
