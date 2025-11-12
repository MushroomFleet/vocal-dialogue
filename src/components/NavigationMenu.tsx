import { ChevronDown } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

export const EcosystemNavigationMenu = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex items-center gap-1">
        {/* News */}
        <NavigationMenuItem>
          <NavigationMenuLink
            href="https://vestig.oragenai.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2",
              "text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground focus:outline-none"
            )}
          >
            News
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Radio */}
        <NavigationMenuItem>
          <NavigationMenuLink
            href="https://www.scuffedepoch.com/radio.html"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2",
              "text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground focus:outline-none"
            )}
          >
            Radio
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Gallery */}
        <NavigationMenuItem>
          <NavigationMenuLink
            href="https://gallery.scuffedepoch.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2",
              "text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground focus:outline-none"
            )}
          >
            Gallery
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* MORE Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9">MORE</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-1 p-2 bg-popover">
              <li>
                <NavigationMenuLink asChild>
                  <a
                    href="https://careless.oragenai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    )}
                  >
                    <div className="text-sm font-medium leading-none">Careless</div>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a
                    href="https://cognition.oragenai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    )}
                  >
                    <div className="text-sm font-medium leading-none">Cognition</div>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a
                    href="https://spittoon.oragenai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    )}
                  >
                    <div className="text-sm font-medium leading-none">Spittoon</div>
                  </a>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <a
                    href="https://www.oragenai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    )}
                  >
                    <div className="text-sm font-medium leading-none">All Apps</div>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Ko-fi Donation Button */}
        <NavigationMenuItem>
          <NavigationMenuLink
            href="https://ko-fi.com/driftjohnson"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center h-9"
          >
            <img
              src="https://cdn.ko-fi.com/cdn/kofi3.png?v=3"
              alt="Ko-fi"
              className="h-9 hover:opacity-80 transition-opacity"
            />
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
