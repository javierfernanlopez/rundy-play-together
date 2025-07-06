import { Home, Trophy, User } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NavigationBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationBar = ({ activeTab, onTabChange }: NavigationBarProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'matches', label: 'Partidos', icon: Trophy },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => onTabChange(tab.id)}
                // ✅ LA CLASE 'space-y-1' HA SIDO ELIMINADA DE AQUÍ
                className={`flex flex-col items-center h-auto py-2 px-4 ${
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : ''}`} />
                {/* Puedes añadir un margen superior aquí si lo ves necesario, ej: mt-0.5 */}
                <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                  {tab.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;