import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  HStack,
  Badge,
  IconButton,
  Tooltip,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Icon,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash, FiEye } from 'react-icons/fi';
import { apiClient } from '../../api/client';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);

interface Quiz {
  quiz_id: number;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived' | 'deleted';
  access: 'public' | 'private' | 'invite_only';
  created_at: string;
}

export const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizToDelete, setQuizToDelete] = useState<{ id: number; title: string } | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<any>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/quiz');
      setQuizzes(response.data);
    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.response?.data?.message ?? error.response?.data?.error;
      if (status === 403) {
        toast({
          title: 'Доступ запрещён',
          description: msg || 'Только создатели контента могут управлять квизами. Зарегистрируйтесь как создатель контента.',
          status: 'warning',
          duration: 6000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Ошибка загрузки квизов',
          description: msg || 'Не удалось загрузить список квизов. Попробуйте позже.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => navigate('/quiz/new');
  const handleEditQuiz = (quizId: number) => navigate(`/quiz/${quizId}/edit`);
  const handleViewQuiz = (quizId: number) => navigate(`/quiz/${quizId}`);
  const handleEditQuestions = (quizId: number) => navigate(`/quiz/${quizId}/questions`);
  const handleDeleteQuiz = (quizId: number, title: string) => {
    setQuizToDelete({ id: quizId, title });
    onOpen();
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    try {
      await apiClient.delete(`/api/quiz/${quizToDelete.id}`);
      toast({ title: 'Квиз удален', description: 'Квиз был успешно удален.', status: 'success', duration: 3000, isClosable: true });
      fetchQuizzes();
    } catch {
      toast({ title: 'Ошибка удаления', description: 'Не удалось удалить квиз. Попробуйте позже.', status: 'error', duration: 5000, isClosable: true });
    } finally {
      onClose();
      setQuizToDelete(null);
    }
  };

  const publishedQuizzes = quizzes.filter(q => q.status === 'published');
  const draftQuizzes = quizzes.filter(q => q.status === 'draft');
  const archivedQuizzes = quizzes.filter(q => q.status === 'archived');

  const renderQuizCard = (quiz: Quiz, variant: 'published' | 'draft' | 'archived') => {
    const accent = variant === 'published' ? 'green' : variant === 'draft' ? 'yellow' : 'gray';
    const label = variant === 'published' ? 'Опубликован' : variant === 'draft' ? 'Черновик' : 'Архив';
    return (
      <MotionBox
        key={quiz.quiz_id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        bg="white"
        borderRadius="2xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
        p={5}
        _hover={{ boxShadow: 'md', borderColor: `${accent}.200` }}
        transition="all 0.2s"
      >
        <Flex justify="space-between" align="flex-start" gap={4}>
          <Box flex="1" minW={0}>
            <Text fontWeight="semibold" color="gray.800" fontSize="lg" mb={1} noOfLines={1}>
              {quiz.title}
            </Text>
            {quiz.description && (
              <Text color="gray.500" fontSize="sm" noOfLines={2} mb={3}>
                {quiz.description}
              </Text>
            )}
            <HStack spacing={2}>
              <Badge colorScheme={accent} size="sm">{label}</Badge>
              <Badge colorScheme="blue" variant="outline" size="sm">{quiz.access}</Badge>
            </HStack>
          </Box>
          <HStack spacing={1} flexShrink={0}>
            <Tooltip label="Просмотреть">
              <IconButton aria-label="Просмотреть" icon={<FiEye />} size="sm" variant="ghost" colorScheme="gray" onClick={() => handleViewQuiz(quiz.quiz_id)} />
            </Tooltip>
            <Tooltip label="Вопросы">
              <IconButton aria-label="Вопросы" icon={<FiEdit />} size="sm" variant="ghost" colorScheme="gray" onClick={() => handleEditQuestions(quiz.quiz_id)} />
            </Tooltip>
            <Tooltip label="Редактировать">
              <IconButton aria-label="Редактировать" icon={<FiEdit />} size="sm" variant="ghost" colorScheme="brand" onClick={() => handleEditQuiz(quiz.quiz_id)} />
            </Tooltip>
            <Tooltip label="Удалить">
              <IconButton aria-label="Удалить" icon={<FiTrash />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDeleteQuiz(quiz.quiz_id, quiz.title)} />
            </Tooltip>
          </HStack>
        </Flex>
      </MotionBox>
    );
  };

  if (loading) {
    return (
      <Flex justify="center" py={12}>
        <Spinner size="lg" colorScheme="brand" />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="1px">
          Список квизов
        </Text>
        <Button
          leftIcon={<Icon as={FiPlus} />}
          colorScheme="brand"
          size="sm"
          onClick={handleCreateQuiz}
          _hover={{ transform: 'translateY(-1px)' }}
          transition="all 0.2s"
        >
          Создать квиз
        </Button>
      </Flex>

      <VStack spacing={4} align="stretch">
        {publishedQuizzes.length > 0 && (
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="green.600" textTransform="uppercase" letterSpacing="1px" mb={3}>
              Опубликованные
            </Text>
            <VStack spacing={4} align="stretch">
              {publishedQuizzes.map(q => renderQuizCard(q, 'published'))}
            </VStack>
          </Box>
        )}
        {draftQuizzes.length > 0 && (
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="yellow.600" textTransform="uppercase" letterSpacing="1px" mb={3}>
              Черновики
            </Text>
            <VStack spacing={4} align="stretch">
              {draftQuizzes.map(q => renderQuizCard(q, 'draft'))}
            </VStack>
          </Box>
        )}
        {archivedQuizzes.length > 0 && (
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="1px" mb={3}>
              Архив
            </Text>
            <VStack spacing={4} align="stretch">
              {archivedQuizzes.map(q => renderQuizCard(q, 'archived'))}
            </VStack>
          </Box>
        )}
        {quizzes.length === 0 && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            bg="white"
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
            p={10}
            textAlign="center"
          >
            <Text color="gray.500" mb={2} fontWeight="medium">
              Пока нет квизов
            </Text>
            <Text color="gray.400" fontSize="sm" mb={6}>
              Создайте первый квиз, чтобы начать
            </Text>
            <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={handleCreateQuiz}>
              Создать первый квиз
            </Button>
          </MotionBox>
        )}
      </VStack>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Удалить квиз?
            </AlertDialogHeader>
            <AlertDialogBody>
              Вы действительно хотите удалить квиз «{quizToDelete?.title}»? Это действие нельзя отменить.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="ghost">
                Отмена
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Удалить
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
