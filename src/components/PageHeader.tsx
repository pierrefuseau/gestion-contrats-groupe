import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

interface PageHeaderProps {
  backTo?: string;
  backLabel?: string;
}

export function PageHeader({ backTo, backLabel }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-border px-6 py-4 sticky top-0 z-10 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="flex items-center gap-2 text-muted hover:text-accent transition-colors duration-150"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium text-sm">{backLabel || 'Retour'}</span>
            </button>
          )}
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-150"
        >
          <img
            src="/logo_fuseau_hd.png"
            alt="Accueil"
            className="h-9 object-contain"
          />
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <Home className="w-4 h-4 text-accent" />
          </div>
        </button>
      </div>
    </header>
  );
}
