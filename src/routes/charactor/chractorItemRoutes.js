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
        const alreadyItem = await prisma.char_Invens.findFirst({ where: { itemId } })
        if (!alreadyItem) {
            await prisma.char_Invens.create({
                data: {
                    characterId: charId,
                    itemId: itemId,
                    itemCount: count,
                    itemName: targetItem.name
                }
            });
        }
        else {
            alreadyItem.itemCount += count;
            await prisma.char_Invens.update({
                where: { itemId },
                data: { itemCount: alreadyItem.itemCount }
            });
        }

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

        // 아이템 보유중 검사
        const { itemId, count } = req.body;
        const sellItem = await prisma.char_Invens.findFirst({ where: { itemId } });
        if (!sellItem) return res.status(404).json({ message: "해당 아이템이 존재하지 않습니다." });
        if (count > sellItem.itemCount) return res.status(400).json({ message: "보유한 아이템 수량이 부족합니다." });

        // 판매 로직
        const sellingItem = await prisma.items.findUnique({ where: { itemId } });
        const sellPay = Math.floor((sellingItem.price * 0.6) * count);
        // 캐릭터 보유 재화 업데이트
        const restMoney = myChar.money + sellPay;
        await prisma.characters.update({
            where: { characterId: charId },
            data: { money: restMoney }
        });
        // 캐릭터 인벤토리 아이템 갯수 업데이트
        const restCount = sellItem.itemCount - count;
        await prisma.char_Invens.update({
            where: { itemId },
            data: { itemCount: restCount }
        });

        // if (inv_settingItem.itemCount <= 1) {
        //     await prisma.char_Invens.delete({
        //         where: { itemId: settingItemCode }
        //     });
        // }
        // else {
        //     const updateCount = inv_settingItem.itemCount - 1;
        //     await prisma.char_Invens.update({
        //         where: { itemId: settingItemCode },
        //         data: {
        //             itemCount: updateCount
        //         }
        //     });
        // }

        return res.status(200).json({ message: "아이템을 판매하였습니다.", currentMoney: myChar.money });
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

        const items = await prisma.char_Invens.findMany({ where: { characterId: charId } });
        const itemList = items.map(item => ({
            item_code: item.itemId,
            item_name: item.itemName,
            item_count: item.itemCount
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

// 캐릭터 장착 아이템 목록 조회 API
router.get('/char/:charId/setItemSear', async (req, res, next) => {
    try {
        const charId = +req.params.charId;
        const items = await prisma.char_Items.findMany({ where: { characterId: { equals: charId } } });

        if (!items.length) return res.status(404).json({ message: "장착한 아이템이 없습니다." });
        const itemList = items.map(item => ({
            item_code: item.itemId,
            item_name: item.itemName,
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

// 아이템 장착 AP - JWT
router.post('/char/:charId/setUpItem', authMiddlewares, async (req, res, next) => {
    try {
        if (!req.account) return res.status(401).json({ message: "로그인이 필요합니다." });
        const charId = +req.params.charId;
        const myChar = await prisma.characters.findFirst({ where: { characterId: charId } });
        // 데이터 유효성 검사
        if (!myChar) return res.status(404).json({ message: "해당하는 캐릭터가 존재하지 않습니다." });

        // 이전 장착 여부 및 유효성 검사
        const settingItemCode = +req.body.itemId;
        const inv_settingItem = await prisma.char_Invens.findFirst({ where: { itemId: settingItemCode } });
        if (!inv_settingItem) return res.status(404).json({ message: "인벤토리에 존재하지 않는 아이템입니다." });
        const set_settingItem = await prisma.char_Items.findFirst({ where: { itemId: settingItemCode } });
        if (set_settingItem) return res.status(400).json({ message: "이미 장착된 아이템입니다." });
        console.log(inv_settingItem);

        const setUpItem = await prisma.items.findFirst({ where: { itemId: settingItemCode } });
        // 캐릭터 능력치 조정
        const updateHealth = myChar.health + setUpItem.health;
        const updatePower = myChar.power + setUpItem.power;
        await prisma.characters.update({
            where: { characterId: charId },
            data: {
                power: updatePower,
                health: updateHealth
            }
        });

        // 장비칸으로 데이터 이동
        await prisma.char_Items.create({
            data: {
                characterId: myChar.characterId,
                itemId: settingItemCode,
                itemName: setUpItem.name,
            }
        });

        // 인벤토리에서 데이터 조정
        if (inv_settingItem.itemCount <= 1) {
            await prisma.char_Invens.delete({
                where: { itemId: settingItemCode }
            });
        }
        else {
            const updateCount = inv_settingItem.itemCount - 1;
            await prisma.char_Invens.update({
                where: { itemId: settingItemCode },
                data: {
                    itemCount: updateCount
                }
            });
        }

        const currentStat = { health: myChar.health, power: myChar.power };
        return res.status(200).json({ message: "아이템을 장착했습니다.", currentStat })
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
        console.log(charId);
        const myChar = await prisma.characters.findFirst({ where: { characterId: charId } });
        console.log(myChar);
        // 데이터 유효성 검사
        if (!myChar) return res.status(404).json({ message: "해당하는 캐릭터가 존재하지 않습니다." });

        const itemId = +req.body.itemId;
        const setItem = await prisma.char_Items.findFirst({ where: { itemId } });
        if (!setItem) return res.status(400).json({ message: "장착하지 않은 아이템입니다." });

        const targetItem = await prisma.items.findFirst({ where: { itemId } });

        // 캐릭터 능력치 조정
        const updateHealth = myChar.health - targetItem.health;
        const updatePower = myChar.power - targetItem.power;
        await prisma.characters.update({
            where: { characterId: charId },
            data: {
                health: updateHealth,
                power: updatePower
            }
        });

        // 인벤토리로 데이터 이동
        const inv_Item = await prisma.char_Invens.findFirst({ where: { itemId } });
        if (!inv_Item) {
            await prisma.char_Invens.create({
                data: {
                    characterId: charId,
                    itemCount: 1,
                    itemId: itemId
                }
            });
        } else {
            const inv_count = inv_Item.itemCount++;
            await prisma.char_Invens.update({
                where: { itemId },
                data: {
                    itemCount: inv_count
                }
            });
        }

        const tempId = await prisma.char_Items.findFirst({ where: { itemId } });
        console.log(tempId);
        // 장비칸에서 데이터 삭제
        await prisma.char_Items.delete({
            where: { itemId }
        });

        const currentStat = { health: myChar.health, power: myChar.power };
        return res.status(200).json({ message: "아이탬을 해제하였습니다.", currentStat })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "서버 에러가 발생했습니다",
            errorCode: err.message
        });
    }
});

export default router;