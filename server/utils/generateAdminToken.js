import jwt from 'jsonwebtoken'

const generateAdminToken = (id, role, scope) => {
    const accessToken = jwt.sign({ id, role, scope }, process.env.JWT_SECRET, {
        expiresIn: '15m'
    })
    const refreshToken = jwt.sign({ id, role, scope }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })
    return { accessToken, refreshToken }
}

export default generateAdminToken
