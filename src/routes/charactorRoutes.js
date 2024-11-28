import express from 'express';
import { prisma } from '../utils/prisma/index.js'

const router = express.Router();

// 캐릭터 생성 APi - JWT 필요


// 캐릭터 삭제 API - JWT 필요


// 캐릭터 상세 조회 API
router.get('/char/:charName', async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err.message
        });
    }
});

export default router;