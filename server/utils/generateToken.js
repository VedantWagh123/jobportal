import jwt from 'jsonwebtoken'

const generateToken = (id) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '15m'
    })
    const refreshToken = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })
    return { accessToken, refreshToken }
}

export default generateToken