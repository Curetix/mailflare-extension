import { Container } from "@mantine/core";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { useStorage } from "@plasmohq/storage/dist/hook";

import AliasList from "~components/AliasList";
import Login from "~components/Login";
import { ThemeProvider } from "~popup/Theme";

const queryClient = new QueryClient();

function Popup() {
  const [storedToken] = useStorage<string>("apiToken", null);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Container miw={400} maw={400} mih={600} mah={600} p={0}>
          {!storedToken && <Login />}
          {storedToken && <AliasList />}
        </Container>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default Popup;
