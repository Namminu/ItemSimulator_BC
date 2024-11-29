import express from 'express';
import { prisma } from '../../utils/prisma/index.js'
import authMiddlewares from '../../middlewares/middleware.js'

const router = express.Router();

// 아이템 구매 API - JWT
router.post('/item/:charId/buyItem', authMiddlewares, async (req, res, next) => {
    try {
        if (!req.account) return res.status(401).json({ message: "로그인이 필요합니다." });
        const charId = +req.params.charId;
        const myChar = await prisma.characters.findFirst({ where: { characterId: charId } });
        // 데이터 유효성 검사
        if (!myChar) return res.status(404).json({ message: "해당하는 캐릭터가 존재하지 않습니다." });

        // body 데이터 기반으로 아이템, 총 가격 계산
        const { itemId, count } = req.body;
        const targetItem = await prisma.items.findFirst({ where: { itemId } });
        const totalPrice = targetItem.price * count;

        // 잔액이 부족할 경우
        if (myChar.money < totalPrice)
            return res.status(400).json({ message: "재화가 부족해 아이템 구매에 실패했습니다.", currentMoney: myChar.money });

        // 구매 성공 시 - 보유 금액 감소
        const letMoney = myChar.money - (targetItem.price * count);
        await prisma.characters.update({
            where: { characterId: charId },
            data: { money: letMoney }
        });

        // char_Invens 테이블에 데이터 추가
        await prisma.char_Invens.create({
            data: {
                characterId: charId,
                itemId: itemId,
                itemCount: count
            }
        });

        return res.status(200).json({ message: "아이템 구매에 성공했습니다.", currentMoney: myChar.money })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err.message
        });
    }
});

// 아이템 판매 API - JWT
router.delete('/item/:charId/sellItem', authMiddlewares, async (req, res, next) => {
    try {
        if (!req.account) return res.status(401).json({ message: "로그인이 필요합니다." });
        const charId = +req.params.charId;
        const myChar = await prisma.characters.findFirst({ where: { characterId: charId } });
        // 데이터 유효성 검사
        if (!myChar) return res.status(404).json({ message: "해당하는 캐릭터가 존재하지 않습니다." });


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err.message
        });
    }
});

// 캐릭터 인벤 아이템 목록 조회 API - JWT
router.get('/char/:charId/invenSear', authMiddlewares, async (req, res, next) => {
    try {
        if (!req.account) return res.status(401).json({ message: "로그인이 필요합니다." });
        const charId = +req.params.charId;
        const myChar = await prisma.characters.findFirst({ where: { characterId: charId } });
        // 데이터 유효성 검사
        if (!myChar) return res.status(404).json({ message: "해당하는 캐릭터가 존재하지 않습니다." });


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err.message
        });
    }
});

// 캐릭터 장착 아이템 목록 조회 API
router.get('/char/:charId/setItemSear', async (req, res, next) => {

});

// 아이템 장착 AP - JWT
router.post('/char/:charId/setUpItem', authMiddlewares, async (req, res, next) => {
    try {
        if (!req.account) return res.status(401).json({ message: "로그인이 필요합니다." });
        const charId = +req.params.charId;
        const myChar = await prisma.characters.findFirst({ where: { characterId: charId } });
        // 데이터 유효성 검사
        if (!myChar) return res.status(404).json({ message: "해당하는 캐릭터가 존재하지 않습니다." });


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err.message
        });
    }
});

// 아이템 해제 AP - JWT
router.delete('/char/:charId/setOffItem', authMiddlewares, async (req, res, next) => {
    try {
        if (!req.account) return res.status(401).json({ message: "로그인이 필요합니다." });
        const charId = +req.params.charId;
        const myChar = await prisma.characters.findFirst({ where: { characterId: charId } });
        // 데이터 유효성 검사
        if (!myChar) return res.status(404).json({ message: "해당하는 캐릭터가 존재하지 않습니다." });


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err.message
        });
    }
});

export default router;