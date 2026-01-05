import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, ChevronDown } from "lucide-react";

interface UserMenuProps {
  variant?: "default" | "gradient";
}

export function UserMenu({ variant = "gradient" }: UserMenuProps) {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="w-20 h-9 glass rounded-lg animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Button 
        variant={variant} 
        size="sm" 
        onClick={() => navigate("/auth")}
        className="group"
      >
        Sign In
      </Button>
    );
  }

  const userEmail = user.email || "User";
  const displayName = userEmail.split("@")[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 glass px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium max-w-[100px] truncate hidden sm:block">
          {displayName}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl border border-white/10 shadow-xl overflow-hidden z-50"
            >
              <div className="p-3 border-b border-white/10">
                <p className="text-sm font-medium truncate">{userEmail}</p>
                <p className="text-xs text-muted-foreground">Logged in</p>
              </div>
              
              <div className="p-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
