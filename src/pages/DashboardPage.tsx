
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
  Button,
  type BoxProps,
  Divider,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiList, FiPlay, FiUsers, FiBarChart2, FiAward, FiTrendingUp, FiCheckSquare, FiLogOut, FiShield, FiUser, FiHelpCircle, FiBookOpen } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';
import { getApiErrorMessage } from '../utils/apiError';

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
    quiz_id: number;
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
  const { user, loading: authLoading, isCreator, isParticipant, isModerator, isAdmin } = useAuth();
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
        } catch (error: unknown) {
          toast({
            title: 'Ошибка загрузки аналитики',
            description: getApiErrorMessage(error, 'Не удалось загрузить данные'),
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      };
      void fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [authLoading, isCreator, toast]);

  type ActionButtonProps = Omit<BoxProps, 'as' | 'onClick'> & {
    icon: IconType;
    title: string;
    description: string;
    onClick: () => void;
    colorScheme: string;
  };

  const ActionButton: React.FC<ActionButtonProps> = ({ icon, title, description, onClick, colorScheme, ...rest }) => (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      bg="white"
      p={5}
      borderRadius="2xl"
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.100"
      textAlign="left"
      position="relative"
      overflow="hidden"
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          opacity: 0.9,
          background: `linear-gradient(90deg, var(--chakra-colors-${colorScheme}-400), var(--chakra-colors-purple-400))`,
        },
      }}
      _hover={{
        boxShadow: '0 10px 28px -8px rgba(0,0,0,0.12)',
        transform: 'translateX(4px)',
        borderColor: `${colorScheme}.200`,
      }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'brand.400',
        outlineOffset: '2px',
      }}
      transition="all 0.2s"
      cursor="pointer"
      {...rest}
    >
      <Flex align="center" gap={4}>
        <Flex
          w={12}
          h={12}
          borderRadius="xl"
          bg={`${colorScheme}.50`}
          color={`${colorScheme}.500`}
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={6} />
        </Flex>
        <Box>
          <Text fontWeight="semibold" color="gray.800">
            {title}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {description}
          </Text>
        </Box>
      </Flex>
    </Box>
  );

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
        <Box maxW="1000px" mx="auto" w="100%">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="brand.500"
                  textTransform="uppercase"
                  letterSpacing="1px"
                >
                  Личный кабинет
                </Text>
                <Heading size="lg" color="gray.800">
                  Добро пожаловать, {user?.name || 'Гость'}!
                </Heading>
              </Box>
              <HStack spacing={3}>
                {user && (
                  <Badge
                    colorScheme={
                      isAdmin ? 'red' : isModerator ? 'purple' : isCreator ? 'purple' : 'blue'
                    }
                    fontSize="sm"
                    p={2}
                    borderRadius="md"
                  >
                    Ваша роль:{' '}
                    {user.role_id === 'admin'
                      ? 'Администратор'
                      : user.role_id === 'moderator'
                        ? 'Модератор'
                        : user.role_id === 'creator'
                          ? 'Создатель'
                          : 'Участник'}
                  </Badge>
                )}
                {user && (
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<FiLogOut />}
                    onClick={async () => {
                      try {
                        await apiClient.post('/api/auth/sign-out');
                      } catch {
                      } finally {
                        window.location.href = '/auth';
                      }
                    }}
                  >
                    Выйти
                  </Button>
                )}
              </HStack>
            </Flex>
            <Text color="gray.500" mb={8} maxW="500px">
              {isAdmin
                ? 'Полный доступ: квизы, модерация репортов и блокировка пользователей.'
                : isModerator
                  ? 'Модерация контента по репортам на вопросы.'
                  : isCreator
                    ? 'Ваш центр управления квизами. Создавайте викторины и приглашайте участников по коду сессии.'
                    : 'Добро пожаловать! Присоединяйтесь к квизам и проверяйте свои знания.'}
            </Text>

            {isParticipant && (
              <Box
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.100"
                p={{ base: 5, md: 6 }}
                mb={8}
              >
                <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
                  <Box>
                    <Text fontWeight="semibold" color="gray.800">
                      Быстрый старт
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      Начни с участия — код сессии выдаёт организатор.
                    </Text>
                  </Box>
                  <Button size="sm" variant="outline" leftIcon={<FiPlay />} onClick={() => navigate('/play')}>
                    Ввести код сессии
                  </Button>
                </HStack>
                <Divider my={4} />
                <HStack spacing={3} flexWrap="wrap">
                  <Button size="sm" variant="ghost" leftIcon={<FiCheckSquare />} onClick={() => navigate('/my-results')}>
                    Мои результаты
                  </Button>
                  <Button size="sm" variant="ghost" leftIcon={<FiUsers />} onClick={() => navigate('/how-it-works')}>
                    Как это работает
                  </Button>
                </HStack>
              </Box>
            )}

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
                   <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} bg="white" p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100">
                    <VStack align="flex-start" spacing={2}>
                      <HStack>
                        <Icon as={FiBarChart2} color="brand.500" />
                        <Text fontSize="sm" color="gray.500">Всего сессий</Text>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.800">{analytics.sessions.total_sessions}</Text>
                    </VStack>
                  </MotionBox>
                  <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} bg="white" p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100">
                    <VStack align="flex-start" spacing={2}>
                      <HStack>
                        <Icon as={FiUsers} color="green.500" />
                        <Text fontSize="sm" color="gray.500">Участников</Text>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.800">{analytics.participants.total_participants}</Text>
                    </VStack>
                  </MotionBox>
                  <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} bg="white" p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100">
                    <VStack align="flex-start" spacing={2}>
                      <HStack>
                        <Icon as={FiAward} color="purple.500" />
                        <Text fontSize="sm" color="gray.500">Средний балл</Text>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.800">{analytics.participants.avg_score ? Math.round(parseFloat(analytics.participants.avg_score)) : '—'}</Text>
                    </VStack>
                  </MotionBox>
                  <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }} bg="white" p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100">
                    <VStack align="flex-start" spacing={2}>
                      <HStack>
                        <Icon as={FiTrendingUp} color="teal.500" />
                        <Text fontSize="sm" color="gray.500">Активных</Text>
                      </HStack>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.800">{analytics.sessions.active_sessions}</Text>
                    </VStack>
                  </MotionBox>
                </SimpleGrid>
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
              {isModerator && (
                <>
                  <ActionButton
                    icon={FiShield}
                    title="Модерация репортов"
                    description="Обработка жалоб на вопросы по подготовленным репортам"
                    onClick={() => navigate('/moderation')}
                    colorScheme="orange"
                  />
                  <ActionButton
                    icon={FiBookOpen}
                    title="Каталог квизов"
                    description="Просмотр контента квизов для проверки"
                    onClick={() => navigate('/moderation/quizzes')}
                    colorScheme="purple"
                  />
                  {!isAdmin && !isCreator && !isParticipant && (
                    <ActionButton
                      icon={FiHelpCircle}
                      title="Как это работает"
                      description="Пошаговые подсказки под вашу роль на платформе"
                      onClick={() => navigate('/how-it-works')}
                      colorScheme="gray"
                    />
                  )}
                </>
              )}
              {isAdmin && (
                <ActionButton
                  icon={FiUser}
                  title="Администрирование"
                  description="Пользователи и блокировки"
                  onClick={() => navigate('/admin')}
                  colorScheme="red"
                />
              )}
              {(isCreator || isAdmin) && (
                <ActionButton
                  icon={FiHelpCircle}
                  title="Как это работает"
                  description="Пошаговые подсказки под вашу роль на платформе"
                  onClick={() => navigate('/how-it-works')}
                  colorScheme="gray"
                />
              )}
              {isCreator && (
                <>
                  <ActionButton
                    icon={FiList}
                    title="Управление квизами"
                    description="Создание, редактирование и публикация ваших квизов"
                    onClick={() => navigate('/quiz')}
                    colorScheme="brand"
                  />
                  <ActionButton
                    icon={FiPlus}
                    title="Управление сессиями"
                    description="Запуск и завершение сессий, код для участников"
                    onClick={() => navigate('/sessions')}
                    colorScheme="purple"
                  />
                </>
              )}
              {isParticipant && (
                <>
                  <ActionButton
                    icon={FiHelpCircle}
                    title="Как это работает"
                    description="Пошаговые подсказки под вашу роль на платформе"
                    onClick={() => navigate('/how-it-works')}
                    colorScheme="gray"
                  />
                  <ActionButton
                    icon={FiPlay}
                    title="Присоединиться к квизу"
                    description="Введите код сессии для участия в квизе"
                    onClick={() => navigate('/play')}
                    colorScheme="green"
                  />
                  <ActionButton
                    icon={FiCheckSquare}
                    title="Мои результаты"
                    description="Просмотр истории участий и результатов"
                    onClick={() => navigate('/my-results')}
                    colorScheme="blue"
                  />
                </>
              )}
            </VStack>
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
