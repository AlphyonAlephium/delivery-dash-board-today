
import React from "react";
import { Link } from "react-router-dom";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";

const Header = () => {
  return (
    <header className="pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Management</h1>
          <p className="text-muted-foreground">
            A dashboard for project and logistics management
          </p>
        </div>
        
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/" className={navigationMenuTriggerStyle()}>
                Dashboard
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/projects" className={navigationMenuTriggerStyle()}>
                Projects
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/missing-materials" className={navigationMenuTriggerStyle()}>
                Missing Materials
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/ordered-materials" className={navigationMenuTriggerStyle()}>
                Ordered Materials
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default Header;
