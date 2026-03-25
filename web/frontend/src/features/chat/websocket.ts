export function normalizeWsUrlForBrowser(wsUrl: string): string {
  let finalWsUrl = wsUrl

  try {
    const parsedUrl = new URL(wsUrl)
    const isLocalHost =
      parsedUrl.hostname === "localhost" ||
      parsedUrl.hostname === "127.0.0.1" ||
      parsedUrl.hostname === "0.0.0.0"
    const isBrowserLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"

    if (isLocalHost && !isBrowserLocal) {
      parsedUrl.hostname = window.location.hostname
    }

    // HTTPS pages cannot open ws:// (mixed content). Backend may still return ws
    // when TLS terminates at a reverse proxy without X-Forwarded-Proto.
    if (window.location.protocol === "https:" && parsedUrl.protocol === "ws:") {
      parsedUrl.protocol = "wss:"
    }

    finalWsUrl = parsedUrl.toString()
  } catch (error) {
    console.warn("Could not parse ws_url:", error)
  }

  return finalWsUrl
}

export function invalidateSocket(socket: WebSocket | null) {
  if (!socket) {
    return
  }

  socket.onopen = null
  socket.onmessage = null
  socket.onclose = null
  socket.onerror = null
  socket.close()
}

export function isCurrentSocket({
  socket,
  currentSocket,
  generation,
  currentGeneration,
  sessionId,
  currentSessionId,
}: {
  socket: WebSocket
  currentSocket: WebSocket | null
  generation: number
  currentGeneration: number
  sessionId: string
  currentSessionId: string
}): boolean {
  return (
    currentSocket === socket &&
    generation === currentGeneration &&
    sessionId === currentSessionId
  )
}
