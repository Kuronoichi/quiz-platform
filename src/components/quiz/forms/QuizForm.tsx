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
  Badge,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../api/client';

interface QuizFormData {
  title: string;
  description: string;
  status: 'draft' | 'published';
  access: 'public' | 'private' | 'invite_only';
}

interface QuizErrors {
  title?: string;
  description?: string;
}

export const QuizForm: React.FC = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    status: 'draft',
    access: 'public',
  });

  const [errors, setErrors] = useState<QuizErrors>({});

  // Загрузка данных квиза при редактировании
  React.useEffect(() => {
    if (isEditing && id) {
      const fetchQuiz = async () => {
        try {
          setLoading(true);
          const response = await apiClient.get(`/api/quiz/${id}`);
          const quiz = response.data;

          setFormData({
            title: quiz.title,
            description: quiz.description || '',
            status: quiz.status,
            access: quiz.access,
          });
        } catch (error) {
          toast({
            title: 'Ошибка загрузки квиза',
            description: 'Не удалось загрузить данные квиза. Перенаправляем в список квизов.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/quiz');
        } finally {
          setLoading(false);
        }
      };

      fetchQuiz();
    }
  }, [isEditing, id, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Очистка ошибок при изменении поля
    if (errors[name as keyof QuizErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validate = (): boolean => {
    const nextErrors: QuizErrors = {};

    if (!formData.title.trim()) {
      nextErrors.title = 'Название квиза обязательно';
    } else if (formData.title.trim().length < 3) {
      nextErrors.title = 'Название должно быть не менее 3 символов';
    }

    if (formData.description && formData.description.length > 1000) {
      nextErrors.description = 'Описание не должно превышать 1000 символов';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditing && id) {
        // Обновление существующего квиза
        await apiClient.patch(`/api/quiz/${id}`, formData);

        toast({
          title: 'Квиз обновлен',
          description: 'Изменения успешно сохранены.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Создание нового квиза
        const response = await apiClient.post('/api/quiz', formData);

        toast({
          title: 'Квиз создан',
          description: 'Новый квиз успешно создан.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Перенаправляем на страницу редактирования вопросов
        navigate(`/quiz/${response.data.quiz_id}/edit`);
        return;
      }

      // После успешного сохранения возвращаемся к списку квизов
      navigate('/quiz');
    } catch (error) {
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить квиз. Попробуйте позже.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/quiz');
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={5} align="stretch">
        {isEditing && (
          <HStack spacing={3}>
            <Badge colorScheme={formData.status === 'published' ? 'green' : 'yellow'}>
              {formData.status === 'published' ? 'Опубликован' : 'Черновик'}
            </Badge>
            <Badge colorScheme="blue">{formData.access}</Badge>
          </HStack>
        )}

        <FormControl isRequired isInvalid={!!errors.title}>
          <FormLabel fontSize="sm" color="gray.600">Название квиза</FormLabel>
          <Input
            borderRadius="xl"
            borderColor="gray.200"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Например: Введение в React"
            isDisabled={loading}
          />
          {errors.title && <FormErrorMessage>{errors.title}</FormErrorMessage>}
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel fontSize="sm" color="gray.600">Описание (необязательно)</FormLabel>
          <Textarea
            borderRadius="xl"
            borderColor="gray.200"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Краткое описание квиза, его цель и тематика..."
            isDisabled={loading}
            rows={4}
          />
          {errors.description && <FormErrorMessage>{errors.description}</FormErrorMessage>}
        </FormControl>

        <HStack spacing={4} width="100%">
          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">Статус</FormLabel>
            <Select
              borderRadius="xl"
              borderColor="gray.200"
              name="status"
              value={formData.status}
              onChange={handleChange}
              isDisabled={loading}
            >
              <option value="draft">Черновик</option>
              <option value="published">Опубликован</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">Доступ</FormLabel>
            <Select
              name="access"
              borderRadius="xl"
              borderColor="gray.200"
              value={formData.access}
              onChange={handleChange}
              isDisabled={loading}
            >
              <option value="public">Публичный</option>
              <option value="private">Приватный</option>
              <option value="invite_only">По приглашению</option>
            </Select>
          </FormControl>
        </HStack>

        <HStack spacing={3} justify="flex-end" pt={4} borderTopWidth="1px" borderColor="gray.100">
          <Button variant="outline" onClick={handleCancel} isDisabled={loading} borderRadius="xl">
            Отмена
          </Button>
          <Button
            type="submit"
            colorScheme="brand"
            isLoading={loading}
            loadingText={isEditing ? 'Сохранение...' : 'Создание...'}
            borderRadius="xl"
          >
            {isEditing ? 'Сохранить изменения' : 'Создать квиз'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};
