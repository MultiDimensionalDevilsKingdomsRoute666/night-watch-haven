# Kin relay (Lantern Grove multiplayer)

GitHub Pages is static, so the grove has two ways for kin to meet:

1. **PeerJS (default)**: `worlds/lantern-grove/?room=kin&name=You`. Uses PeerJS's free public broker `0.peerjs.com` (no account; checked alive 2026-10-26) for signaling, then WebRTC peer-to-peer. *Not verified end-to-end*: WebRTC can't connect inside our sandboxed box (even a same-page loopback test fails), so it needs testing on two real phones/computers.
2. **This relay (tested on the box)**: `cd server && npm install && PORT=8790 node kin-relay.mjs`, then open `...?room=kin&name=You&relay=ws://HOST:8790`. Two headless tabs saw each other through it. For live use it has to be hosted somewhere reachable (and use `wss://` from the https Pages site); we haven't hosted it, since that may need an account.

Without a reachable server the grove stays single-player.
