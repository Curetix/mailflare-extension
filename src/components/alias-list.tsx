import {
  IconEdit,
  IconListCheck,
  IconPlaylistAdd,
  IconPlaylistX,
  IconRefresh,
  IconSearch,
  IconSearchOff,
  IconTrash,
} from "@tabler/icons-react";
import { useI18nContext } from "~i18n/i18n-react";
import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Center,
  Flex,
  Loader,
  ScrollArea,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { useAtom } from "jotai";

import AliasBulkDeleteModal from "~components/alias-bulk-delete-modal";
import AliasBulkEditModal from "~components/alias-bulk-edit-modal";
import AliasCard from "~components/alias-card";
import AliasCreateModal from "~components/alias-create-modal";
import AliasDeleteModal from "~components/alias-delete-modal";
import AliasEditModal from "~components/alias-edit-modal";
import { popupHeight } from "~const";
import { useCloudflare } from "~lib/cloudflare/use-cloudflare";
import { sortBy } from "~utils";
import { Alias } from "~utils/alias";
import { aliasSearchAtom, settingsAtom } from "~utils/state";

import "~/styles/scroll-area.css";

// popupHeight - header - divider - padding - select - button group - gap
const aliasListHeight = popupHeight - 52 - 1 - 16 * 2 - 36 - 26 - 10 * 2;

function AliasList() {
  const { LL } = useI18nContext();

  const { selectedZoneId, setSelectedZoneId, zones, emailDestinations, emailRules } =
    useCloudflare();

  const [{ ruleFilter }] = useAtom(settingsAtom);
  const [aliasSearch, setAliasSearch] = useAtom(aliasSearchAtom);
  const [filteredAliases, setFilteredAliases] = useState<Alias[]>([]);

  const [aliasCreateModalOpened, setAliasCreateModalOpened] = useState(false);
  const [aliasEditModalOpened, setAliasEditModalOpened] = useState(false);
  const [aliasDeleteModalOpened, setAliasDeleteModalOpened] = useState(false);
  const [aliasSelectEnabled, setAliasSelectEnabled] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  const [selectedAliases, selectedAliasesHandlers] = useListState<Alias>([]);
  const [aliasToEdit, setAliasToEdit] = useState<Alias | null>(null);
  const [aliasToDelete, setAliasToDelete] = useState<Alias | null>(null);

  function getAliasBadge(rule: Alias) {
    const destination = emailDestinations.data?.find((d) => rule.destination === d.email);
    if (
      emailDestinations.data &&
      emailDestinations.data.length > 0 &&
      (!destination || destination.verified === null)
    ) {
      return (
        <Badge color="red" variant="filled" size="xs">
          {LL.INVALID()}
        </Badge>
      );
    }
    if (rule.isExternal) {
      return (
        <Badge color="blue" size="xs">
          {LL.EXTERNAL()}
        </Badge>
      );
    }
    if (!rule.enabled) {
      return (
        <Badge color="red" size="xs">
          {LL.DISABLED()}
        </Badge>
      );
    }
  }

  useEffect(() => {
    if (!emailRules.isSuccess || !emailRules.data || emailRules.data.length === 0) {
      return;
    }
    setFilteredAliases(
      emailRules.data
        .filter((r) => r.matchers[0].type === "literal" && r.actions[0].type === "forward")
        .map((r) => Alias.fromCloudflareEmailRule(r))
        .filter((r) => (ruleFilter ? !r.isExternal : true))
        .filter(
          (r) =>
            aliasSearch === "" ||
            r.name.toLowerCase().includes(aliasSearch.toLowerCase()) ||
            r.address.toLowerCase().includes(aliasSearch.toLowerCase()),
        )
        .sort(sortBy<Alias>("priority", "descending")),
    );
  }, [emailRules.data, ruleFilter, aliasSearch]);

  return (
    <Flex p="md" h="calc(100% - 53px)" direction="column" gap="xs">
      <AliasCreateModal
        opened={aliasCreateModalOpened}
        onClose={() => setAliasCreateModalOpened(false)}
      />

      <AliasEditModal
        opened={aliasEditModalOpened && !!aliasToEdit && selectedAliases.length === 0}
        onClose={() => {
          setAliasEditModalOpened(false);
          setAliasToEdit(null);
        }}
        aliasToEdit={aliasToEdit!}
      />

      <AliasBulkEditModal
        opened={aliasEditModalOpened && selectedAliases.length > 0}
        onClose={(clear) => {
          setAliasEditModalOpened(false);
          if (clear) {
            setAliasSelectEnabled(false);
            selectedAliasesHandlers.setState([]);
          }
        }}
        selectedAliases={selectedAliases}
      />

      <AliasDeleteModal
        opened={aliasDeleteModalOpened && !!aliasToDelete && selectedAliases.length === 0}
        onClose={() => {
          setAliasDeleteModalOpened(false);
          setAliasToDelete(null);
        }}
        aliasToDelete={aliasToDelete!}
      />

      <AliasBulkDeleteModal
        opened={aliasDeleteModalOpened && selectedAliases.length > 0}
        onClose={(clear) => {
          setAliasDeleteModalOpened(false);
          if (clear) {
            setAliasSelectEnabled(false);
            selectedAliasesHandlers.setState([]);
          }
        }}
        selectedAliases={selectedAliases}
      />

      {/* DOMAIN SELECTOR */}
      <Select
        placeholder={LL.DOMAIN()}
        value={selectedZoneId}
        onChange={setSelectedZoneId}
        disabled={!zones.data || zones.data.length === 0}
        rightSection={zones.isFetching ? <Loader size="xs" /> : undefined}
        data={
          zones.data?.map((z) => ({
            value: z.id,
            label: z.name,
          })) || []
        }
        searchable={zones.isSuccess && zones.data.length > 5}
        allowDeselect={false}
      />

      {/* ACTION BUTTONS */}
      <Button.Group>
        <Button
          variant="light"
          size="compact-md"
          fullWidth
          leftSection={
            aliasSelectEnabled ? <IconPlaylistX size={16} /> : <IconListCheck size={16} />
          }
          disabled={
            !zones.data ||
            (!aliasSelectEnabled && filteredAliases.length === 0) ||
            selectedZoneId === null
          }
          onClick={() => {
            selectedAliasesHandlers.setState([]);
            setAliasSelectEnabled(!aliasSelectEnabled);
          }}>
          {aliasSelectEnabled ? LL.STOP_SELECT() : LL.SELECT()}
        </Button>
        {aliasSelectEnabled && (
          <>
            <Button
              variant="light"
              size="compact-md"
              fullWidth
              leftSection={<IconEdit size={16} />}
              disabled={selectedAliases.length === 0}
              onClick={() => setAliasEditModalOpened(true)}>
              {LL.EDIT()}
            </Button>
            <Button
              variant="light"
              color="red"
              size="compact-md"
              fullWidth
              leftSection={<IconTrash size={16} />}
              disabled={selectedAliases.length === 0}
              onClick={() => setAliasDeleteModalOpened(true)}>
              {LL.DELETE()}
            </Button>
          </>
        )}
        {!aliasSelectEnabled && (
          <>
            <Button
              variant="light"
              size="compact-md"
              fullWidth
              leftSection={<IconPlaylistAdd size={16} />}
              disabled={!zones.data || zones.data.length === 0 || selectedZoneId === null}
              onClick={() => setAliasCreateModalOpened(true)}>
              {LL.CREATE()}
            </Button>
            <Button
              variant="light"
              size="compact-md"
              fullWidth
              leftSection={searchVisible ? <IconSearchOff size={16} /> : <IconSearch size={16} />}
              disabled={
                !zones.data ||
                !emailRules.data ||
                emailRules.data.length === 0 ||
                (!searchVisible && filteredAliases.length === 0) ||
                selectedZoneId === null
              }
              loaderProps={{ size: 16 }}
              onClick={() => {
                setSearchVisible(!searchVisible);
                setAliasSearch("");
              }}>
              {searchVisible ? LL.STOP_SEARCH() : LL.SEARCH()}
            </Button>
            <Button
              variant="light"
              size="compact-md"
              fullWidth
              leftSection={<IconRefresh size={16} />}
              disabled={!zones.data || zones.data.length === 0 || selectedZoneId === null}
              loading={emailRules.isFetching}
              loaderProps={{ size: 16 }}
              onClick={() => emailRules.refetch()}>
              {LL.REFRESH()}
            </Button>
          </>
        )}
      </Button.Group>

      {/* Search field */}
      {searchVisible && (
        <TextInput
          placeholder={LL.SEARCH_PLACEHOLDER()}
          value={aliasSearch}
          onChange={(event) => setAliasSearch(event.currentTarget.value)}
        />
      )}

      {/* ALIAS LIST AREA */}
      <ScrollArea style={{ flex: 1 }}>
        <Stack gap="xs">
          {!zones.isFetching && zones.isSuccess && zones.data.length === 0 && (
            <Alert title={LL.NO_ZONES_TITLE()} color="yellow">
              {LL.NO_ZONES()}
            </Alert>
          )}

          {zones.isError && (
            <Alert title={LL.ZONES_ERROR_TITLE()} color="red">
              {LL.ZONES_ERROR({ error: zones.error })}
            </Alert>
          )}

          {!!selectedZoneId && filteredAliases.length === 0 && emailRules.isFetching && (
            <Center>
              <Loader height={aliasListHeight - 5} />
            </Center>
          )}

          {!!selectedZoneId &&
            emailRules.isSuccess &&
            !emailRules.isFetching &&
            filteredAliases.length === 0 && (
              <Alert title={LL.NO_RULES_TITLE()} color="yellow">
                {LL.NO_RULES()}
              </Alert>
            )}

          {emailRules.isError && !zones.isError && (
            <Alert title={LL.RULES_ERROR_TITLE()} color="red">
              {LL.RULES_ERROR({ error: emailRules.error })}
            </Alert>
          )}

          {/* ALIAS LIST */}
          {emailRules.isSuccess &&
            filteredAliases.map((r) => (
              <AliasCard
                key={r.tag}
                alias={r}
                badge={getAliasBadge(r)}
                selectEnabled={aliasSelectEnabled}
                isSelected={selectedAliases.includes(r)}
                onSelect={() => {
                  const i = selectedAliases.findIndex((a) => a.tag === r.tag);
                  if (i > -1) {
                    selectedAliasesHandlers.remove(i);
                  } else {
                    selectedAliasesHandlers.append(r);
                  }
                }}
                onEdit={() => {
                  setAliasToEdit(r);
                  setAliasEditModalOpened(true);
                }}
                onDelete={() => {
                  setAliasToDelete(r);
                  setAliasDeleteModalOpened(true);
                }}
              />
            ))}
        </Stack>
      </ScrollArea>
    </Flex>
  );
}

export default AliasList;
