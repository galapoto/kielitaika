import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from yki_practice.certification_service import HASH_ALGORITHM, compute_final_result_hash


def verify_export(payload: dict):
    certification_record = payload.get("certification_record")
    final_result_hash = payload.get("final_result_hash")
    hash_algorithm = payload.get("hash_algorithm")

    if not isinstance(certification_record, dict) or not isinstance(final_result_hash, str):
        return False, "INVALID"

    if hash_algorithm != HASH_ALGORITHM:
        return False, "INVALID"

    expected = compute_final_result_hash(
        certification_record["session_hash"],
        certification_record["task_sequence_hash"],
        certification_record["audit_event_range"],
        certification_record["contract_version"],
    )
    return expected == final_result_hash, "VALID" if expected == final_result_hash else "INVALID"


def main():
    if len(sys.argv) != 2:
        print("INVALID")
        raise SystemExit(1)

    payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    ok, label = verify_export(payload)
    print(label)
    raise SystemExit(0 if ok else 1)


if __name__ == "__main__":
    main()
