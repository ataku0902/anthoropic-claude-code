# 設定値一覧

このスキルにAPIキー・トークン・パスワードは**ない**（`.env` 不要）。設定するのはvaultの場所を示す3値だけで、すべて `~/Library/Application Support/obsidian/obsidian.json` から自動検出できる（`_SETUP.md` Phase 2）。

## 必須設定

| # | 変数名 | 説明 | 出現場所 | 型 | 例 |
|----|--------|------|---------|-----|-----|
| 1 | `{{VAULT_PATH}}` | 既定vaultの絶対パス | `SKILL.md`（description・前提表・利用ルール表・フォールバック文）／`references/cli-commands.md`（ラッパー `VAULT_PATH=`）／`references/design-guide.md`（冒頭） | 絶対パス | `/Users/yourname/Documents/MyVault` |
| 2 | `{{VAULT_ID}}` | Obsidianが各vaultに振る16桁のid。ラッパーが `vault=` に自動付与する値 | `SKILL.md`（前提表・ラッパー説明・トラブルシュート）／`references/cli-commands.md`（ラッパー `VAULT_ID=`） | 16桁の英数字 | `0123456789abcdef` |
| 3 | `{{VAULT_NAME}}` | vault名（＝vaultフォルダの末尾名） | `SKILL.md`（前提表） | 文字列 | `MyVault` |

置換後の確認: `grep -rn "{{VAULT_" ~/.claude/skills/obsidian/` が空になること。

## オプション設定（プレースホルダーではなく、必要なときだけ手で直す箇所）

| # | 項目 | 説明 | 場所 | デフォルト値 |
|----|------|------|------|------------|
| 1 | デイリーノートの場所・書式 | Daily notesコアプラグインの設定を既定から変えている場合に表の記述を合わせる | `SKILL.md` 前提表「デイリーノート」行 | vault直下 `YYYY-MM-DD.md` |
| 2 | Basesのフィルタ対象フォルダ | スキル一覧ページを置くフォルダ名 | `templates/skill-db.base` の `file.inFolder("スキル一覧")` | `スキル一覧` |
| 3 | 一覧ページのリンク先フォルダ | 同上（テンプレ内の例） | `templates/index-page.md` の `[[フォルダ名/skill-a\|/skill-a]]`・`![[フォルダ名/スキルDB.base]]` | `フォルダ名`（要書き換え） |
| 4 | カテゴリタグの色 | `#cat/xxx` タグに付く色。自分のカテゴリを足す・減らす | `assets/rich-vault.css` の `a.tag[href="#cat/..."]` 行（直したらvaultの `.obsidian/snippets/` へコピーし直す） | 20種の初期セット（`references/design-guide.md` §4） |
| 5 | CLI本体のパス | macOS以外、または非標準の場所にインストールした場合 | `~/.local/bin/obsidian` の `CLI=` と `references/cli-commands.md` の再セットアップ手順 | `/Applications/Obsidian.app/Contents/MacOS/obsidian-cli` |

## 設定の依存関係

- `{{VAULT_ID}}` と `{{VAULT_PATH}}` は同じvaultのものを組で使う（`obsidian.json` の同じエントリから取る）。ラッパーは「cwdが `VAULT_PATH` 配下なら `vault=` を付けない／それ以外は `vault=VAULT_ID` を付ける」という判定にこの2値を使うので、片方だけ別vaultだと `Vault not found.` になる
- `{{VAULT_NAME}}` は表示用。`obsidian vault info=name` の返り値と一致していれば疎通確認の目印になる
- CSSスニペットのファイル名 `rich-vault.css` と `appearance.json` の `enabledCssSnippets: ["rich-vault"]`、テンプレートの `cssclasses: [rich-doc, ...]` は連動している。名前を変えるなら3か所同時に変える（変えないことを推奨）
