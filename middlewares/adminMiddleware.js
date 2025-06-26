module.exports = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            error: 'No autenticado' 
        });
    }
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Acceso denegado: Se requiere rol de administrador' 
        });
    }
    next();
};