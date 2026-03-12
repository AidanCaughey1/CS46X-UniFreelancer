import React, { useEffect, useRef } from "react";
import { ZoomMtg } from "@zoom/meetingsdk";

const ZOOM_SDK_VERSION = process.env.REACT_APP_ZOOM_SDK_VERSION || "5.1.2";
const ZOOM_SDK_LIB = `https://source.zoom.us/${ZOOM_SDK_VERSION}/lib`;

function ZoomMeeting({ seminarId, meetingNumber, passWord, userFullName }) {
  const initializedRef = useRef(false);
  const cleanupTimerRef = useRef(null);

  useEffect(() => {
    const suppressZoomCancelErrors = (event) => {
      const message = event?.message || event?.error?.message || event?.reason?.message || event?.reason;
      if (typeof message === "string" && message.includes("Job was cancelled")) {
        event.preventDefault();
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
      }
    };

    window.addEventListener("error", suppressZoomCancelErrors);
    window.addEventListener("unhandledrejection", suppressZoomCancelErrors);

    return () => {
      window.removeEventListener("error", suppressZoomCancelErrors);
      window.removeEventListener("unhandledrejection", suppressZoomCancelErrors);
    };
  }, []);

  useEffect(() => {
    if (cleanupTimerRef.current) {
      window.clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }

    const zoomRoot = document.getElementById("zmmtg-root");
    if (zoomRoot) {
      zoomRoot.style.display = "block";
    }

    const initZoom = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      try {
        ZoomMtg.setZoomJSLib(ZOOM_SDK_LIB, "/av");
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();

        const apiBase = process.env.REACT_APP_API_URL || "";
        const videoWebRtcMode = Number(process.env.REACT_APP_ZOOM_VIDEO_WEBRTC_MODE ?? 1);
        const params = new URLSearchParams({
          role: "0",
          meetingNumber: String(meetingNumber)
        });

        if ([0, 1].includes(videoWebRtcMode)) {
          params.set("videoWebRtcMode", String(videoWebRtcMode));
        }

        const signatureRes = await fetch(
          `${apiBase}/api/academy/seminars/${seminarId}/zoom-signature?${params.toString()}`,
          { credentials: "include" }
        );

        if (!signatureRes.ok) {
          const errorData = await signatureRes.json().catch(() => ({}));
          throw new Error(errorData.message || "Unable to get Zoom signature");
        }

        const { signature } = await signatureRes.json();
        if (!signature) {
          throw new Error("Invalid signature response");
        }

        ZoomMtg.init({
          leaveUrl: `${window.location.origin}/academy/seminars/${seminarId}`,
          patchJsMedia: true,
          leaveOnPageUnload: true,
          debug: false,
          success: () => {
            ZoomMtg.join({
              signature,
              meetingNumber: String(meetingNumber),
              passWord: passWord || "",
              userName: userFullName || "Guest User",
              userEmail: "",
              success: () => {},
              error: (error) => {
                initializedRef.current = false;
                console.error("Zoom join error", error);
              }
            });
          },
          error: (error) => {
            initializedRef.current = false;
            console.error("Zoom init error", error);
          }
        });
      } catch (error) {
        initializedRef.current = false;
        console.error("Zoom start error", error);
      }
    };

    initZoom();

    return () => {
      cleanupTimerRef.current = window.setTimeout(() => {
        const root = document.getElementById("zmmtg-root");
        if (root) {
          root.style.display = "none";
        }

        try {
          ZoomMtg.leaveMeeting({});
        } catch (error) {
          // Ignore cleanup errors from zoom sdk.
        }

        document.body.style.overflow = "auto";
        initializedRef.current = false;
      }, 150);
    };
  }, [seminarId, meetingNumber, passWord, userFullName]);

  return (
    <div style={{ minHeight: "100vh", background: "#06080f" }} />
  );
}

export default ZoomMeeting;
