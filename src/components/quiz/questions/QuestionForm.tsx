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
  Image,
  Link,
} from '@chakra-ui/react';
import { FiPlus, FiTrash, FiCheck, FiX, FiCopy, FiChevronUp, FiChevronDown, FiExternalLink } from 'react-icons/fi';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type QuestionType = 'single_choice' | 'multiple_choice';

export type QuestionMediaType = 'image' | 'video';

export interface QuestionMediaFormItem {
  id: string;
  url: string;
  media_type: QuestionMediaType;
}

export interface QuestionFormData {
  question_text: string;
  question_type: QuestionType;
  timeLimit: number | '';
  points: number;
  options: QuestionOption[];
  media: QuestionMediaFormItem[];
}

interface QuestionErrors {
  questionText?: string;
  options?: string;
  correctOption?: string;
  timeLimit?: string;
  points?: string;
  mediaUrl?: string;
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
    media: initialData?.media ?? [],
  });

  const [errors, setErrors] = useState<QuestionErrors>({});

  const parseNumericId = (id: string): number => {
    const n = Number(id);
    return Number.isFinite(n) ? n : 0;
  };

  const isValidHttpUrl = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    try {
      const url = new URL(trimmed);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isYoutubeUrl = (value: string): boolean => {
    const lower = value.toLowerCase();
    return lower.includes('youtube.com') || lower.includes('youtu.be');
  };

  const toYoutubeEmbedUrl = (value: string): string | null => {
    try {
      const url = new URL(value);
      if (url.hostname.includes('youtu.be')) {
        const id = url.pathname.replace('/', '');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (url.hostname.includes('youtube.com')) {
        const id = url.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      return null;
    } catch {
      return null;
    }
  };

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

    if (errors.options || errors.correctOption) {
      setErrors(prev => ({
        ...prev,
        options: undefined,
        correctOption: undefined
      }));
    }
  };

  const addMedia = () => {
    const newId = (Math.max(0, ...formData.media.map((m) => parseNumericId(m.id))) + 1).toString();
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, { id: newId, url: '', media_type: 'image' }],
    }));
  };

  const removeMedia = (id: string) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter(m => m.id !== id),
    }));
  };

  const handleMediaChange = (id: string, field: 'url' | 'media_type', value: string) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.map(m => (m.id === id ? { ...m, [field]: value } : m)),
    }));
    if (errors.mediaUrl) {
      setErrors(prev => ({ ...prev, mediaUrl: undefined }));
    }
  };

  const duplicateMedia = (id: string) => {
    setFormData((prev) => {
      const idx = prev.media.findIndex((m) => m.id === id);
      if (idx < 0) return prev;
      const newId = (Math.max(0, ...prev.media.map((m) => parseNumericId(m.id))) + 1).toString();
      const source = prev.media[idx];
      const cloned = { ...source, id: newId };
      const next = [...prev.media];
      next.splice(idx + 1, 0, cloned);
      return { ...prev, media: next };
    });
  };

  const moveMedia = (id: string, direction: -1 | 1) => {
    setFormData((prev) => {
      const idx = prev.media.findIndex((m) => m.id === id);
      const targetIdx = idx + direction;
      if (idx < 0 || targetIdx < 0 || targetIdx >= prev.media.length) return prev;
      const next = [...prev.media];
      const [item] = next.splice(idx, 1);
      next.splice(targetIdx, 0, item);
      return { ...prev, media: next };
    });
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

    const correctCount = formData.options.filter(opt => opt.isCorrect).length;
    if (correctCount === 0) {
      nextErrors.correctOption = 'Должен быть выбран хотя бы один правильный ответ';
    } else if (formData.question_type === 'single_choice' && correctCount !== 1) {
      nextErrors.correctOption = 'Для типа «один ответ» должен быть ровно один правильный вариант';
    }

    if (formData.timeLimit !== '' && (formData.timeLimit < 5 || formData.timeLimit > 300)) {
      nextErrors.timeLimit = 'Время должно быть от 5 до 300 секунд';
    }

    if (formData.points < 1 || formData.points > 100) {
      nextErrors.points = 'Баллы должны быть от 1 до 100';
    }

    const nonEmptyMedia = formData.media.filter((m) => m.url.trim().length > 0);
    if (nonEmptyMedia.some((m) => !isValidHttpUrl(m.url))) {
      nextErrors.mediaUrl = 'Укажите корректный URL, начинающийся с http:// или https://';
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
            <Select
              name="question_type"
              value={formData.question_type}
              onChange={handleChange}
              borderRadius="xl"
              borderColor="gray.200"
            >
              <option value="single_choice">Один правильный ответ</option>
              <option value="multiple_choice">Несколько правильных ответов</option>
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

        <Box>
          <HStack spacing={2} mb={3}>
            <FormLabel mb="0" fontSize="sm" color="gray.600">Медиа (изображения/видео, по желанию)</FormLabel>
            <Badge colorScheme="blue" size="sm">{formData.media.length}</Badge>
            {errors.mediaUrl && <Text color="red.500" fontSize="sm">{errors.mediaUrl}</Text>}
          </HStack>
          <Text mt={0} mb={3} fontSize="xs" color="gray.500">
            Добавляйте ссылки на изображения или видео. Поддерживаются обычные URL и YouTube-ссылки.
          </Text>
          <VStack spacing={3} align="stretch">
            {formData.media.map((m, index) => {
              const hasUrl = m.url.trim().length > 0;
              const isValidUrl = !hasUrl || isValidHttpUrl(m.url);
              const youtubeEmbedUrl = m.media_type === 'video' && isYoutubeUrl(m.url) ? toYoutubeEmbedUrl(m.url) : null;
              return (
                <Box key={m.id} borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={3}>
                  <HStack justify="space-between" mb={2}>
                    <Badge variant="outline">Медиа #{index + 1}</Badge>
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="Сдвинуть вверх"
                        icon={<FiChevronUp />}
                        size="xs"
                        variant="ghost"
                        onClick={() => moveMedia(m.id, -1)}
                        isDisabled={index === 0}
                      />
                      <IconButton
                        aria-label="Сдвинуть вниз"
                        icon={<FiChevronDown />}
                        size="xs"
                        variant="ghost"
                        onClick={() => moveMedia(m.id, 1)}
                        isDisabled={index === formData.media.length - 1}
                      />
                      <IconButton
                        aria-label="Дублировать медиа"
                        icon={<FiCopy />}
                        size="xs"
                        variant="ghost"
                        onClick={() => duplicateMedia(m.id)}
                      />
                      <IconButton
                        aria-label="Удалить медиа"
                        icon={<FiTrash />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeMedia(m.id)}
                      />
                    </HStack>
                  </HStack>

                  <HStack spacing={3} align="start">
                    <Input
                      placeholder="https://example.com/image.png"
                      value={m.url}
                      onChange={(e) => handleMediaChange(m.id, 'url', e.target.value)}
                      borderRadius="xl"
                      borderColor={isValidUrl ? 'gray.200' : 'red.300'}
                    />
                    <Select
                      value={m.media_type}
                      onChange={(e) => handleMediaChange(m.id, 'media_type', e.target.value as QuestionMediaType)}
                      w="140px"
                      borderRadius="xl"
                      borderColor="gray.200"
                    >
                      <option value="image">Изображение</option>
                      <option value="video">Видео</option>
                    </Select>
                  </HStack>

                  {hasUrl && !isValidUrl && (
                    <Text mt={2} fontSize="xs" color="red.500">
                      Введите корректный URL (http:// или https://).
                    </Text>
                  )}

                  {hasUrl && isValidUrl && (
                    <Box mt={3}>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="xs" color="gray.500">Предпросмотр</Text>
                        <Link href={m.url} isExternal fontSize="xs" color="brand.500">
                          Открыть ссылку <FiExternalLink style={{ display: 'inline', marginLeft: 4 }} />
                        </Link>
                      </HStack>
                      {m.media_type === 'image' ? (
                        <Image
                          src={m.url}
                          alt="Предпросмотр изображения"
                          maxH="180px"
                          objectFit="contain"
                          borderWidth="1px"
                          borderColor="gray.200"
                          borderRadius="lg"
                          fallback={<Box p={3} borderWidth="1px" borderColor="gray.200" borderRadius="lg"><Text fontSize="xs" color="gray.500">Не удалось загрузить изображение по ссылке.</Text></Box>}
                        />
                      ) : youtubeEmbedUrl ? (
                        <Box
                          as="iframe"
                          src={youtubeEmbedUrl}
                          title={`preview-${m.id}`}
                          width="100%"
                          height="220px"
                          border="0"
                          borderRadius="8px"
                        />
                      ) : (
                        <Box
                          as="video"
                          src={m.url}
                          controls
                          maxH="220px"
                          width="100%"
                          borderRadius="lg"
                          borderWidth="1px"
                          borderColor="gray.200"
                        />
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
            <Button
              leftIcon={<FiPlus />}
              variant="outline"
              size="sm"
              borderRadius="xl"
              onClick={addMedia}
            >
              Добавить медиа
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
