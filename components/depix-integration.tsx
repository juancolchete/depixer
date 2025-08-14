"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Edit2, Check, X } from "lucide-react"

export function DepixIntegration() {
  const [amountInReais, setAmountInReais] = useState("")
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [statusResponse, setStatusResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [depositId, setDepositId] = useState<string | null>(null)
  const [isEditingDepositId, setIsEditingDepositId] = useState(false)
  const [customDepositId, setCustomDepositId] = useState<string>("")

  const requestBody = { amountInCents: Math.round((Number(amountInReais) || 0) * 100) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResponse(null)
    setDepositId(null)
    setStatusResponse(null)
    setStatusError(null)

    try {
      const res = await fetch("/api/depix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amountInCents: Math.round((Number(amountInReais) || 0) * 100) }),
      })

      const responseText = await res.text()

      let data
      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch (parseError) {
        data = { rawResponse: responseText, parseError: "Failed to parse JSON" }
      }

      if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`)
      }

      const responseData = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: data,
        timestamp: new Date().toISOString(),
      }

      setResponse(responseData)

      if (data.response?.id) {
        setDepositId(data.response.id)
        console.log("Deposit ID extracted:", data.response.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleEditDepositId = () => {
    setCustomDepositId(depositId || "")
    setIsEditingDepositId(true)
  }

  const handleSaveDepositId = () => {
    if (customDepositId.trim()) {
      setDepositId(customDepositId.trim())
      setIsEditingDepositId(false)
    }
  }

  const handleCancelEditDepositId = () => {
    setIsEditingDepositId(false)
    setCustomDepositId("")
  }

  const handleCheckStatus = async () => {
    if (!depositId) {
      setStatusError("No deposit ID available. Please create a deposit first or enter a custom deposit ID.")
      return
    }

    setStatusLoading(true)
    setStatusError(null)
    setStatusResponse(null)

    try {
      const res = await fetch(`/api/depix-status?id=${depositId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Unable to check deposit status. Please try again.`)
      }

      const statusResponseData = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: data,
        timestamp: new Date().toISOString(),
      }

      setStatusResponse(statusResponseData)
      console.log("Deposit status response:", statusResponseData)
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>DePix Deposit</CardTitle>
        <p className="text-sm text-muted-foreground">
          Deposit DePix quickly and securely using PIX payments. Enter your amount and get instant payment instructions.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="text-sm font-medium">
              💵 Deposit Amount (R$)
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amountInReais}
              onChange={(e) => setAmountInReais(e.target.value)}
              placeholder="10.00"
              min="0.01"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Processing Your Deposit..." : "🚀 Generate PIX Payment"}
          </Button>
        </form>

        {(depositId || isEditingDepositId) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">📋 Transaction ID:</span>
              {isEditingDepositId ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={customDepositId}
                    onChange={(e) => setCustomDepositId(e.target.value)}
                    placeholder="Enter your transaction ID"
                    className="flex-1"
                  />
                  <Button size="sm" variant="outline" onClick={handleSaveDepositId} disabled={!customDepositId.trim()}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEditDepositId}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded flex-1">{depositId}</span>
                  <Button size="sm" variant="outline" onClick={handleEditDepositId}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <Button
              onClick={handleCheckStatus}
              disabled={statusLoading || !depositId}
              variant="outline"
              className="w-full bg-transparent"
            >
              {statusLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {statusLoading ? "Checking..." : "🔍 Check Payment Status"}
            </Button>
          </div>
        )}

        {!depositId && !isEditingDepositId && (
          <div className="space-y-2">
            <Button onClick={() => setIsEditingDepositId(true)} variant="outline" className="w-full">
              <Edit2 className="mr-2 h-4 w-4" />📝 Track Existing Transaction
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>❌ Oops! Something went wrong: {error}</AlertDescription>
          </Alert>
        )}

        {statusError && (
          <Alert variant="destructive">
            <AlertDescription>❌ Unable to check payment status: {statusError}</AlertDescription>
          </Alert>
        )}

        {response && response.data && (
          <>
            {response.data.response?.qrImageUrl && (
              <div>
                <label className="text-sm font-medium">📱 Scan to Pay with PIX</label>
                <Alert className="mt-1">
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        Open your bank app and scan this QR code to complete your deposit instantly
                      </p>
                      <div className="flex flex-col items-center space-y-2">
                        <img
                          src={response.data.response.qrImageUrl || "/placeholder.svg"}
                          alt="PIX QR Code for Payment"
                          className="max-w-xs border rounded"
                          onLoad={() => console.log("QR image loaded successfully")}
                          onError={(e) => {
                            console.error("Failed to load QR image:", response.data.response.qrImageUrl)
                            e.currentTarget.style.display = "none"
                            const errorDiv = document.createElement("div")
                            errorDiv.textContent = `Unable to load payment QR code. Please try again.`
                            errorDiv.className = "text-red-500 text-sm p-2 border border-red-200 rounded"
                            e.currentTarget.parentNode?.appendChild(errorDiv)
                          }}
                        />
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {response.data.response?.qrCopyPaste && (
              <div>
                <label className="text-sm font-medium">🔑 PIX Copy & Paste Key</label>
                <Alert className="mt-1">
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        Can't scan? Copy this PIX key and paste it in your banking app
                      </p>
                      <div className="font-mono text-lg p-4 bg-muted rounded border break-all">
                        {response.data.response.qrCopyPaste}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(response.data.response.qrCopyPaste)
                            const button = document.activeElement as HTMLButtonElement
                            const originalText = button.textContent
                            button.textContent = "✅ Copied!"
                            button.disabled = true
                            setTimeout(() => {
                              button.textContent = originalText
                              button.disabled = false
                            }, 2000)
                          } catch (err) {
                            console.error("Failed to copy to clipboard:", err)
                            const textArea = document.createElement("textarea")
                            textArea.value = response.data.response.qrCopyPaste
                            document.body.appendChild(textArea)
                            textArea.select()
                            try {
                              document.execCommand("copy")
                              const button = document.activeElement as HTMLButtonElement
                              const originalText = button.textContent
                              button.textContent = "✅ Copied!"
                              button.disabled = true
                              setTimeout(() => {
                                button.textContent = originalText
                                button.disabled = false
                              }, 2000)
                            } catch (fallbackErr) {
                              console.error("Fallback copy failed:", fallbackErr)
                              alert("Copy failed. Please manually copy the PIX key above.")
                            }
                            document.body.removeChild(textArea)
                          }
                        }}
                        className="w-full"
                      >
                        📋 Copy PIX Key
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </>
        )}

        {statusResponse && (
          <>
            {statusResponse.data?.response?.status && (
              <div>
                <label className="text-sm font-medium">💳 Payment Status</label>
                <Alert
                  className={`mt-1 ${
                    statusResponse.data.response.status === "depix_sent"
                      ? "border-green-500 bg-green-50"
                      : statusResponse.data.response.status === "pending"
                        ? "border-yellow-500 bg-yellow-50"
                        : ""
                  }`}
                >
                  <AlertDescription>
                    <div className="space-y-2">
                      {statusResponse.data.response.status === "depix_sent" && (
                        <div className="flex items-center space-x-2">
                          <div className="text-green-600 font-medium">🎉 Payment Completed!</div>
                          <div className="text-green-700">
                            Your deposit has been successfully processed and added to your account.
                          </div>
                        </div>
                      )}
                      {statusResponse.data.response.status === "pending" && (
                        <div className="flex items-center space-x-2">
                          <div className="text-yellow-600 font-medium">⏳ Processing Payment</div>
                          <div className="text-yellow-700">
                            Your deposit is being processed. This usually takes a few minutes.
                          </div>
                        </div>
                      )}
                      {statusResponse.data.response.status !== "depix_sent" &&
                        statusResponse.data.response.status !== "pending" && (
                          <div className="flex items-center space-x-2">
                            <div className="text-gray-600 font-medium">ℹ️ Status:</div>
                            <div className="text-gray-700 font-mono">{statusResponse.data.response.status}</div>
                          </div>
                        )}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
