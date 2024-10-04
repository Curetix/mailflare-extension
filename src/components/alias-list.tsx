import { useAtom } from "jotai";
import { useEffect, useState } from "react";

import { useI18nContext } from "~/i18n/i18n-react";
import { useCloudflare } from "~/lib/cloudflare/use-cloudflare";
import { sortBy } from "~/utils";
import { Alias } from "~/utils/alias";
import { aliasSearchAtom, settingsAtom } from "~/utils/state";
import {
  TbEdit,
  TbListCheck,
  TbPlaylistX,
  TbPlus,
  TbRefresh,
  TbSearch,
  TbSearchOff,
  TbTrash,
} from "react-icons/tb";
import { Link as RouterLink } from "@tanstack/react-router";
import {
  Badge,
  Button,
  Center,
  Flex,
  Group,
  Input,
  Link,
  Spinner,
  Stack,
  type FlexProps,
} from "@chakra-ui/react";
import { AliasCard } from "~/components/alias-card";
import { Select } from "~/components/ui/select";
import { Alert } from "~/components/ui/alert";

export function AliasList(props: FlexProps) {
  const { LL } = useI18nContext();

  const {
    accountId,
    selectedZoneId,
    setSelectedZoneId,
    zones,
    emailDestinations,
    emailRoutingStatus,
    emailRules,
  } = useCloudflare();

  const [{ ruleFilter }] = useAtom(settingsAtom);
  const [aliasSearch, setAliasSearch] = useAtom(aliasSearchAtom);
  const [filteredAliases, setFilteredAliases] = useState<Alias[]>([]);

  const [aliasCreateModalOpened, setAliasCreateModalOpened] = useState(false);
  const [aliasEditModalOpened, setAliasEditModalOpened] = useState(false);
  const [aliasDeleteModalOpened, setAliasDeleteModalOpened] = useState(false);
  const [aliasSelectEnabled, setAliasSelectEnabled] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  const [selectedAliases, setSelectedAliases] = useState<Alias[]>([]);
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
        <Badge colorPalette="red" variant="solid" size="sm">
          {LL.INVALID()}
        </Badge>
      );
    }
    if (rule.isExternal) {
      return (
        <Badge colorPalette="blue" variant="solid" size="sm">
          {LL.EXTERNAL()}
        </Badge>
      );
    }
    if (!rule.enabled) {
      return (
        <Badge colorPalette="red" variant="solid" size="sm">
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
  }, [emailRules.isSuccess, emailRules.data, ruleFilter, aliasSearch]);

  return (
    <Flex direction="column" gap={2} {...props}>
      {/* <AliasCreateModal
        opened={aliasCreateModalOpened}
        onClose={() => setAliasCreateModalOpened(false)}
      />

      <AliasEditModal
        opened={aliasEditModalOpened && !!aliasToEdit && selectedAliases.length === 0}
        onClose={() => {
          setAliasEditModalOpened(false);
          setAliasToEdit(null);
        }}
        aliasToEdit={aliasToEdit}
      />

      <AliasBulkEditModal
        opened={aliasEditModalOpened && selectedAliases.length > 0}
        onClose={(clear) => {
          setAliasEditModalOpened(false);
          if (clear) {
            setAliasSelectEnabled(false);
            setSelectedAliases.setState([]);
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
        aliasToDelete={aliasToDelete}
      />

      <AliasBulkDeleteModal
        opened={aliasDeleteModalOpened && selectedAliases.length > 0}
        onClose={(clear) => {
          setAliasDeleteModalOpened(false);
          if (clear) {
            setAliasSelectEnabled(false);
            setSelectedAliases.setState([]);
          }
        }}
        selectedAliases={selectedAliases}
      /> */}

      {/* DOMAIN SELECTOR */}
      <Select
        placeholder={LL.DOMAIN()}
        value={selectedZoneId}
        onValueChange={setSelectedZoneId}
        disabled={!zones.data || zones.data.length === 0}
        loading={zones.isFetching}
        items={
          zones.data?.map((z) => ({
            value: z.id,
            label: z.name,
          })) || []
        }
      />

      {/* ACTION BUTTONS */}
      <Group attached grow>
        <Button
          variant="subtle"
          size="sm"
          disabled={
            !zones.data ||
            (!aliasSelectEnabled && filteredAliases.length === 0) ||
            selectedZoneId === null
          }
          onClick={() => {
            setSelectedAliases([]);
            setAliasSelectEnabled(!aliasSelectEnabled);
          }}>
          {aliasSelectEnabled ? <TbPlaylistX size={16} /> : <TbListCheck size={16} />}
          {aliasSelectEnabled ? LL.STOP_SELECT() : LL.SELECT()}
        </Button>
        <Button
          variant="subtle"
          size="sm"
          disabled={
            !zones.data ||
            !emailRules.data ||
            emailRules.data.length === 0 ||
            (!searchVisible && filteredAliases.length === 0) ||
            selectedZoneId === null
          }
          onClick={() => {
            setSearchVisible(!searchVisible);
            setAliasSearch("");
          }}>
          {searchVisible ? <TbSearchOff size={16} /> : <TbSearch size={16} />}
          {searchVisible ? LL.STOP_SEARCH() : LL.SEARCH()}
        </Button>

        {aliasSelectEnabled && (
          <Button
            variant="subtle"
            size="sm"
            disabled={selectedAliases.length === 0}
            onClick={() => setAliasEditModalOpened(true)}>
            <TbEdit size={16} />
            {LL.EDIT()}
          </Button>
        )}
        {aliasSelectEnabled && (
          <Button
            variant="subtle"
            size="sm"
            disabled={selectedAliases.length === 0}
            onClick={() => setAliasDeleteModalOpened(true)}>
            <TbTrash size={16} />
            {LL.DELETE()}
          </Button>
        )}

        {!aliasSelectEnabled && (
          <Button
            asChild
            variant="subtle"
            size="sm"
            disabled={!zones.data || zones.data.length === 0 || selectedZoneId === null}
            onClick={() => setAliasCreateModalOpened(true)}>
            <RouterLink to="/app/create">
              <TbPlus size={16} />
              {LL.CREATE()}
            </RouterLink>
          </Button>
        )}
        {!aliasSelectEnabled && (
          <Button
            variant="subtle"
            size="sm"
            disabled={
              emailRules.isFetching ||
              !zones.data ||
              zones.data.length === 0 ||
              selectedZoneId === null
            }
            onClick={() => emailRules.refetch()}>
            {emailRules.isFetching ? <Spinner /> : <TbRefresh size={16} />}
            {LL.REFRESH()}
          </Button>
        )}
      </Group>

      {/* Search field */}
      {searchVisible && (
        <Input
          autoFocus
          placeholder={LL.SEARCH_PLACEHOLDER()}
          value={aliasSearch}
          onChange={(event) => setAliasSearch(event.currentTarget.value)}
        />
      )}

      {selectedZoneId &&
        (emailRoutingStatus?.data?.result?.enabled === false ||
          emailRoutingStatus?.data?.result?.status !== "ready") && (
          <Alert status="error">
            {LL.EMAIL_ROUTING_NOT_ENABLED()}
            <Link
              href={`https://dash.cloudflare.com/${accountId}/${zones.data?.find((z) => z.id === selectedZoneId)?.name || "whoops"}/email/routing/overview`}
              target="_blank">
              {LL.EMAIL_ROUTING_DASHBOARD()}
            </Link>
          </Alert>
        )}

      {!!selectedZoneId && filteredAliases.length === 0 && emailRules.isFetching && (
        <Center flex={1}>
          <Spinner />
        </Center>
      )}

      {!zones.isFetching && zones.isSuccess && zones.data.length === 0 && (
        <Alert title={LL.NO_ZONES_TITLE()}>{LL.NO_ZONES()}</Alert>
      )}

      {zones.isError && (
        <Alert title={LL.ZONES_ERROR_TITLE()} color="red">
          {LL.ZONES_ERROR({ error: zones.error })}
        </Alert>
      )}

      {!!selectedZoneId &&
        emailRules.isSuccess &&
        !emailRules.isFetching &&
        filteredAliases.length === 0 && <Alert title={LL.NO_RULES_TITLE()}>{LL.NO_RULES()}</Alert>}

      {emailRules.isError && !zones.isError && (
        <Alert title={LL.RULES_ERROR_TITLE()}>{LL.RULES_ERROR({ error: emailRules.error })}</Alert>
      )}

      {/* ALIAS LIST */}
      <Stack gap={2} overflowY="auto">
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
                  setSelectedAliases(selectedAliases.filter((a) => a.tag !== r.tag));
                } else {
                  setSelectedAliases([...selectedAliases, r]);
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
    </Flex>
  );
}
