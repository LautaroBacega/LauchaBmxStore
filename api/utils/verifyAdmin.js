import User from "../models/user.model.js"
import { errorHandler } from "./error.js"

export const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return next(errorHandler(404, "Usuario no encontrado"))
    }

    // Check if user is admin (you can modify this logic)
    // For now, we'll check if the user email is in admin list
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []

    if (!adminEmails.includes(user.email)) {
      return next(errorHandler(403, "Acceso denegado. Se requieren permisos de administrador."))
    }

    next()
  } catch (error) {
    next(error)
  }
}
