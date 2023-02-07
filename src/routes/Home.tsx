import { Navigate, useLocation } from "react-router";

import { useStorage } from "@plasmohq/storage/dist/hook";

import { StorageKey } from "~const";

function Home() {
  const location = useLocation();
  const [token] = useStorage<string>(StorageKey.ApiToken);

  if (token) {
    return <Navigate to="/aliases" state={{ from: location }} replace />;
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
}

export default Home;
