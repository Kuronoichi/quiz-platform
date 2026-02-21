import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { QuizForm } from '../components/quiz/forms/QuizForm';

const MotionBox = motion(Box);

export const QuizCreatePage: React.FC = () => {
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
        <Box maxW="700px" mx="auto">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            bg="white"
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
            p={{ base: 6, md: 8 }}
          >
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="brand.500"
              textTransform="uppercase"
              letterSpacing="1px"
              mb={2}
            >
              Новый квиз
            </Text>
            <Heading size="lg" color="gray.800" mb={2}>
              Создание квиза
            </Heading>
            <Text color="gray.500" mb={6}>
              Заполните основные параметры нового квиза
            </Text>
            <QuizForm />
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};
