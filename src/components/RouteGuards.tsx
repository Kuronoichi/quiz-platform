import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Spinner, useToast } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';

export const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        bgGradient="linear(to-br, brand.50, white, purple.50)"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="lg" colorScheme="brand" />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

const useGuardToast = () => {
  const toast = useToast();
  const shownRef = React.useRef(false);

  return (message: string) => {
    if (shownRef.current) return;
    shownRef.current = true;
    toast({
      title: message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  };
};

export const RequireCreator: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading, isCreator, isAdmin } = useAuth();
  const location = useLocation();
  const showToast = useGuardToast();

  if (loading) {
    return (
      <Box
        bgGradient="linear(to-br, brand.50, white, purple.50)"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="lg" colorScheme="brand" />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isCreator && !isAdmin) {
    showToast('Доступ к этому разделу есть только у создателей контента');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const RequireParticipant: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading, isParticipant } = useAuth();
  const location = useLocation();
  const showToast = useGuardToast();

  if (loading) {
    return (
      <Box
        bgGradient="linear(to-br, brand.50, white, purple.50)"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="lg" colorScheme="brand" />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isParticipant) {
    showToast('Этот раздел предназначен только для участников');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const RequireModerator: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading, isModerator } = useAuth();
  const location = useLocation();
  const showToast = useGuardToast();

  if (loading) {
    return (
      <Box
        bgGradient="linear(to-br, brand.50, white, purple.50)"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="lg" colorScheme="brand" />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isModerator) {
    showToast('Доступ к модерации есть только у модераторов и администраторов');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const RequireAdmin: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const showToast = useGuardToast();

  if (loading) {
    return (
      <Box
        bgGradient="linear(to-br, brand.50, white, purple.50)"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="lg" colorScheme="brand" />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    showToast('Доступ к этому разделу есть только у администратора');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

