export function isAdmin(req, res, next) {
  if (req.user?.permissions?.includes('admin')) {
    return next()
  }
  return res.status(403).json({ message: 'No tiene permisos de Administrador' })
}
