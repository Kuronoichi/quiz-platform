import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Icon,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Code,
  Spinner,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { AI_FEEDBACK_MAX_REQUESTS_PER_USER } from '../constants/aiFeedback';
import { FiPlay, FiCopy, FiX, FiArrowLeft, FiCpu, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { getApiErrorMessage } from '../utils/apiError';

const MotionBox = motion(Box);

interface Session {
  session_id: number;
  quiz_id: number;
  organizer_id: string;
  session_code: string;
  status: 'scheduled' | 'active' | 'finished' | 'cancelled';
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  max_players: number | null;
  min_players: number | null;
  participants_count?: number;
}

interface FeedbackApiResponse {
  feedback: {
    feedback_id: number;
    text: string;
    model: string | null;
    generate_time: string;
  };
  requests_used: number;
  requests_left: number;
}

export const QuizSessionPage: React.FC = () => {
  const { id, sessionId: sessionIdParam } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(() => Boolean(sessionIdParam));
  const [maxPlayers, setMaxPlayers] = useState<number | undefined>(undefined);
  const [minPlayers, setMinPlayers] = useState<number | undefined>(undefined);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackMeta, setFeedbackMeta] = useState<{ requests_left: number; requests_used: number } | null>(null);
  const [exportingReport, setExportingReport] = useState(false);

  useEffect(() => {
    if (!sessionIdParam || !id) {
      setLoadingExisting(false);
      return;
    }
    const load = async () => {
      try {
        setLoadingExisting(true);
        const response = await apiClient.get<Session>(`/api/session/${sessionIdParam}`);
        const data = response.data;
        if (String(data.quiz_id) !== String(id)) {
          toast({
            title: 'Сессия не относится к этому квизу',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
          navigate('/sessions', { replace: true });
          return;
        }
        setSession(data);
      } catch (error: any) {
        toast({
          title: 'Не удалось загрузить сессию',
          description: getApiErrorMessage(error, 'Проверьте ссылку или откройте сессию из списка'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/sessions', { replace: true });
      } finally {
        setLoadingExisting(false);
      }
    };

    void load();
  }, [sessionIdParam, id, navigate, toast]);

  const isScheduledLobby = session?.status === 'scheduled';

  useEffect(() => {
    if (!sessionIdParam || !isScheduledLobby) return;
    const timer = window.setInterval(() => {
      void (async () => {
        try {
          const response = await apiClient.get<Session>(`/api/session/${sessionIdParam}`);
          const data = response.data;
          if (String(data.quiz_id) !== String(id)) return;
          setSession((prev) => {
            if (prev?.status && prev.status !== 'scheduled') return prev;
            return data;
          });
        } catch {
        }
      })();
    }, 4000);
    return () => window.clearInterval(timer);
  }, [sessionIdParam, id, isScheduledLobby]);

  const createSession = async () => {
    if (!id) return;
    try {
      setCreating(true);
      const response = await apiClient.post(`/api/session/quiz/${id}`, {
        max_players: maxPlayers || null,
        min_players: minPlayers || null,
      });
      navigate(`/quiz/${id}/session/${response.data.session_id}`, { replace: true });
      onClose();
      toast({
        title: 'Сессия создана',
        description: 'Код сессии готов к использованию',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка создания сессии',
        description: getApiErrorMessage(error, 'Не удалось создать сессию'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCreating(false);
    }
  };

  const startSession = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const response = await apiClient.post(`/api/session/${session.session_id}/start`);
      setSession(response.data);
      toast({
        title: 'Сессия запущена',
        description: 'Участники могут присоединяться и отвечать',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка запуска сессии',
        description: getApiErrorMessage(error, 'Не удалось запустить сессию'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const finishSession = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const response = await apiClient.post(`/api/session/${session.session_id}/finish`);
      setSession(response.data);
      toast({
        title: 'Сессия завершена',
        description: 'Результаты доступны для просмотра',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка завершения сессии',
        description: getApiErrorMessage(error, 'Не удалось завершить сессию'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.session_code);
    toast({
      title: 'Код скопирован',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const generateCreatorFeedback = async () => {
    if (!session) return;
    try {
      setFeedbackLoading(true);
      const response = await apiClient.post<FeedbackApiResponse>(`/api/session/${session.session_id}/feedback`);
      setFeedbackText(response.data.feedback.text);
      setFeedbackMeta({
        requests_left: response.data.requests_left,
        requests_used: response.data.requests_used,
      });
      toast({
        title: 'Отклик сформирован',
        description: `Осталось запросов: ${response.data.requests_left} из ${AI_FEEDBACK_MAX_REQUESTS_PER_USER}`,
        status: 'success',
        duration: 3500,
        isClosable: true,
      });
    } catch (error: unknown) {
      toast({
        title: 'Ошибка генерации отклика',
        description: getApiErrorMessage(error, 'Не удалось получить ИИ-отклик'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFeedbackLoading(false);
    }
  };

  const copyCreatorFeedback = async () => {
    if (!feedbackText) return;
    await navigator.clipboard.writeText(feedbackText);
    toast({
      title: 'Отклик скопирован',
      status: 'success',
      duration: 2500,
      isClosable: true,
    });
  };

  const exportSessionReport = async () => {
    if (!session) return;
    try {
      setExportingReport(true);
      const response = await apiClient.get(`/api/session/${session.session_id}/export`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/html;charset=utf-8' });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `session-report-${session.session_id}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);

      toast({
        title: 'Отчёт выгружен',
        description: 'Файл отчёта сохранён в загрузки',
        status: 'success',
        duration: 3500,
        isClosable: true,
      });
    } catch (error: unknown) {
      toast({
        title: 'Ошибка экспорта',
        description: getApiErrorMessage(error, 'Не удалось выгрузить отчёт'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setExportingReport(false);
    }
  };

  return (
    <Box
      bgGradient="linear(to-br, brand.50, white, purple.50)"
      minH="100vh"
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" top="-100px" right="-100px" w="400px" h="400px" borderRadius="full" bg="brand.100" opacity={0.3} filter="blur(60px)" />
      <Box position="absolute" bottom="-150px" left="-100px" w="500px" h="500px" borderRadius="full" bg="purple.100" opacity={0.3} filter="blur(80px)" />

      <Box position="relative" zIndex={1} px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
        <Box maxW="800px" mx="auto">
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
              p={{ base: 6, md: 8 }}
            >
              <HStack spacing={3} mb={6}>
                <Button leftIcon={<Icon as={FiArrowLeft} />} variant="ghost" size="sm" onClick={() => navigate(`/quiz/${id}`)}>
                  Назад к квизу
                </Button>
              </HStack>

              <Text fontSize="sm" fontWeight="semibold" color="brand.500" textTransform="uppercase" letterSpacing="1px" mb={2}>
                Управление сессией
              </Text>

              {loadingExisting ? (
                <VStack spacing={4} py={12}>
                  <Spinner size="lg" colorScheme="brand" />
                  <Text color="gray.500">Загрузка сессии…</Text>
                </VStack>
              ) : !session ? (
                <VStack spacing={6} py={8}>
                  <Icon as={FiPlay} boxSize={12} color="brand.500" />
                  <Heading size="md" color="gray.800">
                    Создайте сессию для проведения квиза
                  </Heading>
                  <Text color="gray.500" textAlign="center">
                    После создания вы получите уникальный код, который участники смогут использовать для присоединения
                  </Text>
                  <Button
                    colorScheme="brand"
                    size="lg"
                    leftIcon={<Icon as={FiPlay} />}
                    onClick={onOpen}
                    borderRadius="xl"
                  >
                    Создать сессию
                  </Button>
                </VStack>
              ) : (
                <VStack spacing={6} align="stretch">
                  <Box
                    bgGradient="linear(to-r, brand.500, purple.500)"
                    borderRadius="xl"
                    p={6}
                    color="white"
                    textAlign="center"
                  >
                    <Text fontSize="sm" fontWeight="semibold" opacity={0.9} mb={2}>
                      Код сессии
                    </Text>
                    <HStack justify="center" spacing={4} mb={4}>
                      <Code fontSize="4xl" fontWeight="bold" bg="whiteAlpha.200" color="white" px={4} py={2} borderRadius="lg">
                        {session.session_code}
                      </Code>
                      <Button
                        leftIcon={<Icon as={FiCopy} />}
                        bg="whiteAlpha.200"
                        _hover={{ bg: 'whiteAlpha.300' }}
                        color="white"
                        onClick={copyCode}
                        size="sm"
                      >
                        Копировать
                      </Button>
                    </HStack>
                    <Text fontSize="sm" opacity={0.9}>
                      Поделитесь этим кодом с участниками
                    </Text>
                  </Box>

                  <HStack spacing={2} justify="center">
                    <Badge
                      colorScheme={
                        session.status === 'active' ? 'green' : session.status === 'finished' ? 'gray' : 'yellow'
                      }
                      fontSize="md"
                      px={3}
                      py={1}
                    >
                      {session.status === 'active' ? 'Активна' : session.status === 'finished' ? 'Завершена' : 'Запланирована'}
                    </Badge>
                  </HStack>

                  {session.status === 'scheduled' && (
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Участники вводят код на странице «Присоединиться к квизу» и остаются в ожидании старта — так они
                      попадают в лобби.
                      {session.min_players != null && session.min_players > 0 ? (
                        <>
                          {' '}
                          Сейчас в лобби: <strong>{session.participants_count ?? 0}</strong>, нужно минимум{' '}
                          <strong>{session.min_players}</strong>.
                        </>
                      ) : null}
                    </Text>
                  )}

                  <HStack spacing={3} justify="center" flexWrap="wrap">
                    {session.status === 'scheduled' && (
                      <Button
                        colorScheme="green"
                        leftIcon={<Icon as={FiPlay} />}
                        onClick={startSession}
                        isLoading={loading}
                        borderRadius="xl"
                      >
                        Запустить сессию
                      </Button>
                    )}
                    {session.status === 'active' && (
                      <Button
                        colorScheme="red"
                        leftIcon={<Icon as={FiX} />}
                        onClick={finishSession}
                        isLoading={loading}
                        borderRadius="xl"
                      >
                        Завершить сессию
                      </Button>
                    )}
                    {session.status === 'finished' && (
                      <VStack spacing={4} align="stretch" w="full" maxW="xl">
                        <Text fontSize="sm" color="gray.600" textAlign="center">
                          Итоги и ответы доступны только участникам в их личном кабинете после завершения сессии.
                        </Text>
                        <Button
                          leftIcon={<Icon as={FiCpu} />}
                          colorScheme="purple"
                          variant="outline"
                          onClick={generateCreatorFeedback}
                          isLoading={feedbackLoading}
                          alignSelf="center"
                          borderRadius="xl"
                        >
                          Получить ИИ-отклик по сессии
                        </Button>
                        <Button
                          leftIcon={<Icon as={FiDownload} />}
                          colorScheme="gray"
                          variant="outline"
                          onClick={exportSessionReport}
                          isLoading={exportingReport}
                          alignSelf="center"
                          borderRadius="xl"
                        >
                          Экспортировать официальный отчёт
                        </Button>
                        {feedbackMeta && (
                          <Text fontSize="xs" color="gray.500" textAlign="center">
                            Использовано запросов: {feedbackMeta.requests_used}/{AI_FEEDBACK_MAX_REQUESTS_PER_USER} •
                            Осталось: {feedbackMeta.requests_left}
                          </Text>
                        )}
                        {feedbackText && (
                          <Box borderWidth="1px" borderColor="gray.200" bg="white" borderRadius="xl" p={5} boxShadow="sm">
                            <Text fontSize="sm" fontWeight="semibold" color="brand.600" mb={2}>
                              Персональный ИИ-отклик для создателя
                            </Text>
                            <Divider mb={3} />
                            <Button
                              size="xs"
                              leftIcon={<Icon as={FiCopy} />}
                              variant="outline"
                              mb={3}
                              onClick={() => {
                                void copyCreatorFeedback();
                              }}
                            >
                              Скопировать отклик
                            </Button>
                            <Text color="gray.700" whiteSpace="pre-wrap" lineHeight="tall">
                              {feedbackText}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    )}
                  </HStack>
                </VStack>
              )}
            </Box>
          </MotionBox>
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Создать сессию</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Максимальное количество участников</FormLabel>
                <NumberInput
                  value={maxPlayers}
                  onChange={(_, val) => setMaxPlayers(isNaN(val) ? undefined : val)}
                  min={1}
                >
                  <NumberInputField borderRadius="xl" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Минимальное количество участников</FormLabel>
                <NumberInput
                  value={minPlayers}
                  onChange={(_, val) => setMinPlayers(isNaN(val) ? undefined : val)}
                  min={1}
                >
                  <NumberInputField borderRadius="xl" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onClose} borderRadius="xl">
                Отмена
              </Button>
              <Button colorScheme="brand" onClick={createSession} isLoading={creating} borderRadius="xl">
                Создать
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
