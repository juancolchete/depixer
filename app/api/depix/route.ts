import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amountInCents } = await request.json()

    // Get the bearer token from environment variables
    const bearerToken = process.env.DEPIX_BEARER_TOKEN

    if (!bearerToken) {
      return NextResponse.json({ error: "DEPIX_BEARER_TOKEN environment variable is not set" }, { status: 500 })
    }

    // Make the API call to Depix
    const response = await fetch("https://depix.eulen.app/api/deposit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amountInCents: amountInCents || 100,
      }),
    })

    console.log("Depix API response status:", response.status)
    console.log("Depix API response headers:", Object.fromEntries(response.headers.entries()))

    // Get the response text first
    const responseText = await response.text()
    console.log("Depix API response text:", responseText)

    // Check if response is empty
    if (!responseText) {
      return NextResponse.json(
        {
          error: "Depix API returned empty response",
          status: response.status,
          statusText: response.statusText,
        },
        { status: response.status || 500 },
      )
    }

    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse Depix API response as JSON:", parseError)
      return NextResponse.json(
        {
          error: "Depix API returned invalid JSON",
          responseText: responseText,
          status: response.status,
        },
        { status: 500 },
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Depix API request failed",
          details: data,
          status: response.status,
          statusText: response.statusText,
        },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Depix API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
