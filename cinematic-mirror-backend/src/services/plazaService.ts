import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabase.js';
import type { PlazaPost, PostComment, PaginatedResponse } from '../types/index.js';

export class PlazaService {
  // 获取帖子列表（分页）
  async getPosts(
    page: number = 1,
    limit: number = 10,
    currentUserId?: string
  ): Promise<PaginatedResponse<PlazaPost>> {
    const offset = (page - 1) * limit;

    // 获取帖子
    const { data: posts, error, count } = await supabase
      .from('plaza_posts')
      .select(`
        *,
        user:users!user_id(id, email, nickname, avatar_url)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error('获取帖子失败: ' + error.message);
    }

    // 如果有当前用户，检查是否已点赞
    let postsWithLikeStatus = posts || [];
    if (currentUserId && posts) {
      const postIds = posts.map(p => p.id);
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', postIds);

      const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
      postsWithLikeStatus = posts.map(post => ({
        ...post,
        is_liked: likedPostIds.has(post.id)
      }));
    }

    return {
      items: postsWithLikeStatus,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  // 获取单个帖子
  async getPost(postId: string, currentUserId?: string): Promise<PlazaPost | null> {
    const { data: post, error } = await supabase
      .from('plaza_posts')
      .select(`
        *,
        user:users!user_id(id, email, nickname, avatar_url)
      `)
      .eq('id', postId)
      .single();

    if (error || !post) {
      return null;
    }

    // 检查是否已点赞
    if (currentUserId) {
      const { data: like } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .single();

      return { ...post, is_liked: !!like };
    }

    return post;
  }

  // 创建帖子
  async createPost(
    userId: string,
    content: string,
    imageUrls: string[] = [],
    inspirationTags: string[] = [],
    location?: string
  ): Promise<PlazaPost> {
    const postId = uuidv4();

    const { data: post, error } = await supabase
      .from('plaza_posts')
      .insert({
        id: postId,
        user_id: userId,
        content,
        image_urls: imageUrls,
        inspiration_tags: inspirationTags,
        location,
        likes_count: 0,
        comments_count: 0
      })
      .select(`
        *,
        user:users!user_id(id, email, nickname, avatar_url)
      `)
      .single();

    if (error) {
      throw new Error('创建帖子失败: ' + error.message);
    }

    return post;
  }

  // 删除帖子
  async deletePost(postId: string, userId: string): Promise<void> {
    // 检查是否是帖子作者
    const { data: post } = await supabase
      .from('plaza_posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post || post.user_id !== userId) {
      throw new Error('无权删除此帖子');
    }

    const { error } = await supabase
      .from('plaza_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      throw new Error('删除帖子失败: ' + error.message);
    }
  }

  // 点赞帖子
  async likePost(postId: string, userId: string): Promise<void> {
    // 检查是否已点赞
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      throw new Error('已经点赞过了');
    }

    // 添加点赞记录
    const { error: likeError } = await supabase
      .from('post_likes')
      .insert({
        id: uuidv4(),
        post_id: postId,
        user_id: userId
      });

    if (likeError) {
      throw new Error('点赞失败: ' + likeError.message);
    }

    // 更新点赞计数
    await supabase.rpc('increment_likes_count', { p_post_id: postId });
  }

  // 取消点赞
  async unlikePost(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) {
      throw new Error('取消点赞失败: ' + error.message);
    }

    // 更新点赞计数
    await supabase.rpc('decrement_likes_count', { p_post_id: postId });
  }

  // 获取帖子评论
  async getComments(postId: string): Promise<PostComment[]> {
    const { data: comments, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        user:users!user_id(id, email, nickname, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error('获取评论失败: ' + error.message);
    }

    return comments || [];
  }

  // 添加评论
  async addComment(postId: string, userId: string, content: string): Promise<PostComment> {
    const commentId = uuidv4();

    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({
        id: commentId,
        post_id: postId,
        user_id: userId,
        content
      })
      .select(`
        *,
        user:users!user_id(id, email, nickname, avatar_url)
      `)
      .single();

    if (error) {
      throw new Error('添加评论失败: ' + error.message);
    }

    // 更新评论计数
    await supabase.rpc('increment_comments_count', { p_post_id: postId });

    return comment;
  }

  // 删除评论
  async deleteComment(commentId: string, userId: string): Promise<void> {
    // 检查是否是评论作者
    const { data: comment } = await supabase
      .from('post_comments')
      .select('user_id, post_id')
      .eq('id', commentId)
      .single();

    if (!comment || comment.user_id !== userId) {
      throw new Error('无权删除此评论');
    }

    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      throw new Error('删除评论失败: ' + error.message);
    }

    // 更新评论计数
    await supabase.rpc('decrement_comments_count', { p_post_id: comment.post_id });
  }
}

export const plazaService = new PlazaService();
