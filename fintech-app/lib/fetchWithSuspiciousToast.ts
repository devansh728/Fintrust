import { toast } from "@/hooks/use-toast"

/**
 * A fetch wrapper that shows a toast if a suspicious user is detected (403 Forbidden with specific error message).
 * Usage: import fetchWithSuspiciousToast from "@/lib/fetchWithSuspiciousToast";
 *        await fetchWithSuspiciousToast(url, options)
 */
export default async function fetchWithSuspiciousToast(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, init)
  if (res.status === 403) {
    try {
      const data = await res.clone().json()
      if (data && data.error === "Suspicious user detected") {
        toast({
          title: "Suspicious Activity Detected",
          description: "Your behavior was flagged as suspicious. Please contact support if this is a mistake.",
          // You can add variant or action if needed
        })
      }
    } catch (e) {
      // Not JSON or no error field, ignore
    }
  }
  return res
} 