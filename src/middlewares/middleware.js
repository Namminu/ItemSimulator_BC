import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js'

// 사용자 인증 미들웨어
export default async function (req, res, next) {
    try {
        const { auth } = req.cookies;
        // 토큰 존재 유무 확인
        if (!auth) throw new Error('해당 토큰이 존재하지 않습니다.');

        // 토큰 타입 확인
        const [tokentype, token] = auth.split(' ');
        if (tokentype !== 'Bearer') throw new Error('토큰 타입이 올바른 형식이 아닙니다.');

        // JWT 검증
        const decodedToken = jwt.verify(token, 'ISBC-secret-key');
        const accountId = decodedToken.accountId;
        // 유저 탐색
        const account = await prisma.accounts.findFirst({
            where: { accountId: +accountId }
        });
        if (!account) throw new Error('사용자가 존재하지 않습니다..');

        req.account = {
            accountId: account.accountId,
            accountName: account.accountName,
            email: account.email,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        };
        next();
    } catch (err) {
        res.clearCookie('auth');
        switch (err.name) {
            case 'TokenExpiredError':
                return res.status(401).json({ message: '토큰 기한이 만료되었습니다.' });
            case 'JsonWebTokenError':
                return res.status(401).json({ message: '위험 여지가 있는 토큰입니다.' });
            default:
                return res.status(401).json({ message: err.message ?? '비정상적인 요청입니다.' });
        }
    }
}