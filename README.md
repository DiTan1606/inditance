# Inditance - Mạng xã hội

Website mạng xã hội với các tính năng: kết bạn, đăng bài, nhắn tin, thông báo.

## Công nghệ

- Next.js 16, React 19, TypeScript
- TailwindCSS 4
- Supabase (Auth, Database, Storage, Realtime)

## Cài đặt

1. Clone và cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Chỉ cần cho Admin (khóa tài khoản)
```

3. Chạy migrations trong Supabase SQL Editor:
   - Mở Supabase Dashboard > SQL Editor
   - Chạy lần lượt các file trong `supabase/migrations/`

4. Tạo Storage buckets trong Supabase Dashboard > Storage:
   - `avatars` (public)
   - `posts` (public)

5. Bật Realtime cho bảng `messages`: Database > Replication > chọn `messages`

6. Tạo tài khoản admin: Cập nhật role trong bảng `profiles` thành `admin` cho user cần làm admin

## Chạy dev

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## Tính năng

- Đăng ký, đăng nhập
- Hồ sơ cá nhân (avatar, username, bio, ngày sinh)
- Kết bạn, huỷ kết bạn
- Đăng bài (ảnh + caption)
- Bảng tin (bài của bạn bè)
- Like, bình luận
- Nhắn tin 1-1 (realtime)
- Thông báo (like, comment, friend request)
- Tìm kiếm người dùng
- Admin: quản lý user, xem bài viết, khóa/mở tài khoản
