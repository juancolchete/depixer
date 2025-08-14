import { DepixIntegration } from "@/components/depix-integration"

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container max-w-2xl">
        <div className="flex justify-center">
          <DepixIntegration />
        </div>
      </div>
    </main>
  )
}
