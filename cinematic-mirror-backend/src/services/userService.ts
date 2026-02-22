import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import supabase from '../config/supabase';
import { generateToken } from '../utils/jwt';
import { creditsService } from './creditsService';
import type { User, UserPublic } from '../types/index';

// Gmail SMTP 邮件发送
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 统一发送邮件的辅助函数
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"影中镜 Cinematic Mirror" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error: any) {
    console.error('邮件发送失败:', error);
    throw new Error('邮件发送失败，请稍后重试');
  }
}

export class UserService {
  // 注册新用户
  async register(email: string, password: string, nickname: string): Promise<{ user: UserPublic; token: string }> {
    // 检查邮箱是否已存在
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      throw new Error('该邮箱已被注册');
    }

    // 检查昵称是否已存在
    const { data: existingNickname } = await supabase
      .from('users')
      .select('id')
      .eq('nickname', nickname)
      .single();

    if (existingNickname) {
      throw new Error('该片场代号已被使用');
    }

    // 加密密码
    const password_hash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // 创建用户
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        password_hash,
        nickname,
        avatar_url: `https://picsum.photos/seed/${userId}/200/200`
      })
      .select('id, email, nickname, avatar_url, created_at')
      .single();

    if (error) {
      throw new Error('注册失败: ' + error.message);
    }

    // 初始化用户积分
    await creditsService.initializeCredits(newUser.id);

    // 生成 JWT
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      nickname: newUser.nickname
    });

    return { user: newUser, token };
  }

  // 用户登录
  async login(email: string, password: string): Promise<{ user: UserPublic; token: string }> {
    // 查找用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('邮箱或密码错误');
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('邮箱或密码错误');
    }

    // 生成 JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname
    });

    // 返回不含密码的用户信息
    const { password_hash, ...userPublic } = user;
    return { user: userPublic, token };
  }

  // 获取用户信息
  async getUserById(userId: string): Promise<UserPublic | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, nickname, avatar_url, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  }

  // 更新用户信息
  async updateUser(userId: string, updates: { nickname?: string; avatar_url?: string }): Promise<UserPublic> {
    // 如果更新昵称，检查是否已被使用
    if (updates.nickname) {
      const { data: existingNickname } = await supabase
        .from('users')
        .select('id')
        .eq('nickname', updates.nickname)
        .neq('id', userId)
        .single();

      if (existingNickname) {
        throw new Error('该片场代号已被使用');
      }
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, nickname, avatar_url, created_at')
      .single();

    if (error) {
      throw new Error('更新失败: ' + error.message);
    }

    return updatedUser;
  }

  // 发送注册验证码
  async sendRegisterCode(email: string): Promise<void> {
    // 检查邮箱是否已注册
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      throw new Error('该邮箱已被注册');
    }

    // 检查1分钟内是否已发送过
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentCode } = await supabase
      .from('email_verification_codes')
      .select('id')
      .eq('email', email)
      .eq('used', false)
      .gte('created_at', oneMinuteAgo)
      .limit(1)
      .single();

    if (recentCode) {
      throw new Error('请稍后再试，验证码已发送');
    }

    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 存入数据库
    const { error: insertError } = await supabase
      .from('email_verification_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt,
      });

    if (insertError) {
      throw new Error('验证码生成失败');
    }

    // 通过 Gmail SMTP 发送邮件
    await sendEmail(
      email,
      '注册验证码 / Registration Code',
      `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #faf8f5; border: 1px solid #e8e0d4;">
          <h1 style="font-size: 24px; color: #5c4a3a; text-align: center; margin-bottom: 8px;">影中镜 Cinematic Mirror</h1>
          <p style="text-align: center; color: #8a7a6a; font-size: 12px; letter-spacing: 2px; margin-bottom: 32px;">REGISTRATION CODE</p>
          <p style="color: #5c4a3a; font-size: 14px; line-height: 1.8;">欢迎加入影中镜！您的注册验证码如下：</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #c0392b; background: #fff; padding: 16px 32px; border: 2px dashed #c0392b;">${code}</span>
          </div>
          <p style="color: #8a7a6a; font-size: 13px; line-height: 1.8;">验证码有效期 10 分钟，请尽快使用。<br/>This code expires in 10 minutes.</p>
          <p style="color: #bbb; font-size: 11px; margin-top: 32px; text-align: center;">如非本人操作，请忽略此邮件。</p>
        </div>
      `
    );
  }

  // 验证注册验证码并注册
  async registerWithCode(email: string, password: string, nickname: string, code: string): Promise<{ user: UserPublic; token: string }> {
    // 验证验证码
    const now = new Date().toISOString();
    const { data: verificationCode } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!verificationCode) {
      throw new Error('验证码无效或已过期');
    }

    // 标记验证码为已使用
    await supabase
      .from('email_verification_codes')
      .update({ used: true })
      .eq('id', verificationCode.id);

    // 调用原有注册逻辑
    return this.register(email, password, nickname);
  }

  // 发送密码重置验证码
  async sendResetCode(email: string): Promise<void> {
    // 查找用户
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      // 为安全起见，不暴露邮箱是否存在
      return;
    }

    // 检查1分钟内是否已发送过
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentCode } = await supabase
      .from('password_reset_codes')
      .select('id')
      .eq('user_id', user.id)
      .eq('used', false)
      .gte('created_at', oneMinuteAgo)
      .limit(1)
      .single();

    if (recentCode) {
      throw new Error('请稍后再试，验证码已发送');
    }

    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10分钟过期

    // 存入数据库
    const { error: insertError } = await supabase
      .from('password_reset_codes')
      .insert({
        user_id: user.id,
        code,
        expires_at: expiresAt,
      });

    if (insertError) {
      throw new Error('验证码生成失败');
    }

    // 通过 Gmail SMTP 发送邮件
    await sendEmail(
      email,
      '密码重置验证码 / Password Reset Code',
      `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #faf8f5; border: 1px solid #e8e0d4;">
          <h1 style="font-size: 24px; color: #5c4a3a; text-align: center; margin-bottom: 8px;">影中镜 Cinematic Mirror</h1>
          <p style="text-align: center; color: #8a7a6a; font-size: 12px; letter-spacing: 2px; margin-bottom: 32px;">PASSWORD RESET CODE</p>
          <p style="color: #5c4a3a; font-size: 14px; line-height: 1.8;">您正在重置密码，验证码如下：</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #c0392b; background: #fff; padding: 16px 32px; border: 2px dashed #c0392b;">${code}</span>
          </div>
          <p style="color: #8a7a6a; font-size: 13px; line-height: 1.8;">验证码有效期 10 分钟，请尽快使用。<br/>This code expires in 10 minutes.</p>
          <p style="color: #bbb; font-size: 11px; margin-top: 32px; text-align: center;">如非本人操作，请忽略此邮件。</p>
        </div>
      `
    );
  }

  // 用验证码重置密码
  async resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<void> {
    // 查找用户
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      throw new Error('邮箱或验证码错误');
    }

    // 查找有效的验证码
    const now = new Date().toISOString();
    const { data: resetCode } = await supabase
      .from('password_reset_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!resetCode) {
      throw new Error('验证码无效或已过期');
    }

    // 标记验证码为已使用
    await supabase
      .from('password_reset_codes')
      .update({ used: true })
      .eq('id', resetCode.id);

    // 更新密码
    const password_hash = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      throw new Error('密码更新失败');
    }
  }
}

export const userService = new UserService();
