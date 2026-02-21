import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { QuizSessionResultsPage } from './pages/QuizSessionResultsPage';
import { QuizPlayResultsPage } from './pages/QuizPlayResultsPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/quiz/new" element={<QuizCreatePage />} />
        <Route path="/quiz/:id/edit" element={<QuizEditPage />} />
        <Route path="/quiz/:id" element={<QuizViewPage />} />
        <Route path="/quiz/:id/questions" element={<QuizQuestionsPage />} />
        <Route path="/quiz/:id/session" element={<QuizSessionPage />} />
        <Route path="/play" element={<QuizPlayPage />} />
        <Route path="/session/:sessionId/results" element={<QuizSessionResultsPage />} />
        <Route path="/play/:code/results" element={<QuizPlayResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
