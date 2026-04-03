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
    bounds: str

    @property
    def label(self) -> str:
        return self.text or self.content_desc

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
    def __init__(self, *, backend_base_url: str, device_id: str | None):
        self.backend_base_url = backend_base_url.rstrip("/")
        self.device_id = device_id
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

    def dump_ui(self) -> list[UiNode]:
        self.adb("shell", "uiautomator", "dump", "/sdcard/yki-window.xml")
        raw_xml = self.adb("shell", "cat", "/sdcard/yki-window.xml")
        root = ET.fromstring(raw_xml)
        nodes: list[UiNode] = []
        for node in root.iter("node"):
            nodes.append(
                UiNode(
                    text=node.attrib.get("text", "").strip(),
                    content_desc=node.attrib.get("content-desc", "").strip(),
                    bounds=node.attrib.get("bounds", ""),
                )
            )
        return nodes

    def find_node(self, label: str, *, contains: bool = False, timeout_seconds: float = 15.0) -> UiNode:
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            nodes = self.dump_ui()
            for node in nodes:
                candidate = node.label
                if not candidate:
                    continue
                if contains and label in candidate:
                    return node
                if candidate == label:
                    return node
            time.sleep(0.5)
        raise RunnerError(f"UI node not found: {label}")

    def tap_node(self, node: UiNode):
        x, y = node.center()
        self.adb("shell", "input", "tap", str(x), str(y))
        self.record("UI_TAP", label=node.label, bounds=node.bounds, x=x, y=y)
        time.sleep(0.8)

    def tap_label(self, label: str, *, contains: bool = False, timeout_seconds: float = 15.0):
        node = self.find_node(label, contains=contains, timeout_seconds=timeout_seconds)
        self.tap_node(node)

    def input_text(self, text: str):
        sanitized = re.sub(r"[^A-Za-z0-9._-]", " ", text).strip()
        escaped = sanitized.replace(" ", "%s")
        self.adb("shell", "input", "text", escaped)
        self.record("UI_TEXT_INPUT", text=sanitized)
        time.sleep(0.8)

    def wait_for_latest_session(self, previous_session_id: str | None) -> str:
        deadline = time.time() + 25
        while time.time() < deadline:
            payload = self.get_data("/api/v1/yki/sessions/latest")
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

    def open_exam_from_home(self) -> str:
        returned_home = False
        try:
            self.tap_label("Return Home", timeout_seconds=3)
            returned_home = True
        except RunnerError:
            pass
        if returned_home:
            self.find_node("YKI Exam", timeout_seconds=20)
        latest_before = None
        try:
            latest_before = self.get_data("/api/v1/yki/sessions/latest")["session_id"]
        except Exception:
            latest_before = None
        self.tap_label("YKI Exam", timeout_seconds=20)
        return self.wait_for_latest_session(latest_before)

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
            if kind in {"reading_passage", "writing_prompt", "speaking_prompt", "section_complete"}:
                self.tap_label(view["actions"]["next"]["label"] if view["actions"]["next"] else "Next", contains=True)
                self.wait_for_view_change(session_id, previous_view_key)
            elif kind in {"reading_question", "listening_question"}:
                option = view["options"][0]
                self.tap_label(option, timeout_seconds=15)
                self.wait_for_view_change(session_id, previous_view_key)
            elif kind == "listening_prompt":
                self.tap_label("Play Prompt")
                time.sleep(1.0)
                try:
                    self.tap_label("Pause Prompt", timeout_seconds=4)
                    time.sleep(0.8)
                    self.tap_label("Resume Prompt", timeout_seconds=4)
                except RunnerError:
                    self.record("PROMPT_PAUSE_RESUME_UNAVAILABLE")
                time.sleep(0.8)
                self.tap_label("Next")
                self.wait_for_view_change(session_id, previous_view_key)
            elif kind == "writing_response":
                self.tap_label("Write your response", contains=True)
                self.input_text(writing_answer)
                self.tap_label("Submit Response")
                self.wait_for_view_change(session_id, previous_view_key)
            elif kind == "speaking_response":
                self.tap_label("Start Recording")
                time.sleep(1.5)
                self.tap_label("Stop And Submit")
                self.wait_for_view_change(session_id, previous_view_key)
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
    parser.add_argument("--run-label", required=True)
    args = parser.parse_args()

    runner = AndroidForensicRunner(
        backend_base_url=args.backend_base_url,
        device_id=args.device_id,
    )
    result: dict[str, object]
    try:
        runner.wait_for_device()
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
