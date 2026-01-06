import BrandLogo from "../shared/logo";
import { ModeToggle } from "../shared/mode-toggle";
import { Wrapper } from "../shared/wrapper";

const MainHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-background shadow-sm shadow-foreground/10">
      <Wrapper centered>
        <div className="flex items-center justify-between gap-md space-y-sm">
          <BrandLogo />
          <ModeToggle />
        </div>
      </Wrapper>
    </header>
  );
};

export default MainHeader;
