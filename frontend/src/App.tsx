import { useMemo, useState } from 'react';
import { apiRequest } from './api';
import { ResourceTable } from './components/ResourceTable';
import { StatusCard } from './components/StatusCard';
import { useApiQuery } from './hooks/useApiQuery';
import { useStoredState } from './hooks/useStoredState';
import './styles.css';

type AuthResponse = {
  token: string;
};

type ListResponse<T> = {
  items: T[];
};

type NavKey =
  | 'dashboard'
  | 'users'
  | 'events'
  | 'wallets'
  | 'transactions'
  | 'vendors';

const defaultBaseUrl = 'http://localhost:3000/api';

function normalizeList<T>(payload: T[] | ListResponse<T> | null): T[] {
  if (!payload) {
    return [];
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  if ('items' in payload) {
    return payload.items;
  }
  return [];
}

export default function App() {
  const [baseUrl, setBaseUrl] = useStoredState('coopon.baseUrl', defaultBaseUrl);
  const [token, setToken] = useStoredState<string | null>('coopon.token', null);
  const [activeNav, setActiveNav] = useState<NavKey>('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const client = useMemo(
    () => ({
      baseUrl,
      token: token ?? undefined,
    }),
    [baseUrl, token],
  );

  const userQuery = useApiQuery<Record<string, unknown>>(
    client,
    '/users/me',
    Boolean(token),
  );

  const usersQuery = useApiQuery<ListResponse<Record<string, unknown>>>(
    client,
    '/users',
    Boolean(token),
  );

  const eventsQuery = useApiQuery<ListResponse<Record<string, unknown>>>(
    client,
    '/events',
    Boolean(token),
  );

  const walletsQuery = useApiQuery<ListResponse<Record<string, unknown>>>(
    client,
    '/wallets',
    Boolean(token),
  );

  const transactionsQuery = useApiQuery<ListResponse<Record<string, unknown>>>(
    client,
    '/transactions',
    Boolean(token),
  );

  const vendorsQuery = useApiQuery<ListResponse<Record<string, unknown>>>(
    client,
    '/vendors',
    Boolean(token),
  );

  const userWalletsQuery = useApiQuery<Record<string, unknown>[]>(
    client,
    '/users/me/wallets',
    Boolean(token),
  );

  const [walletId, setWalletId] = useState('');
  const walletTransactionsQuery = useApiQuery<Record<string, unknown>[]>(
    client,
    walletId ? `/wallets/${walletId}/transactions` : '/wallets/0/transactions',
    Boolean(token) && Boolean(walletId),
  );

  const [vendorId, setVendorId] = useState('');
  const vendorTransactionsQuery = useApiQuery<Record<string, unknown>[]>(
    client,
    vendorId ? `/vendors/${vendorId}/transactions` : '/vendors/0/transactions',
    Boolean(token) && Boolean(vendorId),
  );

  const [vendorLookupId, setVendorLookupId] = useState('');
  const vendorLookupQuery = useApiQuery<Record<string, unknown>>(
    client,
    vendorLookupId ? `/vendors/${vendorLookupId}` : '/vendors/0',
    Boolean(token) && Boolean(vendorLookupId),
  );

  const stats = [
    {
      label: 'Users',
      value: normalizeList(usersQuery.data).length || '—',
      tone: 'info' as const,
    },
    {
      label: 'Events',
      value: normalizeList(eventsQuery.data).length || '—',
      tone: 'success' as const,
    },
    {
      label: 'Wallets',
      value: normalizeList(walletsQuery.data).length || '—',
      tone: 'default' as const,
    },
    {
      label: 'Transactions',
      value: normalizeList(transactionsQuery.data).length || '—',
      tone: 'warning' as const,
    },
    {
      label: 'Vendors',
      value: normalizeList(vendorsQuery.data).length || '—',
      tone: 'info' as const,
    },
  ];

  const navItems: Array<{ key: NavKey; label: string; subtitle: string }> = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      subtitle: 'Overview & stats',
    },
    { key: 'users', label: 'Users', subtitle: 'Profiles & roles' },
    { key: 'events', label: 'Events', subtitle: 'Organiser events' },
    { key: 'wallets', label: 'Wallets', subtitle: 'Balances & activity' },
    {
      key: 'transactions',
      label: 'Transactions',
      subtitle: 'Payments & history',
    },
    { key: 'vendors', label: 'Vendors', subtitle: 'Booth data' },
  ];

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const response = await apiRequest<AuthResponse>(
        { baseUrl },
        '/sessions',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      );
      setToken(response.token);
      setPassword('');
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : 'Login failed. Try again.',
      );
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    setToken(null);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo">C</span>
          <div>
            <h1>Coop-on</h1>
            <p>Admin Console</p>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={activeNav === item.key ? 'active' : ''}
              onClick={() => setActiveNav(item.key)}
              type="button"
            >
              <span>{item.label}</span>
              <small>{item.subtitle}</small>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <label>
            API Base URL
            <input
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="http://localhost:3000/api"
            />
          </label>
          {token ? (
            <button className="ghost" type="button" onClick={handleLogout}>
              Logout
            </button>
          ) : null}
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h2>{navItems.find((item) => item.key === activeNav)?.label}</h2>
            <p className="muted">
              {navItems.find((item) => item.key === activeNav)?.subtitle}
            </p>
          </div>
          {token ? (
            <div className="token-chip">
              <span className="dot" />
              Session active
            </div>
          ) : (
            <div className="token-chip warning">
              <span className="dot" />
              Not authenticated
            </div>
          )}
        </header>

        {!token ? (
          <section className="card login-card">
            <h3>Sign in to continue</h3>
            <p className="muted">
              Use a backend user account to fetch data. You can adjust the API
              URL in the sidebar.
            </p>
            <form onSubmit={handleLogin} className="login-form">
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@coop-on.be"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
              </label>
              {loginError ? <p className="error">{loginError}</p> : null}
              <button type="submit" disabled={loginLoading}>
                {loginLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </section>
        ) : null}

        {token && activeNav === 'dashboard' ? (
          <>
            <section className="stats-grid">
              {stats.map((stat) => (
                <StatusCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  tone={stat.tone}
                />
              ))}
            </section>

            <section className="card">
              <div className="card-header">
                <h3>Current user</h3>
                <button type="button" onClick={userQuery.refresh}>
                  Refresh
                </button>
              </div>
              {userQuery.loading ? (
                <p className="muted">Loading user profile...</p>
              ) : userQuery.error ? (
                <p className="error">{userQuery.error.message}</p>
              ) : (
                <pre className="json">{JSON.stringify(userQuery.data, null, 2)}</pre>
              )}
            </section>

            <section className="grid-two">
              <ResourceTable
                title="Latest users"
                data={normalizeList(usersQuery.data).slice(0, 5)}
                emptyMessage="No users returned."
              />
              <ResourceTable
                title="Recent events"
                data={normalizeList(eventsQuery.data).slice(0, 5)}
                emptyMessage="No events returned."
              />
            </section>
          </>
        ) : null}

        {token && activeNav === 'users' ? (
          <>
            <section className="card inline-actions">
              <div>
                <h3>Users overview</h3>
                <p className="muted">Explore registered users and roles.</p>
              </div>
              <button type="button" onClick={usersQuery.refresh}>
                Refresh
              </button>
            </section>
            {usersQuery.error ? (
              <p className="error">{usersQuery.error.message}</p>
            ) : null}
            <ResourceTable
              title="All users"
              data={normalizeList(usersQuery.data)}
              emptyMessage="No users available or access denied."
            />
          </>
        ) : null}

        {token && activeNav === 'events' ? (
          <>
            <section className="card inline-actions">
              <div>
                <h3>Events catalogue</h3>
                <p className="muted">Manage events created by organisers.</p>
              </div>
              <button type="button" onClick={eventsQuery.refresh}>
                Refresh
              </button>
            </section>
            {eventsQuery.error ? (
              <p className="error">{eventsQuery.error.message}</p>
            ) : null}
            <ResourceTable
              title="All events"
              data={normalizeList(eventsQuery.data)}
              emptyMessage="No events available or access denied."
            />
          </>
        ) : null}

        {token && activeNav === 'wallets' ? (
          <>
            <section className="card inline-actions">
              <div>
                <h3>Wallets & balances</h3>
                <p className="muted">
                  Review wallet balances and ownership information.
                </p>
              </div>
              <button type="button" onClick={walletsQuery.refresh}>
                Refresh
              </button>
            </section>
            <div className="grid-two">
              <ResourceTable
                title="All wallets"
                data={normalizeList(walletsQuery.data)}
                emptyMessage="No wallets available or access denied."
              />
              <ResourceTable
                title="My wallets"
                data={userWalletsQuery.data ?? []}
                emptyMessage="No wallets linked to your account."
              />
            </div>
          </>
        ) : null}

        {token && activeNav === 'transactions' ? (
          <>
            <section className="card inline-actions">
              <div>
                <h3>Transactions & activity</h3>
                <p className="muted">Monitor payments per wallet or vendor.</p>
              </div>
              <button type="button" onClick={transactionsQuery.refresh}>
                Refresh
              </button>
            </section>
            <ResourceTable
              title="All transactions"
              data={normalizeList(transactionsQuery.data)}
              emptyMessage="No transactions available or access denied."
            />
            <div className="grid-two">
              <section className="card">
                <div className="card-header">
                  <h3>Wallet transactions</h3>
                </div>
                <label>
                  Wallet ID
                  <input
                    value={walletId}
                    onChange={(event) => setWalletId(event.target.value)}
                    placeholder="e.g. 12"
                  />
                </label>
                <button
                  type="button"
                  onClick={walletTransactionsQuery.refresh}
                  disabled={!walletId}
                >
                  Fetch
                </button>
                {walletTransactionsQuery.error ? (
                  <p className="error">{walletTransactionsQuery.error.message}</p>
                ) : null}
                <pre className="json">
                  {JSON.stringify(walletTransactionsQuery.data, null, 2)}
                </pre>
              </section>
              <section className="card">
                <div className="card-header">
                  <h3>Vendor transactions</h3>
                </div>
                <label>
                  Vendor ID
                  <input
                    value={vendorId}
                    onChange={(event) => setVendorId(event.target.value)}
                    placeholder="e.g. 8"
                  />
                </label>
                <button
                  type="button"
                  onClick={vendorTransactionsQuery.refresh}
                  disabled={!vendorId}
                >
                  Fetch
                </button>
                {vendorTransactionsQuery.error ? (
                  <p className="error">{vendorTransactionsQuery.error.message}</p>
                ) : null}
                <pre className="json">
                  {JSON.stringify(vendorTransactionsQuery.data, null, 2)}
                </pre>
              </section>
            </div>
          </>
        ) : null}

        {token && activeNav === 'vendors' ? (
          <>
            <section className="card inline-actions">
              <div>
                <h3>Vendors & booths</h3>
                <p className="muted">Review vendor profiles and details.</p>
              </div>
              <button type="button" onClick={vendorsQuery.refresh}>
                Refresh
              </button>
            </section>
            <ResourceTable
              title="All vendors"
              data={normalizeList(vendorsQuery.data)}
              emptyMessage="No vendors available or access denied."
            />
            <section className="card">
              <div className="card-header">
                <h3>Vendor lookup</h3>
              </div>
              <label>
                Vendor ID
                <input
                  value={vendorLookupId}
                  onChange={(event) => setVendorLookupId(event.target.value)}
                  placeholder="e.g. 8"
                />
              </label>
              <button
                type="button"
                onClick={vendorLookupQuery.refresh}
                disabled={!vendorLookupId}
              >
                Fetch
              </button>
              {vendorLookupQuery.error ? (
                <p className="error">{vendorLookupQuery.error.message}</p>
              ) : null}
              <pre className="json">
                {JSON.stringify(vendorLookupQuery.data, null, 2)}
              </pre>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
