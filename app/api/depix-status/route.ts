import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const bearerToken = process.env.DEPIX_BEARER_TOKEN

    if (!bearerToken) {
      return NextResponse.json({ error: "DEPIX_BEARER_TOKEN environment variable is not set" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 })
    }

    console.log("Making request to Depix status API with ID:", id)
    console.log("Request URL:", `https://depix.eulen.app/api/deposit-status?id=${id}`)

    const response = await fetch(`https://depix.eulen.app/api/deposit-status?id=${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
    })

    console.log("Depix status API response status:", response.status)
    console.log("Depix status API response headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("Depix status API raw response:", responseText)

    let responseData
    try {
      responseData = responseText ? JSON.parse(responseText) : {}
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError)
      return NextResponse.json(
        {
          error: "Invalid JSON response from Depix API",
          rawResponse: responseText,
          status: response.status,
        },
        { status: 502 },
      )
    }

    if (!response.ok) {
      console.error("Depix status API error:", response.status, responseData)
      return NextResponse.json(
        {
          error: `Depix API error: ${response.status} ${response.statusText}`,
          details: responseData,
          rawResponse: responseText,
        },
        { status: response.status },
      )
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Depix status API error:", error)
    return NextResponse.json(
      { error: `Depix status API error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
