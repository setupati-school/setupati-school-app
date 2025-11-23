import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">403 - Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page.
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate('/admin/dashboard')}>
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;