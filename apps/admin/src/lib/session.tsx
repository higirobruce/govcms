import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  getTenantId,
  getToken,
  setTenantId as persistTenant,
  setToken as persistToken,
  type AuthUser,
} from "./api";

interface Session {
  user: AuthUser | null;
  ready: boolean;
  tenantId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  selectTenant: (id: string) => void;
}

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [tenantId, setTid] = useState<string | null>(getTenantId());

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => {
        persistToken(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    persistToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    persistToken(null);
    persistTenant(null);
    setUser(null);
    setTid(null);
  }, []);

  const selectTenant = useCallback((id: string) => {
    persistTenant(id);
    setTid(id);
  }, []);

  const value = useMemo(
    () => ({ user, ready, tenantId, login, logout, selectTenant }),
    [user, ready, tenantId, login, logout, selectTenant],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSession outside SessionProvider");
  return c;
}
