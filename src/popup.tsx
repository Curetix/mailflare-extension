import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";

import { useStorage } from "@plasmohq/storage/dist/hook";

import Aliases from "~components/aliases";
import Login from "~components/login";
import { ThemeProvider } from "~theme";

const queryClient = new QueryClient();

function IndexPopup() {
  const [storedToken] = useStorage<string>("apiToken", null);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {!storedToken && <Login />}
        {storedToken && <Aliases />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default IndexPopup;
