import express from 'express';
import { prisma } from '../utils/prisma/index.js'
import authMiddlewares from '../middlewares/middleware.js'

const router = express.Router();

// 캐릭터 생성 APi - JWT 필요
router.post('/char/charMake', authMiddlewares, async (req, res, next) => {
    try {
        if (!req.account) return res.status(401).json({ message: "로그인이 필요합니다." });
        const accountId = req.account.accountId;
        const { charName } = req.body;
        if (!charName) return res.status(400).json({ message: "닉네임을 입력해주세요." });

        // 이름 유효성 검사
        const isalreayName = await prisma.characters.findFirst({ where: { name: charName } });
        if (isalreayName) return res.status(409).json({ message: "이미 존재하는 닉네임입니다." });

        // 캐릭터 생성 로직
        const character = await prisma.characters.create({
            data: {
                accountId: accountId,
                name: charName
            }
        });

        // res 데이터
        const characterId = character.characterId;
        return res.status(201).json({ message: "캐릭터 생성이 완료되었습니다.", ChracterID: characterId });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err.message
        });
    }
});

// 캐릭터 삭제 API - JWT 필요
router.delete('/char/:charId/charDele', authMiddlewares, async (req, res, next) => {
    try {
        if (!req.account) return res.status(401).json({ message: "로그인이 필요합니다." });
        const charId = +req.params.charId;               // 사용자가 삭제하려는 캐릭터 ID
        const jwtID = req.account.accountId;             // 사용자의 JWT 로 받은 계정의 ID
        // 삭제하려는 캐릭터 데이터 전체
        const character = await prisma.characters.findFirst({ where: { characterId: charId } });

        // 데이터 유효성 검사
        if (!character) return res.status(404).json({ message: "해당하는 캐릭터가 존재하지 않습니다." });
        if (jwtID !== character.accountId) return res.status(403).json({ message: "타인의 캐릭터는 삭제할 수 없습니다." });

        await prisma.characters.delete({
            where: { characterId: charId }
        });

        return res.status(200).json({ message: "캐릭터가 정상적으로 삭제되었습니다." });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err.message
        });
    }
});

// 캐릭터 상세 조회 API - JWT 사용
router.get('/char/:charId/charSear', authMiddlewares, async (req, res, next) => {
    try {
        if (!req.account) return res.status(401).json({ message: "로그인이 필요합니다." });
        const charId = +req.params.charId;
        const targetChar = await prisma.characters.findFirst({ where: { characterId: charId } });

        // 데이터 유효성 검사
        if (!targetChar) return res.status(404).json({ message: "해당하는 캐릭터가 존재하지 않습니다." });

        const jwtID = req.account.accountId;
        let data;
        // 자신의 캐릭터가 아닐 경우
        if (jwtID !== targetChar.accountId) {
            data = {
                name: targetChar.name,
                health: targetChar.health,
                power: targetChar.power
            }
            return res.status(200).json({ data });
        }
        // 자신의 캐릭터일 경우
        else {
            data = {
                name: targetChar.name,
                health: targetChar.health,
                power: targetChar.power,
                money: targetChar.money
            }
            return res.status(200).json({ data });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err.message
        });
    }
});

export default router;