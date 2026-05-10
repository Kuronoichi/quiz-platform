import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Button,
  Icon,
  Spinner,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiAward } from 'react-icons/fi';
import { apiClient } from '../api/client';
import { getApiErrorMessage } from '../utils/apiError';
import { useToast } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';

const MotionBox = motion(Box);

interface Entry {
  rank: number;
  user_id: string;
  display_name: string;
  login: string;
  best_score: number;
  sessions_played: string;
}

export const QuizLeaderboardPage: React.FC = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isModerator, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId || authLoading) return;
    const run = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<{ quiz: { title: string }; entries: Entry[] }>(`/api/quiz/${quizId}/leaderboard`);
        setTitle(res.data.quiz.title);
        setEntries(res.data.entries);
      } catch (e: unknown) {
        toast({
          title: 'Не удалось загрузить рейтинг',
          description: getApiErrorMessage(e, 'Попробуйте позже'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate(isModerator ? '/moderation/quizzes' : '/dashboard');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [quizId, navigate, toast, authLoading, isModerator]);

  if (authLoading || loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bgGradient="linear(to-br, brand.50, white, purple.50)">
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
      <Box position="absolute" top="-100px" right="-100px" w="400px" h="400px" borderRadius="full" bg="brand.100" opacity={0.3} filter="blur(60px)" />
      <Box position="absolute" bottom="-150px" left="-100px" w="500px" h="500px" borderRadius="full" bg="purple.100" opacity={0.3} filter="blur(80px)" />

      <Box position="relative" zIndex={1} px={{ base: 4, sm: 6, md: 8 }} py={{ base: 6, md: 12 }}>
        <Box maxW="900px" mx="auto" w="100%">
          <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Button
              leftIcon={<Icon as={FiArrowLeft} />}
              variant="ghost"
              size="sm"
              mb={4}
              onClick={() =>
                isModerator && quizId
                  ? navigate(`/moderation/quizzes/${quizId}`)
                  : navigate(-1)
              }
            >
              {isModerator ? 'К проверке квиза' : 'Назад'}
            </Button>

            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
              p={{ base: 5, md: 8 }}
              mb={6}
            >
              <HStack spacing={3} mb={2} flexWrap="wrap" align="center">
                <Icon as={FiAward} boxSize={8} color="brand.500" />
                <Box minW={0}>
                  <Text fontSize="sm" fontWeight="semibold" color="brand.500" textTransform="uppercase" letterSpacing="1px">
                    Рейтинг игроков
                  </Text>
                  <Heading size="md" color="gray.800" noOfLines={2}>
                    {title}
                  </Heading>
                </Box>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                Учитываются только завершённые сессии. Для каждого игрока показан лучший результат в рамках этого квиза.
              </Text>
            </Box>

            <Box bg="white" borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100" overflow="hidden">
              <TableContainer maxW="100%" overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>#</Th>
                      <Th>Игрок</Th>
                      <Th isNumeric>Лучший балл</Th>
                      <Th isNumeric display={{ base: 'none', sm: 'table-cell' }}>
                        Сессий
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {entries.length === 0 ? (
                      <Tr>
                        <Td colSpan={4}>
                          <Text color="gray.500" py={6} textAlign="center">
                            Пока нет завершённых сессий по этому квизу.
                          </Text>
                        </Td>
                      </Tr>
                    ) : (
                      entries.map((e) => (
                        <Tr key={e.user_id}>
                          <Td>
                            <Badge colorScheme={e.rank <= 3 ? 'brand' : 'gray'}>{e.rank}</Badge>
                          </Td>
                          <Td>
                            <Text fontWeight="medium" noOfLines={1}>
                              {e.display_name}
                            </Text>
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                              {e.login}
                            </Text>
                          </Td>
                          <Td isNumeric fontWeight="semibold">
                            {e.best_score}
                          </Td>
                          <Td isNumeric display={{ base: 'none', sm: 'table-cell' }}>
                            {e.sessions_played}
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
