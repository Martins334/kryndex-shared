import { toast } from 'sonner'

const BASE = import.meta.env.VITE_API_URL as string

// Aviso único quando a conta entra em modo somente-leitura (teste expirado OU assinatura
// pendente/vencida). Evita spamar o mesmo toast quando várias escritas falham juntas.
let _readonlyToastAt = 0
function warnReadonly(reason: 'trial' | 'subscription'): void {
  const now = Date.now()
  if (now - _readonlyToastAt < 4000) return
  _readonlyToastAt = now
  toast.error(
    reason === 'subscription'
      ? 'Sua assinatura está com pagamento pendente ou vencida — regularize para criar ou editar.'
      : 'Seu período de teste expirou — assine para criar ou editar.',
  )
}

// O prefixo `elitecell-` destas chaves é da marca antiga e FICA de propósito: é identificador
// de armazenamento, não texto visível. Renomear sem migração desloga na hora todo mundo que
// tem sessão aberta — quem quiser trocar precisa ler a chave antiga, regravar na nova e só
// então apagar a velha. Mesma razão vale para `elitecell-auth-v5` (authStore),
// `elitecell-meta-mensal` (dashboard) e `elitecell:commissionRate` (comissões/relatórios).
export function getToken(): string | null {
  return localStorage.getItem('elitecell-jwt')
}

export function setToken(token: string): void {
  localStorage.setItem('elitecell-jwt', token)
}

export function clearToken(): void {
  localStorage.removeItem('elitecell-jwt')
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('elitecell-rt')
}

export function setRefreshToken(token: string): void {
  localStorage.setItem('elitecell-rt', token)
}

export function clearRefreshToken(): void {
  localStorage.removeItem('elitecell-rt')
}

// Returns the token expiry as a Unix timestamp (seconds), or null if not decodable.
export function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

// Singleton promise to avoid multiple concurrent refresh calls.
let _refreshing: Promise<string | null> | null = null

export async function refreshAccessToken(): Promise<string | null> {
  if (_refreshing) return _refreshing
  _refreshing = (async () => {
    const rt = getRefreshToken()
    if (!rt) return null
    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      })
      if (!res.ok) {
        clearToken()
        clearRefreshToken()
        return null
      }
      const data = await res.json()
      setToken(data.token)
      if (data.refreshToken) setRefreshToken(data.refreshToken)
      // Mantém permissões/cargo do usuário em sincronia com o JWT renovado (best-effort;
      // import dinâmico p/ evitar dependência circular — authStore importa este módulo).
      if (data.user) {
        import('../stores/authStore')
          .then(({ useAuthStore }) => {
            const cur = useAuthStore.getState().user
            if (cur) {
              useAuthStore.setState({
                user: {
                  ...cur,
                  role: data.user.role ?? cur.role,
                  permissions: data.user.permissions ?? cur.permissions,
                  roleName: data.user.roleName ?? cur.roleName,
                  technicianId: data.user.technicianId ?? cur.technicianId,
                  planSlug: data.user.planSlug ?? cur.planSlug,
                  superAdmin: data.user.superAdmin ?? cur.superAdmin,
                  emailVerified: data.user.emailVerified ?? cur.emailVerified,
                },
              })
            }
          })
          .catch(() => {})
      }
      return data.token as string
    } catch {
      return null
    } finally {
      _refreshing = null
    }
  })()
  return _refreshing
}

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (res.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      const retry = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
          ...(init?.headers ?? {}),
        },
      })
      if (retry.ok) {
        if (retry.status === 204) return undefined as T
        return retry.json() as Promise<T>
      }
      const retryBody = await retry.json().catch(() => ({}))
      throw Object.assign(new Error(retryBody.error ?? `HTTP ${retry.status}`), {
        status: retry.status,
        body: retryBody,
      })
    }
    // Refresh failed — clear session. Só force ida ao login se estivermos numa área
    // do painel. Em páginas públicas (login, signup, marketing, portal do cliente), um
    // 401 de fundo (ex.: query admin residual) NÃO deve sequestrar a navegação —
    // isso jogava o usuário de volta ao /admin/login ao abrir /signup.
    clearToken()
    clearRefreshToken()
    if (typeof window !== 'undefined') {
      const p = window.location.pathname
      if (p.startsWith('/admin') && p !== '/admin/login') {
        window.location.href = '/admin/login'
      }
    }
    throw new Error('Sessão expirada')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const code = (body as { code?: string }).code
    if (res.status === 403 && code === 'TRIAL_EXPIRED_READONLY') warnReadonly('trial')
    if (res.status === 403 && code === 'SUBSCRIPTION_PAST_DUE') warnReadonly('subscription')
    throw Object.assign(new Error(body.error ?? `HTTP ${res.status}`), { status: res.status, body })
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
