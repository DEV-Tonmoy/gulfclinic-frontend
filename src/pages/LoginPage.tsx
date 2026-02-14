// ... (keep your imports)
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  // ... (keep your states)
  const { checkAuth } = useAuth(); // Add this
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/admin/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('admin_token', response.data.token);
        
        // CRITICAL: Tell the auth hook to re-check the token NOW
        await checkAuth(); 
        
        navigate('/dashboard');
      }
    } catch (err: any) {
      // ... (keep error handling)
    } finally {
      setLoading(false);
    }
  };

  // ... (keep the rest of your JSX)
};

export default LoginPage;