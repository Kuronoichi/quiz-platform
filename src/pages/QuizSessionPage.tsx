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
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Code,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { FiPlay, FiCopy, FiUsers, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface Session {
  session_id: number;
  quiz_id: number;
  organizer_id: string;
  session_code: string;
  status: 'scheduled' | 'active' | 'finished' | 'cancelled';
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  max_players: number | null;
  min_players: number | null;
}

export const QuizSessionPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState<number | undefined>(undefined);
  const [minPlayers, setMinPlayers] = useState<number | undefined>(undefined);

  const createSession = async () => {
    if (!id) return;
    try {
      setCreating(true);
      const response = await apiClient.post(`/api/session/quiz/${id}`, {
        max_players: maxPlayers || null,
        min_players: minPlayers || null,
      });
      setSession(response.data);
      onClose();
      toast({
        title: 'Сессия создана',
        description: 'Код сессии готов к использованию',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка создания сессии',
        description: error.response?.data?.error || 'Не удалось создать сессию',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCreating(false);
    }
  };

  const startSession = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const response = await apiClient.post(`/api/session/${session.session_id}/start`);
      setSession(response.data);
      toast({
        title: 'Сессия запущена',
        description: 'Участники могут присоединяться и отвечать',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка запуска сессии',
        description: error.response?.data?.error || 'Не удалось запустить сессию',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const finishSession = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const response = await apiClient.post(`/api/session/${session.session_id}/finish`);
      setSession(response.data);
      toast({
        title: 'Сессия завершена',
        description: 'Результаты доступны для просмотра',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка завершения сессии',
        description: error.response?.data?.error || 'Не удалось завершить сессию',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.session_code);
    toast({
      title: 'Код скопирован',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const viewResults = () => {
    if (!session) return;
    navigate(`/session/${session.session_id}/results`);
  };

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
            >
              <HStack spacing={3} mb={6}>
                <Button leftIcon={<Icon as={FiArrowLeft} />} variant="ghost" size="sm" onClick={() => navigate(`/quiz/${id}`)}>
                  Назад к квизу
                </Button>
              </HStack>

              <Text fontSize="sm" fontWeight="semibold" color="brand.500" textTransform="uppercase" letterSpacing="1px" mb={2}>
                Управление сессией
              </Text>

              {!session ? (
                <VStack spacing={6} py={8}>
                  <Icon as={FiPlay} boxSize={12} color="brand.500" />
                  <Heading size="md" color="gray.800">
                    Создайте сессию для проведения квиза
                  </Heading>
                  <Text color="gray.500" textAlign="center">
                    После создания вы получите уникальный код, который участники смогут использовать для присоединения
                  </Text>
                  <Button
                    colorScheme="brand"
                    size="lg"
                    leftIcon={<Icon as={FiPlay} />}
                    onClick={onOpen}
                    borderRadius="xl"
                  >
                    Создать сессию
                  </Button>
                </VStack>
              ) : (
                <VStack spacing={6} align="stretch">
                  <Box
                    bgGradient="linear(to-r, brand.500, purple.500)"
                    borderRadius="xl"
                    p={6}
                    color="white"
                    textAlign="center"
                  >
                    <Text fontSize="sm" fontWeight="semibold" opacity={0.9} mb={2}>
                      Код сессии
                    </Text>
                    <HStack justify="center" spacing={4} mb={4}>
                      <Code fontSize="4xl" fontWeight="bold" bg="whiteAlpha.200" color="white" px={4} py={2} borderRadius="lg">
                        {session.session_code}
                      </Code>
                      <Button
                        leftIcon={<Icon as={FiCopy} />}
                        bg="whiteAlpha.200"
                        _hover={{ bg: 'whiteAlpha.300' }}
                        color="white"
                        onClick={copyCode}
                        size="sm"
                      >
                        Копировать
                      </Button>
                    </HStack>
                    <Text fontSize="sm" opacity={0.9}>
                      Поделитесь этим кодом с участниками
                    </Text>
                  </Box>

                  <HStack spacing={2} justify="center">
                    <Badge
                      colorScheme={
                        session.status === 'active' ? 'green' : session.status === 'finished' ? 'gray' : 'yellow'
                      }
                      fontSize="md"
                      px={3}
                      py={1}
                    >
                      {session.status === 'active' ? 'Активна' : session.status === 'finished' ? 'Завершена' : 'Запланирована'}
                    </Badge>
                  </HStack>

                  <HStack spacing={3} justify="center" flexWrap="wrap">
                    {session.status === 'scheduled' && (
                      <Button
                        colorScheme="green"
                        leftIcon={<Icon as={FiPlay} />}
                        onClick={startSession}
                        isLoading={loading}
                        borderRadius="xl"
                      >
                        Запустить сессию
                      </Button>
                    )}
                    {session.status === 'active' && (
                      <Button
                        colorScheme="red"
                        leftIcon={<Icon as={FiX} />}
                        onClick={finishSession}
                        isLoading={loading}
                        borderRadius="xl"
                      >
                        Завершить сессию
                      </Button>
                    )}
                    {session.status === 'finished' && (
                      <Button
                        colorScheme="brand"
                        leftIcon={<Icon as={FiUsers} />}
                        onClick={viewResults}
                        borderRadius="xl"
                      >
                        Просмотреть результаты
                      </Button>
                    )}
                  </HStack>
                </VStack>
              )}
            </Box>
          </MotionBox>
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Создать сессию</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Максимальное количество участников</FormLabel>
                <NumberInput
                  value={maxPlayers}
                  onChange={(_, val) => setMaxPlayers(isNaN(val) ? undefined : val)}
                  min={1}
                >
                  <NumberInputField borderRadius="xl" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Минимальное количество участников</FormLabel>
                <NumberInput
                  value={minPlayers}
                  onChange={(_, val) => setMinPlayers(isNaN(val) ? undefined : val)}
                  min={1}
                >
                  <NumberInputField borderRadius="xl" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onClose} borderRadius="xl">
                Отмена
              </Button>
              <Button colorScheme="brand" onClick={createSession} isLoading={creating} borderRadius="xl">
                Создать
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
