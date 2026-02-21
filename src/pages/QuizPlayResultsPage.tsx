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
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { FiArrowLeft, FiCheck, FiX, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface Participant {
  session_id: number;
  user_id: string;
  join_time: string;
  score: number | null;
}

interface Answer {
  answer_id: number;
  question_id: number;
  correctness: boolean;
  answer_time: string;
  time_spent: number | null;
  question_text: string;
  points: number;
}

interface Question {
  question_id: number;
  question_text: string;
  points: number;
  option_id: number;
  option_text: string;
  correctness: boolean;
}

interface Results {
  participant: Participant;
  answers: Answer[];
  questions: Question[];
}

export const QuizPlayResultsPage: React.FC = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/session/code/${code}/results`);
        setResults(response.data);
      } catch (error: any) {
        toast({
          title: 'Ошибка загрузки результатов',
          description: error.response?.data?.error || 'Не удалось загрузить результаты',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/play');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [code, navigate, toast]);

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

  const questionsMap = new Map<number, Question[]>();
  results.questions.forEach((q) => {
    if (!questionsMap.has(q.question_id)) {
      questionsMap.set(q.question_id, []);
    }
    questionsMap.get(q.question_id)!.push(q);
  });

  const answersMap = new Map<number, Answer>();
  results.answers.forEach((a) => {
    answersMap.set(a.question_id, a);
  });

  const totalScore = results.participant.score || 0;
  const maxScore = Array.from(questionsMap.values()).reduce((sum, opts) => {
    return sum + (opts[0]?.points || 0);
  }, 0);

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
              mb={6}
              textAlign="center"
            >
              <VStack spacing={4}>
                <Icon as={FiAward} boxSize={16} color="brand.500" />
                <Heading size="lg" color="gray.800">
                  Ваши результаты
                </Heading>
                <HStack spacing={4} justify="center">
                  <VStack>
                    <Text fontSize="sm" color="gray.500">
                      Набрано баллов
                    </Text>
                    <Text fontSize="4xl" fontWeight="bold" color="brand.600">
                      {totalScore}
                    </Text>
                  </VStack>
                  <Text fontSize="2xl" color="gray.300">
                    /
                  </Text>
                  <VStack>
                    <Text fontSize="sm" color="gray.500">
                      Максимум
                    </Text>
                    <Text fontSize="4xl" fontWeight="bold" color="gray.600">
                      {maxScore}
                    </Text>
                  </VStack>
                </HStack>
                <Text fontSize="lg" color="gray.600">
                  {Math.round((totalScore / maxScore) * 100)}% правильных ответов
                </Text>
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
              <Text fontSize="sm" fontWeight="semibold" color="brand.500" textTransform="uppercase" letterSpacing="1px" mb={6}>
                Детали ответов
              </Text>

              <VStack spacing={6} align="stretch">
                {Array.from(questionsMap.entries()).map(([questionId, options], index) => {
                  const answer = answersMap.get(questionId);
                  const isCorrect = answer?.correctness || false;
                  const questionText = options[0]?.question_text || '';
                  const points = options[0]?.points || 0;

                  return (
                    <MotionBox
                      key={questionId}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      bg={isCorrect ? 'green.50' : 'red.50'}
                      borderRadius="xl"
                      p={5}
                      borderWidth="1px"
                      borderColor={isCorrect ? 'green.200' : 'red.200'}
                    >
                      <HStack spacing={3} mb={3}>
                        <Badge colorScheme={isCorrect ? 'green' : 'red'} fontSize="md" px={2} py={1}>
                          Вопрос {index + 1}
                        </Badge>
                        {isCorrect ? (
                          <Icon as={FiCheck} color="green.500" />
                        ) : (
                          <Icon as={FiX} color="red.500" />
                        )}
                        <Text fontSize="sm" color="gray.600">
                          Баллы: {isCorrect ? points : 0} / {points}
                        </Text>
                      </HStack>
                      <Text fontWeight="medium" color="gray.800" mb={3}>
                        {questionText}
                      </Text>
                      <VStack spacing={2} align="stretch" pl={2}>
                        {options.map((opt) => (
                          <HStack key={opt.option_id} spacing={3}>
                            <Box
                              w={4}
                              h={4}
                              borderRadius="full"
                              bg={opt.correctness ? 'green.200' : 'gray.200'}
                              borderWidth="2px"
                              borderColor={opt.correctness ? 'green.500' : 'gray.400'}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              {opt.correctness && <Box w={1.5} h={1.5} borderRadius="full" bg="green.500" />}
                            </Box>
                            <Text fontSize="sm" color="gray.700">
                              {opt.option_text}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </MotionBox>
                  );
                })}
              </VStack>
            </Box>

            <HStack justify="center" mt={6}>
              <Button leftIcon={<Icon as={FiArrowLeft} />} variant="outline" onClick={() => navigate('/play')} borderRadius="xl">
                Вернуться к началу
              </Button>
            </HStack>
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
