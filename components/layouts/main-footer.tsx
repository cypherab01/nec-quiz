import { Section } from "../shared/section";
import { Wrapper } from "../shared/wrapper";

const MainFooter = () => {
  return (
    <Wrapper>
      <Section size="xs">
        <footer className="tailwind-typography text-center tailwind-typography">
          <p>All rights reserved &copy; {new Date().getFullYear()} NEC Quiz</p>
        </footer>
      </Section>
    </Wrapper>
  );
};

export default MainFooter;
