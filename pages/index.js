import { useSession } from "next-auth/react";

import Home from "containers/Home/Home";
import HomeWithLogo from "containers/Home/HomeWithLogo";
import { useSetting } from "hooks";

const MainPage = () => {
  const { data: session } = useSession();

  const isDefault = session?.user?.login_as_default;

  if (isDefault) return null;

  return <Home />;
};

export default MainPage;
