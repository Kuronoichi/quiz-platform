import axios from 'axios';

function translateCommonEnglishToRu(message: string): string {
  const m = message.trim();
  const lower = m.toLowerCase();

  if (lower === 'unauthorized' || lower.includes('not authenticated')) return 'Требуется авторизация';
  if (lower === 'forbidden') return 'Доступ запрещён';
  if (lower.includes('invalid email or password')) return 'Неверный email или пароль';

  if (m === 'Network Error' || lower.includes('network error')) {
    return 'Ошибка сети. Проверьте подключение к интернету и повторите попытку.';
  }
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return 'Превышено время ожидания ответа сервера. Повторите попытку позже.';
  }

  if (lower.startsWith('request failed with status code')) {
    return 'Запрос не выполнен. Попробуйте обновить страницу и повторить действие.';
  }

  return m;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;

    if (err.response?.data && typeof err.response.data === 'object') {
      const d = err.response.data as Record<string, unknown>;
      const raw = (typeof d.error === 'string' && d.error) || (typeof d.message === 'string' && d.message) || '';
      if (raw) return translateCommonEnglishToRu(raw);
    }

    if (err.code === 'ERR_NETWORK') {
      return 'Ошибка сети. Проверьте подключение к интернету и повторите попытку.';
    }

    if (status === 0 || status == null) {
      return translateCommonEnglishToRu(err.message || fallback);
    }
    if (status === 401) return 'Требуется авторизация';
    if (status === 403) return 'Доступ запрещён';
    if (status === 404) return 'Ресурс не найден';
    if (status >= 500) return 'Ошибка сервера. Повторите попытку позже.';

    return translateCommonEnglishToRu(err.message || fallback);
  }

  if (err instanceof Error && err.message) {
    return translateCommonEnglishToRu(err.message);
  }

  return fallback;
}

