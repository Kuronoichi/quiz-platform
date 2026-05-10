import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Button,
  useToast,
  Spinner,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  TableCaption,
  Input,
  Select,
  VStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Tooltip,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Icon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { FiUserX, FiUserCheck, FiArrowLeft, FiDownload, FiRefreshCw, FiEye, FiActivity } from 'react-icons/fi';
import { getApiErrorMessage } from '../utils/apiError';

interface UserRow {
  id: string;
  name: string;
  email: string;
  login: string;
  full_name: string;
  role_id: string;
  active: boolean;
  createdAt: string;
}

interface QuizRow {
  quiz_id: number;
  creator_id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived' | 'deleted';
  access: 'public' | 'private' | 'invite_only';
  created_at: string;
}

interface AuditLogRow {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
}

interface LoginEventRow {
  id: string;
  user_id: string | null;
  email: string | null;
  ip: string | null;
  success: boolean;
  event_type: string;
  created_at: string;
}

interface SettingsRow {
  key: string;
  value: unknown;
  updated_at: string;
  updated_by: string | null;
}

interface QuizDetailResponse {
  quiz: QuizRow;
  creator_login: string | null;
  question_count: number;
  session_count: number;
}

interface SystemMetrics {
  collected_at: string;
  runtime?: { node_env: string | null };
  node: { version: string; platform: string; arch: string };
  process: {
    pid: number;
    uptime_sec: number;
    memory_mb: { rss: number; heap_used: number; heap_total: number };
  };
  os: {
    hostname: string;
    cpus: number;
    load_avg: number[];
    memory_mb: { total: number; free: number };
    memory_used_pct: number | null;
  };
  database: {
    ping_ms: number;
    pool: { total_count: number; idle_count: number; waiting_count: number; max: number | null };
  };
}

function formatProcessUptime(sec: number): string {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d} д`);
  if (h > 0 || d > 0) parts.push(`${h} ч`);
  parts.push(`${m} мин`);
  return parts.join(' ');
}

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user: currentUser, loading: authLoading, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [audit, setAudit] = useState<AuditLogRow[]>([]);
  const [logins, setLogins] = useState<LoginEventRow[]>([]);
  const [settings, setSettings] = useState<SettingsRow[]>([]);
  const [modSummary, setModSummary] = useState<any>(null);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [loadingModeration, setLoadingModeration] = useState(false);
  const [adminTab, setAdminTab] = useState(0);
  const [serverMetrics, setServerMetrics] = useState<SystemMetrics | null>(null);
  const [serverLoading, setServerLoading] = useState(false);

  const [actingBlockId, setActingBlockId] = useState<string | null>(null);
  const [actingRoleId, setActingRoleId] = useState<string | null>(null);
  const [actingQuizId, setActingQuizId] = useState<number | null>(null);
  const [bulkWorking, setBulkWorking] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Record<string, boolean>>({});
  const [quizDetailOpen, setQuizDetailOpen] = useState(false);
  const [quizDetail, setQuizDetail] = useState<QuizDetailResponse | null>(null);
  const [quizDetailLoading, setQuizDetailLoading] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [quizQuery, setQuizQuery] = useState('');
  const [quizStatus, setQuizStatusFilter] = useState<string>('');

  const [settingKey, setSettingKey] = useState('registration');
  const [settingValue, setSettingValue] = useState<string>('{"enabled": true}');

  const refreshUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await apiClient.get('/api/admin/users');
      setUsers(res.data);
    } catch (e: unknown) {
      toast({
        title: 'Ошибка загрузки пользователей',
        description: getApiErrorMessage(e, 'Не удалось загрузить список'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingUsers(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    void refreshUsers();
  }, [authLoading, isAdmin, navigate, refreshUsers]);

  const refreshQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      const res = await apiClient.get('/api/admin/quizzes', {
        params: { q: quizQuery || undefined, status: quizStatus || undefined, limit: 100, offset: 0 },
      });
      setQuizzes(res.data);
    } catch (e: unknown) {
      toast({
        title: 'Ошибка загрузки квизов',
        description: getApiErrorMessage(e, 'Не удалось загрузить квизы'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const refreshLogs = async () => {
    try {
      setLoadingLogs(true);
      const [a, l] = await Promise.all([
        apiClient.get('/api/admin/audit', { params: { limit: 80, offset: 0 } }),
        apiClient.get('/api/admin/logins', { params: { limit: 80, offset: 0 } }),
      ]);
      setAudit(a.data);
      setLogins(l.data);
    } catch (e: unknown) {
      toast({
        title: 'Ошибка загрузки логов',
        description: getApiErrorMessage(e, 'Не удалось загрузить логи'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingLogs(false);
    }
  };

  const refreshSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await apiClient.get('/api/admin/settings');
      setSettings(res.data);
    } catch (e: unknown) {
      toast({
        title: 'Ошибка загрузки настроек',
        description: getApiErrorMessage(e, 'Не удалось загрузить настройки'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingSettings(false);
    }
  };

  const refreshModerationSummary = async () => {
    try {
      setLoadingModeration(true);
      const res = await apiClient.get('/api/admin/moderation/summary');
      setModSummary(res.data);
    } catch (e: unknown) {
      toast({
        title: 'Ошибка загрузки сводки модерации',
        description: getApiErrorMessage(e, 'Не удалось загрузить данные'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingModeration(false);
    }
  };

  const refreshServerMetrics = useCallback(async () => {
    try {
      setServerLoading(true);
      const res = await apiClient.get<SystemMetrics>('/api/admin/system-metrics');
      setServerMetrics(res.data);
    } catch (e: unknown) {
      toast({
        title: 'Не удалось загрузить метрики',
        description: getApiErrorMessage(e, 'Проверьте доступ к API'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setServerLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (adminTab !== 5) return;
    const id = window.setInterval(() => void refreshServerMetrics(), 5000);
    return () => window.clearInterval(id);
  }, [adminTab, refreshServerMetrics]);

  const handleAdminTabChange = (index: number) => {
    setAdminTab(index);
    if (index === 1) void refreshQuizzes();
    if (index === 2) void refreshModerationSummary();
    if (index === 3) void refreshSettings();
    if (index === 4) void refreshLogs();
    if (index === 5) void refreshServerMetrics();
  };

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.login?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        (u.full_name || u.name || '').toLowerCase().includes(q)
    );
  }, [users, userQuery]);

  const selectedBulkIds = useMemo(
    () => filteredUsers.filter((u) => selectedUserIds[u.id] && u.id !== currentUser?.id).map((u) => u.id),
    [filteredUsers, selectedUserIds, currentUser?.id]
  );

  const toggleUserSelected = (id: string) => {
    if (id === currentUser?.id) return;
    setSelectedUserIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAllFiltered = () => {
    setSelectedUserIds((prev) => {
      const next = { ...prev };
      for (const u of filteredUsers) {
        if (u.id !== currentUser?.id) next[u.id] = true;
      }
      return next;
    });
  };

  const clearUserSelection = () => setSelectedUserIds({});

  const blockUser = async (id: string) => {
    setActingBlockId(id);
    try {
      await apiClient.post(`/api/admin/users/${id}/block`);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: false } : u)));
      setSelectedUserIds((prev) => ({ ...prev, [id]: false }));
      toast({ title: 'Пользователь заблокирован', status: 'success', duration: 3000, isClosable: true });
    } catch (e: unknown) {
      toast({
        title: 'Ошибка',
        description: getApiErrorMessage(e, 'Не удалось заблокировать'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActingBlockId(null);
    }
  };

  const unblockUser = async (id: string) => {
    setActingBlockId(id);
    try {
      await apiClient.post(`/api/admin/users/${id}/unblock`);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: true } : u)));
      toast({ title: 'Пользователь разблокирован', status: 'success', duration: 3000, isClosable: true });
    } catch (e: unknown) {
      toast({
        title: 'Ошибка',
        description: getApiErrorMessage(e, 'Не удалось разблокировать'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActingBlockId(null);
    }
  };

  const bulkBlock = async () => {
    if (selectedBulkIds.length === 0) return;
    setBulkWorking(true);
    try {
      const res = await apiClient.post('/api/admin/users/bulk/block', { ids: selectedBulkIds });
      const blocked = new Set(res.data.ids as string[]);
      setUsers((prev) => prev.map((u) => (blocked.has(u.id) ? { ...u, active: false } : u)));
      clearUserSelection();
      toast({ title: 'Заблокировано', description: `Обновлено записей: ${res.data.updated}`, status: 'success', duration: 3000, isClosable: true });
    } catch (e: unknown) {
      toast({ title: 'Ошибка', description: getApiErrorMessage(e, 'Массовая блокировка не удалась'), status: 'error', duration: 5000, isClosable: true });
    } finally {
      setBulkWorking(false);
    }
  };

  const bulkUnblock = async () => {
    if (selectedBulkIds.length === 0) return;
    setBulkWorking(true);
    try {
      const res = await apiClient.post('/api/admin/users/bulk/unblock', { ids: selectedBulkIds });
      const unblocked = new Set(res.data.ids as string[]);
      setUsers((prev) => prev.map((u) => (unblocked.has(u.id) ? { ...u, active: true } : u)));
      clearUserSelection();
      toast({ title: 'Разблокировано', description: `Обновлено записей: ${res.data.updated}`, status: 'success', duration: 3000, isClosable: true });
    } catch (e: unknown) {
      toast({ title: 'Ошибка', description: getApiErrorMessage(e, 'Массовая разблокировка не удалась'), status: 'error', duration: 5000, isClosable: true });
    } finally {
      setBulkWorking(false);
    }
  };

  const changeRole = async (id: string, role_id: string) => {
    setActingRoleId(id);
    try {
      await apiClient.patch(`/api/admin/users/${id}/role`, { role_id });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role_id } : u)));
      toast({ title: 'Роль обновлена', status: 'success', duration: 2500, isClosable: true });
    } catch (e: unknown) {
      toast({
        title: 'Ошибка',
        description: getApiErrorMessage(e, 'Не удалось изменить роль'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActingRoleId(null);
    }
  };

  const openQuizDetail = async (quizId: number) => {
    setQuizDetailOpen(true);
    setQuizDetail(null);
    setQuizDetailLoading(true);
    try {
      const res = await apiClient.get<QuizDetailResponse>(`/api/admin/quizzes/${quizId}/detail`);
      setQuizDetail(res.data);
    } catch (e: unknown) {
      toast({ title: 'Не удалось загрузить квиз', description: getApiErrorMessage(e, 'Ошибка'), status: 'error', duration: 5000, isClosable: true });
      setQuizDetailOpen(false);
    } finally {
      setQuizDetailLoading(false);
    }
  };

  const setQuizStatus = async (quizId: number, status: QuizRow['status']) => {
    setActingQuizId(quizId);
    try {
      const res = await apiClient.patch(`/api/admin/quizzes/${quizId}/status`, { status });
      setQuizzes((prev) => prev.map((q) => (q.quiz_id === quizId ? res.data : q)));
      if (quizDetail?.quiz.quiz_id === quizId) {
        setQuizDetail((d) => (d ? { ...d, quiz: res.data } : d));
      }
      toast({ title: 'Статус квиза обновлён', status: 'success', duration: 2500, isClosable: true });
    } catch (e: unknown) {
      toast({
        title: 'Ошибка',
        description: getApiErrorMessage(e, 'Не удалось изменить статус'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActingQuizId(null);
    }
  };

  const saveSetting = async () => {
    try {
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(settingValue);
      } catch {
        toast({ title: 'Некорректный JSON', description: 'Проверьте значение настройки', status: 'warning', duration: 4000, isClosable: true });
        return;
      }
      await apiClient.post('/api/admin/settings', { key: settingKey, value: parsed });
      toast({ title: 'Настройка сохранена', status: 'success', duration: 2500, isClosable: true });
      await refreshSettings();
    } catch (e: unknown) {
      toast({ title: 'Ошибка', description: getApiErrorMessage(e, 'Не удалось сохранить настройку'), status: 'error', duration: 5000, isClosable: true });
    }
  };

  const roleLabel: Record<string, string> = {
    participant: 'Участник',
    creator: 'Создатель',
    moderator: 'Модератор',
    admin: 'Администратор',
  };

  if (authLoading || !isAdmin) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="lg" colorScheme="brand" />
      </Box>
    );
  }

  return (
    <Box
      bgGradient="linear(to-br, brand.50, white, purple.50)"
      minH="100vh"
      position="relative"
      overflow="hidden"
    >
      <Box position="relative" zIndex={1} px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
        <Box maxW="1100px" mx="auto">
          <HStack justify="space-between" align="center" mb={6}>
            <Box>
              <Heading size="lg" color="gray.800">
                Администрирование
              </Heading>
              <Text color="gray.500" fontSize="sm" mt={1}>
                Пользователи, квизы, модерация, настройки, логи и мониторинг процесса API
              </Text>
            </Box>
            <Button size="sm" variant="ghost" leftIcon={<FiArrowLeft />} onClick={() => navigate('/dashboard')}>
              В дашборд
            </Button>
          </HStack>

          <Tabs
            index={adminTab}
            onChange={handleAdminTabChange}
            variant="soft-rounded"
            colorScheme="brand"
            bg="white"
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
            p={{ base: 4, md: 5 }}
          >
            <TabList flexWrap="wrap" gap={2}>
              <Tab>Пользователи</Tab>
              <Tab>Квизы</Tab>
              <Tab>Модерация</Tab>
              <Tab>Настройки</Tab>
              <Tab>Логи</Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FiActivity} />
                  <Text as="span">Сервер</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels mt={4}>
              <TabPanel px={0}>
                <HStack mb={3} justify="space-between" flexWrap="wrap" gap={3}>
                  <HStack flexWrap="wrap">
                    <Input
                      placeholder="Поиск по логину/email..."
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      maxW="320px"
                      borderRadius="xl"
                    />
                    <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline" onClick={() => void refreshUsers()} isLoading={loadingUsers}>
                      Обновить
                    </Button>
                    <Button size="sm" variant="outline" onClick={selectAllFiltered} isDisabled={filteredUsers.length === 0}>
                      Выбрать всех в списке
                    </Button>
                    <Button size="sm" variant="ghost" onClick={clearUserSelection} isDisabled={selectedBulkIds.length === 0}>
                      Снять выбор
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => void bulkBlock()}
                      isLoading={bulkWorking}
                      isDisabled={selectedBulkIds.length === 0}
                    >
                      Заблокировать ({selectedBulkIds.length})
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={() => void bulkUnblock()}
                      isLoading={bulkWorking}
                      isDisabled={selectedBulkIds.length === 0}
                    >
                      Разблокировать ({selectedBulkIds.length})
                    </Button>
                  </HStack>
                  <Button
                    size="sm"
                    leftIcon={<FiDownload />}
                    variant="outline"
                    onClick={() => window.open('/api/admin/users.csv', '_blank')}
                  >
                    Экспорт CSV
                  </Button>
                </HStack>

                {loadingUsers ? (
                  <Box py={10} textAlign="center">
                    <Spinner size="lg" colorScheme="brand" />
                  </Box>
                ) : (
                  <TableContainer overflowX="auto" borderRadius="2xl" borderWidth="1px" borderColor="gray.100">
                    <Table size="sm">
                      <TableCaption>
                        Всего в базе: {users.length} · в фильтре: {filteredUsers.length} · выбрано: {selectedBulkIds.length}
                      </TableCaption>
                      <Thead>
                        <Tr>
                          <Th w="40px">
                            <Checkbox
                              isChecked={
                                filteredUsers.filter((u) => u.id !== currentUser?.id).length > 0 &&
                                filteredUsers.filter((u) => u.id !== currentUser?.id).every((u) => selectedUserIds[u.id])
                              }
                              isIndeterminate={
                                selectedBulkIds.length > 0 &&
                                filteredUsers.filter((u) => u.id !== currentUser?.id).some((u) => !selectedUserIds[u.id])
                              }
                              onChange={(e) => (e.target.checked ? selectAllFiltered() : clearUserSelection())}
                            />
                          </Th>
                          <Th>Логин</Th>
                          <Th>Имя</Th>
                          <Th>Email</Th>
                          <Th>Роль</Th>
                          <Th>Статус</Th>
                          <Th>Действия</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredUsers.map((u) => (
                          <Tr key={u.id}>
                            <Td>
                              <Checkbox
                                isChecked={!!selectedUserIds[u.id]}
                                onChange={() => toggleUserSelected(u.id)}
                                isDisabled={u.id === currentUser?.id}
                              />
                            </Td>
                            <Td fontWeight="medium">{u.login}</Td>
                            <Td>{u.full_name || u.name}</Td>
                            <Td fontSize="sm" color="gray.600">
                              {u.email}
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Badge
                                  colorScheme={
                                    u.role_id === 'admin' ? 'red' : u.role_id === 'moderator' ? 'purple' : u.role_id === 'creator' ? 'purple' : 'blue'
                                  }
                                >
                                  {roleLabel[u.role_id] || u.role_id}
                                </Badge>
                                <Select
                                  size="sm"
                                  value={u.role_id}
                                  onChange={(e) => void changeRole(u.id, e.target.value)}
                                  borderRadius="lg"
                                  maxW="170px"
                                  isDisabled={actingRoleId === u.id || u.id === currentUser?.id}
                                >
                                  <option value="participant">participant</option>
                                  <option value="creator">creator</option>
                                  <option value="moderator">moderator</option>
                                  <option value="admin">admin</option>
                                </Select>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge colorScheme={u.active ? 'green' : 'red'}>{u.active ? 'Активен' : 'Заблокирован'}</Badge>
                            </Td>
                            <Td>
                              {u.id !== currentUser?.id && (
                                <HStack spacing={2}>
                                  {u.active ? (
                                    <Tooltip label="Заблокировать">
                                      <IconButton
                                        aria-label="Заблокировать"
                                        size="sm"
                                        colorScheme="red"
                                        variant="ghost"
                                        icon={<FiUserX />}
                                        onClick={() => void blockUser(u.id)}
                                        isLoading={actingBlockId === u.id}
                                      />
                                    </Tooltip>
                                  ) : (
                                    <Tooltip label="Разблокировать">
                                      <IconButton
                                        aria-label="Разблокировать"
                                        size="sm"
                                        colorScheme="green"
                                        variant="ghost"
                                        icon={<FiUserCheck />}
                                        onClick={() => void unblockUser(u.id)}
                                        isLoading={actingBlockId === u.id}
                                      />
                                    </Tooltip>
                                  )}
                                </HStack>
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              <TabPanel px={0}>
                <HStack mb={3} justify="space-between" flexWrap="wrap" gap={3}>
                  <HStack>
                    <Input
                      placeholder="Поиск по названию..."
                      value={quizQuery}
                      onChange={(e) => setQuizQuery(e.target.value)}
                      maxW="320px"
                      borderRadius="xl"
                    />
                    <Select value={quizStatus} onChange={(e) => setQuizStatusFilter(e.target.value)} maxW="180px" borderRadius="xl">
                      <option value="">Все статусы</option>
                      <option value="draft">draft</option>
                      <option value="published">published</option>
                      <option value="archived">archived</option>
                      <option value="deleted">deleted</option>
                    </Select>
                    <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline" onClick={() => void refreshQuizzes()} isLoading={loadingQuizzes}>
                      Обновить
                    </Button>
                  </HStack>
                </HStack>

                {loadingQuizzes ? (
                  <Box py={10} textAlign="center">
                    <Spinner size="lg" colorScheme="brand" />
                  </Box>
                ) : (
                  <TableContainer overflowX="auto" borderRadius="2xl" borderWidth="1px" borderColor="gray.100">
                    <Table size="sm">
                      <TableCaption>Квизы: {quizzes.length}</TableCaption>
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Название</Th>
                          <Th>Создатель</Th>
                          <Th>Статус</Th>
                          <Th>Доступ</Th>
                          <Th>Действия</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {quizzes.map((q) => (
                          <Tr key={q.quiz_id}>
                            <Td>{q.quiz_id}</Td>
                            <Td fontWeight="medium">{q.title}</Td>
                            <Td fontSize="sm" color="gray.600">{q.creator_id}</Td>
                            <Td>
                              <Badge colorScheme={q.status === 'published' ? 'green' : q.status === 'archived' ? 'orange' : q.status === 'deleted' ? 'red' : 'yellow'}>
                                {q.status}
                              </Badge>
                            </Td>
                            <Td><Badge variant="outline">{q.access}</Badge></Td>
                            <Td>
                              <HStack spacing={2}>
                                <Tooltip label="Подробности">
                                  <IconButton
                                    aria-label="Подробности квиза"
                                    size="sm"
                                    variant="outline"
                                    icon={<FiEye />}
                                    onClick={() => void openQuizDetail(q.quiz_id)}
                                  />
                                </Tooltip>
                                <Select
                                  size="sm"
                                  value={q.status}
                                  onChange={(e) => void setQuizStatus(q.quiz_id, e.target.value as QuizRow['status'])}
                                  borderRadius="lg"
                                  maxW="170px"
                                  isDisabled={actingQuizId === q.quiz_id}
                                >
                                  <option value="draft">draft</option>
                                  <option value="published">published</option>
                                  <option value="archived">archived</option>
                                  <option value="deleted">deleted</option>
                                </Select>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              <TabPanel px={0}>
                <HStack mb={3} justify="space-between" flexWrap="wrap" gap={3}>
                  <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline" onClick={() => void refreshModerationSummary()} isLoading={loadingModeration}>
                    Обновить
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/moderation')}>
                    Открыть модерацию
                  </Button>
                </HStack>

                {loadingModeration ? (
                  <Box py={10} textAlign="center">
                    <Spinner size="lg" colorScheme="brand" />
                  </Box>
                ) : modSummary ? (
                  <VStack align="stretch" spacing={4}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <Box borderWidth="1px" borderColor="gray.100" borderRadius="2xl" p={4} bg="white">
                        <Stat>
                          <StatLabel>Репорты (pending)</StatLabel>
                          <StatNumber>
                            {(modSummary.countsByStatus || []).find((x: any) => x.status === 'pending')?.cnt ?? '0'}
                          </StatNumber>
                        </Stat>
                      </Box>
                      <Box borderWidth="1px" borderColor="gray.100" borderRadius="2xl" p={4} bg="white">
                        <Stat>
                          <StatLabel>Всего статусов</StatLabel>
                          <StatNumber>{(modSummary.countsByStatus || []).length}</StatNumber>
                        </Stat>
                      </Box>
                      <Box borderWidth="1px" borderColor="gray.100" borderRadius="2xl" p={4} bg="white">
                        <Stat>
                          <StatLabel>Горячие квизы</StatLabel>
                          <StatNumber>{(modSummary.topQuizzes || []).length}</StatNumber>
                        </Stat>
                      </Box>
                    </SimpleGrid>

                    <TableContainer overflowX="auto" borderRadius="2xl" borderWidth="1px" borderColor="gray.100">
                      <Table size="sm">
                        <TableCaption>Последние pending репорты</TableCaption>
                        <Thead>
                          <Tr>
                            <Th>Квиз</Th>
                            <Th>Вопрос</Th>
                            <Th>Причина</Th>
                            <Th>Автор</Th>
                            <Th>Создан</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {(modSummary.latestPending || []).map((r: any) => (
                            <Tr key={r.report_id}>
                              <Td fontWeight="medium">{r.quiz_title}</Td>
                              <Td maxW="420px">{r.question_text}</Td>
                              <Td maxW="320px">{r.reason}</Td>
                              <Td>{r.reporter_login || r.reporter_id}</Td>
                              <Td fontSize="sm" color="gray.600">{String(r.created_at)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </VStack>
                ) : (
                  <Text color="gray.500">Сводка пока недоступна.</Text>
                )}
              </TabPanel>

              <TabPanel px={0}>
                <HStack mb={3} justify="space-between" flexWrap="wrap" gap={3}>
                  <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline" onClick={() => void refreshSettings()} isLoading={loadingSettings}>
                    Обновить
                  </Button>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                  <Box borderWidth="1px" borderColor="gray.100" borderRadius="2xl" p={4} bg="white">
                    <Text fontWeight="semibold" mb={2}>Сохранить настройку</Text>
                    <VStack align="stretch" spacing={2}>
                      <Input value={settingKey} onChange={(e) => setSettingKey(e.target.value)} placeholder="key" borderRadius="xl" />
                      <Input value={settingValue} onChange={(e) => setSettingValue(e.target.value)} placeholder="{...json}" borderRadius="xl" />
                      <Button onClick={() => void saveSetting()} size="sm">Сохранить</Button>
                      <Text fontSize="xs" color="gray.500">
                        Пример: key=&quot;registration&quot;, value={"{\"enabled\":true}"}
                      </Text>
                    </VStack>
                  </Box>

                  <Box borderWidth="1px" borderColor="gray.100" borderRadius="2xl" p={4} bg="white">
                    <Text fontWeight="semibold" mb={2}>Текущие настройки</Text>
                    {loadingSettings ? (
                      <Spinner size="sm" />
                    ) : (
                      <VStack align="stretch" spacing={2}>
                        {settings.map((s) => (
                          <Box key={s.key} borderWidth="1px" borderColor="gray.100" borderRadius="xl" p={3}>
                            <HStack justify="space-between" align="flex-start">
                              <Box>
                                <Text fontWeight="semibold">{s.key}</Text>
                                <Text fontSize="xs" color="gray.500">Обновлено: {s.updated_at} {s.updated_by ? `(кем: ${s.updated_by})` : ''}</Text>
                              </Box>
                            </HStack>
                            <Text fontFamily="mono" fontSize="xs" mt={2} whiteSpace="pre-wrap">
                              {JSON.stringify(s.value, null, 2)}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </Box>
                </SimpleGrid>
              </TabPanel>

              <TabPanel px={0}>
                <HStack mb={3} justify="space-between" flexWrap="wrap" gap={3}>
                  <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline" onClick={() => void refreshLogs()} isLoading={loadingLogs}>
                    Обновить
                  </Button>
                </HStack>

                {loadingLogs ? (
                  <Box py={10} textAlign="center">
                    <Spinner size="lg" colorScheme="brand" />
                  </Box>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <TableContainer overflowX="auto" borderRadius="2xl" borderWidth="1px" borderColor="gray.100">
                      <Table size="sm">
                        <TableCaption>Audit log</TableCaption>
                        <Thead>
                          <Tr>
                            <Th>Время</Th>
                            <Th>Действие</Th>
                            <Th>Сущность</Th>
                            <Th>ID</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {audit.map((a) => (
                            <Tr key={a.id}>
                              <Td fontSize="sm" color="gray.600">{a.created_at}</Td>
                              <Td fontWeight="medium">{a.action}</Td>
                              <Td>{a.entity_type || '—'}</Td>
                              <Td>{a.entity_id || '—'}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>

                    <TableContainer overflowX="auto" borderRadius="2xl" borderWidth="1px" borderColor="gray.100">
                      <Table size="sm">
                        <TableCaption>Попытки входа</TableCaption>
                        <Thead>
                          <Tr>
                            <Th>Время</Th>
                            <Th>Тип</Th>
                            <Th>Email</Th>
                            <Th>Успех</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {logins.map((l) => (
                            <Tr key={l.id}>
                              <Td fontSize="sm" color="gray.600">{l.created_at}</Td>
                              <Td>{l.event_type}</Td>
                              <Td>{l.email || '—'}</Td>
                              <Td>
                                <Badge colorScheme={l.success ? 'green' : 'red'}>{l.success ? 'OK' : 'FAIL'}</Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </SimpleGrid>
                )}
              </TabPanel>

              <TabPanel px={0}>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between" flexWrap="wrap" gap={3}>
                    <Text fontSize="sm" color="gray.600">
                      Снимок состояния <strong>процесса Node.js</strong>, на котором запущен API (память, uptime), хоста
                      ОС и пула подключений к PostgreSQL. Данные обновляются каждые 5 секунд, пока открыта эта вкладка.
                    </Text>
                    <Button
                      size="sm"
                      leftIcon={<FiRefreshCw />}
                      variant="outline"
                      onClick={() => void refreshServerMetrics()}
                      isLoading={serverLoading}
                    >
                      Обновить сейчас
                    </Button>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Load average на Windows часто показывает нули — это нормально. Для полноценного мониторинга в
                    продакшене используйте внешние системы (Prometheus, Grafana, облачный APM).
                  </Text>

                  {!serverMetrics && serverLoading ? (
                    <Box py={10} textAlign="center">
                      <Spinner size="lg" colorScheme="brand" />
                    </Box>
                  ) : serverMetrics ? (
                    <>
                      <Text fontSize="xs" color="gray.500">
                        Снято: {new Date(serverMetrics.collected_at).toLocaleString('ru-RU')}
                        {serverMetrics.runtime?.node_env != null ? ` · NODE_ENV=${serverMetrics.runtime.node_env}` : ''}
                      </Text>
                      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                        <Box borderWidth="1px" borderColor="gray.100" borderRadius="2xl" p={4} bg="white">
                          <Stat>
                            <StatLabel>Uptime процесса</StatLabel>
                            <StatNumber fontSize="xl">{formatProcessUptime(serverMetrics.process.uptime_sec)}</StatNumber>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              PID {serverMetrics.process.pid}
                            </Text>
                          </Stat>
                        </Box>
                        <Box borderWidth="1px" borderColor="gray.100" borderRadius="2xl" p={4} bg="white">
                          <Stat>
                            <StatLabel>Heap (Node)</StatLabel>
                            <StatNumber fontSize="xl">
                              {serverMetrics.process.memory_mb.heap_used} / {serverMetrics.process.memory_mb.heap_total} МБ
                            </StatNumber>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              RSS {serverMetrics.process.memory_mb.rss} МБ
                            </Text>
                          </Stat>
                        </Box>
                        <Box borderWidth="1px" borderColor="gray.100" borderRadius="2xl" p={4} bg="white">
                          <Stat>
                            <StatLabel>Пинг БД</StatLabel>
                            <StatNumber fontSize="xl">{serverMetrics.database.ping_ms} мс</StatNumber>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              Пул: занято {serverMetrics.database.pool.total_count}, свободно{' '}
                              {serverMetrics.database.pool.idle_count}
                              {serverMetrics.database.pool.max != null ? ` · max ${serverMetrics.database.pool.max}` : ''}
                              {serverMetrics.database.pool.waiting_count > 0 ? (
                                <Badge ml={2} colorScheme="orange">
                                  ожидание: {serverMetrics.database.pool.waiting_count}
                                </Badge>
                              ) : null}
                            </Text>
                          </Stat>
                        </Box>
                        <Box borderWidth="1px" borderColor="gray.100" borderRadius="2xl" p={4} bg="white">
                          <Stat>
                            <StatLabel>Память ОС (занято)</StatLabel>
                            <StatNumber fontSize="xl">
                              {serverMetrics.os.memory_used_pct != null ? `${serverMetrics.os.memory_used_pct}%` : '—'}
                            </StatNumber>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              Свободно {serverMetrics.os.memory_mb.free} из {serverMetrics.os.memory_mb.total} МБ ·{' '}
                              {serverMetrics.os.hostname}
                            </Text>
                          </Stat>
                        </Box>
                        <Box borderWidth="1px" borderColor="gray.100" borderRadius="2xl" p={4} bg="white">
                          <Stat>
                            <StatLabel>Load average (1 / 5 / 15 мин)</StatLabel>
                            <StatNumber fontSize="lg">
                              {serverMetrics.os.load_avg.map((x) => x.toFixed(2)).join(' · ')}
                            </StatNumber>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              Ядер CPU: {serverMetrics.os.cpus}
                            </Text>
                          </Stat>
                        </Box>
                        <Box borderWidth="1px" borderColor="gray.100" borderRadius="2xl" p={4} bg="white">
                          <Stat>
                            <StatLabel>Среда</StatLabel>
                            <StatNumber fontSize="md" whiteSpace="nowrap">
                              {serverMetrics.node.version}
                            </StatNumber>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              {serverMetrics.node.platform} / {serverMetrics.node.arch}
                            </Text>
                          </Stat>
                        </Box>
                      </SimpleGrid>
                    </>
                  ) : (
                    <Text color="gray.500">Нет данных. Нажмите «Обновить сейчас».</Text>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>

      <Modal isOpen={quizDetailOpen} onClose={() => setQuizDetailOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Квиз #{quizDetail?.quiz.quiz_id ?? '…'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {quizDetailLoading ? (
              <Box py={8} textAlign="center">
                <Spinner colorScheme="brand" />
              </Box>
            ) : quizDetail ? (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="semibold" fontSize="lg">
                    {quizDetail.quiz.title}
                  </Text>
                  {quizDetail.quiz.description && (
                    <Text color="gray.600" fontSize="sm" mt={1}>
                      {quizDetail.quiz.description}
                    </Text>
                  )}
                </Box>
                <SimpleGrid columns={2} spacing={3}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                      Статус
                    </Text>
                    <Badge colorScheme={quizDetail.quiz.status === 'published' ? 'green' : 'purple'}>{quizDetail.quiz.status}</Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                      Доступ
                    </Text>
                    <Badge variant="outline">{quizDetail.quiz.access}</Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                      Вопросов
                    </Text>
                    <Text fontWeight="bold">{quizDetail.question_count}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                      Сессий
                    </Text>
                    <Text fontWeight="bold">{quizDetail.session_count}</Text>
                  </Box>
                </SimpleGrid>
                <Box>
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
                    Создатель
                  </Text>
                  <Text fontSize="sm">
                    {quizDetail.creator_login || quizDetail.quiz.creator_id}
                  </Text>
                  <Text fontSize="xs" color="gray.400" fontFamily="mono">
                    {quizDetail.quiz.creator_id}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>
                    Сменить статус
                  </Text>
                  <Select
                    value={quizDetail.quiz.status}
                    onChange={(e) => void setQuizStatus(quizDetail.quiz.quiz_id, e.target.value as QuizRow['status'])}
                    borderRadius="xl"
                    isDisabled={actingQuizId === quizDetail.quiz.quiz_id}
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                    <option value="archived">archived</option>
                    <option value="deleted">deleted</option>
                  </Select>
                </Box>
              </VStack>
            ) : (
              <Text color="gray.500">Нет данных</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
