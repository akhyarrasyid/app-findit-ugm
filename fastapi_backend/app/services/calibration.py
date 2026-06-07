from dataclasses import dataclass

from app.config import settings


@dataclass(frozen=True)
class CalibrationResult:
    scores: dict[str, float]
    metadata: dict[str, object]


def apply_camera_real_mask_calibration(
    scores: dict[str, float],
    source: str,
) -> CalibrationResult:
    normalized_source = source.strip().lower() if source else "upload"
    metadata: dict[str, object] = {
        "source": normalized_source,
        "applied": False,
        "reason": None,
        "boost": 0.0,
    }

    if normalized_source != "camera":
        metadata["reason"] = "not_camera_source"
        return CalibrationResult(scores=scores, metadata=metadata)

    if (
        not settings.CAMERA_REAL_MASK_CALIBRATION_ENABLED
        or settings.CAMERA_REAL_MASK_BOOST <= 0
    ):
        metadata["reason"] = "disabled"
        return CalibrationResult(scores=scores, metadata=metadata)

    real = float(scores.get("real_person", 0.0))
    mask = float(scores.get("fake_mask", 0.0))
    other_spoofs = [
        float(scores.get("fake_screen", 0.0)),
        float(scores.get("fake_printed", 0.0)),
        float(scores.get("fake_mannequin", 0.0)),
        float(scores.get("fake_unknown", 0.0)),
    ]

    top_two_labels = _get_top_two_labels(scores)
    if set(top_two_labels) != {"real_person", "fake_mask"}:
        metadata["reason"] = "top2_not_real_mask"
        return CalibrationResult(scores=scores, metadata=metadata)

    if max(real, mask) < settings.CAMERA_REAL_MASK_MIN_PAIR_SCORE:
        metadata["reason"] = "real_mask_pair_too_weak"
        return CalibrationResult(scores=scores, metadata=metadata)

    if max(other_spoofs) > settings.CAMERA_REAL_MASK_MAX_OTHER_SPOOF_SCORE:
        metadata["reason"] = "other_spoof_too_high"
        return CalibrationResult(scores=scores, metadata=metadata)

    transfer = min(settings.CAMERA_REAL_MASK_BOOST, mask)
    adjusted = scores.copy()
    adjusted["real_person"] = real + transfer
    adjusted["fake_mask"] = mask - transfer

    total = sum(adjusted.values())
    if total > 0:
        adjusted = {
            label: float(round(score / total, 6))
            for label, score in adjusted.items()
        }

    metadata.update(
        {
            "applied": True,
            "reason": "camera_real_mask_stabilization",
            "type": "camera_real_mask_stabilization",
            "boost": float(round(transfer, 6)),
        }
    )
    return CalibrationResult(scores=adjusted, metadata=metadata)


def _get_top_two_labels(scores: dict[str, float]) -> list[str]:
    return [
        label
        for label, _score in sorted(
            scores.items(),
            key=lambda item: item[1],
            reverse=True,
        )[:2]
    ]
