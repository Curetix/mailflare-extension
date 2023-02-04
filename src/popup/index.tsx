import { Container } from "@mantine/core";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { useStorage } from "@plasmohq/storage/dist/hook";

import AliasList from "~components/AliasList";
import Login from "~components/Login";
import { popupHeight, popupWidth } from "~const";
import { ThemeProvider } from "~popup/Theme";

const queryClient = new QueryClient();

function Popup() {
  const [token] = useStorage<string>("apiToken", null);
  const [reactQueryDevtoolsEnabled] = useStorage<boolean>("reactQueryDevtoolsEnabled", false);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {reactQueryDevtoolsEnabled && <ReactQueryDevtools initialIsOpen={false} />}
        <Container w={popupWidth} h={popupHeight} p={0}>
          {!token && <Login />}
          {token && <AliasList />}
        </Container>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default Popup;
