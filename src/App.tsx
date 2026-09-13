import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CourseDataProvider } from './context/CourseDataContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SmartboardProvider } from './context/SmartboardContext';

import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import DayPage from './pages/DayPage';
import TopicPage from './pages/TopicPage';
import HandoutsPage from './pages/HandoutsPage';
import PidsPage from './pages/PidsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import QuizListPage from './pages/QuizListPage';
import QuizPlayerPage from './pages/QuizPlayerPage';
import CoursePlanPage from './pages/CoursePlanPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';

import AdminLoginPage from './admin/AdminLoginPage';
import AdminLayout from './admin/AdminLayout';
import RequireAdmin from './admin/RequireAdmin';
import AdminDashboardPage from './admin/AdminDashboardPage';
import AdminCoursePage from './admin/AdminCoursePage';
import AdminDaysPage from './admin/AdminDaysPage';
import AdminDayEditPage from './admin/AdminDayEditPage';
import AdminSchedulePage from './admin/AdminSchedulePage';
import AdminTopicsPage from './admin/AdminTopicsPage';
import AdminTopicEditPage from './admin/AdminTopicEditPage';
import AdminActivitiesPage from './admin/AdminActivitiesPage';
import AdminQuizzesPage from './admin/AdminQuizzesPage';
import AdminResourcesPage from './admin/AdminResourcesPage';
import AdminBackupPage from './admin/AdminBackupPage';
import AdminSettingsPage from './admin/AdminSettingsPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CourseDataProvider>
          <SmartboardProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/day/:dayNumber" element={<DayPage />} />
                  <Route path="/day/:dayNumber/:tab" element={<DayPage />} />
                  <Route path="/topic/:slug" element={<TopicPage />} />
                  <Route path="/resources/handouts" element={<HandoutsPage />} />
                  <Route path="/resources/pids" element={<PidsPage />} />
                  <Route path="/activities" element={<ActivitiesPage />} />
                  <Route path="/quiz" element={<QuizListPage />} />
                  <Route path="/quiz/:quizId" element={<QuizPlayerPage />} />
                  <Route path="/course-plan" element={<CoursePlanPage />} />
                  <Route path="/search" element={<SearchPage />} />

                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route
                    path="/admin"
                    element={
                      <RequireAdmin>
                        <AdminLayout />
                      </RequireAdmin>
                    }
                  >
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="course" element={<AdminCoursePage />} />
                    <Route path="days" element={<AdminDaysPage />} />
                    <Route path="days/:dayId" element={<AdminDayEditPage />} />
                    <Route path="schedule" element={<AdminSchedulePage />} />
                    <Route path="topics" element={<AdminTopicsPage />} />
                    <Route path="topics/:topicId" element={<AdminTopicEditPage />} />
                    <Route path="activities" element={<AdminActivitiesPage />} />
                    <Route path="quizzes" element={<AdminQuizzesPage />} />
                    <Route path="resources" element={<AdminResourcesPage />} />
                    <Route path="resources/:type" element={<AdminResourcesPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="backup" element={<AdminBackupPage />} />
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </SmartboardProvider>
        </CourseDataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
