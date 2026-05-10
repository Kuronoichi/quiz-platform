import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Button,
  Spinner,
  Input,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEye, FiSearch, FiBarChart2 } from 'react-icons/fi';
import { Icon } from '@chakra-ui/react';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../utils/apiError';
import { useToast } from '@chakra-ui/react';

const MotionBox = motion(Box);

interface ModerationQuizRow {
  quiz_id: number;
  title: string;
  status: string;
  created_at: string;
  creator_login: string;
}

export const ModerationQuizCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { loading: authLoading, isModerator } = useAuth();
  const [list, setList] = useState<ModerationQuizRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ModerationQuizRow[]>('/api/moderation/quizzes');
      setList(res.data);
    } catch (e: unknown) {
      toast({
        title: 'Ошибка загрузки',
        description: getApiErrorMessage(e, 'Не удалось загрузить квизы'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!isModerator) {
      navigate('/dashboard');
      return;
    }
    void fetchList();
  }, [authLoading, isModerator, navigate, fetchList]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (r) =>
        r.title.toLowerCase().includes(s) ||
        r.creator_login.toLowerCase().includes(s) ||
        String(r.quiz_id).includes(s)
    );
  }, [list, q]);

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
      <Box position="relative" zIndex={1} px={{ base: 4, sm: 6, md: 8 }} py={{ base: 6, md: 12 }}>
        <Box maxW="1100px" mx="auto" w="100%">
          <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <HStack justify="space-between" align="flex-start" mb={6} flexWrap="wrap" gap={3}>
              <Box>
                <Button
                  leftIcon={<Icon as={FiArrowLeft} />}
                  variant="ghost"
                  size="sm"
                  mb={2}
                  onClick={() => navigate('/moderation')}
                >
                  К репортам
                </Button>
                <Heading size="lg" color="gray.800">
                  Каталог квизов
                </Heading>
                <Text color="gray.500" fontSize="sm" mt={1}>
                  Просмотр вопросов и вариантов для проверки контента (без права редактирования).
                </Text>
              </Box>
            </HStack>

            <HStack mb={4} flexWrap="wrap" gap={3} align="center">
              <Icon as={FiSearch} color="gray.400" display={{ base: 'none', sm: 'block' }} />
              <Input
                placeholder="Поиск по названию, автору, ID…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                maxW={{ base: '100%', md: '400px' }}
                borderRadius="xl"
                bg="white"
              />
              <Text fontSize="sm" color="gray.500">
                Показано: {filtered.length} из {list.length}
              </Text>
            </HStack>

            {loading ? (
              <Box py={12} textAlign="center">
                <Spinner colorScheme="brand" />
              </Box>
            ) : (
              <TableContainer
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.100"
                maxW="100%"
                overflowX="auto"
              >
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Название</Th>
                      <Th display={{ base: 'none', md: 'table-cell' }}>Автор</Th>
                      <Th>Статус</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filtered.map((r) => (
                      <Tr key={r.quiz_id}>
                        <Td>{r.quiz_id}</Td>
                        <Td maxW={{ base: '160px', md: '280px' }}>
                          <Text fontWeight="medium" noOfLines={2}>
                            {r.title}
                          </Text>
                          <Text fontSize="xs" color="gray.500" display={{ base: 'block', md: 'none' }}>
                            {r.creator_login}
                          </Text>
                        </Td>
                        <Td display={{ base: 'none', md: 'table-cell' }}>{r.creator_login}</Td>
                        <Td>
                          <Badge>{r.status}</Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2} flexWrap="wrap">
                            <Button
                              size="xs"
                              leftIcon={<FiEye />}
                              onClick={() => navigate(`/moderation/quizzes/${r.quiz_id}`)}
                            >
                              Открыть
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              leftIcon={<FiBarChart2 />}
                              onClick={() => navigate(`/leaderboard/${r.quiz_id}`)}
                            >
                              Рейтинг
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
