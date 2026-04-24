"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Room,
  RoomEvent,
  type Track,
  type RemoteTrack,
  type RemoteTrackPublication,
  type RemoteParticipant,
} from "livekit-client"
import {
  createHeygenStreamingSession,
  startHeygenStreamingSession,
  stopHeygenStreamingSession,
  sendHeygenStreamingTask,
  interruptHeygenStreamingSession,
  keepAliveHeygenStreamingSession,
  startHeygenStreamingListening,
  stopHeygenStreamingListening,
  type CreateHeygenStreamingSessionInput,
} from "@/lib/heygen/rest"

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    p.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (err) => {
        clearTimeout(t)
        reject(err)
      },
    )
  })
}

type StreamingState =
  | "idle"
  | "creating"
  | "connecting"
  | "connected"
  | "speaking"
  | "error"
  | "ended"

export interface UseHeygenStreamingResult {
  state: StreamingState
  error: string | null
  /** Called by UI to mount the remote video stream. */
  attachVideo: (el: HTMLVideoElement | null) => void
  sendTask: (text: string, opts?: { type?: "talk" | "repeat" }) => Promise<void>
  interrupt: () => Promise<void>
  /** End the session. Also runs automatically on unmount. */
  stop: () => Promise<void>
  /** True when we're publishing mic audio AND HeyGen is transcribing it. */
  micOn: boolean
  /** Open the mic and start voice chat (requires user gesture). */
  startVoiceChat: () => Promise<void>
  stopVoiceChat: () => Promise<void>
}

/**
 * Drives a HeyGen interactive avatar session:
 *
 *   1. Creates a session via `/v1/streaming.new` (access_token + LiveKit URL)
 *   2. Calls `/v1/streaming.start`
 *   3. Joins the LiveKit room and attaches the avatar's video/audio tracks
 *   4. `sendTask(text)` → `/v1/streaming.task` makes the avatar speak
 *   5. `stop()` (or unmount) tears down the room and session
 *
 * Keep-alive pings fire every 60 s so HeyGen doesn't garbage-collect the
 * session while the tab is open.
 */
export function useHeygenStreaming(
  input: CreateHeygenStreamingSessionInput | null,
): UseHeygenStreamingResult {
  const [state, setState] = useState<StreamingState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [micOn, setMicOn] = useState(false)

  const sessionIdRef = useRef<string | null>(null)
  const roomRef = useRef<Room | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const videoElRef = useRef<HTMLVideoElement | null>(null)
  const pendingVideoTrackRef = useRef<RemoteTrack | null>(null)
  /** Dedicated <audio> element for the avatar's TTS output. Browsers
   *  block autoplay-with-audio on <video>; a standalone <audio>
   *  element plays freely once the user has granted mic permission. */
  const audioElRef = useRef<HTMLAudioElement | null>(null)

  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoElRef.current = el
    const track = pendingVideoTrackRef.current
    if (el && track) {
      track.attach(el)
    }
  }, [])

  const stop = useCallback(async () => {
    const sid = sessionIdRef.current
    const room = roomRef.current
    const ws = wsRef.current
    sessionIdRef.current = null
    roomRef.current = null
    wsRef.current = null
    pendingVideoTrackRef.current = null
    try {
      ws?.close()
    } catch {
      // ignored
    }
    try {
      await room?.disconnect()
    } catch {
      // ignored — room may already be disconnected
    }
    if (audioElRef.current) {
      try {
        audioElRef.current.pause()
        audioElRef.current.remove()
      } catch {
        // ignored
      }
      audioElRef.current = null
    }
    if (sid) {
      try {
        await stopHeygenStreamingSession(sid)
      } catch (err) {
        console.warn("[heygen-streaming] stop failed:", err)
      }
    }
    setState("ended")
    setMicOn(false)
  }, [])

  const sendTask = useCallback(
    async (text: string, opts: { type?: "talk" | "repeat" } = {}) => {
      const sid = sessionIdRef.current
      if (!sid) throw new Error("heygen-streaming: no active session")
      setState("speaking")
      try {
        await sendHeygenStreamingTask({
          session_id: sid,
          text,
          task_type: opts.type ?? "talk",
        })
      } finally {
        setState((s) => (s === "speaking" ? "connected" : s))
      }
    },
    [],
  )

  const startVoiceChat = useCallback(async () => {
    const sid = sessionIdRef.current
    const room = roomRef.current
    if (!sid || !room) throw new Error("heygen-streaming: session not connected")
    // Opens the mic (browser permission prompt) and publishes the track
    // into the LiveKit room. Must be called from a user gesture.
    await room.localParticipant.setMicrophoneEnabled(true)
    try {
      await startHeygenStreamingListening(sid)
      setMicOn(true)
    } catch (err) {
      await room.localParticipant.setMicrophoneEnabled(false).catch(() => {})
      throw err
    }
  }, [])

  const stopVoiceChat = useCallback(async () => {
    const sid = sessionIdRef.current
    const room = roomRef.current
    setMicOn(false)
    if (sid) {
      try {
        await stopHeygenStreamingListening(sid)
      } catch (err) {
        console.warn("[heygen-streaming] stop_listening failed:", err)
      }
    }
    if (room) {
      await room.localParticipant.setMicrophoneEnabled(false).catch(() => {})
    }
  }, [])

  const interrupt = useCallback(async () => {
    const sid = sessionIdRef.current
    if (!sid) return
    try {
      await interruptHeygenStreamingSession(sid)
    } catch (err) {
      console.warn("[heygen-streaming] interrupt failed:", err)
    }
  }, [])

  // Serialize `input` so we only start a new session when the avatar_name
  // or voice actually changes — not on every React re-render.
  const key = input
    ? JSON.stringify({
        a: input.avatar_name,
        v: input.voice?.voice_id,
        q: input.quality,
        l: input.language,
        k: input.knowledge_base_id ?? input.knowledge_base,
      })
    : null

  useEffect(() => {
    if (!input || !key) return
    let cancelled = false
    setError(null)

    ;(async () => {
      try {
        setState("creating")
        console.log("[heygen-streaming] creating session", input)
        const session = await createHeygenStreamingSession(input)
        console.log("[heygen-streaming] session created", {
          session_id: session.session_id,
          url: session.url,
        })
        if (cancelled) {
          await stopHeygenStreamingSession(session.session_id).catch(() => {})
          return
        }
        sessionIdRef.current = session.session_id

        const room = new Room({ adaptiveStream: true, dynacast: true })
        roomRef.current = room

        room.on(
          RoomEvent.TrackSubscribed,
          (
            track: RemoteTrack,
            _pub: RemoteTrackPublication,
            _participant: RemoteParticipant,
          ) => {
            const kind = (track as Track).kind
            console.log("[heygen-streaming] track subscribed:", kind)
            if (kind === "video") {
              pendingVideoTrackRef.current = track
              if (videoElRef.current) track.attach(videoElRef.current)
            } else if (kind === "audio") {
              // Route audio to its own <audio> element so it plays even
              // when the <video> is autoplay-muted by the browser.
              if (!audioElRef.current) {
                const el = document.createElement("audio")
                el.autoplay = true
                el.setAttribute("playsinline", "")
                audioElRef.current = el
                document.body.appendChild(el)
              }
              track.attach(audioElRef.current)
            }
          },
        )
        room.on(RoomEvent.Disconnected, (reason) => {
          console.log("[heygen-streaming] room disconnected:", reason)
          if (!cancelled) setState("ended")
        })
        room.on(RoomEvent.ConnectionStateChanged, (s) => {
          console.log("[heygen-streaming] room connection state:", s)
        })
        room.on(RoomEvent.ParticipantConnected, (p) => {
          console.log("[heygen-streaming] participant connected:", p.identity)
        })
        room.on(RoomEvent.ParticipantDisconnected, (p) => {
          console.log("[heygen-streaming] participant disconnected:", p.identity)
        })
        room.on(RoomEvent.TrackPublished, (pub, participant) => {
          console.log(
            "[heygen-streaming] track published by",
            participant.identity,
            ":",
            pub.kind,
            pub.trackSid,
          )
        })
        room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          const names = speakers.map((s) => s.identity).join(", ")
          console.log("[heygen-streaming] active speakers:", names || "(none)")
        })
        room.on(RoomEvent.DataReceived, (payload, participant) => {
          try {
            const text = new TextDecoder().decode(payload)
            console.log(
              "[heygen-streaming] data from",
              participant?.identity ?? "(server)",
              ":",
              text,
            )
          } catch {
            console.log(
              "[heygen-streaming] data received (binary)",
              payload.byteLength,
              "bytes",
            )
          }
        })

        setState("connecting")
        console.log("[heygen-streaming] streaming.start …")
        await withTimeout(
          startHeygenStreamingSession(session.session_id),
          10000,
          "streaming.start",
        )
        console.log("[heygen-streaming] room.connect …", session.url)
        await withTimeout(
          room.connect(session.url, session.access_token),
          15000,
          "livekit room.connect",
        )
        console.log("[heygen-streaming] room connected")
        if (cancelled) {
          await room.disconnect().catch(() => {})
          await stopHeygenStreamingSession(session.session_id).catch(() => {})
          return
        }

        // Open HeyGen's control WebSocket. The avatar agent uses this
        // channel for lifecycle events; some backends also wait for a
        // client WS before they start publishing media into the room.
        const wsUrl =
          `wss://api.heygen.com/v1/ws/streaming.chat` +
          `?session_id=${encodeURIComponent(session.session_id)}` +
          `&session_token=${encodeURIComponent(session.access_token)}` +
          `&arch_version=v2`
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws
        ws.addEventListener("open", () =>
          console.log("[heygen-streaming] control ws open"),
        )
        ws.addEventListener("error", (e) =>
          console.warn("[heygen-streaming] control ws error", e),
        )
        ws.addEventListener("close", (e) =>
          console.log("[heygen-streaming] control ws close", e.code, e.reason),
        )
        ws.addEventListener("message", (e) => {
          console.log("[heygen-streaming] control ws message:", e.data)
        })

        setState("connected")
      } catch (err) {
        if (cancelled) return
        console.error("[heygen-streaming] setup failed:", err)
        setError((err as Error)?.message ?? "Failed to start avatar")
        setState("error")
      }
    })()

    return () => {
      cancelled = true
      void stop()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Keep-alive pings.
  useEffect(() => {
    if (state !== "connected" && state !== "speaking") return
    const interval = setInterval(() => {
      const sid = sessionIdRef.current
      if (sid) void keepAliveHeygenStreamingSession(sid).catch(() => {})
    }, 60000)
    return () => clearInterval(interval)
  }, [state])

  return {
    state,
    error,
    attachVideo,
    sendTask,
    interrupt,
    stop,
    micOn,
    startVoiceChat,
    stopVoiceChat,
  }
}
