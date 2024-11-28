import express from 'express';
import { prisma } from '../utils/prisma/index.js'

const router = express.Router();

// 아이템 생성 API
router.post('/item/ItemMake', async (req, res, next) => {
    try {
        const { name, stat, price } = req.body;
        // 데이터 유효성 검사
        if (!name || !stat || !price) return res.status(400).json({ message: "수치를 올바르게 입력해야 합니다." });

        // 아이템 생성
        const item = await prisma.items.create({
            data: {
                name: name,
                power: stat.power,
                health: stat.health,
                price: price
            }
        });
        return res.status(201).json({ message: "아이템이 성공적으로 생성되었습니다.", item: item.name });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err.message
        });
    }
});

// 아이템 수정 API
router.patch('/item/:itemId/itemFix', async (req, res, next) => {
    try {
        const itemId = +req.params.itemId;
        const targetItem = await prisma.items.findFirst({ where: { itemId } });
        if (!targetItem) return res.status(404).json({ message: "해당하는 아이템이 존재하지 않습니다." });

        const { name, stat, price = null } = req.body;
        if (price) return res.status(400).json({ message: "가격은 수정할 수 없습니다." });
        if (!name) return res.status(400).json({ message: "아이템의 이름은 필수 항목입니다." });

        await prisma.items.update({
            where: { itemId },
            data: {
                name: name,
                health: stat.health !== undefined ? stat.health : 0,
                power: stat.power !== undefined ? stat.power : 0
            }
        })

        return res.status(200).json({ message: "아이템의 정보가 수정되었습니다." });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err.message
        });
    }
});

// 아이템 목록 조회 API
router.get('/item/itemSear', async (req, res, next) => {
    try {
        const items = await prisma.items.findMany();
        const itemList = items.map(item => ({
            item_code: item.itemId,
            item_name: item.name,
            item_price: item.price
        }));

        return res.status(200).json(itemList);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err.message
        });
    }
});

// 아이템 상세 조회 API
router.get('/item/:itemId/itemSear', async (req, res, next) => {
    try {
        const itemId = +req.params.itemId;
        const targetItem = await prisma.items.findFirst({ where: { itemId } });
        if (!targetItem) return res.status(404).json({ message: "해당하는 아이템이 존재하지 않습니다." });

        const resItem = {
            item_Id: targetItem.itemId,
            item_name: targetItem.name,
            item_stat: { health: targetItem.health, power: targetItem.power },
            item_price: targetItem.price
        }

        return res.status(200).json(resItem);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err
        });
    }
});

export default router;