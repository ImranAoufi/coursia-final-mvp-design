export function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Turquoise orbs */}
      <div className="absolute top-20 left-10 w-[500px] h-[500px] orb-primary rounded-full blur-[120px] animate-float" />
      <div className="absolute top-1/3 right-20 w-[600px] h-[600px] orb-primary rounded-full blur-[140px] animate-float" style={{ animationDelay: "2s", animationDuration: "4s" }} />
      
      {/* Purple orbs */}
      <div className="absolute bottom-20 left-1/4 w-[550px] h-[550px] orb-secondary rounded-full blur-[130px] animate-float" style={{ animationDelay: "1s", animationDuration: "5s" }} />
      <div className="absolute top-1/2 right-1/3 w-[450px] h-[450px] orb-secondary rounded-full blur-[110px] animate-float" style={{ animationDelay: "3s" }} />
      
      {/* Blue accent orbs */}
      <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] orb-accent rounded-full blur-[125px] animate-float" style={{ animationDelay: "1.5s", animationDuration: "4.5s" }} />
      <div className="absolute top-2/3 left-1/3 w-[480px] h-[480px] orb-accent rounded-full blur-[115px] animate-float" style={{ animationDelay: "2.5s" }} />
    </div>
  );
}
