import express from 'express';
import { prisma } from '../utils/prisma/index.js'

const router = express.Router();

// 아이템 생성 API
router.post('/', async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err
        });
    }
});

// 아이템 수정 API
router.patch('/item/:itemId', async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err
        });
    }
});

// 아이템 목록 조회 API
router.get('/item', async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err
        });
    }
});

// 아이템 상세 조회 API
router.get('/item/:itemId', async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err
        });
    }
});

export default router;