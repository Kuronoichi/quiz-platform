import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  useToast,
  Text,
  Badge,
  IconButton,
} from '@chakra-ui/react';
import { FiPlus, FiTrash, FiCheck, FiX } from 'react-icons/fi';

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionFormData {
  question_text: string;
  question_type: 'single_choice';
  timeLimit: number | '';
  points: number;
  options: QuestionOption[];
}

interface QuestionErrors {
  questionText?: string;
  options?: string;
  correctOption?: string;
  timeLimit?: string;
  points?: string;
}

interface QuestionFormProps {
  initialData?: QuestionFormData;
  onSubmit: (data: QuestionFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const toast = useToast();

  const [formData, setFormData] = useState<QuestionFormData>({
    question_text: initialData?.question_text || '',
    question_type: initialData?.question_type || 'single_choice',
    timeLimit: initialData?.timeLimit || '',
    points: initialData?.points || 1,
    options: initialData?.options.length ? initialData.options : [
      { id: '1', text: '', isCorrect: true },
      { id: '2', text: '', isCorrect: false },
    ],
  });

  const [errors, setErrors] = useState<QuestionErrors>({});

  const fieldMap: Record<string, keyof QuestionFormData> = {
    question_text: 'question_text',
    question_type: 'question_type',
    timeLimit: 'timeLimit',
    points: 'points',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = fieldMap[name] ?? name;
    setFormData(prev => ({
      ...prev,
      [key]: key === 'timeLimit' || key === 'points' ? (value === '' ? '' : Number(value)) : value,
    }));
    if (errors[key as keyof QuestionErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleOptionChange = (id: string, field: 'text' | 'isCorrect', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(opt =>
        opt.id === id ? { ...opt, [field]: value } : opt
      )
    }));

    // Очистка ошибок при изменении варианта
    if (errors.options || errors.correctOption) {
      setErrors(prev => ({
        ...prev,
        options: undefined,
        correctOption: undefined
      }));
    }
  };

  const addOption = () => {
    if (formData.options.length >= 10) {
      toast({
        title: 'Ограничение достигнуто',
        description: 'Максимальное количество вариантов ответа - 10.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newId = (Math.max(0, ...formData.options.map(o => parseInt(o.id))) + 1).toString();
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { id: newId, text: '', isCorrect: false }]
    }));
  };

  const removeOption = (id: string) => {
    if (formData.options.length <= 2) {
      toast({
        title: 'Минимальное количество',
        description: 'Должно быть как минимум 2 варианта ответа.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== id)
    }));
  };

  const validate = (): boolean => {
    const nextErrors: QuestionErrors = {};

    if (!formData.question_text.trim()) {
      nextErrors.questionText = 'Текст вопроса обязателен';
    }

    if (formData.options.length < 2) {
      nextErrors.options = 'Минимум 2 варианта ответа';
    } else {
      const emptyOption = formData.options.find(opt => !opt.text.trim());
      if (emptyOption) {
        nextErrors.options = 'Все варианты ответа должны быть заполнены';
      }
    }

    const correctOption = formData.options.find(opt => opt.isCorrect);
    if (!correctOption) {
      nextErrors.correctOption = 'Должен быть выбран хотя бы один правильный ответ';
    }

    if (formData.timeLimit !== '' && (formData.timeLimit < 5 || formData.timeLimit > 300)) {
      nextErrors.timeLimit = 'Время должно быть от 5 до 300 секунд';
    }

    if (formData.points < 1 || formData.points > 100) {
      nextErrors.points = 'Баллы должны быть от 1 до 100';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={5} align="stretch">
        <FormControl isRequired isInvalid={!!errors.questionText}>
          <FormLabel fontSize="sm" color="gray.600">Текст вопроса</FormLabel>
          <Textarea
            name="question_text"
            value={formData.question_text}
            onChange={handleChange}
            placeholder="Введите текст вопроса..."
            rows={3}
            borderRadius="xl"
            borderColor="gray.200"
          />
          {errors.questionText && <FormErrorMessage>{errors.questionText}</FormErrorMessage>}
        </FormControl>

        <HStack spacing={4} width="100%">
          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">Тип вопроса</FormLabel>
            <Select name="question_type" value={formData.question_type} onChange={handleChange} isDisabled borderRadius="xl" borderColor="gray.200">
              <option value="single_choice">Один правильный ответ</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">Время на ответ (сек)</FormLabel>
            <Input
              name="timeLimit"
              type="number"
              value={formData.timeLimit}
              onChange={handleChange}
              placeholder="0-300"
              borderRadius="xl"
              borderColor="gray.200"
            />
            {errors.timeLimit && <FormErrorMessage>{errors.timeLimit}</FormErrorMessage>}
          </FormControl>
          <FormControl isRequired>
            <FormLabel fontSize="sm" color="gray.600">Баллы</FormLabel>
            <Input
              name="points"
              type="number"
              value={formData.points}
              onChange={handleChange}
              placeholder="1-100"
              borderRadius="xl"
              borderColor="gray.200"
            />
            {errors.points && <FormErrorMessage>{errors.points}</FormErrorMessage>}
          </FormControl>
        </HStack>

        <Box>
          <HStack spacing={2} mb={3}>
            <FormLabel mb="0" fontSize="sm" color="gray.600">Варианты ответа</FormLabel>
            <Badge colorScheme="purple" size="sm">{formData.options.length} / 10</Badge>
            {errors.options && <Text color="red.500" fontSize="sm">{errors.options}</Text>}
            {errors.correctOption && <Text color="red.500" fontSize="sm">{errors.correctOption}</Text>}
          </HStack>
          <VStack spacing={3} align="stretch">
            {formData.options.map((option, index) => (
              <HStack key={option.id} spacing={3}>
                <Box
                  w={5}
                  h={5}
                  borderRadius="full"
                  bg={option.isCorrect ? 'green.100' : 'gray.100'}
                  borderWidth="2px"
                  borderColor={option.isCorrect ? 'green.500' : 'gray.300'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  onClick={() => handleOptionChange(option.id, 'isCorrect', !option.isCorrect)}
                >
                  {option.isCorrect && <Box w={2} h={2} borderRadius="full" bg="green.500" />}
                </Box>
                <Input
                  value={option.text}
                  onChange={(e) => handleOptionChange(option.id, 'text', e.target.value)}
                  placeholder={`Вариант ${index + 1}`}
                  borderRadius="xl"
                  borderColor="gray.200"
                />
                <IconButton
                  aria-label="Удалить вариант"
                  icon={<FiTrash />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeOption(option.id)}
                  isDisabled={formData.options.length <= 2}
                />
              </HStack>
            ))}
            <Button leftIcon={<FiPlus />} variant="outline" size="sm" onClick={addOption} isDisabled={formData.options.length >= 10} borderRadius="xl">
              Добавить вариант
            </Button>
          </VStack>
        </Box>

        <HStack spacing={3} justify="flex-end" pt={4} borderTopWidth="1px" borderColor="gray.100">
          <Button variant="outline" onClick={onCancel} leftIcon={<FiX />} borderRadius="xl">
            Отмена
          </Button>
          <Button type="submit" colorScheme="brand" leftIcon={<FiCheck />} borderRadius="xl">
            {isEditing ? 'Сохранить изменения' : 'Добавить вопрос'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};
