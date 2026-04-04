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

    def launch_app(self):
        if not self.app_url:
            return
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

    def find_node(self, selectors: list[dict], timeout_seconds: float = 15.0) -> tuple[UiNode, dict]:
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            nodes = self.dump_ui()
            for selector in selectors:
                for node in nodes:
                    if self._match_selector(node, selector):
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
        self.adb("shell", "input", "tap", str(x), str(y))
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
        )
        time.sleep(0.25)

    def tap_selectors(self, selectors: list[dict], timeout_seconds: float = 15.0) -> UiNode:
        node, selector = self.find_node(selectors, timeout_seconds=timeout_seconds)
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

    def tap_and_wait_for_view_change(
        self,
        session_id: str,
        previous_view_key: str,
        selectors: list[dict],
        timeout_seconds: float = 15.0,
    ) -> dict:
        node, selector = self.find_node(selectors, timeout_seconds=timeout_seconds)
        self.tap_node(node, selector)
        try:
            return self.wait_for_view_change(session_id, previous_view_key, timeout_seconds=timeout_seconds)
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

    def wait_for_latest_session(self, previous_session_id: str | None) -> str:
        deadline = time.time() + 25
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

    def wait_for_view_change(self, session_id: str, previous_view_key: str, timeout_seconds: float = 15.0) -> dict:
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            session = self.get_data(f"/api/v1/yki/sessions/{session_id}")
            if session["current_view"]["view_key"] != previous_view_key or session["status"] == "read_only":
                return session
            time.sleep(0.5)
        raise RunnerError(f"View did not change from {previous_view_key}")

    def wait_for_question_submission(
        self,
        session_id: str,
        previous_view_key: str,
        timeout_seconds: float = 15.0,
    ) -> dict:
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            session = self.get_data(f"/api/v1/yki/sessions/{session_id}")
            current_view = session["current_view"]
            if current_view["view_key"] != previous_view_key:
                return session

            if (
                current_view.get("answer_status") != "pending"
                or current_view.get("response_locked")
                or current_view.get("submitted_answer")
                or (current_view.get("actions", {}).get("next") or {}).get("enabled")
            ):
                return session
            time.sleep(0.5)
        raise RunnerError(f"Question submission did not settle for {previous_view_key}")

    def wait_for_prompt_unlock(
        self,
        session_id: str,
        previous_view_key: str,
        timeout_seconds: float = 4.0,
    ) -> dict:
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            session = self.get_data(f"/api/v1/yki/sessions/{session_id}")
            current_view = session["current_view"]
            if current_view["view_key"] != previous_view_key:
                return session
            playback = current_view.get("playback") or {}
            next_action = current_view.get("actions", {}).get("next") or {}
            if playback.get("count", 0) >= 1 or next_action.get("enabled"):
                return session
            time.sleep(0.25)
        raise RunnerError(f"Prompt playback did not unlock next for {previous_view_key}")

    def open_exam_from_home(self) -> str:
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
            self.find_node(
                [
                    {"type": "accessibilityLabel", "value": "yki-start-button"},
                    {"type": "resource-id", "value": "yki-start-button"},
                    {"type": "visible_text", "value": "YKI Exam"},
                ],
                timeout_seconds=20,
            )
        latest_before = None
        try:
            latest_before = self.get_data("/api/v1/yki/sessions/latest")["session_id"]
        except Exception:
            latest_before = None
        try:
            self.tap_selectors(
                [
                    {"type": "accessibilityLabel", "value": "yki-start-button"},
                    {"type": "resource-id", "value": "yki-start-button"},
                    {"type": "visible_text", "value": "YKI Exam"},
                ],
                timeout_seconds=20,
            )
            return self.wait_for_latest_session(latest_before)
        except RunnerError:
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
            raise

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
                    previous_view_key,
                    [
                        {"type": "accessibilityLabel", "value": "yki-next-button"},
                        {"type": "resource-id", "value": "yki-next-button"},
                        {
                            "type": "visible_text",
                            "value": view["actions"]["next"]["label"] if view["actions"]["next"] else "Next",
                            "contains": True,
                        },
                    ],
                )
            elif kind == "section_complete":
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
                self.wait_for_view_change(session_id, previous_view_key, timeout_seconds=20.0)
            elif kind in {"reading_question", "listening_question"}:
                option = view["options"][0]
                self.tap_selectors(
                    [
                        {"type": "accessibilityLabel", "value": option},
                        {"type": "resource-id", "value": "yki-option-0"},
                        {"type": "visible_text", "value": option},
                    ],
                    timeout_seconds=15.0,
                )
                settled_session = self.wait_for_question_submission(
                    session_id,
                    previous_view_key,
                    timeout_seconds=15.0,
                )
                if settled_session["current_view"]["view_key"] == previous_view_key:
                    enabled_node, selector = self.wait_for_enabled_node(
                        [
                            {"type": "accessibilityLabel", "value": "yki-next-button"},
                            {"type": "resource-id", "value": "yki-next-button"},
                            {"type": "visible_text", "value": "Next"},
                        ],
                        timeout_seconds=4.0,
                    )
                    self.tap_node(enabled_node, selector)
                    self.wait_for_view_change(session_id, previous_view_key, timeout_seconds=6.0)
            elif kind == "listening_prompt":
                self.tap_selectors(
                    [
                        {"type": "accessibilityLabel", "value": "yki-play-audio"},
                        {"type": "resource-id", "value": "yki-play-audio"},
                        {"type": "visible_text", "value": "Play Prompt"},
                    ],
                )
                prompt_session = self.get_data(f"/api/v1/yki/sessions/{session_id}")
                prompt_remaining = prompt_session["timing_manifest"]["current_section_remaining_seconds"]
                enabled_node, selector = self.wait_for_enabled_node(
                    [
                        {"type": "accessibilityLabel", "value": "yki-next-button"},
                        {"type": "resource-id", "value": "yki-next-button"},
                        {"type": "visible_text", "value": "Next"},
                    ],
                    timeout_seconds=1.5,
                )
                if prompt_remaining > 8:
                    try:
                        self.tap_selectors(
                            [
                                {"type": "accessibilityLabel", "value": "yki-pause-audio"},
                                {"type": "resource-id", "value": "yki-pause-audio"},
                                {"type": "visible_text", "value": "Pause Prompt"},
                            ],
                            timeout_seconds=0.75,
                        )
                        self.tap_selectors(
                            [
                                {"type": "accessibilityLabel", "value": "yki-play-audio"},
                                {"type": "resource-id", "value": "yki-play-audio"},
                                {"type": "visible_text", "value": "Resume Prompt"},
                            ],
                            timeout_seconds=0.75,
                        )
                    except RunnerError:
                        self.record("PROMPT_PAUSE_RESUME_UNAVAILABLE")
                else:
                    self.record(
                        "PROMPT_PAUSE_RESUME_SKIPPED_LOW_TIME",
                        section_remaining_seconds=prompt_remaining,
                    )
                self.tap_node(enabled_node, selector)
                self.wait_for_view_change(session_id, previous_view_key, timeout_seconds=4.0)
            elif kind == "writing_response":
                self.tap_selectors(
                    [
                        {"type": "accessibilityLabel", "value": "yki-written-response"},
                        {"type": "resource-id", "value": "yki-written-response"},
                        {"type": "visible_text", "value": "Write your response", "contains": True},
                    ],
                )
                self.input_text(writing_answer)
                self.tap_and_wait_for_view_change(
                    session_id,
                    previous_view_key,
                    [
                        {"type": "accessibilityLabel", "value": "yki-submit-button"},
                        {"type": "resource-id", "value": "yki-submit-button"},
                        {"type": "visible_text", "value": "Submit Response"},
                    ],
                )
            elif kind == "speaking_response":
                self.tap_selectors(
                    [
                        {"type": "accessibilityLabel", "value": "yki-record-start"},
                        {"type": "resource-id", "value": "yki-record-start"},
                        {"type": "visible_text", "value": "Start Recording"},
                    ],
                )
                time.sleep(1.5)
                self.tap_and_wait_for_view_change(
                    session_id,
                    previous_view_key,
                    [
                        {"type": "accessibilityLabel", "value": "yki-record-stop"},
                        {"type": "resource-id", "value": "yki-record-stop"},
                        {"type": "visible_text", "value": "Stop And Submit"},
                    ],
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
