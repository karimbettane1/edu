export function dashboardPath(user) {
  if (user?.role === 'admin') return '/admin'
  if (user?.role === 'contributor') return '/contributeur'
  return '/etudiant'
}

export const ROLE_LABELS = {
  admin: 'admin.roleAdmin',
  contributor: 'admin.roleContributeur',
  student: 'admin.roleEtudiant',
}
