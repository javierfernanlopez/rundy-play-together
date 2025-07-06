import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      // ✅ MODIFICAMOS ESTA LÍNEA
      className="fixed right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      // ✅ Y AÑADIMOS ESTA
      style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }} // 5rem es el equivalente a 'bottom-20' de Tailwind
      size="icon"
    >
      <Plus className="h-6 w-6 text-white" />
    </Button>
  );
};

export default FloatingActionButton;