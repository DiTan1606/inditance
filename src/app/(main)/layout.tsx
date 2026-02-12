import { MainAppLayout } from '@/components/layout/MainAppLayout'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainAppLayout>{children}</MainAppLayout>
}
