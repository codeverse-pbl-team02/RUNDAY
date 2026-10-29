import { useEffect, useRef } from "react"
import { registerBackAction } from "./backActions"

export function useBackAction(enabled: boolean, action: () => void) {
  const latest = useRef(action)
  latest.current = action
  useEffect(() => {
    if (!enabled) return
    return registerBackAction(() => latest.current())
  }, [enabled])
}
