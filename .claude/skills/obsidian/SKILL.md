---
name: obsidian
description: Obsidian公式CLI（`obsidian` コマンド）でvault（{{VAULT_PATH}}）を読み書き・検索・デイリーノート操作するスキル。「デイリーノートを開いて」「今日のノートにタスク追加」「Obsidianで検索」「Obsidianのメモを読んで」「vaultに保存」「Obsidianにノート作って」「デイリーに追記」「obsidian daily」「/obsidian」などの依頼で必ず使用する。加えて、Obsidianのファイルを扱う他の全スキル・エージェント（ルール集の読み込み／原稿の保存／ネタ帳への追記／一覧ページの登録など）は、vaultへの読み書き・検索を**このCLI経由で行う**のが恒久ルール。直接パスでのRead/Writeはアプリ未起動時のフォールバックに限る。
---

# obsidian — Obsidian CLI 操作スキル

## 前提（セットアップ後の状態）

| 項目 | 値 |
|---|---|
| コマンド | `obsidian`（`~/.local/bin/obsidian` ＝ラッパー。PATH済み） |
| 実体 | `/Applications/Obsidian.app/Contents/MacOS/obsidian-cli`（Obsidian 1.12.4以降に同梱。動作確認は1.13.7） |
| vault | `{{VAULT_PATH}}`（名前 `{{VAULT_NAME}}`／id `{{VAULT_ID}}`）。複数vaultがあっても、このスキルの既定はこの1つ |
| デイリーノート | vault直下 `YYYY-MM-DD.md`（Daily notesコアプラグインの既定設定。フォルダや書式を変えていればそちらに従う） |
| 必須条件 | **Obsidianアプリが起動していること**（CLIは `~/.obsidian-cli.sock` 経由でアプリに命令する） |

ラッパーは `vault=` 未指定かつvault外のcwdで実行したとき、自動で `vault={{VAULT_ID}}` を付ける。どのディレクトリからでも `obsidian daily` がそのまま通る。

## 基本コマンド（この3つが日常の主役）

```bash
obsidian daily                                   # 今日のデイリーノートを開く（なければ作る）
obsidian search query="meeting notes"            # vault全文検索（ファイルパス一覧が返る）
obsidian daily:append content="- [ ] Buy groceries"   # デイリーノートにタスクを追記
```

## コマンド早見表（スキルから使う頻度順）

| 目的 | コマンド | 備考 |
|---|---|---|
| ファイルを読む | `obsidian read path="ナレッジ/用語集.md"` | `path=` はvault相対の正確なパス。`file=` はファイル名解決（拡張子不要・wikilink同様） |
| 全文検索 | `obsidian search query="キーワード" [path=フォルダ] [limit=n] [format=json]` | ヒットしたファイルパス一覧 |
| 行付き検索 | `obsidian search:context query="キーワード" format=json` | 行番号と該当行が返る |
| 新規作成 | `obsidian create path="フォルダ/名前.md" content="本文" [overwrite] [open]` | **既存パスに `overwrite` なしで実行すると「名前 1.md」が勝手にできる**。上書き意図なら必ず `overwrite` |
| 末尾追記 | `obsidian append path="..." content="行"` | `\n` で改行。`inline` で改行なし追記 |
| 先頭追記 | `obsidian prepend path="..." content="行"` | frontmatterの直後に入る |
| デイリー読む | `obsidian daily:read` | パスだけなら `obsidian daily:path` |
| デイリー追記 | `obsidian daily:append content="- [ ] タスク"` | `daily:prepend` もある |
| タスク一覧 | `obsidian tasks daily` / `obsidian tasks todo path=フォルダ` | `task ref="path:line" done` で完了に |
| プロパティ | `obsidian property:set name=status value=draft path="..."` / `property:read` | frontmatterを直接触らずに済む |
| ファイル一覧 | `obsidian files folder="ネタ帳"` / `obsidian folders` | 既存ファイルの把握に |
| ファイル情報 | `obsidian file path="..."` | size／created／modified |
| 移動・改名・削除 | `obsidian move path=... to=...` / `rename` / `delete path=...`（ゴミ箱へ） | `delete permanent` は使わない |
| アプリで開く | `obsidian open path="..."` | 保存後に見せたいとき |
| バックリンク等 | `backlinks` / `links` / `orphans` / `unresolved` / `outline` / `wordcount` | ナレッジ整理用 |

全コマンドの完全な一覧は `references/cli-commands.md`（`obsidian help` の生出力は `references/cli-help-full.txt`）。

## 書き方のルール

- 値にスペース・日本語を含むときは必ずダブルクォート: `path="プロジェクトA/00_進捗管理.md"`
- 複数行は `\n` エスケープでも、`content="$(cat draft.md)"` のような実改行入り文字列でも通る（実測済み）
- 長い原稿（数千字）は `content=` に直接詰めず、いったん作業フォルダにmdを書いてから `obsidian create path="..." content="$(cat 作業ファイル.md)" overwrite` で入れる。シェル引数長の上限を避けつつ、Obsidian側のインデックスにも即反映される
- 出力を機械処理するなら `format=json`（search／search:context／tasks／backlinks など対応コマンドのみ）
- **`content=` は本文中の `\n` `\t` という2文字を実改行・実タブに変換する**（`\\n` と二重にしても回避不可。実測済み）。コードブロックにバックスラッシュ入りの文字列（`"\n"` など）を含む原稿は CLI で書くと壊れるので、その成果物だけは直接ファイルに書き、`obsidian file path=...` で反映を確認する（例: シェル手順を含むレポート本体）

## リッチ表示ルール（恒久）

vaultに**人が読むページ**（スキル一覧・マニュアル・ルール集・パスワード台帳・メルマガ保管庫・ネタ帳など、長文原稿を機械的に保存するフォルダ以外）を作る・書き換えるときは、`references/design-guide.md` のデザインルールに従う。プレーンな見出し＋長文＋巨大テーブルの羅列で納品しない。

| 部品 | 場所 | 使い方 |
|---|---|---|
| デザインガイド | `references/design-guide.md` | 全ページ共通の部品10種（frontmatter／顔callout／ピル／カスタムcallout／テーブル4列以内／手順／mermaid／progress／ハイライト／Bases）と種別ごとの構成 |
| テンプレート | `templates/skill-page.md` `index-page.md` `manual.md` `secret-page.md` `skill-db.base` | コピーして埋める。構成は変えない |
| CSSスニペット | 原本 `assets/rich-vault.css` → `<vault>/.obsidian/snippets/rich-vault.css` | カスタムcallout（skill／trigger／flow／path／secret／agent／rule／step／result／kb）・見出し帯・テーブル装飾・`#cat/xxx` タグ色。直すときは原本を直してコピーする |
| 有効化 | `<vault>/.obsidian/appearance.json` の `enabledCssSnippets: ["rich-vault"]` | 消えていたら書き戻す（`obsidian snippet:enable name=rich-vault` でも可） |
| Bases | `スキル一覧/スキルDB.base` など（雛形 `templates/skill-db.base`） | frontmatter（category／summary／status／updated）を読むデータベース表示。一覧ページに `![[...base]]` で埋め込む |

最低限守ること:

1. 全ページに frontmatter（`type` `summary` `updated` `tags` `cssclasses: [rich-doc, <種別>]`）
2. H1直下に顔callout（`[!skill]` `[!abstract]` `[!secret]` `[!rule]` `[!info]`）＋ピル行
3. テーブルは4列以内・1セル60字以内。長文は見出しとcalloutへ
4. 恒久ルールは `[!rule]` に `==ハイライト==`、禁止は赤字太字
5. 絵文字をアイコン代わりに使わない
6. 元ページの情報は落とさない（振り分けるだけ）
7. スキルページは `templates/skill-page.md` に沿って作る。一覧の行は `| スキル | ひとこと（40字以内） | 発動ワード例 |` の3列

## エージェントチーム（自動呼び出し）

このスキルの実行中、以下のエージェントを**必ず**該当タイミングで起動する。定義ファイルはスキル内 `agents/` に恒久同梱しており、CLAUDE.md 等への追記は不要。

| エージェント | 定義ファイル | 起動タイミング | 目的 |
|---|---|---|---|
| **vault-page-reviewer** | `agents/vault-page-reviewer.md` | 「リッチ表示ルール」の対象ページを新規作成・全面書き換えした直後（書き込み完了後、ユーザーへ報告する前） | `references/design-guide.md` の必須項目（frontmatter／顔callout／ピル／テーブル4列以内／絵文字アイコン禁止）と、元情報の欠落をチェックして PASS／FIX を返す |

**必須起動ルール:**

- 対象は「人が読むページ」を `create`（新規・`overwrite`）で丸ごと書いたとき。`append`／`daily:append` の1行追記、`property:set`、読み取り・検索だけの操作では起動しない
- レビュー結果が FIX なら、指摘どおりに直して再度レビューし、PASS になってから報告する
- 起動方法: `~/.claude/agents/vault-page-reviewer.md` として登録済みなら Agent tool で `subagent_type: vault-page-reviewer` を指定する。**未登録なら `general-purpose` エージェントに `agents/vault-page-reviewer.md` を読ませ、その定義どおりに実行させる**（フォールバック。動作は同じ）
- 渡すもの: 書き込んだページのvault相対パス、ページ種別（skill／index／manual／secret／style／note）、元になった情報の場所（あれば）

## 他スキル・エージェントからの利用ルール（恒久）

Obsidianのファイルを読む・書く・探す処理は、以下の対応で **CLIを第一手段** にする。

| これまで | これから |
|---|---|
| Readツールで `{{VAULT_PATH}}/...` を読む | `obsidian read path="..."` |
| Globやlsで既存ファイルを調べる | `obsidian files folder="..."` |
| Grepでvault内を探す | `obsidian search query="..."`／`search:context` |
| Writeツールで新規md作成 | `obsidian create path="..." content="..." [overwrite]` |
| Editツールで末尾に1行足す（ネタ帳・進捗ログ等） | `obsidian append path="..." content="..."` |
| frontmatterを書き換える | `obsidian property:set ...` |

**フォールバック**: CLIが `Vault not found.`／接続エラー／無応答（10秒以上）を返したら、**Obsidianを勝手に起動しない**。そのまま `{{VAULT_PATH}}/` への直接Read/Writeで続行し、最後の報告に「CLI不通のため直接ファイル操作した」と一言添える。黙って切り替えない。CLIでしかできない操作（`daily:append`／`search`／`command` など）がどうしても要るときだけ、ユーザーに「Obsidianを開いていいか」を確認してから起動する。

原稿保存系のエージェントのように**構造化された長文を大量に保存する**場合は、上の「長い原稿」ルールに従う（作業ファイル→`create ... overwrite`）。進捗管理ファイルの1行追記は `append`、チェックリストの `[ ]→[x]` 更新のような行内編集はCLIに該当コマンドがないので、`read` で内容を取得→編集→`create overwrite` で書き戻す。

## トラブルシュート

| 症状 | 対処 |
|---|---|
| `Vault not found.` | Obsidianが未起動、またはvault外cwdで `vault=` なし直呼び。ラッパー（`obsidian`）を使うか `vault={{VAULT_ID}}` を付ける |
| コマンドが返ってこない | `pkill -f MacOS/obsidian-cli` で止め、`obsidian version` で疎通確認。復旧しなければ直接ファイル操作に切り替える（アプリの再起動が要ると判断したら、勝手にやらずユーザーに確認する） |
| `Command "xxx" not found` | 該当コアプラグイン（Daily notes／Templates／Bookmarks等）が無効。`obsidian plugin:enable id=daily-notes filter=core` |
| `obsidian` が見つからない | `~/.local/bin/obsidian` が消えている。`references/cli-commands.md` の「再セットアップ」に従って作り直す（**シンボリックリンクにしない**。リンク先の本体を上書きして壊した事例がある） |
| ファイルの中身が消えた・上書きしてしまった | `obsidian history path="..."` で版一覧 → `obsidian history:read path="..." version=N` で中身確認 → `obsidian history:restore path="..." version=N`（File recoveryコアプラグインの履歴。デイリーノートが空になった事例をこの手順で復元できた） |
| CLIが有効化されていないと言われる | `~/Library/Application Support/obsidian/obsidian.json` に `"cli":true` があるか確認。なければ設定→一般→「Command line interface」をオン |

## 関連

- ルール集・用語集など「毎回読むページ」の取得: `obsidian read path="..."` を各スキルの開始処理に組み込む
- 一覧ページへの登録: `templates/index-page.md`＋`templates/skill-page.md` の構成で追記する
- 長文原稿の保存: 「書き方のルール」の作業ファイル→`create ... overwrite` 方式
- リッチ表示のデザインルール: `references/design-guide.md`（テンプレは `templates/`、CSSは `assets/rich-vault.css`）
- 書いたページの検証: `agents/vault-page-reviewer.md`
