import { DepixIntegration } from "@/components/depix-integration"

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Depix API Integration</h1>
          <p className="text-muted-foreground">Test your Depix API integration with bearer token authentication</p>
        </div>

        <div className="flex justify-center">
          <DepixIntegration />
        </div>
      </div>
    </main>
  )
}
