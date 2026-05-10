import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  VStack,
  HStack,
  Stack,
  Icon,
  SimpleGrid,
  Badge,
  Button,
  Input,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiAward, FiTrendingUp, FiClock, FiBarChart2, FiCpu, FiCopy } from 'react-icons/fi';
import { apiClient } from '../api/client';
import { AI_FEEDBACK_MAX_REQUESTS_PER_USER } from '../constants/aiFeedback';
import { getApiErrorMessage } from '../utils/apiError';

const MotionBox = motion(Box);

interface ParticipantSummary {
  total_sessions: string;
  total_quizzes: string;
  avg_score: string | null;
  max_score: string | null;
}

interface ParticipantRecentSession {
  session_id: number;
  quiz_id: number;
  session_code: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  quiz_title: string;
  score: number | null;
}

interface ParticipantAnalytics {
  summary: ParticipantSummary;
  recentSessions: ParticipantRecentSession[];
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

export const MyResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [analytics, setAnalytics] = useState<ParticipantAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [feedbackLoadingBySession, setFeedbackLoadingBySession] = useState<Record<number, boolean>>({});
  const [feedbackTextBySession, setFeedbackTextBySession] = useState<Record<number, string>>({});
  const [feedbackLeftBySession, setFeedbackLeftBySession] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/session/me/analytics');
        setAnalytics(response.data);
      } catch {
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };
    void fetchAnalytics();
  }, []);

  const generateParticipantFeedback = async (sessionId: number) => {
    try {
      setFeedbackLoadingBySession((prev) => ({ ...prev, [sessionId]: true }));
      const response = await apiClient.post<FeedbackApiResponse>(`/api/session/${sessionId}/me/feedback`);
      setFeedbackTextBySession((prev) => ({
        ...prev,
        [sessionId]: response.data.feedback.text,
      }));
      setFeedbackLeftBySession((prev) => ({
        ...prev,
        [sessionId]: response.data.requests_left,
      }));
      toast({
        title: 'Отклик сформирован',
        description: `Осталось запросов: ${response.data.requests_left} из ${AI_FEEDBACK_MAX_REQUESTS_PER_USER}`,
        status: 'success',
        duration: 3500,
        isClosable: true,
      });
    } catch (error: unknown) {
      toast({
        title: 'Не удалось получить ИИ-отклик',
        description: getApiErrorMessage(error, 'Попробуйте позже'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFeedbackLoadingBySession((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  const copyFeedbackText = async (sessionId: number) => {
    const text = feedbackTextBySession[sessionId];
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast({
      title: 'Отклик скопирован',
      status: 'success',
      duration: 2500,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <Box
        bgGradient="linear(to-br, brand.50, white, purple.50)"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
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
      <Box
        position="absolute"
        top="-100px"
        right="-100px"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="brand.100"
        opacity={0.3}
        filter="blur(60px)"
      />
      <Box
        position="absolute"
        bottom="-150px"
        left="-100px"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="purple.100"
        opacity={0.3}
        filter="blur(80px)"
      />

      <Box position="relative" zIndex={1} px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
        <Box maxW="1000px" mx="auto">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Stack direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} spacing={3} mb={4}>
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="brand.500"
                  textTransform="uppercase"
                  letterSpacing="1px"
                >
                  Личный кабинет участника
                </Text>
                <Heading size="lg" color="gray.800">
                  Мои результаты
                </Heading>
                <Text color="gray.500" mt={1}>
                  Краткая статистика по пройденным сессиям и последним участиям.
                </Text>
              </Box>
              <Button
                leftIcon={<Icon as={FiArrowLeft} />}
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                alignSelf={{ base: 'stretch', sm: 'auto' }}
              >
                В личный кабинет
              </Button>
            </Stack>

            {analytics && (
              <>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    bg="white"
                    p={5}
                    borderRadius="xl"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                  >
                    <VStack align="flex-start" spacing={2}>
                      <HStack>
                        <Icon as={FiAward} color="brand.500" />
                        <Text fontSize="sm" color="gray.500">
                          Всего сессий
                        </Text>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                        {analytics.summary.total_sessions ?? '0'}
                      </Text>
                    </VStack>
                  </MotionBox>
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    bg="white"
                    p={5}
                    borderRadius="xl"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                  >
                    <VStack align="flex-start" spacing={2}>
                      <HStack>
                        <Icon as={FiTrendingUp} color="green.500" />
                        <Text fontSize="sm" color="gray.500">
                          Средний балл
                        </Text>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                        {analytics.summary.avg_score
                          ? Math.round(parseFloat(analytics.summary.avg_score))
                          : '—'}
                      </Text>
                    </VStack>
                  </MotionBox>
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    bg="white"
                    p={5}
                    borderRadius="xl"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                  >
                    <VStack align="flex-start" spacing={2}>
                      <HStack>
                        <Icon as={FiClock} color="purple.500" />
                        <Text fontSize="sm" color="gray.500">
                          Квизов пройдено
                        </Text>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                        {analytics.summary.total_quizzes ?? '0'}
                      </Text>
                    </VStack>
                  </MotionBox>
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    bg="white"
                    p={5}
                    borderRadius="xl"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                  >
                    <VStack align="flex-start" spacing={2}>
                      <HStack>
                        <Icon as={FiAward} color="orange.500" />
                        <Text fontSize="sm" color="gray.500">
                          Лучший результат
                        </Text>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                        {analytics.summary.max_score ?? '—'}
                      </Text>
                    </VStack>
                  </MotionBox>
                </SimpleGrid>

                <Box
                  bg="white"
                  borderRadius="2xl"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.100"
                  p={{ base: 6, md: 8 }}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="brand.500"
                    textTransform="uppercase"
                    letterSpacing="1px"
                    mb={4}
                  >
                    Последние участия
                  </Text>

                  {analytics.recentSessions.length === 0 ? (
                    <VStack align="stretch" spacing={3}>
                      <Text color="gray.500">Вы ещё не участвовали в сессиях.</Text>
                      <Button size="sm" variant="outline" onClick={() => navigate('/play')} alignSelf="flex-start">
                        Присоединиться к квизу
                      </Button>
                    </VStack>
                  ) : (
                    <>
                      <HStack mb={4} justify="space-between" flexWrap="wrap" gap={3}>
                        <Input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Поиск по названию или коду…"
                          borderRadius="xl"
                          maxW="360px"
                          bg="gray.50"
                        />
                        <Button size="sm" variant="outline" onClick={() => navigate('/play')}>
                          Присоединиться к квизу
                        </Button>
                      </HStack>
                      <VStack spacing={3} align="stretch">
                        {analytics.recentSessions
                          .filter((s) => {
                            const q = query.trim().toLowerCase();
                            if (!q) return true;
                            return s.quiz_title.toLowerCase().includes(q) || s.session_code.toLowerCase().includes(q);
                          })
                          .map((s) => (
                        <MotionBox
                          key={s.session_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          p={4}
                          borderRadius="xl"
                          bg="gray.50"
                          _hover={{ bg: 'gray.100' }}
                        >
                          <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'center' }} spacing={4}>
                            <VStack align="flex-start" spacing={1}>
                              <HStack flexWrap="wrap">
                                <Text fontWeight="semibold" color="gray.800">
                                  {s.quiz_title}
                                </Text>
                                <Badge
                                  colorScheme={
                                    s.status === 'finished'
                                      ? 'gray'
                                      : s.status === 'active'
                                      ? 'green'
                                      : 'yellow'
                                  }
                                >
                                  {s.status === 'finished'
                                    ? 'Завершена'
                                    : s.status === 'active'
                                    ? 'Активна'
                                    : 'Запланирована'}
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color="gray.500" wordBreak="break-word">
                                Код: {s.session_code} •{' '}
                                {s.start_time
                                  ? new Date(s.start_time).toLocaleString('ru-RU')
                                  : new Date(s.created_at).toLocaleString('ru-RU')}
                              </Text>
                              <Button
                                size="xs"
                                variant="outline"
                                leftIcon={<Icon as={FiBarChart2} />}
                                onClick={() => navigate(`/leaderboard/${s.quiz_id}`)}
                              >
                                Рейтинг квиза
                              </Button>
                              {s.status === 'finished' && (
                                <>
                                  <Button
                                    size="xs"
                                    colorScheme="purple"
                                    variant="outline"
                                    leftIcon={<Icon as={FiCpu} />}
                                    onClick={() => generateParticipantFeedback(s.session_id)}
                                    isLoading={Boolean(feedbackLoadingBySession[s.session_id])}
                                  >
                                    Получить ИИ-отклик
                                  </Button>
                                  {typeof feedbackLeftBySession[s.session_id] === 'number' && (
                                    <Text fontSize="xs" color="gray.500">
                                      Осталось запросов: {feedbackLeftBySession[s.session_id]} из{' '}
                                      {AI_FEEDBACK_MAX_REQUESTS_PER_USER}
                                    </Text>
                                  )}
                                </>
                              )}
                            </VStack>
                            <VStack align={{ base: 'flex-start', md: 'flex-end' }} spacing={1}>
                              <Text fontSize="sm" color="gray.500">
                                Набрано баллов
                              </Text>
                              <Text fontSize="lg" fontWeight="bold" color="brand.600">
                                {s.score ?? 0}
                              </Text>
                            </VStack>
                          </Stack>
                          {feedbackTextBySession[s.session_id] && (
                            <Box mt={4} borderWidth="1px" borderColor="gray.200" bg="white" borderRadius="xl" p={5} boxShadow="sm">
                              <Text fontSize="sm" fontWeight="semibold" color="brand.600" mb={2}>
                                Персональный ИИ-отклик по вашему результату
                              </Text>
                              <Divider mb={3} />
                              <Button
                                size="xs"
                                leftIcon={<Icon as={FiCopy} />}
                                variant="outline"
                                mb={3}
                                onClick={() => {
                                  void copyFeedbackText(s.session_id);
                                }}
                              >
                                Скопировать отклик
                              </Button>
                              <Text color="gray.700" whiteSpace="pre-wrap" lineHeight="tall">
                                {feedbackTextBySession[s.session_id]}
                              </Text>
                            </Box>
                          )}
                        </MotionBox>
                        ))}
                      </VStack>
                    </>
                  )}
                </Box>
              </>
            )}
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
