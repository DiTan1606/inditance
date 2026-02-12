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
   - Chạy lần lượt các file trong `supabase/migrations/` theo thứ tự:
     - `20250212000000_initial_schema.sql`
     - `20250212000001_storage_buckets.sql`
     - `20250212000002_realtime.sql`
     - `20250212000003_posts_profiles_fk.sql`
     - `20250212000004_admin_functions.sql`
     - `20250212000005_triggers_and_indexes.sql`

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

### Người dùng
- Đăng ký, đăng nhập
- Hồ sơ cá nhân (avatar, username, bio, ngày sinh)
- Kết bạn, huỷ kết bạn (có confirmation)
- Đăng bài (ảnh + caption) với validation file type
- Xóa bài viết (soft delete)
- Bảng tin (bài của bạn bè)
- Like, bình luận (optimistic updates)
- Xóa bình luận
- Nhắn tin 1-1 (realtime)
- Thông báo (like, comment, friend request)
- Tìm kiếm người dùng (với debounce)

### Admin
- Quản lý user
- Xem bài viết
- Khóa/mở tài khoản (với validation)
- Không thể khóa admin khác

## Cải tiến mới

### Performance
- Optimistic updates cho like/comment
- Debounce search (500ms)
- Soft delete cho posts/comments
- Indexes được tối ưu
- Trigram search cho username

### Security
- Validation file type khi upload
- Admin không thể ban admin khác
- Admin không thể ban chính mình
- Error handling đầy đủ
- RLS policies cập nhật cho soft delete

### UX
- Confirmation dialog cho unfriend
- Confirmation dialog cho delete post
- Loading states
- Error boundaries
- Skeleton loading components
- Better error messages

### Code Quality
- Custom hooks (usePost, useComments, useDebounce, useInfiniteScroll)
- Reusable components
- Better type safety
- Consistent error handling

## Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (main)/            # Main app routes
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/            # React components
│   ├── friends/          # Friend-related components
│   ├── messages/         # Chat components
│   ├── notifications/    # Notification components
│   ├── post/             # Post components
│   ├── profile/          # Profile components
│   ├── search/           # Search components
│   └── ui/               # UI components (Loading, Error, Skeleton)
├── lib/                   # Utilities
│   ├── hooks/            # Custom React hooks
│   ├── supabase/         # Supabase clients
│   ├── notifications.ts  # Notification helpers
│   └── validation.ts     # Input validation
└── types/                 # TypeScript types

supabase/
└── migrations/            # Database migrations
```

## Best Practices

- Sử dụng soft delete thay vì hard delete
- Luôn validate input ở cả client và server
- Implement optimistic updates cho UX tốt hơn
- Sử dụng debounce cho search và autocomplete
- Error boundaries để catch React errors
- Loading states cho mọi async operations
- Confirmation dialogs cho destructive actions
