import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import './App.css';
import { getIssues, getPriorityMetrics, getStatusMetrics, syncIssues } from './api';

const STORAGE_KEY = 'issue-tracker-user';
const USERS_KEY = 'issue-tracker-users';

function App() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [user, setUser] = useState(null);
  const [projectKey, setProjectKey] = useState('KAN');
  const [issues, setIssues] = useState([]);
  const [statusMetrics, setStatusMetrics] = useState([]);
  const [priorityMetrics, setPriorityMetrics] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const storedUser = window.localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      void loadDashboard();
    }
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [issuesResponse, statusResponse, priorityResponse] = await Promise.all([
        getIssues(),
        getStatusMetrics(),
        getPriorityMetrics(),
      ]);
      setIssues(issuesResponse.data);
      setStatusMetrics(statusResponse.data);
      setPriorityMetrics(priorityResponse.data);
      setFeedback('Dashboard refreshed successfully.');
    } catch (error) {
      setFeedback('Could not reach the backend yet. Make sure it is running on port 8081.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    const existingUsers = JSON.parse(window.localStorage.getItem(USERS_KEY) || '[]');

    if (mode === 'register') {
      if (!form.name || !form.email || !form.password) {
        setFeedback('Please complete every field before registering.');
        return;
      }
      const duplicate = existingUsers.some((entry) => entry.email === form.email);
      if (duplicate) {
        setFeedback('That email is already registered. Please log in instead.');
        return;
      }
      const nextUser = { name: form.name, email: form.email, password: form.password };
      existingUsers.push(nextUser);
      window.localStorage.setItem(USERS_KEY, JSON.stringify(existingUsers));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
      setFeedback('Account created. Welcome aboard!');
      await loadDashboard();
      return;
    }

    const match = existingUsers.find((entry) => entry.email === form.email && entry.password === form.password);
    if (!match) {
      setFeedback('No account matches those details. Try registering first.');
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
    setUser(match);
    setFeedback('Login successful. Loading your Jira view...');
    await loadDashboard();
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await syncIssues(projectKey);
      setFeedback(response.data.message || `Synced ${response.data.count ?? 0} issues.`);
      await loadDashboard();
    } catch (error) {
      const message = error?.response?.data?.message || 'Sync failed. Please verify your Jira credentials.';
      setFeedback(message);
    } finally {
      setSyncing(false);
    }
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setIssues([]);
    setStatusMetrics([]);
    setPriorityMetrics([]);
    setFeedback('You have been logged out.');
  };

  const maxStatusValue = Math.max(...statusMetrics.map((item) => Number(item.value || 0)), 1);
  const maxPriorityValue = Math.max(...priorityMetrics.map((item) => Number(item.value || 0)), 1);

  const summary = useMemo(() => ({
    totalIssues: issues.length,
    openIssues: issues.filter((issue) => issue.status && issue.status.toLowerCase() !== 'done').length,
    highPriority: issues.filter((issue) => issue.priority && issue.priority.toLowerCase().includes('high')).length,
  }), [issues]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
          <section className="flex-1 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/40">
            <div className="mb-6 flex items-center gap-3 text-cyan-400">
              <Sparkles size={22} />
              <span className="text-sm font-semibold uppercase tracking-[0.35em]">Jira Insight</span>
            </div>
            <h1 className="text-4xl font-semibold">Authenticate and monitor your Jira delivery flow.</h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300">
              Register or log in, then pull your project issues into a live dashboard with status and priority charts.
            </p>
            <div className="mt-8 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-300">
              <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-400" /> Secure local access with saved account details.</div>
              <div className="flex items-center gap-2"><Activity size={18} className="text-cyan-400" /> Sync directly from your Jira workspace into the app.</div>
              <div className="flex items-center gap-2"><BarChart3 size={18} className="text-fuchsia-400" /> View issue distribution in charts and tables.</div>
            </div>
          </section>

          <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
            <div className="mb-6 flex gap-2 rounded-full border border-slate-800 p-1">
              <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${mode === 'login' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'}`}>Login</button>
              <button type="button" onClick={() => setMode('register')} className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${mode === 'register' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'}`}>Register</button>
            </div>

            <form className="space-y-4" onSubmit={handleAuth}>
              {mode === 'register' && (
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Full name</label>
                  <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none ring-0" placeholder="Ada Lovelace" />
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm text-slate-300">Email</label>
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none ring-0" placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Password</label>
                <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none ring-0" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">{mode === 'register' ? 'Create account' : 'Log in'}</button>
            </form>

            {feedback ? <p className="mt-4 text-sm text-slate-400">{feedback}</p> : null}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-50">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Jira Insight</p>
            <h2 className="mt-2 text-2xl font-semibold">Welcome back, {user.name || user.email}</h2>
            <p className="mt-2 text-sm text-slate-400">Sync your project data and review the latest issue health in one place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input value={projectKey} onChange={(event) => setProjectKey(event.target.value.toUpperCase())} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm" placeholder="Project key" />
            <button onClick={handleSync} disabled={syncing} className="rounded-2xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60">{syncing ? 'Syncing…' : 'Sync Jira'}</button>
            <button onClick={logout} className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300"> <LogOut size={16} className="mr-2 inline" />Logout</button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Total issues</p>
            <p className="mt-2 text-3xl font-semibold">{summary.totalIssues}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Open issues</p>
            <p className="mt-2 text-3xl font-semibold">{summary.openIssues}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">High priority</p>
            <p className="mt-2 text-3xl font-semibold">{summary.highPriority}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Status breakdown</h3>
              <span className="text-sm text-slate-400">{feedback}</span>
            </div>
            <div className="mt-6 space-y-4">
              {statusMetrics.length === 0 ? <p className="text-sm text-slate-400">No status data yet. Click sync to pull issues from Jira.</p> : statusMetrics.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${(Number(item.value || 0) / maxStatusValue) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h3 className="text-lg font-semibold">Priority breakdown</h3>
            <div className="mt-6 space-y-4">
              {priorityMetrics.length === 0 ? <p className="text-sm text-slate-400">No priority data yet.</p> : priorityMetrics.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-fuchsia-500" style={{ width: `${(Number(item.value || 0) / maxPriorityValue) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Jira issue list</h3>
            {loading ? <span className="text-sm text-slate-400">Loading...</span> : null}
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">Key</th>
                  <th className="pb-3 pr-4">Summary</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Priority</th>
                  <th className="pb-3 pr-4">Assignee</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">No issues yet. Click sync to fetch your Jira board.</td>
                  </tr>
                ) : issues.map((issue) => (
                  <tr key={issue.id} className="border-b border-slate-800/70 text-slate-200">
                    <td className="py-3 pr-4 font-medium text-cyan-300">{issue.issueKey}</td>
                    <td className="py-3 pr-4">{issue.summary || '—'}</td>
                    <td className="py-3 pr-4">{issue.status || 'Unknown'}</td>
                    <td className="py-3 pr-4">{issue.priority || 'Medium'}</td>
                    <td className="py-3 pr-4">{issue.assignee || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;