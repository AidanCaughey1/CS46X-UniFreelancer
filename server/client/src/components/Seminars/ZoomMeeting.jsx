import React, { useEffect, useRef, useState } from "react";
import { ZoomMtg } from "@zoom/meetingsdk";

const ZOOM_SDK_VERSION = process.env.REACT_APP_ZOOM_SDK_VERSION || "5.1.2";
const ZOOM_SDK_LIB = `https://source.zoom.us/${ZOOM_SDK_VERSION}/lib`;

function ZoomMeeting({ seminarId, meetingNumber, passWord, userFullName, onLeave }) {
  const [status, setStatus] = useState("Initializing Zoom...");
  const initializedRef = useRef(false);

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

        setStatus("Fetching meeting signature...");

        const apiBase = process.env.REACT_APP_API_URL || "";
        const signatureRes = await fetch(
          `${apiBase}/api/academy/seminars/${seminarId}/zoom-signature?role=0&meetingNumber=${encodeURIComponent(meetingNumber)}`,
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

        setStatus("Joining seminar...");

        ZoomMtg.init({
          leaveUrl: `${window.location.origin}/academy/seminars`,
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
              success: () => {
                setStatus("Joined");
              },
              error: (error) => {
                setStatus(`Join error: ${JSON.stringify(error)}`);
              }
            });
          },
          error: (error) => {
            setStatus(`Init error: ${JSON.stringify(error)}`);
          }
        });
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    };

    initZoom();

    return () => {
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
    };
  }, [seminarId, meetingNumber, passWord, userFullName]);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", position: "relative" }}>
      <div style={{ padding: "16px", textAlign: "center" }}>
        <h2>Joining Zoom Seminar</h2>
        <p>Status: {status}</p>
        <button type="button" onClick={onLeave} style={{ padding: "10px 16px", marginTop: "8px" }}>
          Leave
        </button>
      </div>
    </div>
  );
}

export default ZoomMeeting;
