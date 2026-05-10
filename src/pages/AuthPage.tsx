import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  Text,
  VStack,
  HStack,
  useToast,
  Divider,
  Progress,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../utils/apiError';
import {
  FiMail,
  FiLock,
  FiUser,
  FiAtSign,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

type Mode = 'login' | 'register';

type RoleChoice = 'participant' | 'creator';

interface AuthFormState {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  login: string;
  role: RoleChoice;
}

interface AuthErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  login?: string;
}

const initialState: AuthFormState = {
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  login: '',
  role: 'participant',
};

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 20, label: 'Слабый', color: 'red' };
  if (score === 2) return { score: 40, label: 'Так себе', color: 'orange' };
  if (score === 3) return { score: 60, label: 'Средний', color: 'yellow' };
  if (score === 4) return { score: 80, label: 'Хороший', color: 'blue' };
  return { score: 100, label: 'Отличный', color: 'green' };
};

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState<AuthFormState>(initialState);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const isLogin = mode === 'login';

  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password]
  );

  const handleChange =
    (field: keyof AuthFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = (): boolean => {
    const nextErrors: AuthErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Некорректный формат email';
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Введите пароль';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Минимум 8 символов';
    }

    if (!isLogin) {
      if (!form.fullName.trim()) {
        nextErrors.fullName = 'Укажите, как к вам обращаться';
      }
      if (!form.login.trim()) {
        nextErrors.login = 'Введите логин';
      } else if (form.login.length < 3) {
        nextErrors.login = 'Логин должен быть не менее 3 символов';
      } else if (!/^[a-zA-Z0-9_]+$/.test(form.login)) {
        nextErrors.login = 'Только латиница, цифры и _';
      }
      if (!form.confirmPassword.trim()) {
        nextErrors.confirmPassword = 'Подтвердите пароль';
      } else if (form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = 'Пароли не совпадают';
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validate();
    if (!isValid) return;

    try {
      setIsSubmitting(true);

      const baseURL = process.env.REACT_APP_API_URL ?? '';
      const url = baseURL
        ? `${baseURL}/api/auth/${isLogin ? 'sign-in' : 'sign-up'}/email`
        : `/api/auth/${isLogin ? 'sign-in' : 'sign-up'}/email`;

      const payload = isLogin
        ? {
            email: form.email,
            password: form.password,
          }
        : {
            email: form.email,
            password: form.password,
            name: form.fullName,
            login: form.login,
            full_name: form.fullName,
            role_id: form.role,
          };

      await axios.post(url, payload, {
        withCredentials: true,
      });

      toast({
        title: isLogin ? 'Добро пожаловать!' : 'Регистрация прошла успешно',
        description: isLogin
          ? 'Вы успешно вошли в систему.'
          : 'Теперь вы можете войти, используя свои данные.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

      navigate('/dashboard');
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Что-то пошло не так. Попробуйте ещё раз.');

      toast({
        title: 'Ошибка',
        description: message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setForm(initialState);
    setErrors({});
  };

  const title = isLogin ? 'С возвращением!' : 'Создаём профиль';
  const subtitle = isLogin
    ? 'Войдите, чтобы продолжить прохождение квизов.'
    : 'Пара шагов — и вы сможете участвовать в квизах.';

  return (
    <Flex
      minH="100vh"
      bgGradient="linear(135deg, gray.50 0%, white 45%, brand.50 100%)"
      align="center"
      justify="center"
      px={4}
    >
      <MotionBox
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        w="100%"
        maxW="960px"
        bg="white"
        boxShadow="0 20px 50px -12px rgba(99, 102, 241, 0.18), 0 8px 24px rgba(0,0,0,0.06)"
        borderRadius="2xl"
        overflow="hidden"
        borderWidth="1px"
        borderColor="whiteAlpha.800"
      >
        <Flex direction={{ base: 'column', md: 'row' }}>
          <Box
            flex="1"
            bgGradient="linear(to-b, brand.400, brand.600)"
            color="white"
            p={{ base: 8, md: 10 }}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Box>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                fontWeight="semibold"
                letterSpacing="0.2px"
                opacity={0.9}
                mb={2}
              >
                КвизМастер
              </Text>
              <Heading size="lg" mb={4}>
                Комфортное пространство для квизов
              </Heading>
              <Text fontSize="md" opacity={0.9}>
                Проходите тесты, следите за прогрессом и возвращайтесь, когда
                захотите.
              </Text>
            </Box>
          </Box>

          <Box
            flex="1"
            p={{ base: 8, md: 10 }}
            bgGradient="linear(to-b, gray.50, gray.100)"
          >
            <MotionVStack
              align="stretch"
              spacing={6}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              key={mode}
            >
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Heading size="md">{title}</Heading>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {subtitle}
                </Text>
              </Box>

              <HStack spacing={3}>
                <Button
                  variant={isLogin ? 'solid' : 'ghost'}
                  w="full"
                  onClick={() => switchMode('login')}
                >
                  Вход
                </Button>
                <Button
                  variant={!isLogin ? 'solid' : 'ghost'}
                  w="full"
                  onClick={() => switchMode('register')}
                >
                  Регистрация
                </Button>
              </HStack>

              <Divider />

              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  {!isLogin && (
                    <>
                      <FormControl isInvalid={!!errors.fullName}>
                        <FormLabel>Имя и фамилия</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiUser} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            placeholder="Ваше имя и фамилия"
                            value={form.fullName}
                            onChange={handleChange('fullName')}
                          />
                        </InputGroup>
                        {errors.fullName && (
                          <FormErrorMessage>{errors.fullName}</FormErrorMessage>
                        )}
                      </FormControl>

                      <FormControl isInvalid={!!errors.login}>
                        <FormLabel>Логин</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiAtSign} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            placeholder="Ваш логин"
                            value={form.login}
                            onChange={handleChange('login')}
                          />
                        </InputGroup>
                        {errors.login && (
                          <FormErrorMessage>{errors.login}</FormErrorMessage>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel>Роль аккаунта</FormLabel>
                        <HStack spacing={4} mt={2} align="stretch">
                          <Box
                            flex="1"
                            borderWidth="1px"
                            borderRadius="xl"
                            p={4}
                            cursor="pointer"
                            borderColor={form.role === 'participant' ? 'brand.400' : 'gray.200'}
                            bg={form.role === 'participant' ? 'brand.50' : 'white'}
                            onClick={() => setForm(prev => ({ ...prev, role: 'participant' }))}
                          >
                            <HStack spacing={2} mb={1}>
                              <Box
                                w={2.5}
                                h={2.5}
                                borderRadius="full"
                                borderWidth="2px"
                                borderColor={form.role === 'participant' ? 'brand.500' : 'gray.300'}
                                bg={form.role === 'participant' ? 'brand.500' : 'transparent'}
                              />
                              <Text fontWeight="semibold" fontSize="sm">
                                Участник квизов
                              </Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              Проходит квизы, смотрит свои результаты и прогресс.
                            </Text>
                          </Box>
                          <Box
                            flex="1"
                            borderWidth="1px"
                            borderRadius="xl"
                            p={4}
                            cursor="pointer"
                            borderColor={form.role === 'creator' ? 'teal.400' : 'gray.200'}
                            bg={form.role === 'creator' ? 'teal.50' : 'white'}
                            onClick={() => setForm(prev => ({ ...prev, role: 'creator' }))}
                          >
                            <HStack spacing={2} mb={1}>
                              <Box
                                w={2.5}
                                h={2.5}
                                borderRadius="full"
                                borderWidth="2px"
                                borderColor={form.role === 'creator' ? 'teal.500' : 'gray.300'}
                                bg={form.role === 'creator' ? 'teal.500' : 'transparent'}
                              />
                              <Text fontWeight="semibold" fontSize="sm">
                                Создатель контента
                              </Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              Создаёт квизы, запускает сессии и анализирует результаты.
                            </Text>
                          </Box>
                        </HStack>
                        <FormHelperText>
                          Вы всегда сможете зарегистрировать отдельный аккаунт для другой роли.
                        </FormHelperText>
                      </FormControl>
                    </>
                  )}

                  <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiMail} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        placeholder="mail@example.com"
                        value={form.email}
                        onChange={handleChange('email')}
                      />
                    </InputGroup>
                    {errors.email && (
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.password}>
                    <FormLabel>Пароль</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiLock} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange('password')}
                      />
                      <InputRightElement>
                        <Button
                          h="1.75rem"
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                        >
                          <Icon as={showPassword ? FiEyeOff : FiEye} />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    {!isLogin && form.password && (
                      <Box mt={2}>
                        <Progress
                          value={passwordStrength.score}
                          size="xs"
                          colorScheme={passwordStrength.color}
                          borderRadius="full"
                        />
                        <Text fontSize="xs" color={`${passwordStrength.color}.500`} mt={1}>
                          {passwordStrength.label}
                        </Text>
                      </Box>
                    )}
                    {errors.password && (
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    )}
                  </FormControl>

                  {!isLogin && (
                    <FormControl isRequired isInvalid={!!errors.confirmPassword}>
                      <FormLabel>Подтвердите пароль</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiLock} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={form.confirmPassword}
                          onChange={handleChange('confirmPassword')}
                        />
                      </InputGroup>
                      {errors.confirmPassword && (
                        <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                      )}
                    </FormControl>
                  )}

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText={isLogin ? 'Входим...' : 'Регистрируем...'}
                    mt={2}
                    as={motion.button}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isLogin ? 'Войти' : 'Зарегистрироваться'}
                  </Button>
                </VStack>
              </Box>

              {isLogin && (
                <VStack spacing={2}>
                  <Link
                    fontSize="sm"
                    color="gray.500"
                    _hover={{ color: 'brand.500' }}
                    onClick={() => {
                      toast({
                        title: 'Восстановление пароля',
                        description: 'Функция в разработке. Обратитесь к администратору.',
                        status: 'info',
                        duration: 4000,
                        isClosable: true,
                      });
                    }}
                  >
                    Забыли пароль?
                  </Link>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Нет аккаунта?{' '}
                    <Link
                      color="brand.500"
                      fontWeight="medium"
                      onClick={() => switchMode('register')}
                    >
                      Зарегистрироваться
                    </Link>
                  </Text>
                </VStack>
              )}
              {!isLogin && (
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Уже есть аккаунт?{' '}
                  <Link color="brand.500" onClick={() => switchMode('login')}>
                    Войти
                  </Link>
                </Text>
              )}
            </MotionVStack>
          </Box>
        </Flex>
      </MotionBox>
    </Flex>
  );
};

