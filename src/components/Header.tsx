import { Link } from "react-router-dom";
import { Box } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" flex h-16 items-center justify-between px-4 md:px-8">
        <Link 
          to="/" 
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <Box className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">
            Dev Tools Studio
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
