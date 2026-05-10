import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { QuizPage } from './pages/QuizPage';
import { QuizCreatePage } from './pages/QuizCreatePage';
import { QuizEditPage } from './pages/QuizEditPage';
import { QuizViewPage } from './pages/QuizViewPage';
import { QuizQuestionsPage } from './pages/QuizQuestionsPage';
import { QuizSessionPage } from './pages/QuizSessionPage';
import { QuizPlayPage } from './pages/QuizPlayPage';
import { QuizPlayResultsPage } from './pages/QuizPlayResultsPage';
import { MyResultsPage } from './pages/MyResultsPage';
import { SessionsPage } from './pages/SessionsPage';
import { ModerationPage } from './pages/ModerationPage';
import { AdminPage } from './pages/AdminPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { QuizLeaderboardPage } from './pages/QuizLeaderboardPage';
import { ModerationQuizCatalogPage } from './pages/ModerationQuizCatalogPage';
import { ModerationQuizReviewPage } from './pages/ModerationQuizReviewPage';
import { RequireAuth, RequireCreator, RequireModerator, RequireAdmin, RequireParticipant } from './components/RouteGuards';

const QuizSessionPageWithKey: React.FC = () => {
  const { pathname } = useLocation();
  return <QuizSessionPage key={pathname} />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/how-it-works"
          element={
            <RequireAuth>
              <HowItWorksPage />
            </RequireAuth>
          }
        />
        <Route
          path="/leaderboard/:quizId"
          element={
            <RequireAuth>
              <QuizLeaderboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/quiz"
          element={
            <RequireCreator>
              <QuizPage />
            </RequireCreator>
          }
        />
        <Route
          path="/quiz/new"
          element={
            <RequireCreator>
              <QuizCreatePage />
            </RequireCreator>
          }
        />
        <Route
          path="/quiz/:id/edit"
          element={
            <RequireCreator>
              <QuizEditPage />
            </RequireCreator>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <RequireCreator>
              <QuizViewPage />
            </RequireCreator>
          }
        />
        <Route
          path="/quiz/:id/questions"
          element={
            <RequireCreator>
              <QuizQuestionsPage />
            </RequireCreator>
          }
        />
        <Route
          path="/quiz/:id/session/:sessionId"
          element={
            <RequireCreator>
              <QuizSessionPageWithKey />
            </RequireCreator>
          }
        />
        <Route
          path="/quiz/:id/session"
          element={
            <RequireCreator>
              <QuizSessionPageWithKey />
            </RequireCreator>
          }
        />
        <Route
          path="/play"
          element={
            <RequireParticipant>
              <QuizPlayPage />
            </RequireParticipant>
          }
        />
        <Route
          path="/play/:code/results"
          element={
            <RequireParticipant>
              <QuizPlayResultsPage />
            </RequireParticipant>
          }
        />
        <Route
          path="/my-results"
          element={
            <RequireParticipant>
              <MyResultsPage />
            </RequireParticipant>
          }
        />
        <Route
          path="/sessions"
          element={
            <RequireCreator>
              <SessionsPage />
            </RequireCreator>
          }
        />
        <Route
          path="/moderation"
          element={
            <RequireModerator>
              <ModerationPage />
            </RequireModerator>
          }
        />
        <Route
          path="/moderation/quizzes"
          element={
            <RequireModerator>
              <ModerationQuizCatalogPage />
            </RequireModerator>
          }
        />
        <Route
          path="/moderation/quizzes/:id"
          element={
            <RequireModerator>
              <ModerationQuizReviewPage />
            </RequireModerator>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
