
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Badge,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit3, FiPlay, FiUsers, FiBarChart2, FiAward, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';

const MotionBox = motion(Box);

interface Analytics {
  sessions: {
    total_sessions: string;
    active_sessions: string;
    finished_sessions: string;
    scheduled_sessions: string;
  };
  participants: {
    total_participants: string;
    avg_score: string | null;
    max_score: string | null;
    total_participations: string;
  };
  quizzes: {
    total_quizzes: string;
    published_quizzes: string;
  };
  recentSessions: Array<{
    session_id: number;
    session_code: string;
    status: string;
    quiz_title: string;
    participants_count: string;
    avg_score: string | null;
    start_time: string | null;
    end_time: string | null;
    created_at: string;
  }>;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, loading: authLoading, isCreator, isParticipant } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (isCreator) {
      const fetchAnalytics = async () => {
        try {
          setLoading(true);
          const response = await apiClient.get('/api/session/analytics');
          setAnalytics(response.data);
        } catch (error: any) {
          toast({
            title: 'Ошибка загрузки аналитики',
            description: error.response?.data?.error || 'Не удалось загрузить данные',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      };
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [authLoading, isCreator, toast]);

  if (authLoading || loading) {
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
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="brand.500"
              textTransform="uppercase"
              letterSpacing="1px"
              mb={2}
            >
              Личный кабинет
            </Text>
            <Heading size="lg" color="gray.800" mb={2}>
              Добро пожаловать в КвизМастер
            </Heading>
            <Text color="gray.500" mb={8} maxW="500px">
              {isCreator
                ? 'Ваш центр управления квизами. Создавайте викторины, приглашайте участников и анализируйте результаты.'
                : 'Добро пожаловать! Присоединяйтесь к квизам и проверяйте свои знания.'}
            </Text>

            {isCreator && analytics && (
              <Box mb={8}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="brand.500"
                  textTransform="uppercase"
                  letterSpacing="1px"
                  mb={4}
                >
                  Аналитика сессий
                </Text>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
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
                        <Icon as={FiBarChart2} color="brand.500" />
                        <Text fontSize="sm" color="gray.500">
                          Всего сессий
                        </Text>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                        {analytics.sessions.total_sessions}
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
                        <Icon as={FiUsers} color="green.500" />
                        <Text fontSize="sm" color="gray.500">
                          Участников
                        </Text>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                        {analytics.participants.total_participants}
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
                        <Icon as={FiAward} color="purple.500" />
                        <Text fontSize="sm" color="gray.500">
                          Средний балл
                        </Text>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                        {analytics.participants.avg_score
                          ? Math.round(parseFloat(analytics.participants.avg_score))
                          : '—'}
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
                        <Icon as={FiTrendingUp} color="teal.500" />
                        <Text fontSize="sm" color="gray.500">
                          Активных
                        </Text>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                        {analytics.sessions.active_sessions}
                      </Text>
                    </VStack>
                  </MotionBox>
                </SimpleGrid>

                {analytics.recentSessions.length > 0 && (
                  <Box bg="white" borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100" p={6}>
                    <Text fontSize="sm" fontWeight="semibold" color="brand.500" textTransform="uppercase" letterSpacing="1px" mb={4}>
                      Последние сессии
                    </Text>
                    <VStack spacing={3} align="stretch">
                      {analytics.recentSessions.map((session) => (
                        <MotionBox
                          key={session.session_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          p={4}
                          borderRadius="xl"
                          bg="gray.50"
                          _hover={{ bg: 'gray.100' }}
                          cursor="pointer"
                          onClick={() => navigate(`/session/${session.session_id}/results`)}
                        >
                          <HStack justify="space-between" align="center">
                            <VStack align="flex-start" spacing={1}>
                              <HStack>
                                <Text fontWeight="semibold" color="gray.800">
                                  {session.quiz_title}
                                </Text>
                                <Badge
                                  colorScheme={
                                    session.status === 'active' ? 'green' : session.status === 'finished' ? 'gray' : 'yellow'
                                  }
                                  size="sm"
                                >
                                  {session.status === 'active' ? 'Активна' : session.status === 'finished' ? 'Завершена' : 'Запланирована'}
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color="gray.500">
                                Код: {session.session_code} • Участников: {session.participants_count}
                                {session.avg_score && ` • Средний балл: ${Math.round(parseFloat(session.avg_score))}`}
                              </Text>
                            </VStack>
                          </HStack>
                        </MotionBox>
                      ))}
                    </VStack>
                  </Box>
                )}
              </Box>
            )}

            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="1px"
              mb={4}
            >
              Быстрые действия
            </Text>
            <VStack spacing={4} align="stretch">
              {isCreator && (
                <Box
                  as="button"
                  type="button"
                  onClick={() => navigate('/quiz')}
                  bg="white"
                  p={5}
                  borderRadius="2xl"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.100"
                  textAlign="left"
                  _hover={{
                    boxShadow: 'md',
                    transform: 'translateX(4px)',
                    borderColor: 'brand.200',
                  }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <Flex align="center" gap={4}>
                    <Flex
                      w={12}
                      h={12}
                      borderRadius="xl"
                      bg="brand.50"
                      color="brand.500"
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      <Icon as={FiPlus} boxSize={6} />
                    </Flex>
                    <Box>
                      <Text fontWeight="semibold" color="gray.800">
                        Создать новый квиз
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Добавьте вопросы и настройте параметры
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              )}
              {isCreator && (
                <Box
                  as="button"
                  type="button"
                  onClick={() => navigate('/quiz')}
                  bg="white"
                  p={5}
                  borderRadius="2xl"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.100"
                  textAlign="left"
                  _hover={{
                    boxShadow: 'md',
                    transform: 'translateX(4px)',
                    borderColor: 'purple.200',
                  }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <Flex align="center" gap={4}>
                    <Flex
                      w={12}
                      h={12}
                      borderRadius="xl"
                      bg="purple.50"
                      color="purple.500"
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      <Icon as={FiEdit3} boxSize={6} />
                    </Flex>
                    <Box>
                      <Text fontWeight="semibold" color="gray.800">
                        Редактировать квизы
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Управление существующими квизами и вопросами
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              )}
              {isParticipant && (
                <Box
                  as="button"
                  type="button"
                  onClick={() => navigate('/play')}
                  bg="white"
                  p={5}
                  borderRadius="2xl"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.100"
                  textAlign="left"
                  _hover={{
                    boxShadow: 'md',
                    transform: 'translateX(4px)',
                    borderColor: 'green.200',
                  }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <Flex align="center" gap={4}>
                    <Flex
                      w={12}
                      h={12}
                      borderRadius="xl"
                      bg="green.50"
                      color="green.500"
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      <Icon as={FiPlay} boxSize={6} />
                    </Flex>
                    <Box>
                      <Text fontWeight="semibold" color="gray.800">
                        Присоединиться к квизу
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Введите код сессии для участия в квизе
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              )}
            </VStack>
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
