"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { migrateTasksToNigeria } from "@/lib/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function MigrateTasksButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null)

  const handleMigration = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await migrateTasksToNigeria()
      setResult(response)

      // Refresh the page after successful migration
      if (response.success) {
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      setResult({ error: "Failed to run migration" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleMigration} disabled={loading} variant="outline" size="sm">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Atualizando tarefas...
          </>
        ) : (
          "🇳🇬 Atualizar Tarefas para Nigéria"
        )}
      </Button>

      {result?.success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">{result.success}</AlertDescription>
        </Alert>
      )}

      {result?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
