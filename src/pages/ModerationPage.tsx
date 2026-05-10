import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Spinner,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Icon,
  Input,
  SimpleGrid,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { FiAlertTriangle, FiCheck, FiX, FiEye, FiRefreshCw, FiCopy, FiBookOpen } from 'react-icons/fi';
import { getApiErrorMessage } from '../utils/apiError';

interface Report {
  report_id: number;
  question_id: number;
  quiz_id: number;
  reporter_id: string;
  reason: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  resolved_time?: string | null;
  resolved_by: string | null;
  moderator_comment?: string | null;
  question_text: string;
  quiz_title: string;
  reporter_login: string;
}

export const ModerationPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { loading: authLoading, isModerator } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingOnly, setPendingOnly] = useState(true);
  const [reportSearch, setReportSearch] = useState('');
  const [statsByStatus, setStatsByStatus] = useState<{ status: string; cnt: string }[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolving, setResolving] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const [reportsRes, statsRes] = await Promise.all([
        apiClient.get<Report[]>(`/api/reports?pending=${pendingOnly}`),
        apiClient.get<{ byStatus: { status: string; cnt: string }[] }>('/api/reports/stats'),
      ]);
      setReports(reportsRes.data);
      setStatsByStatus(statsRes.data.byStatus);
    } catch (e: unknown) {
      toast({
        title: 'Ошибка загрузки репортов',
        description: getApiErrorMessage(e, 'Не удалось загрузить список'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [pendingOnly, toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!isModerator) {
      navigate('/dashboard');
      return;
    }
    void fetchReports();
  }, [authLoading, isModerator, navigate, fetchReports]);

  const filteredReports = useMemo(() => {
    const q = reportSearch.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter(
      (r) =>
        String(r.report_id).includes(q) ||
        r.quiz_title.toLowerCase().includes(q) ||
        r.question_text.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.reporter_login.toLowerCase().includes(q) ||
        String(r.quiz_id).includes(q)
    );
  }, [reports, reportSearch]);

  const openDetail = (report: Report) => {
    setSelectedReport(report);
    onOpen();
  };

  const copyQuizContext = (r: Report) => {
    const text = `Квиз #${r.quiz_id}, вопрос #${r.question_id}, репорт #${r.report_id}`;
    void navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Скопировано', description: text, status: 'success', duration: 2500, isClosable: true });
    });
  };

  const resolve = async (decision: 'resolved_rejected' | 'resolved_hidden') => {
    if (!selectedReport) return;
    setResolving(true);
    try {
      await apiClient.patch(`/api/reports/${selectedReport.report_id}/resolve`, { decision });
      toast({
        title: decision === 'resolved_hidden' ? 'Жалоба принята' : 'Репорт отклонён и удалён',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setReports((prev) => prev.filter((r) => r.report_id !== selectedReport.report_id));
      try {
        const statsRes = await apiClient.get<{ byStatus: { status: string; cnt: string }[] }>('/api/reports/stats');
        setStatsByStatus(statsRes.data.byStatus);
      } catch {
        /* игнорируем ошибку обновления сводки */
      }
      onClose();
      setSelectedReport(null);
    } catch (e: unknown) {
      toast({
        title: 'Ошибка',
        description: getApiErrorMessage(e, 'Не удалось выполнить действие'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setResolving(false);
    }
  };

  if (authLoading || !isModerator) {
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
          <HStack justify="space-between" align="flex-start" mb={4} flexWrap="wrap" gap={3}>
            <Box>
              <Heading size="lg" color="gray.800">
                Модерация репортов
              </Heading>
              <Text color="gray.500" fontSize="sm" mt={1}>
                Обработка жалоб на вопросы по подготовленным репортам
              </Text>
            </Box>
            <HStack flexWrap="wrap">
              <Button size="sm" leftIcon={<FiBookOpen />} variant="solid" colorScheme="purple" onClick={() => navigate('/moderation/quizzes')}>
                Каталог квизов
              </Button>
              <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline" onClick={() => void fetchReports()} isLoading={loading}>
                Обновить
              </Button>
              <Button
                size="sm"
                variant={pendingOnly ? 'solid' : 'outline'}
                colorScheme="brand"
                onClick={() => setPendingOnly(true)}
              >
                Только ожидающие
              </Button>
              <Button
                size="sm"
                variant={!pendingOnly ? 'solid' : 'outline'}
                colorScheme="gray"
                onClick={() => setPendingOnly(false)}
              >
                Все репорты
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard')}>
                В дашборд
              </Button>
            </HStack>
          </HStack>

          {!loading && statsByStatus.length > 0 && (
            <SimpleGrid columns={{ base: 2, md: 5 }} spacing={3} mb={4}>
              {statsByStatus.map((s) => (
                <Box key={s.status} bg="white" borderRadius="xl" borderWidth="1px" borderColor="gray.100" p={3}>
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                    {s.status}
                  </Text>
                  <Text fontWeight="bold" fontSize="xl">
                    {s.cnt}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          )}

          <HStack mb={4} flexWrap="wrap" gap={3}>
            <Input
              placeholder="Поиск по квизу, вопросу, причине, логину, ID…"
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
              maxW="420px"
              borderRadius="xl"
              bg="white"
            />
            <Text fontSize="sm" color="gray.500">
              Показано: {filteredReports.length} из {reports.length}
            </Text>
          </HStack>

          {loading ? (
            <Box py={12} textAlign="center">
              <Spinner size="lg" colorScheme="brand" />
            </Box>
          ) : reports.length === 0 ? (
            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
              p={10}
              textAlign="center"
            >
              <Icon as={FiCheck} boxSize={12} color="green.400" mb={4} />
              <Text color="gray.600" fontWeight="medium">
                {pendingOnly ? 'Нет репортов в очереди' : 'Репортов пока нет'}
              </Text>
            </Box>
          ) : (
            <TableContainer
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
              overflowX="auto"
              maxW="100%"
            >
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Квиз / Вопрос</Th>
                    <Th>Жалоба</Th>
                    <Th>Кто пожаловался</Th>
                    <Th>Статус</Th>
                    <Th>Дата</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredReports.map((r) => (
                    <Tr key={r.report_id}>
                      <Td>{r.report_id}</Td>
                      <Td>
                        <Text fontWeight="medium">{r.quiz_title}</Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={2}>
                          {r.question_text}
                        </Text>
                      </Td>
                      <Td maxW="200px">
                        <Text fontSize="sm" noOfLines={2}>
                          {r.reason}
                        </Text>
                      </Td>
                      <Td>{r.reporter_login}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            r.status === 'pending' ? 'orange' : r.status === 'resolved' ? 'green' : r.status === 'rejected' ? 'gray' : 'blue'
                          }
                        >
                          {r.status === 'pending'
                            ? 'Ожидает'
                            : r.status === 'resolved'
                              ? 'Жалоба принята'
                              : r.status === 'rejected'
                                ? 'Отклонён'
                                : 'Рассмотрен'}
                        </Badge>
                      </Td>
                      <Td>{new Date(r.created_at).toLocaleDateString('ru')}</Td>
                      <Td>
                        <Button size="xs" leftIcon={<FiEye />} variant={r.status === 'pending' ? 'solid' : 'outline'} onClick={() => openDetail(r)}>
                          {r.status === 'pending' ? 'Разобрать' : 'Подробнее'}
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Репорт: вопрос в квизе</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedReport && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Квиз
                  </Text>
                  <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={2}>
                    <Text fontWeight="medium">{selectedReport.quiz_title}</Text>
                    <Button size="xs" leftIcon={<FiCopy />} variant="outline" onClick={() => copyQuizContext(selectedReport)}>
                      ID в буфер
                    </Button>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    quiz_id: {selectedReport.quiz_id} · question_id: {selectedReport.question_id} · report_id:{' '}
                    {selectedReport.report_id}
                  </Text>
                  <Button
                    size="sm"
                    variant="link"
                    colorScheme="purple"
                    mt={2}
                    onClick={() => {
                      onClose();
                      navigate(`/moderation/quizzes/${selectedReport.quiz_id}`);
                    }}
                  >
                    Открыть весь квиз для проверки
                  </Button>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Текст вопроса
                  </Text>
                  <Text>{selectedReport.question_text}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Причина жалобы
                  </Text>
                  <Text>{selectedReport.reason}</Text>
                </Box>
                <Text fontSize="sm" color="gray.500">
                  Пожаловался: {selectedReport.reporter_login} · Статус: {selectedReport.status}
                </Text>
                {(selectedReport.moderator_comment || selectedReport.resolved_time || selectedReport.resolved_at) && (
                  <Box bg="gray.50" borderRadius="md" p={3}>
                    <Text fontSize="xs" color="gray.500">
                      Решение / служебная отметка
                    </Text>
                    {selectedReport.resolved_time || selectedReport.resolved_at ? (
                      <Text fontSize="sm">
                        {new Date((selectedReport.resolved_time || selectedReport.resolved_at) as string).toLocaleString('ru')}
                      </Text>
                    ) : null}
                    {selectedReport.moderator_comment ? (
                      <Text fontSize="sm" fontFamily="mono">
                        {selectedReport.moderator_comment}
                      </Text>
                    ) : null}
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            {selectedReport?.status === 'pending' ? (
              <>
                <Button
                  colorScheme="red"
                  size="sm"
                  leftIcon={<Icon as={FiAlertTriangle} />}
                  onClick={() => resolve('resolved_hidden')}
                  isLoading={resolving}
                >
                  Скрыть вопрос
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Icon as={FiX} />}
                  onClick={() => resolve('resolved_rejected')}
                  isLoading={resolving}
                >
                  Отклонить репорт
                </Button>
              </>
            ) : null}
            <Button variant="ghost" onClick={onClose}>
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
