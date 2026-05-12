import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import { useI18n } from '../i18n/I18nProvider';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t('login.success'));
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error(t('common.serverUnavailable'));
        return;
      }
      toast.error(err.response.data?.message || t('login.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'ahmed.bensalah@universite.tn', password: 'Admin123!' },
      security: { email: 'yasmine.trabelsi@universite.tn', password: 'Security123!' },
      student: { email: 'marwen.gharbi@universite.tn', password: 'Student123!' },
      teacher: { email: 'amira.jebali@universite.tn', password: 'Teacher123!' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      <div className="absolute inset-0 bg-radial-gradient from-blue-950/30 via-transparent to-transparent" />
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/50 mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{t('common.appName')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('login.subtitle')}</p>
        </div>

        <div className="card border-slate-700/50 shadow-2xl shadow-black/50">
          <h2 className="text-lg font-semibold text-slate-200 mb-6">{t('login.title')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('login.email')}</label>
              <input
                type="email"
                className="input"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">{t('login.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="********"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {t('login.connecting')}
                </span>
              ) : (
                <><LogIn size={16} /> {t('login.submit')}</>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="divider" />
            <p className="text-xs text-slate-500 text-center mb-3">{t('login.demoAccounts')}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'admin', label: t('login.demoAdmin'), color: 'border-purple-500/30 hover:bg-purple-500/10 text-purple-400' },
                { role: 'security', label: t('login.demoSecurity'), color: 'border-blue-500/30 hover:bg-blue-500/10 text-blue-400' },
                { role: 'student', label: t('login.demoStudent'), color: 'border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400' },
                { role: 'teacher', label: t('login.demoTeacher'), color: 'border-amber-500/30 hover:bg-amber-500/10 text-amber-400' },
              ].map(({ role, label, color }) => (
                <button key={role} type="button" onClick={() => fillDemo(role)}
                  className={`text-xs font-medium px-3 py-2 rounded-lg border bg-transparent transition-all ${color}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
