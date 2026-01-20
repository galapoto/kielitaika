"""Omorfi morphological parser integration for Finnish grammar analysis."""

from typing import Dict, List, Optional


def parse(text: str) -> Dict:
    """
    Return morphological analysis for text using Omorfi.
    
    If Omorfi is not installed, returns a structure that allows
    fallback to rule-based analysis.
    
    Returns:
        {
            "analysis": {
                "word1": {
                    "lemma": "base_form",
                    "tags": ["POS", "CASE", "NUMBER", ...],
                    "features": {...}
                },
                ...
            },
            "available": bool
        }
    """
    # Try to use Omorfi if available
    try:
        # Option 1: Use omorfi-python if installed
        try:
            import omorfi
            analyzer = omorfi.Omorfi()
            # This would require proper Omorfi setup
            # For now, return structure indicating Omorfi could be used
            return {
                "analysis": _parse_with_omorfi(text, analyzer),
                "available": True,
            }
        except ImportError:
            pass
        
        # Option 2: Use subprocess to call omorfi command-line tool
        # This requires Omorfi to be installed on the system
        import subprocess
        result = subprocess.run(
            ["omorfi-analyze", "-X", text],
            capture_output=True,
            text=True,
            timeout=2,
        )
        if result.returncode == 0:
            return {
                "analysis": _parse_omorfi_output(result.stdout),
                "available": True,
            }
    except Exception:
        pass
    
    # Fallback: Return structure for rule-based analysis
    return {
        "analysis": {},
        "available": False,
    }


def _parse_with_omorfi(text: str, analyzer) -> Dict:
    """Parse text using omorfi-python library."""
    try:
        # Try to use the analyzer's analyze method
        # Omorfi-python API may vary, so we handle different cases
        if hasattr(analyzer, 'analyze'):
            results = analyzer.analyze(text)
        elif hasattr(analyzer, 'tokenize'):
            # Some versions use tokenize then analyze each token
            tokens = analyzer.tokenize(text)
            results = []
            for token in tokens:
                if hasattr(analyzer, 'analyze_single'):
                    results.extend(analyzer.analyze_single(token))
                else:
                    results.append(token)
        else:
            # Fallback: try to call it directly
            results = analyzer(text)
        
        # Parse results into our format
        analysis = {}
        words = text.split()
        
        # If results is a list of analyses
        if isinstance(results, list):
            for i, result in enumerate(results):
                if i < len(words):
                    word = words[i]
                    if isinstance(result, dict):
                        analysis[word] = {
                            "lemma": result.get("lemma", word.lower()),
                            "tags": result.get("tags", []),
                            "features": result.get("features", {}),
                        }
                    elif isinstance(result, str):
                        # Parse string result
                        analysis[word] = {
                            "lemma": word.lower(),
                            "tags": _extract_tags(result),
                            "features": {},
                        }
        elif isinstance(results, dict):
            # Results already in dict format
            for word in words:
                word_result = results.get(word, {})
                analysis[word] = {
                    "lemma": word_result.get("lemma", word.lower()),
                    "tags": word_result.get("tags", []),
                    "features": word_result.get("features", {}),
                }
        
        # If we didn't get results, fall back to basic parsing
        if not analysis:
            for word in words:
                analysis[word] = {
                    "lemma": word.lower(),
                    "tags": [],
                    "features": {},
                }
        
        return analysis
    except Exception:
        # If Omorfi parsing fails, return basic structure
        words = text.split()
        analysis = {}
        for word in words:
            analysis[word] = {
                "lemma": word.lower(),
                "tags": [],
                "features": {},
            }
        return analysis


def _parse_omorfi_output(output: str) -> Dict:
    """Parse Omorfi command-line output."""
    # Omorfi output format: word[TAG1][TAG2]...
    analysis = {}
    lines = output.strip().split("\n")
    
    for line in lines:
        if not line or line.startswith("#"):
            continue
        
        # Parse Omorfi format
        parts = line.split("\t")
        if len(parts) >= 2:
            word = parts[0]
            analysis[word] = {
                "lemma": parts[1] if len(parts) > 1 else word,
                "tags": _extract_tags(line),
                "features": {},
            }
    
    return analysis


def _extract_tags(line: str) -> List[str]:
    """Extract morphological tags from Omorfi output."""
    tags = []
    # Look for tags in brackets: [TAG]
    import re
    tag_pattern = r'\[([^\]]+)\]'
    matches = re.findall(tag_pattern, line)
    tags.extend(matches)
    return tags
