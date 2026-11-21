// 会话内保留点赞，帖子追加或切换App不会重置；刷新后清空。
const likedPosts=new Set();
export const isThreadLiked=id=>likedPosts.has(id);
export function toggleThreadLike(id){if(likedPosts.has(id))likedPosts.delete(id);else likedPosts.add(id);return likedPosts.has(id);}
