#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import time
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass


@dataclass
class UiNode:
    bounds: str
    class_name: str
    clickable: bool
    content_desc: str
    text: str

    @property
    def label(self) -> str:
        return self.content_desc or self.text

    def center(self) -> tuple[int, int]:
        matches = re.findall(r"\[(\d+),(\d+)\]", self.bounds)
        if len(matches) != 2:
            raise ValueError(f"Invalid bounds: {self.bounds}")
        x1, y1 = map(int, matches[0])
        x2, y2 = map(int, matches[1])
        return ((x1 + x2) // 2, (y1 + y2) // 2)


class ProbeError(RuntimeError):
    pass


class NextButtonProbe:
    def __init__(self, *, backend_base_url: str, device_id: str | None, app_url: str):
        self.backend_base_url = backend_base_url.rstrip("/")
        self.device_id = device_id
        self.app_url = app_url

    def adb(self, *args: str) -> str:
        command = ["adb"]
        if self.device_id:
            command.extend(["-s", self.device_id])
        command.extend(args)
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode != 0:
            raise ProbeError(result.stderr.strip() or result.stdout.strip() or "adb failed")
        return result.stdout

    def launch_app(self) -> None:
        self.adb(
            "shell",
            "am",
            "start",
            "-a",
            "android.intent.action.VIEW",
            "-d",
            self.app_url,
            "host.exp.exponent",
        )
        time.sleep(2.0)

    def dump_ui(self) -> list[UiNode]:
        last_output = ""
        for _ in range(6):
            output = self.adb("exec-out", "uiautomator", "dump", "/dev/tty")
            last_output = output.strip()
            xml_start = output.find("<?xml")
            if xml_start == -1:
                time.sleep(0.5)
                continue

            xml_end = output.rfind("</hierarchy>")
            if xml_end == -1:
                time.sleep(0.5)
                continue

            root = ET.fromstring(output[xml_start : xml_end + len("</hierarchy>")])
            nodes: list[UiNode] = []
            for node in root.iter("node"):
                nodes.append(
                    UiNode(
                        bounds=node.attrib.get("bounds", ""),
                        class_name=node.attrib.get("class", ""),
                        clickable=node.attrib.get("clickable", "false") == "true",
                        content_desc=node.attrib.get("content-desc", "").strip(),
                        text=node.attrib.get("text", "").strip(),
                    )
                )
            return nodes

        raise ProbeError(f"UI dump missing XML payload: {last_output}")

    def find_node(self, label: str, timeout_seconds: float = 20.0) -> UiNode:
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            for node in self.dump_ui():
                if node.label == label:
                    return node
            time.sleep(0.5)
        raise ProbeError(f"UI node not found: {label}")

    def tap(self, node: UiNode) -> None:
        x, y = node.center()
        self.adb("shell", "input", "tap", str(x), str(y))
        time.sleep(1.5)

    def get_latest_session(self) -> dict:
        with urllib.request.urlopen(f"{self.backend_base_url}/api/v1/yki/sessions/latest", timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))

    def get_session(self, session_id: str) -> dict:
        with urllib.request.urlopen(
            f"{self.backend_base_url}/api/v1/yki/sessions/{session_id}",
            timeout=10,
        ) as response:
            return json.loads(response.read().decode("utf-8"))

    def run(self) -> dict:
        self.launch_app()
        next_button = self.find_node("yki-next-button")
        if not next_button.clickable:
            raise ProbeError("yki-next-button is present but not clickable")

        latest_before = self.get_latest_session()
        if not latest_before.get("ok") or not latest_before.get("data"):
            raise ProbeError(f"Latest session unavailable before tap: {latest_before}")

        session_id = latest_before["data"]["session_id"]
        before_view_key = latest_before["data"]["view_key"]
        self.tap(next_button)

        deadline = time.time() + 15.0
        while time.time() < deadline:
            session = self.get_session(session_id)
            if session.get("ok") and session.get("data"):
                after_view_key = session["data"]["current_view"]["view_key"]
                if after_view_key != before_view_key:
                    return {
                        "status": "PASS",
                        "before_view_key": before_view_key,
                        "after_view_key": after_view_key,
                        "session_id": session_id,
                    }
            time.sleep(0.5)

        raise ProbeError("yki-next-button tap did not advance the governed session")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-url", default="exp://127.0.0.1:8081")
    parser.add_argument("--backend-base-url", default="http://127.0.0.1:8002")
    parser.add_argument("--device-id")
    args = parser.parse_args()

    probe = NextButtonProbe(
        app_url=args.app_url,
        backend_base_url=args.backend_base_url,
        device_id=args.device_id,
    )
    try:
        print(json.dumps(probe.run(), indent=2))
    except Exception as exc:
        print(json.dumps({"status": "FAIL", "reason": str(exc)}, indent=2))
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
