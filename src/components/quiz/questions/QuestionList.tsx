import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Badge,
  IconButton,
  Tooltip,
  useDisclosure,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash } from 'react-icons/fi';
import { QuestionForm } from './QuestionForm';

const MotionBox = motion(Box);

interface Question {
  id: string;
  question_text: string;
  question_type: 'single_choice';
  timeLimit: number | null;
  points: number;
  options: { id: string; text: string; isCorrect: boolean }[];
}

interface QuestionListProps {
  questions: Question[];
  onAddQuestion: (question: Omit<Question, 'id'>) => void;
  onEditQuestion: (id: string, question: Omit<Question, 'id'>) => void;
  onDeleteQuestion: (id: string) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const transformQuestionToFormData = (question: Question | null): any | undefined => {
    if (!question) return undefined;
    return { ...question, timeLimit: question.timeLimit ?? '' };
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    onOpen();
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    onOpen();
  };

  const handleFormSubmit = (data: any) => {
    if (editingQuestion) onEditQuestion(editingQuestion.id, data);
    else onAddQuestion(data);
    onClose();
  };

  return (
    <Box>
      <HStack justify="space-between" align="center" mb={4}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="1px">
          Список вопросов ({questions.length})
        </Text>
        <Button
          leftIcon={<Icon as={FiPlus} />}
          colorScheme="brand"
          size="sm"
          borderRadius="xl"
          onClick={handleAddQuestion}
        >
          Добавить вопрос
        </Button>
      </HStack>

      {questions.length === 0 ? (
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
            В этом квизе пока нет вопросов
          </Text>
          <Button leftIcon={<FiPlus />} variant="outline" size="sm" borderRadius="xl" onClick={handleAddQuestion}>
            Добавить первый вопрос
          </Button>
        </MotionBox>
      ) : (
        <VStack spacing={4} align="stretch">
          {questions.map((question, index) => (
            <MotionBox
              key={question.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
              p={5}
              _hover={{ boxShadow: 'md' }}
              transition="all 0.2s"
            >
              <HStack justify="space-between" align="flex-start" spacing={4}>
                <Box flex="1" minW={0}>
                  <HStack spacing={2} mb={2}>
                    <Badge colorScheme="purple" size="sm">Вопрос {index + 1}</Badge>
                    <Badge colorScheme="teal" variant="outline" size="sm">Один ответ</Badge>
                    {question.timeLimit != null && (
                      <Badge colorScheme="orange" variant="outline" size="sm">{question.timeLimit} сек</Badge>
                    )}
                    <Badge variant="outline" size="sm">Баллы: {question.points}</Badge>
                  </HStack>
                  <Text fontWeight="medium" color="gray.800" mb={3}>
                    {question.question_text}
                  </Text>
                  <VStack spacing={2} align="stretch" pl={1}>
                    {question.options.map((option) => (
                      <HStack key={option.id} spacing={3}>
                        <Box
                          w={4}
                          h={4}
                          borderRadius="full"
                          bg={option.isCorrect ? 'green.100' : 'gray.100'}
                          borderWidth="2px"
                          borderColor={option.isCorrect ? 'green.500' : 'gray.300'}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {option.isCorrect && <Box w={1.5} h={1.5} borderRadius="full" bg="green.500" />}
                        </Box>
                        <Text fontSize="sm" color="gray.700">{option.text}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
                <HStack spacing={1} flexShrink={0}>
                  <Tooltip label="Редактировать">
                    <IconButton aria-label="Редактировать" icon={<FiEdit />} size="sm" variant="ghost" colorScheme="brand" onClick={() => handleEditQuestion(question)} />
                  </Tooltip>
                  <Tooltip label="Удалить">
                    <IconButton aria-label="Удалить" icon={<FiTrash />} size="sm" variant="ghost" colorScheme="red" onClick={() => onDeleteQuestion(question.id)} />
                  </Tooltip>
                </HStack>
              </HStack>
            </MotionBox>
          ))}
        </VStack>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" boxShadow="xl">
          <ModalHeader fontSize="lg">
            {editingQuestion ? 'Редактирование вопроса' : 'Новый вопрос'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <QuestionForm
              initialData={transformQuestionToFormData(editingQuestion)}
              onSubmit={handleFormSubmit}
              onCancel={onClose}
              isEditing={!!editingQuestion}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
