# Practice OS — Firebase Operational Cost Formula

For production scaling calculations, use the following operational cost formula based on the Firebase Blaze Plan:

**Total Monthly Cost = (Firestore Costs) + (Functions Costs) + (Storage Costs) + (Egress Costs)**

Where:
- **Firestore Costs**: `(Total Reads / 100,000 * $0.06) + (Total Writes / 100,000 * $0.18)`
- **Cloud Functions Costs**: `(Total Invocations / 1,000,000 * $0.40) + (Total Execution Time (GB-seconds) * $0.000024)`
- **Storage Costs**: `(Total Data (GB) * $0.026)`
- **Egress (Network) Costs**: `(Total Outbound Traffic (GB) * $0.12)`

*Note: Firebase Auth has a 50,000 MAU free tier and is typically free for small-to-mid-sized clinic operations.*
