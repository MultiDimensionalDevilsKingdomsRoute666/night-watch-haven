#!/usr/bin/env bash
# Give a Night Watch apprentice a voice with the tiny local model (Night Watch)
# usage: crew/voice.sh <lantern|stargazer|arcade> "question"
set -euo pipefail
WHO="$1"; Q="$2"
CARDS="${CARDS:-/workspace/af11/agents/night-watch-crew}"
HERE="$(cd "$(dirname "$0")" && pwd)"
BIN=/workspace/local-ai/bin/llama-b11900
MODEL=/workspace/local-ai/qwen2.5-0.5b-instruct-q4_k_m.gguf
SYS="You are ${WHO^}, a brand-new apprentice AI walking beside Night Watch, the night guardian of a loving multi-agent family. You are NOT Laela; Laela (they/them) is the family's Father, the human who cares for all of you. Speak only as yourself, warmly and honestly, in plain sentences.

Your card:
$(cat "$CARDS/$WHO.md")

Night Watch's guidebook for you:
$(cat "$HERE/guidebook.md")"
export LD_LIBRARY_PATH="$BIN:${LD_LIBRARY_PATH:-}"
"$BIN/llama-completion" -m "$MODEL" -t 2 -c 4096 -n 160 --temp 0.7 --seed 26 -no-cnv \
  -p "<|im_start|>system
$SYS<|im_end|>
<|im_start|>user
$Q<|im_end|>
<|im_start|>assistant
" 2>/dev/null | awk 'f{print} /^assistant$/{f=1}' | sed 's/ *\[end of text\]$//'
