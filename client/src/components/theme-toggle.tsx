import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-medical-border/50 dark:hover:bg-white/10"
        data-testid="button-theme-toggle"
      >
        {theme === 'light' ? (
          <>
            <i className="fas fa-moon text-medical-text-primary dark:text-white"></i>
            <span className="hidden lg:block text-medical-text-primary dark:text-white">Dark</span>
          </>
        ) : (
          <>
            <i className="fas fa-sun text-yellow-500"></i>
            <span className="hidden lg:block text-yellow-500">Light</span>
          </>
        )}
      </button>
    </div>
  );
}