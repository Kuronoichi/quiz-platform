import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Button,
  Badge,
  useToast,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { QuestionList } from '../components/quiz/questions/QuestionList';
import { FiCheck, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface Question {
  id: string;
  question_text: string;
  question_type: 'single_choice';
  timeLimit: number | null;
  points: number;
  options: { id: string; text: string; isCorrect: boolean }[];
}

interface Quiz {
  quiz_id: number;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived' | 'deleted';
  access: 'public' | 'private' | 'invite_only';
}

export const QuizQuestionsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const [quizRes, questionsRes] = await Promise.all([
          apiClient.get(`/api/quiz/${id}`),
          apiClient.get(`/api/quiz/${id}/questions`),
        ]);
        setQuiz(quizRes.data);
        setQuestions(
          (questionsRes.data as any[]).map((q: any) => ({
            id: q.question_id.toString(),
            question_text: q.question_text,
            question_type: (q.question_type || 'single_choice') as 'single_choice',
            timeLimit: q.time_limit,
            points: q.points,
            options: (q.options || []).map((o: any) => ({
              id: o.option_id.toString(),
              text: o.option_text,
              isCorrect: o.correctness,
            })),
          }))
        );
      } catch {
        toast({
          title: 'Ошибка загрузки данных',
          description: 'Не удалось загрузить данные квиза и вопросов. Попробуйте позже.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [id, navigate, toast]);

  const handleAddQuestion = (questionData: Omit<Question, 'id'>) => {
    setQuestions(prev => [...prev, { id: `new-${Date.now()}`, ...questionData }]);
    toast({ title: 'Вопрос добавлен', status: 'success', duration: 3000, isClosable: true });
  };

  const handleEditQuestion = (questionId: string, questionData: Omit<Question, 'id'>) => {
    setQuestions(prev => prev.map(q => (q.id === questionId ? { ...questionData, id: questionId } : q)));
    toast({ title: 'Вопрос обновлен', status: 'success', duration: 3000, isClosable: true });
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    toast({ title: 'Вопрос удален', status: 'success', duration: 3000, isClosable: true });
  };

  const handleSaveQuestions = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const currentFromServer = await apiClient.get(`/api/quiz/${id}/questions`);
      const serverQuestions = currentFromServer.data as any[];
      const serverIds = new Set(serverQuestions.map((q: any) => q.question_id.toString()));
      const localIds = new Set(questions.map(q => q.id));

      for (const q of questions) {
        if (q.id.startsWith('new-')) {
          await apiClient.post(`/api/quiz/${id}/questions`, {
            question_text: q.question_text,
            question_type: q.question_type || 'single_choice',
            time_limit: q.timeLimit ?? null,
            points: q.points,
            options: q.options.map(o => ({ option_text: o.text, correctness: o.isCorrect })),
          });
        } else if (serverIds.has(q.id)) {
          await apiClient.patch(`/api/quiz/${id}/questions/${q.id}`, {
            question_text: q.question_text,
            question_type: q.question_type || 'single_choice',
            time_limit: q.timeLimit ?? null,
            points: q.points,
            options: q.options.map(o => ({ option_text: o.text, correctness: o.isCorrect })),
          });
        }
      }
      for (const sid of Array.from(serverIds)) {
        if (!localIds.has(sid)) await apiClient.delete(`/api/quiz/${id}/questions/${sid}`);
      }

      toast({ title: 'Вопросы сохранены', description: 'Все вопросы успешно сохранены.', status: 'success', duration: 3000, isClosable: true });
      navigate(`/quiz/${id}`);
    } catch {
      toast({ title: 'Ошибка сохранения', description: 'Не удалось сохранить вопросы. Попробуйте позже.', status: 'error', duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate(`/quiz/${id}`);

  if (loading && !quiz) {
    return (
      <Box bgGradient="linear(to-br, brand.50, white, purple.50)" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="lg" colorScheme="brand" />
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Box bgGradient="linear(to-br, brand.50, white, purple.50)" minH="100vh" display="flex" alignItems="center" justifyContent="center" px={4}>
        <Text color="gray.500">Квиз не найден</Text>
      </Box>
    );
  }

  return (
    <Box bgGradient="linear(to-br, brand.50, white, purple.50)" minH="100vh" position="relative" overflow="hidden">
      <Box position="absolute" top="-100px" right="-100px" w="400px" h="400px" borderRadius="full" bg="brand.100" opacity={0.3} filter="blur(60px)" />
      <Box position="absolute" bottom="-150px" left="-100px" w="500px" h="500px" borderRadius="full" bg="purple.100" opacity={0.3} filter="blur(80px)" />

      <Box position="relative" zIndex={1} px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
        <Box maxW="800px" mx="auto">
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Box bg="white" borderRadius="2xl" boxShadow="sm" borderWidth="1px" borderColor="gray.100" p={{ base: 6, md: 8 }} mb={6}>
              <Text fontSize="sm" fontWeight="semibold" color="brand.500" textTransform="uppercase" letterSpacing="1px" mb={2}>
                Редактирование вопросов
              </Text>
              <HStack spacing={3} mb={2} flexWrap="wrap">
                <Heading size="lg" color="gray.800">{quiz.title}</Heading>
                <Badge colorScheme={quiz.status === 'published' ? 'green' : 'yellow'} size="sm">
                  {quiz.status === 'published' ? 'Опубликован' : 'Черновик'}
                </Badge>
                <Badge colorScheme="blue" variant="outline" size="sm">{quiz.access}</Badge>
              </HStack>
              {quiz.description && <Text color="gray.500" fontSize="sm" mb={4}>{quiz.description}</Text>}
              <HStack spacing={3}>
                <Button
                  leftIcon={<Icon as={FiCheck} />}
                  colorScheme="brand"
                  size="sm"
                  borderRadius="xl"
                  onClick={handleSaveQuestions}
                  isLoading={loading}
                  loadingText="Сохранение..."
                >
                  Сохранить вопросы
                </Button>
                <Button leftIcon={<Icon as={FiArrowLeft} />} variant="outline" size="sm" borderRadius="xl" onClick={handleBack}>
                  Назад к просмотру
                </Button>
              </HStack>
            </Box>

            <QuestionList
              questions={questions}
              onAddQuestion={handleAddQuestion}
              onEditQuestion={handleEditQuestion}
              onDeleteQuestion={handleDeleteQuestion}
            />
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
