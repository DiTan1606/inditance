import { supabase } from '@/lib/supabase'

export default async function TestPage() {
  // Thử fetch một thứ gì đó từ Supabase (dù chưa có bảng nào)
  const { data, error } = await supabase.from('test').select('*')

  return (
    <div className="p-10 font-sans">
      <h1 className="text-2xl font-bold text-blue-600">Kiểm tra kết nối Inditance</h1>
      <div className="mt-5 p-4 border rounded">
        <p><strong>Trạng thái kết nối:</strong> {error ? "Đã kết nối (nhưng chưa có bảng 'test')" : "Đang kết nối..."}</p>
        <p className="text-sm text-gray-500 mt-2">Nếu bạn thấy dòng này và không có lỗi đỏ trên màn hình, nghĩa là Next.js và Supabase đã nhận ra nhau!</p>
      </div>
    </div>
  )
}