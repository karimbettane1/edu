import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import ProtectedRoute from '../components/routing/ProtectedRoute'
import Loader from '../components/ui/Loader'
import HomePage from '../pages/public/HomePage'

const FilieresPage = lazy(() => import('../pages/public/FilieresPage'))
const FiliereDetailPage = lazy(() => import('../pages/public/FiliereDetailPage'))
const ResourcesPage = lazy(() => import('../pages/public/ResourcesPage'))
const ResourceDetailPage = lazy(() => import('../pages/public/ResourceDetailPage'))
const QuizListPage = lazy(() => import('../pages/public/QuizListPage'))
const QuizPlayPage = lazy(() => import('../pages/public/QuizPlayPage'))
const ProjectsPage = lazy(() => import('../pages/public/ProjectsPage'))
const AboutPage = lazy(() => import('../pages/public/AboutPage'))
const ContactPage = lazy(() => import('../pages/public/ContactPage'))
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const ErrorPage = lazy(() => import('../pages/errors/ErrorPage'))
const StudentDashboardPage = lazy(() => import('../pages/student/StudentDashboardPage'))
const FavoritesPage = lazy(() => import('../pages/student/FavoritesPage'))
const DownloadsPage = lazy(() => import('../pages/student/DownloadsPage'))
const NotificationsPage = lazy(() => import('../pages/student/NotificationsPage'))
const ProfilePage = lazy(() => import('../pages/student/ProfilePage'))
const ContributorDashboardPage = lazy(() => import('../pages/contributor/ContributorDashboardPage'))
const ContributorResourcesPage = lazy(() => import('../pages/contributor/ContributorResourcesPage'))
const ContributorResourceFormPage = lazy(() => import('../pages/contributor/ContributorResourceFormPage'))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const AdminResourcesPage = lazy(() => import('../pages/admin/AdminResourcesPage'))
const AdminResourceFormPage = lazy(() => import('../pages/admin/AdminResourceFormPage'))
const AdminPedagogyPage = lazy(() => import('../pages/admin/AdminPedagogyPage'))
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'))
const AdminCommentsPage = lazy(() => import('../pages/admin/AdminCommentsPage'))
const AdminReportsPage = lazy(() => import('../pages/admin/AdminReportsPage'))
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'))
const AdminAuditLogPage = lazy(() => import('../pages/admin/AdminAuditLogPage'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loader className="min-h-[60vh]" />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/filieres" element={<FilieresPage />} />
            <Route path="/filieres/:slug" element={<FiliereDetailPage />} />
            <Route path="/ressources" element={<ResourcesPage />} />
            <Route path="/ressources/:id" element={<ResourceDetailPage />} />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <QuizListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/:id"
              element={
                <ProtectedRoute>
                  <QuizPlayPage />
                </ProtectedRoute>
              }
            />
            <Route path="/projets" element={<ProjectsPage />} />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/403" element={<ErrorPage status={403} />} />
            <Route path="/500" element={<ErrorPage status={500} />} />
            <Route path="*" element={<ErrorPage status={404} />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/etudiant"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/etudiant/favoris"
              element={
                <ProtectedRoute roles={['student']}>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/etudiant/telechargements"
              element={
                <ProtectedRoute roles={['student']}>
                  <DownloadsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/etudiant/notifications"
              element={
                <ProtectedRoute roles={['student']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/profil" element={<ProfilePage />} />

            <Route
              path="/contributeur"
              element={
                <ProtectedRoute roles={['contributor']}>
                  <ContributorDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contributeur/ressources"
              element={
                <ProtectedRoute roles={['contributor']}>
                  <ContributorResourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contributeur/ressources/nouvelle"
              element={
                <ProtectedRoute roles={['contributor']}>
                  <ContributorResourceFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contributeur/ressources/:id/modifier"
              element={
                <ProtectedRoute roles={['contributor']}>
                  <ContributorResourceFormPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ressources"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminResourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ressources/nouvelle"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminResourceFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ressources/:id/modifier"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminResourceFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pedagogie"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPedagogyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/utilisateurs"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/commentaires"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminCommentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/signalements"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/parametres"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/journal"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminAuditLogPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
