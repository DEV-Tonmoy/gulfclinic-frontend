// ... existing imports
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Axios uses the BASE_URL from axios.ts, so we just need the endpoint
      const response = await api.post('/admin/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('admin_token', response.data.token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Login Error Object:", err);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Network Error: Backend might be sleeping or CORS is blocking.');
      } else {
        setError(err.response?.data?.message || 'Invalid credentials or Server Error.');
      }
    } finally {
      setLoading(false);
    }
  };
// ... rest of the component