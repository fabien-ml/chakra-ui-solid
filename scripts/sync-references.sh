#!/usr/bin/env bash
# Fills and updates the gitignored `__reference__/` folder. This is the only list of the reference
# sources. Sparse-checkout config is local git state no commit tracks, so this script restores it.

set -u

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
reference_root="$repository_root/__reference__"

# folder|url|branch|sparse set (space-separated, empty for a full checkout)
sources=(
  "chakra-ui|https://github.com/chakra-ui/chakra-ui.git|main|packages/react packages/panda-preset apps/www apps/compositions"
  "chakra-ui-v4-poc|https://github.com/Adebesin-Cell/chakra-ui.git|feat/v4-static-factory|"
  "ark|https://github.com/chakra-ui/ark.git|v6|packages/solid packages/react"
  "zag|https://github.com/chakra-ui/zag.git|v2|packages/frameworks/solid packages/machines packages/core packages/anatomy packages/types packages/utilities packages/store"
)

failures=()

sync_source() {
  local folder="$1" url="$2" branch="$3" sparse_set="$4"
  local destination="$reference_root/$folder"

  if [ -d "$destination/.git" ]; then
    git -C "$destination" fetch -q origin "$branch:refs/remotes/origin/$branch" || return 1
    git -C "$destination" checkout -q -B "$branch" "origin/$branch" || return 1
  else
    git clone --branch "$branch" "$url" "$destination" || return 1
  fi

  if [ -n "$sparse_set" ]; then
    # Word splitting is the point: the set is a list of paths.
    # shellcheck disable=SC2086
    git -C "$destination" sparse-checkout set $sparse_set || return 1
  fi
}

mkdir -p "$reference_root"

for source in "${sources[@]}"; do
  IFS='|' read -r folder url branch sparse_set <<<"$source"
  if sync_source "$folder" "$url" "$branch" "$sparse_set"; then
    echo "ok   $folder ($branch) $(git -C "$reference_root/$folder" log -1 --format='%h %cs')"
  else
    failures+=("$folder")
  fi
done

# The v4 design notes live on chakra-ui's `v4` branch; read them with `git show origin/v4:<path>`.
git -C "$reference_root/chakra-ui" fetch -q origin v4:refs/remotes/origin/v4 || failures+=("chakra-ui v4")

if [ ${#failures[@]} -gt 0 ]; then
  echo "failed: ${failures[*]}" >&2
  exit 1
fi
