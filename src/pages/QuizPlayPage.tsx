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
  Input,
  Badge,
  Progress,
  Radio,
  RadioGroup,
  Stack,
  Checkbox,
  CheckboxGroup,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { FiPlay, FiArrowRight, FiCheck, FiX } from 'react-icons/fi';
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
  questions: Question[];
}

interface Session {
  session_id: number;
  session_code: string;
  status: string;
  quiz_title: string;
}

export const QuizPlayPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState<'join' | 'playing' | 'finished'>('join');
  const [sessionCode, setSessionCode] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && step === 'playing') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitAnswer();
    }
  }, [timeLeft, step]);

  const handleJoin = async () => {
    if (!sessionCode.trim()) {
      toast({
        title: 'Введите код сессии',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const sessionResponse = await apiClient.get(`/api/session/code/${sessionCode.toUpperCase()}`);
      const sessionData = sessionResponse.data;
      setSession(sessionData.session);
      setQuiz(sessionData.quiz);

      await apiClient.post(`/api/session/code/${sessionCode.toUpperCase()}/join`);

      setStep('playing');
      if (sessionData.quiz.questions.length > 0) {
        const firstQuestion = sessionData.quiz.questions[0];
        if (firstQuestion.time_limit) {
          setTimeLeft(firstQuestion.time_limit);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка присоединения',
        description: error.response?.data?.error || 'Не удалось присоединиться к сессии',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !quiz) return;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    if (selectedOptions.length === 0) {
      toast({
        title: 'Выберите ответ',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);
      const startTime = Date.now();
      await apiClient.post(`/api/session/code/${session.session_code}/answer`, {
        question_id: currentQuestion.question_id,
        option_ids: selectedOptions,
        time_spent: timeLeft !== null ? (currentQuestion.time_limit || 0) - timeLeft : null,
      });

      setAnswers({ ...answers, [currentQuestion.question_id]: selectedOptions });

      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        const nextQuestion = quiz.questions[currentQuestionIndex + 1];
        setSelectedOptions([]);
        if (nextQuestion.time_limit) {
          setTimeLeft(nextQuestion.time_limit);
        } else {
          setTimeLeft(null);
        }
      } else {
        setStep('finished');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка отправки ответа',
        description: error.response?.data?.error || 'Не удалось отправить ответ',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewResults = () => {
    if (!session) return;
    navigate(`/play/${session.session_code}/results`);
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];

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
          {step === 'join' && (
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Box
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.100"
                p={{ base: 6, md: 8 }}
                textAlign="center"
              >
                <VStack spacing={6}>
                  <Icon as={FiPlay} boxSize={16} color="brand.500" />
                  <Heading size="lg" color="gray.800">
                    Присоединиться к квизу
                  </Heading>
                  <Text color="gray.500">
                    Введите код сессии, который вам предоставил организатор
                  </Text>
                  <VStack spacing={4} w="100%" maxW="400px">
                    <Input
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                      placeholder="Введите код сессии"
                      size="lg"
                      textAlign="center"
                      fontSize="2xl"
                      letterSpacing="4px"
                      fontWeight="bold"
                      borderRadius="xl"
                      maxLength={6}
                    />
                    <Button
                      colorScheme="brand"
                      size="lg"
                      leftIcon={<Icon as={FiArrowRight} />}
                      onClick={handleJoin}
                      isLoading={loading}
                      w="100%"
                      borderRadius="xl"
                    >
                      Присоединиться
                    </Button>
                  </VStack>
                </VStack>
              </Box>
            </MotionBox>
          )}

          {step === 'playing' && quiz && currentQuestion && (
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Box
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.100"
                p={{ base: 6, md: 8 }}
              >
                <HStack justify="space-between" mb={6}>
                  <Text fontSize="sm" fontWeight="semibold" color="brand.500" textTransform="uppercase" letterSpacing="1px">
                    Вопрос {currentQuestionIndex + 1} из {quiz.questions.length}
                  </Text>
                  {timeLeft !== null && (
                    <Badge colorScheme={timeLeft < 10 ? 'red' : 'blue'} fontSize="md" px={3} py={1}>
                      {timeLeft} сек
                    </Badge>
                  )}
                </HStack>

                {timeLeft !== null && (
                  <Progress
                    value={(timeLeft / (currentQuestion.time_limit || 1)) * 100}
                    colorScheme={timeLeft < 10 ? 'red' : 'blue'}
                    mb={6}
                    borderRadius="full"
                  />
                )}

                <Heading size="md" color="gray.800" mb={6}>
                  {currentQuestion.question_text}
                </Heading>

                {currentQuestion.question_type === 'single_choice' ? (
                  <RadioGroup value={selectedOptions[0]?.toString()} onChange={(val) => setSelectedOptions([parseInt(val)])}>
                    <Stack spacing={3}>
                      {currentQuestion.options.map((option) => (
                        <Radio key={option.option_id} value={option.option_id.toString()} size="lg" borderRadius="md">
                          <Text ml={2}>{option.option_text}</Text>
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                ) : (
                  <CheckboxGroup value={selectedOptions.map(String)} onChange={(vals) => setSelectedOptions(vals.map(Number))}>
                    <Stack spacing={3}>
                      {currentQuestion.options.map((option) => (
                        <Checkbox key={option.option_id} value={option.option_id.toString()} size="lg" borderRadius="md">
                          <Text ml={2}>{option.option_text}</Text>
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                )}

                <HStack justify="space-between" mt={8} pt={6} borderTopWidth="1px" borderColor="gray.100">
                  <Text fontSize="sm" color="gray.500">
                    Баллы: {currentQuestion.points}
                  </Text>
                  <Button
                    colorScheme="brand"
                    rightIcon={<Icon as={FiArrowRight} />}
                    onClick={handleSubmitAnswer}
                    isLoading={submitting}
                    borderRadius="xl"
                  >
                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Следующий вопрос' : 'Завершить'}
                  </Button>
                </HStack>
              </Box>
            </MotionBox>
          )}

          {step === 'finished' && (
            <MotionBox initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <Box
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.100"
                p={{ base: 6, md: 8 }}
                textAlign="center"
              >
                <VStack spacing={6}>
                  <Icon as={FiCheck} boxSize={16} color="green.500" />
                  <Heading size="lg" color="gray.800">
                    Квиз завершён!
                  </Heading>
                  <Text color="gray.500">
                    Вы ответили на все вопросы. Результаты будут доступны после завершения сессии организатором.
                  </Text>
                  <Button
                    colorScheme="brand"
                    leftIcon={<Icon as={FiCheck} />}
                    onClick={handleViewResults}
                    borderRadius="xl"
                  >
                    Просмотреть результаты
                  </Button>
                </VStack>
              </Box>
            </MotionBox>
          )}
        </Box>
      </Box>
    </Box>
  );
};
