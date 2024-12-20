import express from 'express';
import { prisma } from '../utils/prisma/index.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 회원가입 API
router.post('/signUp', async (req, res, next) => {
  try {
    const { email, password, passwordCheck, accountName } = req.body;

    // 받은 데이터 유효성 검사
    const isExistAccount = await prisma.Accounts.findFirst({ where: { email } });
    if (isExistAccount) return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    const idRegex = /^[a-z0-9]+$/;
    if (!idRegex.test(email)) return res.status(400).json({ message: "올바르지 않은 형식의 아이디입니다." });
    if (password.length < 6) return res.status(400).json({ message: "비밀번호는 최소 6자리 이상이어야 합니다." });
    if (password !== passwordCheck) return res.status(400).json({ message: "비밀번호 확인이 올바르지 않습니다." });
    const isExistName = await prisma.Accounts.findFirst({ where: { accountName } });
    if (isExistName) return res.status(409).json({ message: "이미 존재하는 계정 이름입니다." });

    // password 암호화
    const hashedPassword = await bcrypt.hash(password, 10);
    // Accounts 테이블에 데이터 추가
    const newAccount = await prisma.Accounts.create({
      data: {
        email,
        password: hashedPassword,
        accountName
      }
    });

    // res 데이터
    const { password: _, ...responseData } = newAccount;
    return res.status(201).json({ message: "회원 가입이 완료되었습니다.", data: responseData });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "서버 에러가 발생했습니다",
      errorCode: err.message
    });
  }
});

// 로그인 API
router.post('/signIn', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 받은 데이터 유효성 검사
    const alreayAccount = await prisma.Accounts.findFirst({ where: { email } });
    if (!alreayAccount) return res.status(400).json({ message: "등록되지 않은 아이디입니다." });
    else if (!(await bcrypt.compare(password, alreayAccount.password)))
      return res.status(400).json({ message: "잘못된 비밀번호입니다." });

    // JWT 토큰 생성
    const token = jwt.sign({ accountId: alreayAccount.accountId }, 'ISBC-secret-key');
    res.cookie('auth', `Bearer ${token}`);

    return res.status(201).json({ message: "로그인 되었습니다." });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "서버 에러가 발생했습니다",
      errorCode: err.message
    });
  }
});

export default router;