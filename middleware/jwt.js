import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    const jwtSecretKey = process.env.JWT_SECRET;
    const token = jwt.sign({ id:user._id,email:user.email, role: 'user' }, jwtSecretKey, { expiresIn: '1h' });
    return token;
};

