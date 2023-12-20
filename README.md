# PeerViewer codebase
PeerViewer codebase for the free peer-to-peer TeamViewer solution.

Under the hood, it uses direct (peer-to-peer) connections between the participants.

This was recently made possible by the advanced holepunching techniques, made by the HolePunch company.

# Why peer-to-peer?
Traditionally, when you use network apps such as TeamViewer, place audio and video calls or share files, your data is going through intermediate servers which are expensive to host, can harm your privacy, increase latency and consume additional bandwidth.

Peer-to-peer solutions such as PeerViewer have the advantage of:

- Being the highest bandwidth AND lowest latency way of establishing a network connection.
- Ensuring maximum privacy for all participants.
- Being low cost, making it possible to survive on a pay-what-you-can/voluntary/donation basis.
- Minimizing time-to-market and allowing for quick MVP's without a lot of server-side datacenter setup work.
- Building blocks

We're lucky to be standing on the shoulders of giants to pull this off.

Here's a list of some key, free and open-source technologies that make this possible:

- HolePunch, for establishing direct peer-to-peer connections.
- LNBits, for quickly building reusable payment QR codes using the LNURLp standard.
- Electron, for building standalone applications using open web standards.
- Bitcoin and Lightning, for accepting payments without needing anyone's permission or approval.
