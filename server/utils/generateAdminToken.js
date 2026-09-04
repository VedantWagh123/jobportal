import jwt from 'jsonwebtoken'

const generateAdminToken = (id, role, scope) => {
    return jwt.sign({ id, role, scope }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

export default generateAdminToken
