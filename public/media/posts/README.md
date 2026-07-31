# Native media for the Content Library

Store cover images and video files here so GetToKnow.You can host them directly.
Do not embed Xiaohongshu or Instagram players. Social platforms remain optional discovery links.

## Publishing steps

1. Compress the media appropriately before committing (repository size, deploy time, and visitor load all matter).
2. Copy an MP4, WebM, JPG, PNG, or WebP into `public/media/posts/`.
3. Reference it from Keystatic **Works (Content Library)** as a site path:
   - Cover image: `/media/posts/your-cover.jpg`
   - Native video: `/media/posts/your-video.mp4`
4. Add a written summary, takeaway, transcript, or body so the idea remains accessible without playing the video.
5. Use the original Xiaohongshu / Instagram / Substack fields for provenance when relevant.
6. Set **Canonical platform** to GetToKnow.You when the on-site version is authoritative.

## Notes

- Empty optional media fields are fine; cards and pages fall back cleanly.
- Large media belongs in this folder only when it is the lasting public asset for a published work.
- Prefer MP4 (H.264 + AAC) for browser compatibility. MOV files may not play in all browsers; convert before treating a native video as production-ready.
- v1 does not include cloud storage, transcoding, or a separate video host.

## Action note — Dunedin checkout video

Hosted path: `/media/posts/Checkout-Chick-Successful-Conversation.mp4` (H.264/AAC MP4).
