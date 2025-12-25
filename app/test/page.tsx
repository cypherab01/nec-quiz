import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const TestPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const listSessions = await auth.api.listSessions({
    headers: await headers(),
  });
  console.log(listSessions);
  console.log(session);
  return <div>TestPage</div>;
};

export default TestPage;
