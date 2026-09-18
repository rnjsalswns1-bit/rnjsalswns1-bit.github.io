# Strict Surgical Code Editing Rule

## Guidelines for Code Modifications
1. **Single Target Modification**: When addressing a user issue, modify ONLY the specific lines directly causing the reported issue.
2. **Preserve Existing Working Logic**: NEVER rewrite initialization arrays (`defaultState`, `customDailyQuests`), state migration routines, or outer helper functions that are currently functioning properly.
3. **Pre-Response Verification**: Always execute `git diff` before presenting any completion message to ensure zero unwanted side effects or unrelated edits occurred.
4. **Revert Collateral Changes**: If an edit unintentionally touches an unrelated line, revert that specific line immediately before submitting.
