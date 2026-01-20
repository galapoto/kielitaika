"""Test package for backend services."""

import sys
from pathlib import Path

# Ensure the backend package is on the import path when running tests from repo root
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
