import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Icon,
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
import { getApiErrorMessage } from '../utils/apiError';
import { FiPlay, FiArrowRight, FiCheck, FiArrowLeft, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface QuestionMedia {
  media_id: number;
  url: string;
  media_type: string;
}

interface Question {
  question_id: number;
  question_text: string;
  question_type: string;
  time_limit: number | null;
  points: number;
  order_index: number | null;
  options: { option_id: number; option_text: string; correctness: boolean }[];
  media?: QuestionMedia[];
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
  const [step, setStep] = useState<'join' | 'waiting' | 'playing' | 'finished'>('join');
  const [sessionCode, setSessionCode] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [, setAnswers] = useState<Record<number, number[]>>({});

  const recentCodes = useMemo(() => {
    try {
      const raw = localStorage.getItem('recent_session_codes');
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((x): x is string => typeof x === 'string' && x.length > 0).slice(0, 5);
    } catch {
      return [];
    }
  }, []);

  const rememberCode = (code: string) => {
    try {
      const norm = code.trim().toUpperCase();
      if (!norm) return;
      const raw = localStorage.getItem('recent_session_codes');
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      const list = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
      const next = [norm, ...list.filter((c) => c.toUpperCase() !== norm)].slice(0, 10);
      localStorage.setItem('recent_session_codes', JSON.stringify(next));
    } catch {
    }
  };

  useEffect(() => {
    if (step !== 'waiting' || !session) return;

    const code = session.session_code;
    const tick = async () => {
      try {
        const sessionResponse = await apiClient.get(`/api/session/code/${code}`);
        const st = sessionResponse.data?.session?.status as string | undefined;
        if (st === 'active') {
          await apiClient.post(`/api/session/code/${code}/join`);
          rememberCode(code);
          setSession(sessionResponse.data.session);
          setQuiz(sessionResponse.data.quiz);
          setStep('playing');
          const qs = sessionResponse.data.quiz?.questions;
          if (qs && qs.length > 0 && qs[0].time_limit) {
            setTimeLeft(qs[0].time_limit);
          }
        } else if (st === 'cancelled' || st === 'finished') {
          toast({
            title: 'Сессия закрыта',
            description: 'Организатор завершил или отменил сессию.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          setStep('join');
          setSession(null);
          setQuiz(null);
        }
      } catch (error: unknown) {
        toast({
          title: 'Не удалось проверить статус',
          description: getApiErrorMessage(error, 'Повторите попытку позже'),
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    };

    void tick();
    const id = window.setInterval(() => void tick(), 3000);
    return () => window.clearInterval(id);
  }, [step, session, toast]);

  const handleJoin = async () => {
    const normalized = sessionCode.trim().toUpperCase();
    if (!normalized) {
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
      const sessionResponse = await apiClient.get(`/api/session/code/${normalized}`);
      const sessionData = sessionResponse.data;
      const status = sessionData?.session?.status;

      if (status === 'cancelled' || status === 'finished') {
        toast({
          title: 'Сессия недоступна',
          description: 'Эта сессия уже завершена или отменена.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (status === 'scheduled') {
        await apiClient.post(`/api/session/code/${normalized}/join`);
        rememberCode(normalized);
        setSession(sessionData.session);
        setQuiz(sessionData.quiz);
        setStep('waiting');
        return;
      }

      setSession(sessionData.session);
      setQuiz(sessionData.quiz);

      if (status !== 'active') {
        toast({
          title: 'Сессия ещё не началась',
          description: 'Дождитесь, пока организатор запустит сессию, и попробуйте снова.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      await apiClient.post(`/api/session/code/${normalized}/join`);
      rememberCode(normalized);

      setStep('playing');
      if (sessionData.quiz.questions.length > 0) {
        const firstQuestion = sessionData.quiz.questions[0];
        if (firstQuestion.time_limit) {
          setTimeLeft(firstQuestion.time_limit);
        }
      }
    } catch (error: unknown) {
      toast({
        title: 'Ошибка присоединения',
        description: getApiErrorMessage(error, 'Не удалось присоединиться к сессии'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const submitAnswerInternal = useCallback(
    async (allowEmpty: boolean) => {
      if (!session || !quiz) return;
      const currentQuestion = quiz.questions[currentQuestionIndex];
      if (!currentQuestion) return;

      if (!allowEmpty && selectedOptions.length === 0) {
        toast({
          title: 'Выберите ответ',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const payloadIds = allowEmpty && selectedOptions.length === 0 ? [] : selectedOptions;

      try {
        setSubmitting(true);
        await apiClient.post(`/api/session/code/${session.session_code}/answer`, {
          question_id: currentQuestion.question_id,
          option_ids: payloadIds,
          time_spent: timeLeft !== null ? (currentQuestion.time_limit || 0) - timeLeft : null,
        });

        setAnswers((prev) => ({ ...prev, [currentQuestion.question_id]: payloadIds }));

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
      } catch (error: unknown) {
        toast({
          title: 'Ошибка отправки ответа',
          description: getApiErrorMessage(error, 'Не удалось отправить ответ'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        if (allowEmpty && currentQuestion.time_limit) {
          setTimeLeft(currentQuestion.time_limit);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [session, quiz, currentQuestionIndex, selectedOptions, timeLeft, toast]
  );

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && step === 'playing') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && step === 'playing') {
      setTimeLeft(null);
      void submitAnswerInternal(true);
    }
  }, [timeLeft, step, submitAnswerInternal]);

  const handleViewResults = () => {
    if (!session) return;
    navigate(`/play/${session.session_code}/results`);
  };

  const handleLeaveSession = async () => {
    try {
      if (session) {
        await apiClient.post(`/api/session/code/${session.session_code}/leave`);
      }
    } catch {
    } finally {
      setStep('join');
      setSession(null);
      setQuiz(null);
      setSelectedOptions([]);
      setCurrentQuestionIndex(0);
      setTimeLeft(null);
      setAnswers({});
      setSessionCode('');
      navigate('/play');
    }
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const progressPct =
    quiz && quiz.questions.length > 0 ? Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100) : 0;

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
        <Box maxW="800px" mx="auto" w="100%">
          {step === 'join' && (
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Box
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                borderWidth="1px"
                borderColor="gray.100"
                p={{ base: 6, md: 8 }}
              >
                <HStack justify="space-between" mb={4}>
                  <Button
                    leftIcon={<Icon as={FiArrowLeft} />}
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    В личный кабинет
                  </Button>
                </HStack>
                <VStack spacing={6} textAlign="center">
                  <Icon as={FiPlay} boxSize={16} color="brand.500" />
                  <Heading size="lg" color="gray.800">
                    Присоединиться к квизу
                  </Heading>
                  <Text color="gray.500">
                    Введите код сессии от организатора — и вы сразу попадёте в вопросы.
                  </Text>
                  {recentCodes.length > 0 && (
                    <Box w="100%" maxW="520px">
                      <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
                        Последние коды
                      </Text>
                      <HStack justify="center" flexWrap="wrap">
                        {recentCodes.map((c) => (
                          <Button key={c} size="sm" variant="outline" borderRadius="xl" onClick={() => setSessionCode(c)}>
                            {c}
                          </Button>
                        ))}
                      </HStack>
                    </Box>
                  )}
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

          {step === 'waiting' && session && quiz && (
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
                <VStack spacing={5}>
                  <Icon as={FiClock} boxSize={14} color="brand.500" />
                  <Heading size="lg" color="gray.800">
                    Ожидание старта
                  </Heading>
                  <Text color="gray.600">
                    Сессия <strong>{session.session_code}</strong> ещё не запущена организатором. Экран обновится
                    автоматически, как только игра начнётся.
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Квиз: {quiz.title}
                  </Text>
                  <Button variant="outline" borderRadius="xl" onClick={handleLeaveSession}>
                    Выйти
                  </Button>
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

                <Progress value={progressPct} size="sm" borderRadius="full" colorScheme="brand" mb={5} />

                {currentQuestion.media && currentQuestion.media.length > 0 && (
                  <Box mb={4}>
                    {currentQuestion.media
                      .filter((m) => m.media_type === 'image')
                      .map((m) => (
                        <Box
                          key={m.media_id}
                          as="img"
                          src={m.url}
                          alt="Иллюстрация к вопросу"
                          maxH="260px"
                          w="100%"
                          objectFit="contain"
                          borderRadius="lg"
                          borderWidth="1px"
                          borderColor="gray.200"
                          mb={2}
                        />
                      ))}
                  </Box>
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

                <HStack justify="space-between" mt={8} pt={6} borderTopWidth="1px" borderColor="gray.100" spacing={4}>
                  <Text fontSize="sm" color="gray.500">
                    Баллы: {currentQuestion.points}
                  </Text>
                  <HStack spacing={3}>
                    <Button variant="ghost" size="sm" onClick={handleLeaveSession}>
                      Выйти
                    </Button>
                    <Button
                      colorScheme="brand"
                      rightIcon={<Icon as={FiArrowRight} />}
                      onClick={() => void submitAnswerInternal(false)}
                      isLoading={submitting}
                      borderRadius="xl"
                    >
                      {currentQuestionIndex < quiz.questions.length - 1 ? 'Следующий вопрос' : 'Завершить'}
                    </Button>
                  </HStack>
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
                  <Button variant="outline" onClick={handleLeaveSession} borderRadius="xl">
                    Выйти из сессии
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
