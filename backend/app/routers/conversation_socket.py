from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.conversation_engine_v4 import ConversationEngineV4
from app.services.subscription_service import enforce_feature, log_feature_usage

# Initialize v4 engine
_conversation_engine_v4 = ConversationEngineV4()

router = APIRouter()


@router.websocket("/ws/conversation/{user_id}")
async def conversation_socket(websocket: WebSocket, user_id: str):
    """
    Minimal WebSocket bridge for streaming conversation.
    Each incoming message is a JSON string: {"role": "user", "text": "..."}
    We reply with {"role": "assistant", "text": "..."} using the conversation engine.
    """
    await websocket.accept()
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                import json

                payload = json.loads(raw)
                user_text = payload.get("text", "")
                level = payload.get("level", "A1")
                path = payload.get("path", "general")
                profession = payload.get("profession")
                enable_progressive_disclosure = payload.get("enable_progressive_disclosure", True)

                # Subscription gating similar to HTTP flow
                feature_key = "general_finnish"
                if path == "workplace":
                    feature_key = "workplace"
                elif path == "yki":
                    feature_key = "yki"

                allowed, reason = await enforce_feature(feature_key, user_id)
                if not allowed:
                    await websocket.send_text(json.dumps({"role": "error", "text": reason or "Subscription required"}))
                    continue

                result = await _conversation_engine_v4.handle_conversation(
                    user_text=user_text,
                    user_id=user_id,
                    level=level,
                    correction_mode="medium",
                    path=path,
                    profession=profession,
                    enable_progressive_disclosure=enable_progressive_disclosure,
                )

                # Send reply with progressive disclosure if available
                reply = result.get("reply", "")
                masked_reply = result.get("masked_reply", reply)
                
                await websocket.send_text(json.dumps({
                    "role": "assistant",
                    "text": reply,
                    "masked_text": masked_reply,
                    "support_level": result.get("support_level", 0),
                    "grammar_info": result.get("grammar_info", {}),
                }))
                await log_feature_usage(user_id, feature_key)
            except Exception as exc:  # noqa: BLE001
                await websocket.send_text(f'{{"role": "error", "text": "Error: {exc}"}}')
    except WebSocketDisconnect:
        # Client disconnected; nothing to do
        return
