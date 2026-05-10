import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  VStack,
  HStack,
  Icon,
  Badge,
  Button,
  Input,
  Select,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUsers, FiAward } from 'react-icons/fi';
import { apiClient } from '../api/client';

const MotionBox = motion(Box);

interface OrganizerSession {
  session_id: number;
  quiz_id: number;
  session_code: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  quiz_title: string;
  participants_count: string;
  avg_score: string | null;
}

interface OrganizerAnalytics {
  recentSessions: OrganizerSession[];
}

export const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<OrganizerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/session/analytics');
        setAnalytics({ recentSessions: response.data.recentSessions });
      } catch {
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };
    void fetchAnalytics();
  }, []);

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
            <HStack justify="space-between" mb={4}>
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="brand.500"
                  textTransform="uppercase"
                  letterSpacing="1px"
                >
                  Управление сессиями
                </Text>
                <Heading size="lg" color="gray.800">
                  Мои сессии
                </Heading>
                <Text color="gray.500" mt={1}>
                  Последние запуски квизов и их результаты.
                </Text>
              </Box>
              <Button
                leftIcon={<Icon as={FiArrowLeft} />}
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                В личный кабинет
              </Button>
            </HStack>

            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
              p={{ base: 6, md: 8 }}
            >
              <HStack mb={4} justify="space-between" flexWrap="wrap" gap={3}>
                <HStack flexWrap="wrap">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск по названию или коду…"
                    borderRadius="xl"
                    maxW="320px"
                  />
                  <Select value={status} onChange={(e) => setStatus(e.target.value)} borderRadius="xl" maxW="190px">
                    <option value="">Все статусы</option>
                    <option value="active">Активна</option>
                    <option value="scheduled">Запланирована</option>
                    <option value="finished">Завершена</option>
                    <option value="cancelled">Отменена</option>
                  </Select>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  {analytics?.recentSessions?.length ?? 0} сессий
                </Text>
              </HStack>
              {analytics && analytics.recentSessions.length > 0 ? (
                <VStack spacing={3} align="stretch">
                  {analytics.recentSessions
                    .filter((s) => {
                      const q = query.trim().toLowerCase();
                      const okQ = !q || s.quiz_title.toLowerCase().includes(q) || s.session_code.toLowerCase().includes(q);
                      const okS = !status || s.status === status;
                      return okQ && okS;
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
                      cursor="pointer"
                      onClick={() => navigate(`/quiz/${s.quiz_id}/session/${s.session_id}`)}
                    >
                      <HStack justify="space-between" align="center">
                        <VStack align="flex-start" spacing={1}>
                          <HStack>
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
                          <Text fontSize="sm" color="gray.500">
                            Код: {s.session_code} •{' '}
                            {s.start_time
                              ? new Date(s.start_time).toLocaleString('ru-RU')
                              : new Date(s.created_at).toLocaleString('ru-RU')}
                          </Text>
                        </VStack>
                        <VStack align="flex-end" spacing={1}>
                          <HStack>
                            <Icon as={FiUsers} color="gray.500" />
                            <Text fontSize="sm" color="gray.600">
                              Участников: {s.participants_count}
                            </Text>
                          </HStack>
                          <HStack>
                            <Icon as={FiAward} color="brand.500" />
                            <Text fontSize="sm" color="gray.600">
                              Ср. балл:{' '}
                              {s.avg_score ? Math.round(parseFloat(s.avg_score)) : '—'}
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>
                    </MotionBox>
                  ))}
                </VStack>
              ) : (
                <Text color="gray.500">
                  У вас ещё нет сессий. Откройте любой квиз и запустите сессию, чтобы увидеть
                  статистику.
                </Text>
              )}
            </Box>
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
