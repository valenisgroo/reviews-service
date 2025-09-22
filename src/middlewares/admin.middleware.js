// Middleware para verificar permisos de admin
export function isAdmin(req, res, next) {
  console.log('El user es:', req.user) // Log para depurar
  if (req.user?.permissions?.includes('admin')) {
    return next()
  }
  return res.status(403).json({ message: 'Forbidden: Admins only' })
}
