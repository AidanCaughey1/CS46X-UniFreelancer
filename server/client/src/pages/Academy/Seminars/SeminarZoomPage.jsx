import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ZoomMeeting from "../../../components/Seminars/ZoomMeeting";
import { getSeminarStatus } from "../../../utils/seminarStatus";

function SeminarZoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [seminar, setSeminar] = useState(null);
  const [userFullName, setUserFullName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_URL || "";

        const meRes = await fetch(`${apiBase}/api/users/me`, { credentials: "include" });
        if (!meRes.ok) {
          navigate("/login");
          return;
        }

        const meData = await meRes.json();
        setUserFullName(`${meData.firstName || ""} ${meData.lastName || ""}`.trim());

        const seminarRes = await fetch(`${apiBase}/api/academy/seminars/${id}`, { credentials: "include" });
        if (!seminarRes.ok) {
          throw new Error("Failed to load seminar");
        }

        const seminarData = await seminarRes.json();
        setSeminar(seminarData);
      } catch (fetchError) {
        setError(fetchError.message || "Could not load meeting details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const seminarStatus = useMemo(() => getSeminarStatus(seminar), [seminar]);

  if (loading) {
    return <div style={{ padding: "24px" }}>Loading meeting details...</div>;
  }

  if (error) {
    return <div style={{ padding: "24px" }}>{error}</div>;
  }

  if (!seminar?.schedule?.zoomMeetingId || !seminar?.schedule?.zoomPassword) {
    return <div style={{ padding: "24px" }}>This seminar is missing Zoom credentials.</div>;
  }

  if (seminarStatus !== "Live Now") {
    return <div style={{ padding: "24px" }}>Zoom join is only available while this seminar is live.</div>;
  }

  return (
    <ZoomMeeting
      seminarId={id}
      meetingNumber={seminar.schedule.zoomMeetingId}
      passWord={seminar.schedule.zoomPassword}
      userFullName={userFullName || "Guest User"}
      onLeave={() => {
        window.close();
        navigate("/academy/seminars");
      }}
    />
  );
}

export default SeminarZoomPage;
