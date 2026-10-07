# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default Deny**: All paths are denied by default (`match /{document=**} { allow read, write: if false; }`).
2. **Identity Integrity**: A member profile `/users/{userId}` can only be created or updated if `request.auth != null`, `request.auth.uid == userId`, and `incoming().uid == request.auth.uid`.
3. **PII Isolation**: Public profiles at `/users/{userId}` never store `email` or other PII. Private PII (`email`) is strictly isolated in `/users/{userId}/private/{docId}` (where `docId == 'info'`) and is readable/writable ONLY by the owner (`request.auth.uid == userId`).
4. **Strict Key & Type Validation**: Every `create` and `update` operation on `/users/{userId}` and `/users/{userId}/private/{docId}` is validated via standalone `isValidUserPublicProfile()` and `isValidUserPrivateInfo()` helpers, enforcing `hasAll`, `hasOnly`, string length boundaries, array size bounds (`topFoods.size() == 3`), and immutable `uid` and `createdAt` fields.
5. **Temporal Integrity**: `createdAt` must equal `request.time` on creation and remain immutable on update; `updatedAt` must equal `request.time` on both creation and update.
6. **Secure List Queries**: `allow list` on `/users/{userId}` enforces `resource.data.spotsSubmittedCount >= 0` so queries must explicitly filter with `where('spotsSubmittedCount', '>=', 0)`.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: Creating `/users/user_1` with `auth == null`.
2. **Identity Spoofing**: Authenticated as `user_2` attempting to create `/users/user_1` or setting `uid: 'user_2'` inside `/users/user_1`.
3. **Shadow Field Injection (Create)**: Creating `/users/user_1` with an extra field `isAdmin: true`.
4. **Shadow Field Injection (Update)**: Updating `/users/user_1` with an extra field `role: 'admin'`.
5. **PII Leakage to Non-Owner**: Authenticated as `user_2` attempting `get` on `/users/user_1/private/info`.
6. **Immortal Field Mutation**: Updating `createdAt` or `uid` on `/users/user_1`.
7. **Client Timestamp Forgery**: Creating `/users/user_1` with a forged past/future `createdAt` instead of `request.time`.
8. **Resource Poisoning (Oversized Bio)**: Creating `/users/user_1` with a `bio` string exceeding 1000 characters.
9. **Array Overflow**: Creating `/users/user_1` with `topFoods` containing 10 items instead of 3.
10. **Invalid ID Poisoning**: Creating a document with non-alphanumeric characters or >128 chars in `{userId}`.
11. **Value Poisoning on Update**: Updating `firstName` on `/users/user_1` with a number or boolean instead of a bounded string.
12. **Orphaned Private Info Write**: Creating `/users/user_1/private/info` when parent `/users/user_1` does not exist.
