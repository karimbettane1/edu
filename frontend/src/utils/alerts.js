import Swal from 'sweetalert2'

const isDark = () => document.documentElement.classList.contains('dark')

const themed = () => ({
  background: isDark() ? '#1e293b' : '#ffffff',
  color: isDark() ? '#f8fafc' : '#0f172a',
  confirmButtonColor: '#2563eb',
  cancelButtonColor: '#64748b',
  customClass: {
    popup: 'rounded-2xl',
    confirmButton: 'rounded-xl',
    cancelButton: 'rounded-xl',
  },
})

function toast(icon, title) {
  return Swal.fire({
    ...themed(),
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: 2800,
    timerProgressBar: true,
  })
}

export const successToast = (title) => toast('success', title)
export const errorToast = (title) => toast('error', title)
export const infoToast = (title) => toast('info', title)
export const warningToast = (title) => toast('warning', title)

export function confirmDialog({ title, text, confirmText = 'Confirmer', cancelText = 'Annuler', icon = 'warning' }) {
  return Swal.fire({
    ...themed(),
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  }).then((result) => result.isConfirmed)
}
