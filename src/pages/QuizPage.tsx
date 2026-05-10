import React from 'react';
import { Box, Heading, Text, Button, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiBarChart2 } from 'react-icons/fi';
import { QuizList } from '../components/quiz/QuizList';

const MotionBox = motion(Box);

export const QuizPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      bgGradient="linear(to-br, brand.50, white, purple.50)"
      minH="100vh"
      position="relative"
      overflow="hidden"
    >
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
      />

      <Box position="relative" zIndex={1} px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
        <Box maxW="1000px" mx="auto">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="brand.500"
              textTransform="uppercase"
              letterSpacing="1px"
              mb={2}
            >
              Управление
            </Text>
            <Box
              display="flex"
              flexDirection={{ base: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ base: 'stretch', sm: 'center' }}
              gap={4}
              mb={2}
            >
              <Box>
                <Heading size="lg" color="gray.800">
                  Мои квизы
                </Heading>
                <Text color="gray.500">
                  Создавайте, редактируйте и публикуйте свои квизы
                </Text>
              </Box>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={FiBarChart2} />}
                borderRadius="xl"
                onClick={() => navigate('/sessions')}
                alignSelf={{ base: 'stretch', sm: 'auto' }}
              >
                Мои сессии
              </Button>
            </Box>
            <Box h={4} />
            <QuizList />
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
