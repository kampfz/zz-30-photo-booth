"use client";

import { useEffect, useState } from "react";

/** Shows a timestamp in the viewer's own time zone (the server only knows UTC). */
export function LocalTime({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(
      new Date(iso).toLocaleString(undefined, { day: "numeric", hour: "numeric", minute: "2-digit", month: "short" }),
    );
  }, [iso]);
  return <time dateTime={iso}>{text}</time>;
}
