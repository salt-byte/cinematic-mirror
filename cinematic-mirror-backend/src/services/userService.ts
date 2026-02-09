import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabase';
import { generateToken } from '../utils/jwt';
import { creditsService } from './creditsService';
import type { User, UserPublic } from '../types/index';

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
}

export const userService = new UserService();
