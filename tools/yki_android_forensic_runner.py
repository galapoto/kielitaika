#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import datetime, UTC
from pathlib import Path


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


@dataclass
class UiNode:
    text: str
    content_desc: str
    resource_id: str
    bounds: str
    class_name: str
    clickable: bool
    enabled: bool
    parent_hierarchy: tuple[str, ...]

    @property
    def label(self) -> str:
        return self.content_desc or self.resource_id or self.text

    @property
    def parent_path(self) -> str:
        return " > ".join(self.parent_hierarchy)

    def center(self) -> tuple[int, int]:
        match = re.findall(r"\[(\d+),(\d+)\]", self.bounds)
        if len(match) != 2:
            raise ValueError(f"Invalid bounds: {self.bounds}")
        x1, y1 = map(int, match[0])
        x2, y2 = map(int, match[1])
        return ((x1 + x2) // 2, (y1 + y2) // 2)


class RunnerError(RuntimeError):
    pass


class AndroidForensicRunner:
    def __init__(self, *, backend_base_url: str, device_id: str | None, app_url: str | None):
        self.backend_base_url = backend_base_url.rstrip("/")
        self.device_id = device_id
        self.app_url = app_url
        self.timeline: list[dict] = []

    def adb(self, *args: str, check: bool = True) -> str:
        command = ["adb"]
        if self.device_id:
            command.extend(["-s", self.device_id])
        command.extend(args)
        result = subprocess.run(command, capture_output=True, text=True)
        if check and result.returncode != 0:
            raise RunnerError(result.stderr.strip() or result.stdout.strip() or "adb failed")
        return result.stdout

    def record(self, event_type: str, **details):
        self.timeline.append(
            {
                "timestamp": utc_now(),
                "event_type": event_type,
                **details,
            }
        )

    def request(self, method: str, path: str, payload: dict | None = None) -> dict:
        data = None
        headers = {}
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"
        request = urllib.request.Request(
            f"{self.backend_base_url}{path}",
            data=data,
            headers=headers,
            method=method,
        )
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8")
            raise RunnerError(f"HTTP {exc.code} for {path}: {body}") from exc

    def get_data(self, path: str) -> dict:
        payload = self.request("GET", path)
        if not payload.get("ok"):
            raise RunnerError(f"Request failed for {path}: {payload}")
        return payload["data"]

    def post_data(self, path: str, payload: dict | None = None) -> dict:
        envelope = self.request("POST", path, payload)
        if not envelope.get("ok"):
            raise RunnerError(f"Request failed for {path}: {envelope}")
        return envelope["data"]

    def wait_for_device(self):
        devices = self.adb("devices")
        if "device" not in devices:
            raise RunnerError("No Android device connected.")
        self.record("DEVICE_READY", raw_output=devices.strip())
        self.prepare_device_ui(navigate_home=True)

    def _best_effort_adb(self, *args: str) -> str:
        try:
            return self.adb(*args, check=False)
        except Exception:
            return ""

    def prepare_device_ui(self, *, navigate_home: bool):
        self._best_effort_adb("shell", "input", "keyevent", "KEYCODE_WAKEUP")
        self._best_effort_adb("shell", "wm", "dismiss-keyguard")
        self._best_effort_adb("shell", "input", "keyevent", "82")
        self._best_effort_adb("shell", "cmd", "statusbar", "collapse")
        if navigate_home:
            self._best_effort_adb("shell", "input", "keyevent", "KEYCODE_BACK")
            self._best_effort_adb("shell", "input", "swipe", "600", "2200", "600", "700", "250")
            self._best_effort_adb("shell", "input", "keyevent", "KEYCODE_HOME")
        self.record("DEVICE_UI_PREP", navigate_home=navigate_home)
        time.sleep(1.0)

    def launch_app(self):
        if not self.app_url:
            return
        self.prepare_device_ui(navigate_home=True)
        self.adb("shell", "am", "force-stop", "host.exp.exponent")
        self.record("APP_FORCE_STOP", package="host.exp.exponent")
        time.sleep(1.0)
        launch_output = self.adb(
            "shell",
            "am",
            "start",
            "-W",
            "-a",
            "android.intent.action.VIEW",
            "-d",
            self.app_url,
            "host.exp.exponent",
        )
        self.record("APP_LAUNCH", app_url=self.app_url, raw_output=launch_output.strip())
        time.sleep(3.0)
        self.prepare_device_ui(navigate_home=False)

    def _trim_xml_payload(self, output: str) -> str:
        xml_start = output.find("<?xml")
        xml_end = output.rfind("</hierarchy>")
        if xml_start == -1 or xml_end == -1:
            raise RunnerError(f"UI dump missing XML payload: {output.strip()}")
        return output[xml_start : xml_end + len("</hierarchy>")]

    def _describe_node(self, raw_node: ET.Element) -> str:
        class_name = raw_node.attrib.get("class", "").strip() or "node"
        content_desc = raw_node.attrib.get("content-desc", "").strip()
        resource_id = raw_node.attrib.get("resource-id", "").strip()
        text = raw_node.attrib.get("text", "").strip()
        descriptor = content_desc or resource_id or text
        return f"{class_name}[{descriptor}]" if descriptor else class_name

    def dump_ui(self) -> list[UiNode]:
        last_output = ""
        for _ in range(6):
            output = self.adb("exec-out", "uiautomator", "dump", "/dev/tty")
            last_output = output
            try:
                root = ET.fromstring(self._trim_xml_payload(output))
            except RunnerError:
                time.sleep(0.5)
                continue

            nodes: list[UiNode] = []

            def walk(raw_node: ET.Element, parent_hierarchy: tuple[str, ...]):
                if raw_node.tag == "node":
                    nodes.append(
                        UiNode(
                            text=raw_node.attrib.get("text", "").strip(),
                            content_desc=raw_node.attrib.get("content-desc", "").strip(),
                            resource_id=raw_node.attrib.get("resource-id", "").strip(),
                            bounds=raw_node.attrib.get("bounds", ""),
                            class_name=raw_node.attrib.get("class", "").strip(),
                            clickable=raw_node.attrib.get("clickable", "false") == "true",
                            enabled=raw_node.attrib.get("enabled", "false") == "true",
                            parent_hierarchy=parent_hierarchy,
                        )
                    )
                    current_hierarchy = parent_hierarchy + (self._describe_node(raw_node),)
                else:
                    current_hierarchy = parent_hierarchy

                for child in list(raw_node):
                    walk(child, current_hierarchy)

            walk(root, ())
            return nodes

        raise RunnerError(f"UI dump missing XML payload: {last_output.strip()}")

    def _match_selector(self, node: UiNode, selector: dict) -> bool:
        selector_type = selector["type"]
        selector_value = selector["value"]
        if selector_type == "accessibilityLabel":
            return node.content_desc == selector_value
        if selector_type == "resource-id":
            return node.resource_id == selector_value
        if selector_type == "visible_text":
            if selector.get("contains"):
                return selector_value in node.text
            return node.text == selector_value
        raise RunnerError(f"Unsupported selector type: {selector_type}")

    def _record_selector_success(self, node: UiNode, selector: dict):
        self.record(
            "UI_SELECTOR_CONFIRMED",
            selector_type=selector["type"],
            selector_value=selector["value"],
            selector_contains=bool(selector.get("contains")),
            resolved_text=node.text,
            resolved_content_desc=node.content_desc,
            resolved_resource_id=node.resource_id,
            class_name=node.class_name,
            clickable=node.clickable,
            enabled=node.enabled,
            bounds=node.bounds,
            parent_hierarchy=node.parent_path,
        )

    def _preferred_match(self, matches: list[UiNode]) -> UiNode:
        for node in matches:
            if node.enabled and node.clickable:
                return node
        for node in matches:
            if node.enabled:
                return node
        for node in matches:
            if node.clickable:
                return node
        return matches[0]

    def _keyguard_visible(self, nodes: list[UiNode]) -> bool:
        for node in nodes:
            if node.resource_id.startswith("com.android.systemui:id/keyguard_"):
                return True
            if node.resource_id == "com.android.systemui:id/pinEntry":
                return True
            if "PIN" in node.text or "PIN" in node.content_desc:
                return True
        return False

    def assert_device_unlocked(self):
        nodes = self.dump_ui()
        if self._keyguard_visible(nodes):
            self.record("DEVICE_LOCKED", reason="secure_keyguard_visible")
            raise RunnerError(
                "Device is locked at secure keyguard; manual unlock required before Android validation run."
            )

    def find_node(self, selectors: list[dict], timeout_seconds: float = 15.0) -> tuple[UiNode, dict]:
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            nodes = self.dump_ui()
            for selector in selectors:
                matches = [node for node in nodes if self._match_selector(node, selector)]
                if matches:
                    node = self._preferred_match(matches)
                    self._record_selector_success(node, selector)
                    return node, selector
            time.sleep(0.5)
        rendered = ", ".join(
            f"{selector['type']}={selector['value']}" for selector in selectors
        )
        raise RunnerError(f"UI node not found for selectors: {rendered}")

    def tap_node(self, node: UiNode, selector: dict):
        if not node.clickable or not node.enabled:
            self.record(
                "UI_TAP_BLOCKED",
                selector_type=selector["type"],
                selector_value=selector["value"],
                bounds=node.bounds,
                clickable=node.clickable,
                enabled=node.enabled,
                parent_hierarchy=node.parent_path,
                class_name=node.class_name,
            )
            raise RunnerError(
                f"Element exists but is not tappable: {selector['type']}={selector['value']}"
            )
        x, y = node.center()
        self.adb("shell", "input", "swipe", str(x), str(y), str(x), str(y), "120")
        self.record(
            "UI_TAP",
            selector_type=selector["type"],
            selector_value=selector["value"],
            label=node.label,
            resource_id=node.resource_id,
            text=node.text,
            bounds=node.bounds,
            clickable=node.clickable,
            enabled=node.enabled,
            parent_hierarchy=node.parent_path,
            x=x,
            y=y,
            gesture="press_hold_120ms",
        )
        time.sleep(0.25)

    def tap_selectors(self, selectors: list[dict], timeout_seconds: float = 15.0) -> UiNode:
        node, selector = self.wait_for_enabled_node(selectors, timeout_seconds=timeout_seconds)
        self.tap_node(node, selector)
        return node

    def wait_for_enabled_node(self, selectors: list[dict], timeout_seconds: float = 20.0) -> tuple[UiNode, dict]:
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            node, selector = self.find_node(selectors, timeout_seconds=2.0)
            if node.clickable and node.enabled:
                return node, selector
            self.record(
                "UI_SELECTOR_WAITING_FOR_ENABLE",
                selector_type=selector["type"],
                selector_value=selector["value"],
                bounds=node.bounds,
                clickable=node.clickable,
                enabled=node.enabled,
                parent_hierarchy=node.parent_path,
            )
            time.sleep(0.5)
        rendered = ", ".join(
            f"{selector['type']}={selector['value']}" for selector in selectors
        )
        raise RunnerError(f"Element never became tappable for selectors: {rendered}")

    def input_text(self, text: str):
        sanitized = re.sub(r"[^A-Za-z0-9._-]", " ", text).strip()
        escaped = sanitized.replace(" ", "%s")
        self.adb("shell", "input", "text", escaped)
        self.record("UI_TEXT_INPUT", text=sanitized)
        time.sleep(0.25)

    def capture_session_state(self, session: dict) -> dict:
        current_view = session.get("current_view") or {}
        next_action = current_view.get("actions", {}).get("next") or {}
        playback = current_view.get("playback") or {}
        return {
            "status": session.get("status"),
            "view_key": current_view.get("view_key"),
            "view_kind": current_view.get("kind"),
            "step_id": current_view.get("view_key"),
            "session_hash": session.get("session_hash"),
            "answer_status": current_view.get("answer_status"),
            "response_locked": bool(current_view.get("response_locked")),
            "submitted_answer": bool(current_view.get("submitted_answer")),
            "submitted_audio": bool(current_view.get("submitted_audio")),
            "next_enabled": bool(next_action.get("enabled")),
            "playback_count": int(playback.get("count") or 0),
        }

    def ui_snapshot(self, nodes: list[UiNode], limit: int = 16) -> list[dict]:
        snapshot: list[dict] = []
        for node in nodes:
            label = node.label.strip()
            if not label:
                continue
            snapshot.append(
                {
                    "label": label,
                    "text": node.text,
                    "content_desc": node.content_desc,
                    "resource_id": node.resource_id,
                    "class_name": node.class_name,
                    "clickable": node.clickable,
                    "enabled": node.enabled,
                    "bounds": node.bounds,
                }
            )
            if len(snapshot) >= limit:
                break
        return snapshot

    def record_action_state(self, action_name: str, state: dict):
        self.record(
            "ACTION_STATE_RECORDED",
            action_name=action_name,
            view_key=state.get("view_key"),
            step_id=state.get("step_id"),
            session_hash=state.get("session_hash"),
            status=state.get("status"),
            view_kind=state.get("view_kind"),
            answer_status=state.get("answer_status"),
            response_locked=state.get("response_locked"),
            submitted_answer=state.get("submitted_answer"),
            submitted_audio=state.get("submitted_audio"),
            next_enabled=state.get("next_enabled"),
            playback_count=state.get("playback_count"),
        )

    def wait_for_settlement(
        self,
        session_id: str,
        before_state: dict,
        *,
        action_name: str,
        timeout_seconds: float,
        result_check=None,
        ui_check=None,
    ) -> tuple[dict | None, str]:
        deadline = time.time() + timeout_seconds
        last_state = before_state
        last_backend_error = None
        last_ui_error = None
        last_ui_snapshot: list[dict] = []
        while time.time() < deadline:
            session = None
            try:
                session = self.get_data(f"/api/v1/yki/sessions/{session_id}")
                last_state = self.capture_session_state(session)
                last_backend_error = None
            except RunnerError as exc:
                last_backend_error = str(exc)

            nodes: list[UiNode] = []
            try:
                nodes = self.dump_ui()
                last_ui_snapshot = self.ui_snapshot(nodes)
                last_ui_error = None
            except RunnerError as exc:
                last_ui_error = str(exc)

            if session is not None:
                if last_state.get("status") == "read_only":
                    self.record(
                        "SETTLEMENT_CONFIRMED",
                        action_name=action_name,
                        reason="status_read_only",
                        before_view_key=before_state.get("view_key"),
                        after_view_key=last_state.get("view_key"),
                        before_step_id=before_state.get("step_id"),
                        after_step_id=last_state.get("step_id"),
                    )
                    return session, "status_read_only"
                if last_state.get("view_key") != before_state.get("view_key"):
                    self.record(
                        "SETTLEMENT_CONFIRMED",
                        action_name=action_name,
                        reason="view_key_changed",
                        before_view_key=before_state.get("view_key"),
                        after_view_key=last_state.get("view_key"),
                        before_step_id=before_state.get("step_id"),
                        after_step_id=last_state.get("step_id"),
                    )
                    return session, "view_key_changed"
                if last_state.get("step_id") != before_state.get("step_id"):
                    self.record(
                        "SETTLEMENT_CONFIRMED",
                        action_name=action_name,
                        reason="step_id_changed",
                        before_view_key=before_state.get("view_key"),
                        after_view_key=last_state.get("view_key"),
                        before_step_id=before_state.get("step_id"),
                        after_step_id=last_state.get("step_id"),
                    )
                    return session, "step_id_changed"
                if result_check and result_check(session, last_state, before_state):
                    self.record(
                        "SETTLEMENT_CONFIRMED",
                        action_name=action_name,
                        reason="action_result_visible",
                        before_view_key=before_state.get("view_key"),
                        after_view_key=last_state.get("view_key"),
                        before_step_id=before_state.get("step_id"),
                        after_step_id=last_state.get("step_id"),
                    )
                    return session, "action_result_visible"

            if ui_check and nodes and ui_check(nodes):
                self.record(
                    "SETTLEMENT_CONFIRMED",
                    action_name=action_name,
                    reason="ui_reflects_next_state",
                    before_view_key=before_state.get("view_key"),
                    after_view_key=last_state.get("view_key"),
                    before_step_id=before_state.get("step_id"),
                    after_step_id=last_state.get("step_id"),
                    ui_snapshot=last_ui_snapshot,
                )
                return session, "ui_reflects_next_state"

            time.sleep(0.5)

        failure = {
            "action_name": action_name,
            "before_state": before_state,
            "last_state": last_state,
            "backend_response": last_backend_error,
            "ui_snapshot": last_ui_snapshot,
            "ui_error": last_ui_error,
        }
        self.record("SETTLEMENT_TIMEOUT", **failure)
        raise RunnerError(f"Settlement timeout after {action_name}: {json.dumps(failure, ensure_ascii=True)}")

    def question_result_visible(self, session: dict, current_state: dict, before_state: dict) -> bool:
        current_view = session.get("current_view") or {}
        next_action = current_view.get("actions", {}).get("next") or {}
        return (
            current_state.get("answer_status") != before_state.get("answer_status")
            or current_state.get("response_locked")
            or current_state.get("submitted_answer")
            or current_state.get("submitted_audio")
            or bool(next_action.get("enabled"))
        )

    def prompt_unlock_visible(self, session: dict, current_state: dict, before_state: dict) -> bool:
        current_view = session.get("current_view") or {}
        playback = current_view.get("playback") or {}
        next_action = current_view.get("actions", {}).get("next") or {}
        return (
            int(playback.get("count") or 0) > int(before_state.get("playback_count") or 0)
            or bool(next_action.get("enabled"))
        )

    def tap_and_wait_for_view_change(
        self,
        session_id: str,
        before_session: dict,
        selectors: list[dict],
        action_name: str,
        timeout_seconds: float = 20.0,
    ) -> dict:
        before_state = self.capture_session_state(before_session)
        self.record_action_state(action_name, before_state)
        node, selector = self.wait_for_enabled_node(selectors, timeout_seconds=timeout_seconds)
        self.tap_node(node, selector)
        try:
            session, _ = self.wait_for_settlement(
                session_id,
                before_state,
                action_name=action_name,
                timeout_seconds=timeout_seconds,
            )
            if session is None:
                raise RunnerError(f"Settlement produced no backend session for {action_name}")
            return session
        except RunnerError:
            self.record(
                "UI_TAP_NO_ADVANCE",
                selector_type=selector["type"],
                selector_value=selector["value"],
                bounds=node.bounds,
                clickable=node.clickable,
                enabled=node.enabled,
                parent_hierarchy=node.parent_path,
                class_name=node.class_name,
            )
            raise

    def wait_for_latest_session(self, previous_session_id: str | None, timeout_seconds: float = 25.0) -> str:
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            try:
                payload = self.get_data("/api/v1/yki/sessions/latest")
            except RunnerError as exc:
                if "SESSION_NOT_FOUND" not in str(exc):
                    raise
                time.sleep(0.5)
                continue
            session_id = payload["session_id"]
            if session_id and session_id != previous_session_id:
                self.record(
                    "SESSION_DISCOVERED",
                    session_id=session_id,
                    current_section=payload.get("current_section"),
                    view_key=payload.get("view_key"),
                )
                return session_id
            time.sleep(0.5)
        raise RunnerError("Timed out waiting for a new governed session.")

    def open_exam_from_home(self) -> str:
        selectors = [
            {"type": "accessibilityLabel", "value": "yki-start-button"},
            {"type": "resource-id", "value": "yki-start-button"},
            {"type": "visible_text", "value": "YKI Exam"},
        ]
        self.assert_device_unlocked()
        returned_home = False
        try:
            self.tap_selectors(
                [{"type": "visible_text", "value": "Return Home"}],
                timeout_seconds=3,
            )
            returned_home = True
        except RunnerError:
            pass
        if returned_home:
            self.find_node(selectors, timeout_seconds=20)
        latest_before = None
        try:
            latest_before = self.get_data("/api/v1/yki/sessions/latest")["session_id"]
        except Exception:
            latest_before = None
        last_error: RunnerError | None = None
        for attempt in range(3):
            try:
                self.tap_selectors(selectors, timeout_seconds=20 if attempt == 0 else 6)
                return self.wait_for_latest_session(latest_before, timeout_seconds=8.0)
            except RunnerError as exc:
                last_error = exc
                self.record(
                    "SESSION_START_RETRY",
                    attempt=attempt + 1,
                    error=str(exc),
                )
                time.sleep(1.0)

        if latest_before:
            latest_session = self.get_data(f"/api/v1/yki/sessions/{latest_before}")
            if latest_session["status"] != "read_only":
                self.record(
                    "SESSION_REUSED",
                    session_id=latest_before,
                    current_section=latest_session.get("current_section"),
                    view_key=latest_session["current_view"]["view_key"],
                    reason="start_button_unavailable_after_launch",
                )
                return latest_before
        raise last_error or RunnerError("Timed out starting governed exam from home.")

    def drive_session(self, session_id: str) -> dict:
        writing_answer = "Automated exam response with enough content to satisfy the writing field."
        steps = 0
        while steps < 32:
            session = self.get_data(f"/api/v1/yki/sessions/{session_id}")
            view = session["current_view"]
            self.record(
                "SESSION_SNAPSHOT",
                session_id=session_id,
                status=session["status"],
                section=session["current_section"],
                view_key=view["view_key"],
                view_kind=view["kind"],
                exam_remaining_seconds=session["timing_manifest"]["exam_remaining_seconds"],
                section_remaining_seconds=session["timing_manifest"]["current_section_remaining_seconds"],
            )
            if session["status"] == "read_only" and session["certificate"]:
                return {
                    "status": "PASS",
                    "session": session,
                }

            previous_view_key = view["view_key"]
            kind = view["kind"]
            if kind in {"reading_passage", "writing_prompt", "speaking_prompt"}:
                self.tap_and_wait_for_view_change(
                    session_id,
                    session,
                    [
                        {"type": "accessibilityLabel", "value": "yki-next-button"},
                        {"type": "resource-id", "value": "yki-next-button"},
                        {
                            "type": "visible_text",
                            "value": view["actions"]["next"]["label"] if view["actions"]["next"] else "Next",
                            "contains": True,
                        },
                    ],
                    action_name=f"advance_{kind}",
                )
            elif kind == "section_complete":
                before_state = self.capture_session_state(session)
                self.record_action_state("advance_section_complete", before_state)
                enabled_node, selector = self.wait_for_enabled_node(
                    [
                        {"type": "accessibilityLabel", "value": "yki-next-button"},
                        {"type": "resource-id", "value": "yki-next-button"},
                        {
                            "type": "visible_text",
                            "value": view["actions"]["next"]["label"] if view["actions"]["next"] else "Next",
                            "contains": True,
                        },
                    ],
                    timeout_seconds=20.0,
                )
                self.tap_node(enabled_node, selector)
                self.wait_for_settlement(
                    session_id,
                    before_state,
                    action_name="advance_section_complete",
                    timeout_seconds=20.0,
                )
            elif kind in {"reading_question", "listening_question"}:
                before_state = self.capture_session_state(session)
                self.record_action_state(f"select_option_{kind}", before_state)
                option = view["options"][0]
                self.tap_selectors(
                    [
                        {"type": "accessibilityLabel", "value": option},
                        {"type": "resource-id", "value": "yki-option-0"},
                        {"type": "visible_text", "value": option},
                    ],
                    timeout_seconds=15.0,
                )
                settled_session, reason = self.wait_for_settlement(
                    session_id,
                    before_state,
                    action_name=f"select_option_{kind}",
                    timeout_seconds=20.0,
                    result_check=self.question_result_visible,
                )
                if settled_session is None:
                    raise RunnerError(f"No backend session after option selection for {previous_view_key}")
                if reason == "action_result_visible":
                    enabled_node, selector = self.wait_for_enabled_node(
                        [
                            {"type": "accessibilityLabel", "value": "yki-next-button"},
                            {"type": "resource-id", "value": "yki-next-button"},
                            {"type": "visible_text", "value": "Next"},
                        ],
                        timeout_seconds=8.0,
                    )
                    next_before_state = self.capture_session_state(settled_session)
                    self.record_action_state(f"advance_after_{kind}", next_before_state)
                    self.tap_node(enabled_node, selector)
                    self.wait_for_settlement(
                        session_id,
                        next_before_state,
                        action_name=f"advance_after_{kind}",
                        timeout_seconds=12.0,
                    )
            elif kind == "listening_prompt":
                play_selectors = [
                    {"type": "accessibilityLabel", "value": "yki-play-audio"},
                    {"type": "resource-id", "value": "yki-play-audio"},
                    {"type": "visible_text", "value": "Play Prompt"},
                ]
                prompt_session = None
                for attempt in range(2):
                    before_state = self.capture_session_state(session if attempt == 0 else prompt_session)
                    self.record_action_state("play_listening_prompt", before_state)
                    self.tap_selectors(play_selectors)
                    try:
                        prompt_session, _ = self.wait_for_settlement(
                            session_id,
                            before_state,
                            action_name="play_listening_prompt",
                            timeout_seconds=12.0,
                            result_check=self.prompt_unlock_visible,
                        )
                        break
                    except RunnerError as exc:
                        self.record(
                            "PROMPT_UNLOCK_RETRY",
                            attempt=attempt + 1,
                            error=str(exc),
                        )
                        if attempt == 1:
                            raise
                        time.sleep(1.0)
                if prompt_session is None:
                    raise RunnerError(f"Prompt playback did not unlock next for {previous_view_key}")
                enabled_node, selector = self.wait_for_enabled_node(
                    [
                        {"type": "accessibilityLabel", "value": "yki-next-button"},
                        {"type": "resource-id", "value": "yki-next-button"},
                        {"type": "visible_text", "value": "Next"},
                    ],
                    timeout_seconds=8.0,
                )
                next_before_state = self.capture_session_state(prompt_session)
                self.record_action_state("advance_after_listening_prompt", next_before_state)
                self.tap_node(enabled_node, selector)
                self.wait_for_settlement(
                    session_id,
                    next_before_state,
                    action_name="advance_after_listening_prompt",
                    timeout_seconds=15.0,
                )
            elif kind == "writing_response":
                self.tap_selectors(
                    [
                        {"type": "accessibilityLabel", "value": "yki-written-response"},
                        {"type": "resource-id", "value": "yki-written-response"},
                        {"type": "visible_text", "value": "Write your response", "contains": True},
                    ],
                )
                self.input_text(writing_answer)
                before_state = self.capture_session_state(session)
                self.record_action_state("submit_writing_response", before_state)
                self.tap_selectors(
                    [
                        {"type": "accessibilityLabel", "value": "yki-submit-button"},
                        {"type": "resource-id", "value": "yki-submit-button"},
                        {"type": "visible_text", "value": "Submit Response"},
                    ],
                )
                settled_session, reason = self.wait_for_settlement(
                    session_id,
                    before_state,
                    action_name="submit_writing_response",
                    timeout_seconds=20.0,
                    result_check=self.question_result_visible,
                )
                if settled_session is None:
                    raise RunnerError(f"No backend session after writing submission for {previous_view_key}")
                if reason == "action_result_visible":
                    enabled_node, selector = self.wait_for_enabled_node(
                        [
                            {"type": "accessibilityLabel", "value": "yki-next-button"},
                            {"type": "resource-id", "value": "yki-next-button"},
                            {"type": "visible_text", "value": "Next"},
                        ],
                        timeout_seconds=8.0,
                    )
                    next_before_state = self.capture_session_state(settled_session)
                    self.record_action_state("advance_after_writing_response", next_before_state)
                    self.tap_node(enabled_node, selector)
                    self.wait_for_settlement(
                        session_id,
                        next_before_state,
                        action_name="advance_after_writing_response",
                        timeout_seconds=12.0,
                    )
            elif kind == "speaking_response":
                self.tap_selectors(
                    [
                        {"type": "accessibilityLabel", "value": "yki-record-start"},
                        {"type": "resource-id", "value": "yki-record-start"},
                        {"type": "visible_text", "value": "Start Recording"},
                    ],
                )
                time.sleep(7.5)
                before_state = self.capture_session_state(session)
                self.record_action_state("submit_speaking_response", before_state)
                self.tap_selectors(
                    [
                        {"type": "accessibilityLabel", "value": "yki-record-stop"},
                        {"type": "resource-id", "value": "yki-record-stop"},
                        {"type": "visible_text", "value": "Stop And Submit"},
                    ],
                )
                settled_session, reason = self.wait_for_settlement(
                    session_id,
                    before_state,
                    action_name="submit_speaking_response",
                    timeout_seconds=20.0,
                    result_check=self.question_result_visible,
                )
                if settled_session is None:
                    raise RunnerError(f"No backend session after speaking submission for {previous_view_key}")
                if reason == "action_result_visible":
                    enabled_node, selector = self.wait_for_enabled_node(
                        [
                            {"type": "accessibilityLabel", "value": "yki-next-button"},
                            {"type": "resource-id", "value": "yki-next-button"},
                            {"type": "visible_text", "value": "Next"},
                        ],
                        timeout_seconds=8.0,
                    )
                    next_before_state = self.capture_session_state(settled_session)
                    self.record_action_state("advance_after_speaking_response", next_before_state)
                    self.tap_node(enabled_node, selector)
                    self.wait_for_settlement(
                        session_id,
                        next_before_state,
                        action_name="advance_after_speaking_response",
                        timeout_seconds=12.0,
                    )
            elif kind == "exam_complete":
                return {
                    "status": "PASS",
                    "session": session,
                }
            else:
                raise RunnerError(f"Unsupported view kind: {kind}")
            steps += 1

        raise RunnerError("Automation exhausted step budget before completion.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--backend-base-url", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--device-id")
    parser.add_argument("--app-url")
    parser.add_argument("--run-label", required=True)
    args = parser.parse_args()

    runner = AndroidForensicRunner(
        backend_base_url=args.backend_base_url,
        device_id=args.device_id,
        app_url=args.app_url,
    )
    result: dict[str, object]
    try:
        runner.wait_for_device()
        runner.launch_app()
        session_id = runner.open_exam_from_home()
        run_outcome = runner.drive_session(session_id)
        forensics = runner.get_data(f"/api/v1/yki/sessions/{session_id}/forensics")
        result = {
            "run_label": args.run_label,
            "status": run_outcome["status"],
            "session_id": session_id,
            "timeline": runner.timeline,
            "session": run_outcome["session"],
            "forensics": forensics,
        }
    except Exception as exc:  # pragma: no cover - forensic script
        failure_session_id = None
        try:
            failure_session_id = runner.get_data("/api/v1/yki/sessions/latest")["session_id"]
        except Exception:
            failure_session_id = None
        result = {
            "run_label": args.run_label,
            "status": "FAIL",
            "session_id": failure_session_id,
            "timeline": runner.timeline,
            "error": str(exc),
        }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
