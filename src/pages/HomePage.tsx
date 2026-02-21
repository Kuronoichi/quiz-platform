import React from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiEdit3,
  FiBarChart2,
  FiUserPlus,
  FiLayers,
  FiPlay,
  FiBookOpen,
  FiBriefcase,
  FiHeart,
  FiArrowRight,
  FiZap,
} from 'react-icons/fi';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Box
      bgGradient="linear(to-br, brand.50, white, purple.50)"
      minH="100vh"
      position="relative"
      overflow="hidden"
    >
      {/* Декоративные элементы фона */}
      <Box
        position="absolute"
        top="-100px"
        right="-100px"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="brand.100"
        opacity={0.3}
        filter="blur(60px)"
        animation={`${pulse} 4s ease-in-out infinite`}
      />
      <Box
        position="absolute"
        bottom="-150px"
        left="-100px"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="purple.100"
        opacity={0.3}
        filter="blur(80px)"
        animation={`${pulse} 5s ease-in-out infinite 1s`}
      />

      {/* Герой-блок */}
      <Flex
        as="section"
        align="center"
        justify="center"
        px={4}
        py={{ base: 12, md: 20 }}
        position="relative"
        zIndex={1}
      >
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          w="100%"
          maxW="1100px"
        >
          <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
            {/* Левая часть — брендинг */}
            <Box
              flex="1.2"
              bgGradient="linear(135deg, brand.500, brand.600, purple.600)"
              color="white"
              p={{ base: 8, md: 12 }}
              borderRadius="3xl"
              boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              position="relative"
              overflow="hidden"
            >
              {/* Декоративные круги */}
              <Box
                position="absolute"
                top="-30px"
                right="-30px"
                w="120px"
                h="120px"
                borderRadius="full"
                bg="whiteAlpha.200"
                animation={`${float} 6s ease-in-out infinite`}
              />
              <Box
                position="absolute"
                bottom="40px"
                right="60px"
                w="60px"
                h="60px"
                borderRadius="full"
                bg="whiteAlpha.100"
                animation={`${float} 4s ease-in-out infinite 1s`}
              />

              <VStack align="flex-start" spacing={6} position="relative" zIndex={1}>
                <HStack spacing={2}>
                  <Icon as={FiZap} boxSize={5} />
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    letterSpacing="1px"
                    textTransform="uppercase"
                  >
                    КвизМастер
                  </Text>
                </HStack>

                <Heading
                  size={{ base: 'xl', md: '2xl' }}
                  lineHeight="1.2"
                  fontWeight="extrabold"
                >
                  Квиз‑платформа
                  <Text as="span" display="block" opacity={0.9}>
                    без лишней строгости
                  </Text>
                </Heading>

                <Text fontSize={{ base: 'md', md: 'lg' }} opacity={0.9} maxW="400px">
                  Создавайте и проходите квизы в понятном и дружелюбном
                  интерфейсе. Для учёбы, тренингов и развлечений.
                </Text>

                <Button
                  size="lg"
                  bg="white"
                  color="brand.600"
                  _hover={{
                    bg: 'whiteAlpha.900',
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.2s"
                  rightIcon={<FiArrowRight />}
                  onClick={() => navigate('/auth')}
                  mt={2}
                >
                  Начать бесплатно
                </Button>
              </VStack>
            </Box>

            {/* Правая часть — преимущества */}
            <Box flex="1" py={{ base: 0, lg: 4 }}>
              <MotionFlex
                direction="column"
                gap={4}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="brand.600"
                  textTransform="uppercase"
                  letterSpacing="1px"
                  mb={2}
                >
                  Возможности платформы
                </Text>

                {[
                  {
                    icon: FiUsers,
                    title: 'Участникам',
                    desc: 'Проходите тесты в уютном интерфейсе и следите за прогрессом',
                    color: 'brand',
                  },
                  {
                    icon: FiEdit3,
                    title: 'Создателям квизов',
                    desc: 'Добавляйте вопросы, медиа и темы без лишней сложности',
                    color: 'purple',
                  },
                  {
                    icon: FiBarChart2,
                    title: 'Преподавателям',
                    desc: 'Отслеживайте успехи и находите слабые места',
                    color: 'teal',
                  },
                ].map((item, i) => (
                  <MotionBox
                    key={i}
                    variants={itemVariants}
                    bg="white"
                    p={5}
                    borderRadius="xl"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                    _hover={{
                      boxShadow: 'md',
                      transform: 'translateX(4px)',
                      borderColor: `${item.color}.200`,
                    }}
                    transition="all 0.2s"
                    cursor="default"
                  >
                    <HStack spacing={4}>
                      <Flex
                        w={12}
                        h={12}
                        borderRadius="xl"
                        bg={`${item.color}.50`}
                        color={`${item.color}.500`}
                        align="center"
                        justify="center"
                        flexShrink={0}
                      >
                        <Icon as={item.icon} boxSize={6} />
                      </Flex>
                      <Box>
                        <Text fontWeight="semibold" color="gray.800">
                          {item.title}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {item.desc}
                        </Text>
                      </Box>
                    </HStack>
                  </MotionBox>
                ))}
              </MotionFlex>
            </Box>
          </Flex>
        </MotionBox>
      </Flex>

      {/* Блок «Как это работает» */}
      <Box
        as="section"
        px={{ base: 4, md: 8 }}
        py={{ base: 12, md: 16 }}
        position="relative"
        zIndex={1}
      >
        <Box maxW="1000px" mx="auto">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={2} mb={10} textAlign="center">
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="brand.500"
                textTransform="uppercase"
                letterSpacing="1px"
              >
                Быстрый старт
              </Text>
              <Heading size="lg" color="gray.800">
                Как это работает
              </Heading>
              <Text color="gray.500" maxW="500px">
                Три простых шага для начала работы
              </Text>
            </VStack>
          </MotionBox>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {[
              {
                icon: FiUserPlus,
                step: '01',
                title: 'Создайте аккаунт',
                desc: 'Зарегистрируйтесь за пару минут — только базовые данные',
                gradient: 'linear(to-br, brand.400, brand.600)',
              },
              {
                icon: FiLayers,
                step: '02',
                title: 'Соберите квиз',
                desc: 'Добавьте вопросы и медиа или выберите готовые наборы',
                gradient: 'linear(to-br, purple.400, purple.600)',
              },
              {
                icon: FiPlay,
                step: '03',
                title: 'Запустите сессию',
                desc: 'Пригласите участников и смотрите результаты в реальном времени',
                gradient: 'linear(to-br, teal.400, teal.600)',
              },
            ].map((item, i) => (
              <MotionBox
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <Box
                  bg="white"
                  borderRadius="2xl"
                  p={6}
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.100"
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    boxShadow: 'lg',
                    transform: 'translateY(-4px)',
                  }}
                  transition="all 0.3s"
                  h="100%"
                >
                  <Text
                    position="absolute"
                    top={4}
                    right={4}
                    fontSize="4xl"
                    fontWeight="bold"
                    color="gray.100"
                  >
                    {item.step}
                  </Text>

                  <VStack align="flex-start" spacing={4}>
                    <Flex
                      w={14}
                      h={14}
                      borderRadius="xl"
                      bgGradient={item.gradient}
                      color="white"
                      align="center"
                      justify="center"
                      boxShadow="md"
                    >
                      <Icon as={item.icon} boxSize={7} />
                    </Flex>

                    <Heading size="md" color="gray.800">
                      {item.title}
                    </Heading>

                    <Text fontSize="sm" color="gray.500" lineHeight="tall">
                      {item.desc}
                    </Text>
                  </VStack>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* Блок «Кому подойдёт» */}
      <Box
        as="section"
        px={{ base: 4, md: 8 }}
        py={{ base: 12, md: 16 }}
        position="relative"
        zIndex={1}
      >
        <Box maxW="1000px" mx="auto">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={2} mb={10} textAlign="center">
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="purple.500"
                textTransform="uppercase"
                letterSpacing="1px"
              >
                Применение
              </Text>
              <Heading size="lg" color="gray.800">
                Кому подойдёт платформа
              </Heading>
              <Text color="gray.500" maxW="500px">
                КвизМастер адаптируется под разные сценарии использования
              </Text>
            </VStack>
          </MotionBox>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {[
              {
                icon: FiBookOpen,
                title: 'Университеты',
                desc: 'Контрольные, тесты и викторины для студентов',
                bg: 'brand.50',
                iconColor: 'brand.500',
              },
              {
                icon: FiBriefcase,
                title: 'Компании',
                desc: 'Онбординг и проверки знаний для сотрудников',
                bg: 'purple.50',
                iconColor: 'purple.500',
              },
              {
                icon: FiHeart,
                title: 'Сообщества',
                desc: 'Тематические викторины и челленджи для участников',
                bg: 'pink.50',
                iconColor: 'pink.500',
              },
            ].map((item, i) => (
              <MotionBox
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Box
                  bg="white"
                  borderRadius="2xl"
                  p={6}
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.100"
                  textAlign="center"
                  _hover={{
                    boxShadow: 'lg',
                    transform: 'translateY(-4px)',
                  }}
                  transition="all 0.3s"
                  h="100%"
                >
                  <VStack spacing={4}>
                    <Flex
                      w={16}
                      h={16}
                      borderRadius="full"
                      bg={item.bg}
                      color={item.iconColor}
                      align="center"
                      justify="center"
                      mx="auto"
                    >
                      <Icon as={item.icon} boxSize={8} />
                    </Flex>

                    <Heading size="md" color="gray.800">
                      {item.title}
                    </Heading>

                    <Text fontSize="sm" color="gray.500">
                      {item.desc}
                    </Text>
                  </VStack>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>

          {/* CTA блок */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            mt={12}
          >
            <Flex
              bgGradient="linear(to-r, brand.500, purple.500)"
              borderRadius="2xl"
              p={{ base: 8, md: 10 }}
              align="center"
              justify="space-between"
              direction={{ base: 'column', md: 'row' }}
              gap={6}
              boxShadow="xl"
            >
              <Box color="white">
                <Heading size="md" mb={2}>
                  Готовы начать?
                </Heading>
                <Text opacity={0.9}>
                  Создайте свой первый квиз уже сегодня
                </Text>
              </Box>
              <Button
                size="lg"
                bg="white"
                color="brand.600"
                _hover={{
                  bg: 'whiteAlpha.900',
                  transform: 'translateY(-2px)',
                }}
                transition="all 0.2s"
                rightIcon={<FiArrowRight />}
                onClick={() => navigate('/auth')}
                flexShrink={0}
              >
                Войти / Зарегистрироваться
              </Button>
            </Flex>
          </MotionBox>
        </Box>
      </Box>

      {/* Футер-отступ */}
      <Box h={8} />
    </Box>
  );
};

