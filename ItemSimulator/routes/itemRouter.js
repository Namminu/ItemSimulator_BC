import express from 'express';

const router = express.Router();

// 회원가입 api
router.post('/item/account/', async (req, res, next) => {

});

// 로그인 api
router.get('/item/account/', async (req, res, next) => {

});

// 캐릭터 생성 api
router.post('/item/cha/:chaID', async (req, res, next) => {

});

// 캐릭터 삭제 api
router.delete('/item/cha/:chaID', async (req, res, next) => {

});

// 캐릭터 상세 조회 api
router.get('/item/cha/:chaID', async (req, res, next) => {

});

// 아이템 생성 api
router.post('/item/items/:newItem', async (req, res, next) => {

});

// 아이템 수정 api
router.patch('/item/items/:fixItem', async (req, res, next) => {

});

// 아이템 목록 조회 api
router.get('/item/items/', async (req, res, next) => {

});


export default router;