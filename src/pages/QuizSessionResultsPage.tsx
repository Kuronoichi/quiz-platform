import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
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
import { apiClient } from '../api/client';
import { FiArrowLeft, FiUsers, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface Participant {
  session_id: number;
  user_id: string;
  join_time: string;
  score: number | null;
  user_name: string;
  user_login: string;
}

interface Answer {
  answer_id: number;
  session_id: number;
  user_id: string;
  question_id: number;
  correctness: boolean;
  answer_time: string;
  time_spent: number | null;
  question_text: string;
  points: number;
  user_name: string;
}

interface Results {
  session: {
    session_id: number;
    quiz_id: number;
    organizer_id: string;
    session_code: string;
    status: string;
    start_time: string | null;
    end_time: string | null;
  };
  participants: Participant[];
  answers: Answer[];
}

export const QuizSessionResultsPage: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/session/${sessionId}/results`);
        setResults(response.data);
      } catch (error: any) {
        toast({
          title: 'Ошибка загрузки результатов',
          description: error.response?.data?.error || 'Не удалось загрузить результаты',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [sessionId, navigate, toast]);

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

  if (!results) {
    return (
      <Box
        bgGradient="linear(to-br, brand.50, white, purple.50)"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
      >
        <Text color="gray.500">Результаты не найдены</Text>
      </Box>
    );
  }

  const sortedParticipants = [...results.participants].sort((a, b) => (b.score || 0) - (a.score || 0));

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
        <Box maxW="1000px" mx="auto">
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
              p={{ base: 6, md: 8 }}
              mb={6}
            >
              <HStack spacing={3} mb={6}>
                <Button leftIcon={<Icon as={FiArrowLeft} />} variant="ghost" size="sm" onClick={() => navigate(`/quiz/${results.session.quiz_id}`)}>
                  Назад к квизу
                </Button>
              </HStack>

              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <VStack align="flex-start" spacing={1}>
                    <Text fontSize="sm" fontWeight="semibold" color="brand.500" textTransform="uppercase" letterSpacing="1px">
                      Результаты сессии
                    </Text>
                    <Heading size="lg" color="gray.800">
                      Код: {results.session.session_code}
                    </Heading>
                  </VStack>
                  <Badge
                    colorScheme={
                      results.session.status === 'active' ? 'green' : results.session.status === 'finished' ? 'gray' : 'yellow'
                    }
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    {results.session.status === 'active' ? 'Активна' : results.session.status === 'finished' ? 'Завершена' : 'Запланирована'}
                  </Badge>
                </HStack>

                <HStack spacing={6} color="gray.600" fontSize="sm">
                  <HStack>
                    <Icon as={FiUsers} />
                    <Text>Участников: {results.participants.length}</Text>
                  </HStack>
                  {results.session.start_time && (
                    <Text>Начало: {new Date(results.session.start_time).toLocaleString('ru-RU')}</Text>
                  )}
                  {results.session.end_time && (
                    <Text>Завершение: {new Date(results.session.end_time).toLocaleString('ru-RU')}</Text>
                  )}
                </HStack>
              </VStack>
            </Box>

            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
              p={{ base: 6, md: 8 }}
            >
              <HStack spacing={2} mb={6}>
                <Icon as={FiAward} color="brand.500" />
                <Text fontSize="sm" fontWeight="semibold" color="brand.500" textTransform="uppercase" letterSpacing="1px">
                  Рейтинг участников
                </Text>
              </HStack>

              {sortedParticipants.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>
                  Участников пока нет
                </Text>
              ) : (
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Место</Th>
                        <Th>Участник</Th>
                        <Th isNumeric>Баллы</Th>
                        <Th>Время присоединения</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {sortedParticipants.map((participant, index) => (
                        <Tr key={participant.user_id}>
                          <Td>
                            <Badge
                              colorScheme={index === 0 ? 'yellow' : index === 1 ? 'gray' : index === 2 ? 'orange' : 'gray'}
                              fontSize="md"
                              px={2}
                              py={1}
                            >
                              {index + 1}
                            </Badge>
                          </Td>
                          <Td>
                            <VStack align="flex-start" spacing={0}>
                              <Text fontWeight="medium">{participant.user_name || participant.user_login}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {participant.user_login}
                              </Text>
                            </VStack>
                          </Td>
                          <Td isNumeric>
                            <Text fontWeight="bold" fontSize="lg" color="brand.600">
                              {participant.score ?? 0}
                            </Text>
                          </Td>
                          <Td>{new Date(participant.join_time).toLocaleString('ru-RU')}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
