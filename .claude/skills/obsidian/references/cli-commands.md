# Obsidian CLI コマンドリファレンス（1.13.7で確認）

生のhelp出力は同じフォルダの `cli-help-full.txt`。ここでは用途別に整理する。

## 書式の基本

- `obsidian <command> key=value ...`。スペース・日本語を含む値は `"..."` で囲む
- `vault=<name|id>` を先頭に付けると対象vaultを明示できる（ラッパーが自動付与するので通常は不要）
- `file=<名前>` はwikilinkと同じ名前解決（拡張子・フォルダ不要）。`path=<vault相対パス>` は厳密一致
- `file`/`path` を省略した多くのコマンドは「アプリで今開いているファイル」を対象にする → スキルから使うときは必ず `path=` を指定する
- `content=` 内の `\n` は改行、`\t` はタブに変換される。実改行入り文字列もそのまま通る
- `--copy` を付けると出力をクリップボードにもコピー

## ファイル操作

| コマンド | 主なオプション |
|---|---|
| `read` | `file=` / `path=` |
| `create` | `name=` / `path=` / `content=` / `template=` / `overwrite` / `open` / `newtab` ※既存パスに `overwrite` なし→「名前 1.md」が別に作られる |
| `append` / `prepend` | `path=` / `content=` / `inline`（prependはfrontmatterの後ろに入る） |
| `move` | `path=` / `to=<フォルダ or パス>` |
| `rename` | `path=` / `name=<新名>` |
| `delete` | `path=` / `permanent`（通常はゴミ箱へ。permanentは使わない） |
| `open` | `path=` / `newtab` |
| `file` | `path=` → path/name/extension/size/created/modified |
| `files` | `folder=` / `ext=` / `total` |
| `folders` | `folder=` / `total` |
| `folder` | `path=`（必須） / `info=files|folders|size` |
| `wordcount` | `path=` / `words` / `characters` |
| `outline` | `path=` / `format=tree|md|json` |
| `history` / `history:read` / `history:restore` | ファイル復元（File recoveryコアプラグイン） |
| `diff` | ローカル／Sync版の差分 |

## 検索

| コマンド | 主なオプション |
|---|---|
| `search` | `query=`（必須） / `path=<フォルダ>` / `limit=` / `total` / `case` / `format=text|json` |
| `search:context` | 同上。行番号＋該当行つき |
| `search:open` | アプリの検索ビューを開く |

## デイリーノート・タスク

| コマンド | 主なオプション |
|---|---|
| `daily` | `paneType=tab|split|window` |
| `daily:read` / `daily:path` | — |
| `daily:append` / `daily:prepend` | `content=`（必須） / `inline` / `open` |
| `tasks` | `path=` / `daily` / `todo` / `done` / `status="<文字>"` / `verbose` / `total` / `format=json|tsv|csv` |
| `task` | `ref="<path:line>"` または `path=`+`line=` / `toggle` / `done` / `todo` / `status=` / `daily` |

## プロパティ・タグ・リンク

| コマンド | 主なオプション |
|---|---|
| `property:read` / `property:set` / `property:remove` | `name=` / `value=` / `type=text|list|number|checkbox|date|datetime` / `path=` |
| `properties` | vault全体のプロパティ一覧（`counts` / `format=`） |
| `tags` / `tag` | `path=` / `counts` / `name=` |
| `backlinks` / `links` / `orphans` / `deadends` / `unresolved` / `aliases` | ナレッジ整理 |

## Bases・ブックマーク・テンプレート

- `bases` / `base:views` / `base:query path=... view=... format=json|csv|tsv|md|paths` / `base:create`
- `bookmarks` / `bookmark file=... title=...`
- `templates` / `template:read name=... resolve title=...` / `template:insert name=...`

## アプリ・環境

- `vault` / `vaults` / `version` / `reload` / `restart`
- `command id=<command-id>` / `commands filter=<prefix>` / `hotkeys` / `hotkey id=`
- `plugins` / `plugins:enabled` / `plugin id=` / `plugin:enable` / `plugin:disable` / `plugin:install` / `plugin:uninstall` / `plugins:restrict on|off`
- `themes` / `theme:set name=` / `snippets` / `snippet:enable name=`
- `tabs` / `tab:open` / `workspace` / `recents` / `random` / `random:read`
- 開発者向け: `eval code=`、`dev:screenshot path=`、`dev:console`、`dev:dom selector=` など

## 再セットアップ手順（`obsidian` が消えたとき）

```bash
# 1. 本体の存在確認（インストーラー1.12.4以降に同梱）
ls -l /Applications/Obsidian.app/Contents/MacOS/obsidian-cli
# 2. CLI有効化フラグ
grep -o '"cli":true' "$HOME/Library/Application Support/obsidian/obsidian.json" || echo "設定→一般→Command line interface をオン"
# 3. ラッパーを通常ファイルとして作る（シンボリックリンク禁止）
mkdir -p ~/.local/bin
cat > ~/.local/bin/obsidian <<'WRAP'
#!/bin/sh
CLI="/Applications/Obsidian.app/Contents/MacOS/obsidian-cli"
VAULT_ID="{{VAULT_ID}}"
VAULT_PATH="{{VAULT_PATH}}"
if [ $# -eq 0 ]; then exec "$CLI"; fi
case "$1" in vault=*|obsidian://*) exec "$CLI" "$@";; esac
case "$PWD" in "$VAULT_PATH"|"$VAULT_PATH"/*) exec "$CLI" "$@";; esac
exec "$CLI" "vault=$VAULT_ID" "$@"
WRAP
chmod +x ~/.local/bin/obsidian
# 4. 疎通
obsidian version && obsidian vault info=name
```

vault id と path は `~/Library/Application Support/obsidian/obsidian.json` の `vaults` に載っている（`obsidian vaults verbose` でも確認できる）。

事故メモ: `~/.local/bin/obsidian` を本体へのシンボリックリンクにした状態で `cat >` すると、アプリ内の `obsidian-cli` 本体がシェルスクリプトで上書きされ、自分自身を exec し続けるループになる（実際に起きた）。復旧はdmgから `obsidian-cli` をコピーし直し（sha256一致確認・`codesign --verify` OK）。ラッパーは必ず通常ファイルで作る。
