import React, { useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Icon,
  SimpleGrid,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import {
  FiArrowLeft,
  FiUsers,
  FiEdit3,
  FiShield,
  FiUser,
  FiPlay,
  FiKey,
  FiBarChart2,
  FiList,
  FiBookOpen,
  FiAlertTriangle,
  FiAward,
  FiClock,
  FiSend,
  FiLock,
  FiSearch,
  FiCheckSquare,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const MotionBox = motion(Box);

type RoleKind = 'admin' | 'moderator' | 'creator' | 'participant';

type Step = {
  icon: IconType;
  title: string;
  text: string;
  color: string;
};

const RoleHero: React.FC<{ icon: IconType; title: string; subtitle: string; accent: string }> = ({
  icon,
  title,
  subtitle,
  accent,
}) => (
  <Flex
    direction={{ base: 'column', sm: 'row' }}
    align={{ base: 'flex-start', sm: 'center' }}
    gap={5}
    mb={8}
    p={{ base: 5, md: 6 }}
    borderRadius="2xl"
    bgGradient={`linear(135deg, ${accent}.50, white, purple.50)`}
    borderWidth="1px"
    borderColor={`${accent}.100`}
  >
    <Flex
      w={{ base: 14, md: 16 }}
      h={{ base: 14, md: 16 }}
      borderRadius="2xl"
      bg={`${accent}.500`}
      color="white"
      align="center"
      justify="center"
      flexShrink={0}
      boxShadow="md"
    >
      <Icon as={icon} boxSize={{ base: 7, md: 8 }} />
    </Flex>
    <Box minW={0}>
      <Text fontSize="xs" fontWeight="bold" color={`${accent}.600`} textTransform="uppercase" letterSpacing="wider" mb={1}>
        Ваша роль
      </Text>
      <Heading as="h1" size="lg" color="gray.800" mb={2}>
        {title}
      </Heading>
      <Text color="gray.600" fontSize="sm" lineHeight="tall">
        {subtitle}
      </Text>
    </Box>
  </Flex>
);

const StepCard: React.FC<{ step: Step; index: number }> = ({ step, index }) => (
  <MotionBox
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    bg="white"
    borderRadius="xl"
    borderWidth="1px"
    borderColor="gray.100"
    p={{ base: 4, md: 5 }}
    boxShadow="sm"
    _hover={{ borderColor: `${step.color}.200`, boxShadow: 'md' }}
  >
    <Flex align="flex-start" gap={4}>
      <Flex
        w={11}
        h={11}
        borderRadius="lg"
        bg={`${step.color}.50`}
        color={`${step.color}.500`}
        align="center"
        justify="center"
        flexShrink={0}
      >
        <Icon as={step.icon} boxSize={5} />
      </Flex>
      <Box minW={0}>
        <Text fontWeight="semibold" color="gray.800" mb={1}>
          {step.title}
        </Text>
        <Text fontSize="sm" color="gray.600" lineHeight="tall">
          {step.text}
        </Text>
      </Box>
    </Flex>
  </MotionBox>
);

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, isAdmin, isModerator, isCreator, isParticipant } = useAuth();

  const role: RoleKind = useMemo(() => {
    if (isAdmin) return 'admin';
    if (isModerator) return 'moderator';
    if (isCreator) return 'creator';
    return 'participant';
  }, [isAdmin, isModerator, isCreator]);

  const config = useMemo(() => {
    if (role === 'admin') {
      return {
        heroIcon: FiUser as IconType,
        heroTitle: 'Администратор',
        heroSubtitle:
          'Полный контроль над пользователями и доступом к системе. Ниже — типичные шаги в одном месте, с понятными значками.',
        accent: 'red',
        steps: [
          {
            icon: FiUser,
            title: 'Пользователи и роли',
            text: 'В разделе администрирования смотрите список пользователей, роли и при необходимости блокируйте доступ.',
            color: 'red',
          },
          {
            icon: FiShield,
            title: 'Модерация и квизы',
            text: 'Репорты и каталог квизов доступны тем же правам, что и модератору — при необходимости проверяйте контент.',
            color: 'purple',
          },
          {
            icon: FiLock,
            title: 'Безопасность',
            text: 'Решения по блокировке и ролям влияют на весь доступ к платформе — действуйте осознанно.',
            color: 'orange',
          },
        ] as Step[],
      };
    }
    if (role === 'moderator') {
      return {
        heroIcon: FiShield as IconType,
        heroTitle: 'Модератор',
        heroSubtitle:
          'Вы следите за качеством контента и жалобами. Ниже — сценарии с иконками, чтобы быстро ориентироваться.',
        accent: 'purple',
        steps: [
          {
            icon: FiAlertTriangle,
            title: 'Очередь репортов',
            text: 'Откройте «Модерация репортов»: сначала разбирайте ожидающие жалобы, затем при необходимости обновите сводку.',
            color: 'orange',
          },
          {
            icon: FiBookOpen,
            title: 'Каталог квизов',
            text: 'В «Каталоге квизов» откройте любой квиз целиком — вопросы, варианты и медиа — без права редактирования.',
            color: 'purple',
          },
          {
            icon: FiSearch,
            title: 'Связь с репортом',
            text: 'Из карточки репорта можно перейти к полному квизу, чтобы понять контекст жалобы.',
            color: 'teal',
          },
        ] as Step[],
      };
    }
    if (role === 'creator') {
      return {
        heroIcon: FiEdit3 as IconType,
        heroTitle: 'Создатель контента',
        heroSubtitle:
          'Вы создаёте квизы и проводите сессии. Шаги ниже с иконками помогут не пропустить этап от черновика до кода для игроков.',
        accent: 'teal',
        steps: [
          {
            icon: FiList,
            title: 'Квиз и вопросы',
            text: 'Создайте квиз, добавьте вопросы, варианты ответов и при необходимости медиа. Опубликуйте, когда готово.',
            color: 'brand',
          },
          {
            icon: FiSend,
            title: 'Сессия и код',
            text: 'На странице сессии создайте игру, запустите её и передайте участникам код — они вводят его в разделе «Игра».',
            color: 'purple',
          },
          {
            icon: FiBarChart2,
            title: 'Аналитика и рейтинг',
            text: 'Смотрите сводку по сессиям в кабинете; рейтинг игроков по квизу открывается с карточки квиза или страницы просмотра.',
            color: 'teal',
          },
          {
            icon: FiAward,
            title: 'Итоги для участников',
            text: 'Детальные ответы и баллы видят только участники в своём кабинете после завершения сессии организатором.',
            color: 'green',
          },
        ] as Step[],
      };
    }
    return {
      heroIcon: FiUsers as IconType,
      heroTitle: 'Участник',
      heroSubtitle:
        'Вы проходите квизы по коду сессии. Ниже — ваш сценарий с крупными значками, чтобы сразу было видно, куда нажимать.',
      accent: 'brand',
      steps: [
        {
          icon: FiKey,
          title: 'Код от организатора',
          text: 'Получите код сессии у преподавателя или ведущего — он состоит из букв и цифр.',
          color: 'brand',
        },
        {
          icon: FiPlay,
          title: 'Раздел «Игра»',
          text: 'В кабинете нажмите «Присоединиться к квизу», введите код и дождитесь старта, если сессия ещё не запущена.',
          color: 'purple',
        },
        {
          icon: FiClock,
          title: 'Вопросы и время',
          text: 'Отвечайте на вопросы; на ограниченные по времени задания ответ может отправиться автоматически по таймеру.',
          color: 'orange',
        },
        {
          icon: FiCheckSquare,
          title: 'Результаты и рейтинг',
          text: 'После завершения сессии смотрите «Мои результаты» и при желании откройте рейтинг по этому квизу.',
          color: 'teal',
        },
        {
          icon: FiAward,
          title: 'Жалоба на вопрос',
          text: 'Если заметили ошибку в формулировке, используйте жалобу на вопрос на экране результатов.',
          color: 'green',
        },
      ] as Step[],
    };
  }, [role]);

  if (loading) {
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
      <Box position="absolute" top="-100px" right="-100px" w="400px" h="400px" borderRadius="full" bg="brand.100" opacity={0.3} filter="blur(60px)" />
      <Box position="absolute" bottom="-150px" left="-100px" w="500px" h="500px" borderRadius="full" bg="purple.100" opacity={0.3} filter="blur(80px)" />

      <Box position="relative" zIndex={1} px={{ base: 4, sm: 6, md: 8 }} py={{ base: 6, md: 12 }} pb={{ base: 10, md: 16 }}>
        <Box maxW="800px" mx="auto" w="100%">
          <MotionBox initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Button
              leftIcon={<Icon as={FiArrowLeft} />}
              variant="ghost"
              size="sm"
              mb={6}
              onClick={() => navigate('/dashboard')}
            >
              Назад в личный кабинет
            </Button>

            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
              p={{ base: 5, md: 8 }}
            >
              <Text fontSize="xs" fontWeight="bold" color="brand.500" textTransform="uppercase" letterSpacing="wider" mb={3}>
                Как это работает
              </Text>

              <RoleHero
                icon={config.heroIcon}
                title={config.heroTitle}
                subtitle={config.heroSubtitle}
                accent={config.accent}
              />

              <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={4}>
                Шаги
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {config.steps.map((step, index) => (
                  <StepCard key={step.title} step={step} index={index} />
                ))}
              </SimpleGrid>

              {isParticipant && !isCreator && !isAdmin && !isModerator && (
                <Box mt={8} p={4} borderRadius="xl" bg="gray.50" borderWidth="1px" borderColor="gray.100">
                  <Text fontSize="xs" color="gray.500">
                    Подсказка: если у вас когда-нибудь появится роль создателя или модератора, эта страница автоматически покажет
                    другой набор шагов и иконок.
                  </Text>
                </Box>
              )}
            </Box>
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
