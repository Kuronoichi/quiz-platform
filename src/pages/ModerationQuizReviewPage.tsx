import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShield, FiBarChart2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../utils/apiError';
import { useToast } from '@chakra-ui/react';

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
  status: string;
  access: string;
  created_at: string;
  questions: Question[];
}

export const ModerationQuizReviewPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading: authLoading, isModerator } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !isModerator || !id) return;
    const run = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<Quiz>(`/api/moderation/quizzes/${id}`);
        const data = res.data;
        setQuiz({
          ...data,
          questions: (data.questions || []).map((q) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : [],
            media: Array.isArray(q.media) ? q.media : [],
          })),
        });
      } catch (e: unknown) {
        toast({
          title: 'Не удалось загрузить квиз',
          description: getApiErrorMessage(e, ''),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/moderation/quizzes');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [id, authLoading, isModerator, navigate, toast]);

  if (authLoading || !isModerator) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="lg" colorScheme="brand" />
      </Box>
    );
  }

  if (loading || !quiz) {
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
      <Box position="relative" zIndex={1} px={{ base: 4, sm: 6, md: 8 }} py={{ base: 6, md: 12 }}>
        <Box maxW="800px" mx="auto" w="100%">
          <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <HStack spacing={3} mb={4} flexWrap="wrap">
              <Button
                leftIcon={<Icon as={FiArrowLeft} />}
                variant="ghost"
                size="sm"
                onClick={() => navigate('/moderation/quizzes')}
              >
                К каталогу
              </Button>
              {id && (
                <Button
                  leftIcon={<Icon as={FiBarChart2} />}
                  variant="outline"
                  size="sm"
                  borderRadius="xl"
                  onClick={() => navigate(`/leaderboard/${id}`)}
                >
                  Рейтинг игроков
                </Button>
              )}
            </HStack>

            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
              p={{ base: 5, md: 8 }}
              mb={6}
            >
              <HStack spacing={2} mb={2} flexWrap="wrap">
                <Icon as={FiShield} color="purple.500" />
                <Badge colorScheme="purple">Проверка контента</Badge>
              </HStack>
              <Heading size="lg" color="gray.800" mb={2}>
                {quiz.title}
              </Heading>
              <HStack spacing={2} mb={3} flexWrap="wrap">
                <Badge>{quiz.status}</Badge>
                <Badge variant="outline">{quiz.access}</Badge>
              </HStack>
              {quiz.description && (
                <Text color="gray.600" fontSize="sm" mb={0}>
                  {quiz.description}
                </Text>
              )}
            </Box>

            <Text fontSize="sm" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="1px" mb={4}>
              Вопросы ({quiz.questions.length})
            </Text>

            <VStack spacing={4} align="stretch">
              {quiz.questions.map((question, index) => (
                <MotionBox
                  key={question.question_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  bg="white"
                  borderRadius="2xl"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.100"
                  p={{ base: 4, md: 5 }}
                >
                  <HStack spacing={2} mb={3} flexWrap="wrap">
                    <Badge colorScheme="purple" size="sm">
                      Вопрос {index + 1}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {question.points} б.
                    </Badge>
                  </HStack>
                  {question.media && question.media.length > 0 && (
                    <Box mb={4}>
                      {question.media
                        .filter((m) => m.media_type === 'image')
                        .map((m) => (
                          <Box
                            key={m.media_id}
                            as="img"
                            src={m.url}
                            alt=""
                            maxH={{ base: '200px', md: '260px' }}
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
                  <Text fontWeight="medium" color="gray.800" mb={4}>
                    {question.question_text}
                  </Text>
                  <VStack spacing={2} align="stretch" pl={1}>
                    {question.options.map((option) => (
                      <HStack key={option.option_id} spacing={3} align="flex-start">
                        <Box
                          mt={1}
                          w={4}
                          h={4}
                          borderRadius="full"
                          bg={option.correctness ? 'green.100' : 'gray.100'}
                          borderWidth="2px"
                          borderColor={option.correctness ? 'green.500' : 'gray.300'}
                          flexShrink={0}
                        />
                        <Text fontSize="sm" color="gray.700" wordBreak="break-word">
                          {option.option_text}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </MotionBox>
              ))}
            </VStack>
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
