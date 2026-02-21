import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  useToast,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { FiEdit, FiArrowLeft, FiPlay } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface Question {
  question_id: number;
  question_text: string;
  question_type: string;
  time_limit: number | null;
  points: number;
  order_index: number | null;
  options: { option_id: number; option_text: string; correctness: boolean }[];
}

interface Quiz {
  quiz_id: number;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived' | 'deleted';
  access: 'public' | 'private' | 'invite_only';
  created_at: string;
  questions: Question[];
}

export const QuizViewPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/quiz/${id}`);
        const data = response.data;
        setQuiz({
          ...data,
          questions: (data.questions || []).map((q: any) => ({ ...q, options: q.options || [] })),
        });
      } catch {
        toast({
          title: 'Ошибка загрузки квиза',
          description: 'Не удалось загрузить данные квиза. Попробуйте позже.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, navigate, toast]);

  const handleEdit = () => navigate(`/quiz/${id}/edit`);
  const handleEditQuestions = () => navigate(`/quiz/${id}/questions`);
  const handleStartSession = () => navigate(`/quiz/${id}/session`);
  const handleBack = () => navigate('/quiz');

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

  if (!quiz) {
    return (
      <Box
        bgGradient="linear(to-br, brand.50, white, purple.50)"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
      >
        <Text color="gray.500">Квиз не найден</Text>
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
            >
              <Text fontSize="sm" fontWeight="semibold" color="brand.500" textTransform="uppercase" letterSpacing="1px" mb={2}>
                Просмотр квиза
              </Text>
              <HStack spacing={3} mb={2} flexWrap="wrap">
                <Heading size="lg" color="gray.800">
                  {quiz.title}
                </Heading>
                <Badge colorScheme={quiz.status === 'published' ? 'green' : 'yellow'} size="sm">
                  {quiz.status === 'published' ? 'Опубликован' : 'Черновик'}
                </Badge>
                <Badge colorScheme="blue" variant="outline" size="sm">{quiz.access}</Badge>
              </HStack>
              {quiz.description && (
                <Text color="gray.500" fontSize="sm" mb={6}>
                  {quiz.description}
                </Text>
              )}
              <HStack spacing={3} flexWrap="wrap">
                <Button leftIcon={<Icon as={FiPlay} />} colorScheme="green" size="sm" borderRadius="xl" onClick={handleStartSession}>
                  Запустить сессию
                </Button>
                <Button leftIcon={<Icon as={FiEdit} />} colorScheme="brand" size="sm" borderRadius="xl" onClick={handleEdit}>
                  Редактировать
                </Button>
                <Button leftIcon={<Icon as={FiEdit} />} variant="outline" size="sm" borderRadius="xl" onClick={handleEditQuestions}>
                  Вопросы
                </Button>
                <Button leftIcon={<Icon as={FiArrowLeft} />} variant="ghost" size="sm" onClick={handleBack}>
                  К списку
                </Button>
              </HStack>
            </Box>

            <Text fontSize="sm" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="1px" mb={4}>
              Вопросы ({quiz.questions.length})
            </Text>

            {quiz.questions.length === 0 ? (
              <Box bg="white" borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100" p={8} textAlign="center">
                <Text color="gray.500">В этом квизе пока нет вопросов</Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {quiz.questions.map((question, index) => (
                  <MotionBox
                    key={question.question_id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    bg="white"
                    borderRadius="2xl"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                    p={5}
                    _hover={{ boxShadow: 'md' }}
                  >
                    <HStack spacing={2} mb={3}>
                      <Badge colorScheme="purple" size="sm">Вопрос {index + 1}</Badge>
                      <Badge colorScheme="teal" variant="outline" size="sm">{question.question_type}</Badge>
                      {question.time_limit != null && (
                        <Badge colorScheme="orange" variant="outline" size="sm">{question.time_limit} сек</Badge>
                      )}
                      <Badge variant="outline" size="sm">Баллы: {question.points}</Badge>
                    </HStack>
                    <Text fontWeight="medium" color="gray.800" mb={4}>
                      {question.question_text}
                    </Text>
                    <VStack spacing={2} align="stretch" pl={2}>
                      {question.options.map((option) => (
                        <HStack key={option.option_id} spacing={3}>
                          <Box
                            w={4}
                            h={4}
                            borderRadius="full"
                            bg={option.correctness ? 'green.100' : 'gray.100'}
                            borderWidth="2px"
                            borderColor={option.correctness ? 'green.500' : 'gray.300'}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            {option.correctness && <Box w={1.5} h={1.5} borderRadius="full" bg="green.500" />}
                          </Box>
                          <Text fontSize="sm" color="gray.700">{option.option_text}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </MotionBox>
                ))}
              </VStack>
            )}
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
