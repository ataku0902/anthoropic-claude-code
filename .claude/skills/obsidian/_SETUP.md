# obsidian — スキルセットアップ指示書

> **ユーザーへ:**
> このファイルがあるフォルダのパスをClaude Codeに渡して、「このスキルをセットアップして」と伝えてください。
> あとは **Claude Codeからの質問にチャットで答えていくだけ** で、スキルのインストールが完了します。
> ファイルの編集やコマンドの実行は不要です。すべてClaude Codeが自動で行います。

---

## Claude Codeへの指示

**このファイルを読んだら、以下の手順を自律的に実行してください。**
**ユーザーにファイル編集やコマンド実行を求めないこと。すべてClaude Codeが行う。**
**ユーザーには「質問に答えていくだけで完了します」と最初に伝えること。**

### スキル概要

Obsidian公式CLI（`obsidian` コマンド）で、Obsidianのvault（ノート置き場）を読み書き・検索・デイリーノート操作するスキル。
どのディレクトリからでも `obsidian daily` や `obsidian search query="..."` が通るようにラッパーを設置し、さらにvaultに「人が読むページ」を書くときのリッチ表示デザイン（CSSスニペット・カスタムcallout10種・テンプレート5種・Bases雛形）を丸ごと持ち込む。他のスキルやエージェントがObsidianのファイルを扱うときも、このCLIを第一手段にする恒久ルールを含む。

**このパッケージの固定仕様（ヒアリング不要）:**

- スキル名は `obsidian` で確定（`/obsidian` で呼び出す）。名前の変更は想定しない
- エージェント（`vault-page-reviewer`）のマッピングは `SKILL.md` 内に記載済みで、CLAUDE.md等への追記は不要
- APIキー・トークンは使わない（`.env` なし）。設定するのはvaultの場所だけ
- 動作確認済みの環境は **macOS**（Obsidian 1.13.7）。Windows／Linuxでは `obsidian-cli` 本体のパスと設定ファイルの場所が異なるので、Phase 1でその旨を伝え、本体の場所をユーザーと一緒に特定してから進める

### 前提条件

| # | 必要なもの | 説明 | なぜ必要か | 取得方法 |
|---|-----------|------|-----------|---------|
| 1 | Obsidian 1.12.4以降 | ノートアプリ本体。CLI（`obsidian-cli`）はこのバージョン以降のインストーラーに同梱 | このスキルのすべての操作がCLI経由 | https://obsidian.md/download から最新版をインストール（既に入っていれば「設定→一般→現在のバージョン」で確認） |
| 2 | CLIの有効化 | Obsidianの設定で「Command line interface」をオンにするスイッチ | オフだとCLIがアプリに接続できない | 設定 → 一般 → 「Command line interface」をオン（下記に詳細） |
| 3 | vault | ノートを保存しているフォルダ。Obsidianで一度開いたことがあるもの | 操作対象。ラッパーがこのvaultを既定にする | Obsidianで開いているvaultをそのまま使う（設定ファイルから自動検出する） |
| 4 | `~/.local/bin` がPATHに含まれること | ラッパースクリプトの置き場 | `obsidian` と打つだけで呼べるようにする | なければClaude Codeがシェル設定に1行足す |

前提条件が満たされていない場合は、以下の順序で対応する：
1. まず何が不足しているかをユーザーに **平易な言葉で** 伝える
2. 取得手順を **番号付きのステップ** で案内する（URLを含む）
3. ユーザーが取得できたか確認してから次に進む

---

## 実行手順

### Phase 0: オリエンテーション

**最初に以下をユーザーに伝える（必須）:**

> これから Obsidian CLI 操作スキル（obsidian）のセットアップを行います。
>
> **進め方:**
> - vaultの場所は設定ファイルから自動で見つけます。質問は最大1問（vaultが複数あるときに「どれを使うか」）です。所要時間は約3分
> - Obsidianアプリを起動した状態にしておいてください（CLIはアプリに命令を送る仕組みなので、閉じていると動きません）
> - ファイルの編集やコマンドの実行は不要です。すべて私が自動で行います
>
> それでは始めましょう！

### Phase 1: 前提条件の確認

以下をコマンドで確認する。不足があればユーザーに案内する：

```bash
# 1. CLI本体（1.12.4以降に同梱）
ls -l /Applications/Obsidian.app/Contents/MacOS/obsidian-cli
# 2. CLI有効化フラグ
grep -o '"cli":true' "$HOME/Library/Application Support/obsidian/obsidian.json"
# 3. アプリが起動しているか
pgrep -x Obsidian >/dev/null && echo "running" || echo "not running"
# 4. PATH
echo "$PATH" | tr ':' '\n' | grep -x "$HOME/.local/bin" || echo "PATHに ~/.local/bin なし"
```

#### Obsidian のセットアップ手順（1 が失敗したとき）

Obsidianとは: Markdownファイルをフォルダごと管理するノートアプリです。CLIは1.12.4以降のインストーラーに入っています。

**取得手順:**
1. https://obsidian.md/download を開く
2. macOS用のインストーラー（.dmg）をダウンロードして開き、Obsidian.app を Applications にドラッグする
3. 既にインストール済みでCLIだけ無い場合も、最新のインストーラーで上書きすれば入る（vaultのデータは消えない）
4. Obsidianを起動し、普段使うvaultを開く

**確認方法:** `ls -l /Applications/Obsidian.app/Contents/MacOS/obsidian-cli` がファイルを返す

#### CLI有効化 の手順（2 が失敗したとき）

「Command line interface」とは: Obsidianの設定にあるスイッチで、これをオンにするとアプリがターミナルからの命令を受け付けるようになります。

**取得手順:**
1. Obsidianを開き、左下の歯車アイコン（設定）をクリックする
2. 「一般」タブを開く
3. 「Command line interface」（コマンドラインインターフェース）をオンにする
4. 一度Obsidianを再起動する

**確認方法:** `grep -o '"cli":true' "$HOME/Library/Application Support/obsidian/obsidian.json"` が `"cli":true` を返す

**よくあるつまずき:**
- 項目が見当たらない → Obsidianのバージョンが古い。1 の手順で最新版に上書きする
- オンにしたのにフラグが出ない → 再起動していない。Obsidianを完全に終了（<kbd>Cmd</kbd>+<kbd>Q</kbd>）して開き直す

#### アプリが起動していないとき（3 が not running のとき）

「Obsidianを起動してください」と伝えて待つ。**Claude Codeが勝手に `open -a Obsidian` しない**（ユーザーの作業中のウィンドウ構成を壊さないため）。ユーザーが「開いていい」と言った場合だけ起動する。

#### Windows／Linux の場合

このパッケージの確認済み環境はmacOS。他OSでは次の2点をユーザーと一緒に特定してから進める（場所はOS・インストール方法で変わるため、決め打ちしない）:
- `obsidian-cli` 本体の場所（Obsidianのインストールフォルダ内。`obsidian help` がターミナルから通るならその実体）
- 設定ファイル `obsidian.json` の場所（vaultのidとpathが載っている）

特定できたら、Phase 4 以降の `/Applications/Obsidian.app/Contents/MacOS/obsidian-cli` と `~/Library/Application Support/obsidian/obsidian.json` をその場所に読み替える。

### Phase 2: ヒアリング（vaultの特定・最大1問）

まず自動検出する:

```bash
python3 - <<'EOF'
import json, os
p = os.path.expanduser("~/Library/Application Support/obsidian/obsidian.json")
d = json.load(open(p))
for vid, v in d.get("vaults", {}).items():
    print(f'{vid}\t{v.get("path")}\t{"open" if v.get("open") else ""}')
EOF
```

- **vaultが1つだけ** → 質問せず、「vault `<path>` を使います」と伝えて確認だけ取る
- **vaultが複数** → 下の質問1を出す（`open` が付いているものを既定候補として先頭に示す）
- **vaultが0件** → Obsidianでvaultを一度開いてもらってから再検出する

> **質問 1/1: 使うvault**
>
> Obsidianのvaultが複数見つかりました。このスキルの既定にするvaultを番号で選んでください。
>
> 1. `<path A>`（現在開いているvault）
> 2. `<path B>`
>
> 他のvaultは `obsidian vault=<名前> ...` と明示すれば操作できるので、ふだん一番使うものを選べばOKです。
>
> わからない場合は「1」と答えてください。今開いているvaultになります。

選ばれたvaultについて、次の3値を控える（Phase 4で使う）:

| 値 | 取り方 |
|---|---|
| `VAULT_PATH` | 上の検出結果の `path`（絶対パス） |
| `VAULT_ID` | 上の検出結果のキー（16桁の英数字） |
| `VAULT_NAME` | `VAULT_PATH` の末尾フォルダ名（Obsidian上のvault名と同じ） |

**ヒアリングのルール:**
- 1問ずつ聞く。まとめて聞かない
- 回答が番号でなくパスだった場合は、検出結果と突き合わせて同じものを採用する
- vaultのパスにスペースや日本語が含まれていてもそのまま使う（ラッパーはクォート済み）

### Phase 3: スキルフォルダの配置

このパッケージフォルダを `~/.claude/skills/obsidian/` にコピーする。

```bash
cp -r {このパッケージのパス} ~/.claude/skills/obsidian
```

既に同名フォルダがある場合は上書き前にユーザーに確認する。

### Phase 4: プレースホルダーの自動書き換え

Phase 2で控えた3値で、コピー先の以下3ファイル内のプレースホルダーをEdit toolで置換する（`_CONFIG.md` に出現箇所の一覧あり）:

| プレースホルダー | 置換値 | 出現ファイル |
|---|---|---|
| `{{VAULT_PATH}}` | `VAULT_PATH`（絶対パス。`~` に短縮してもよいがラッパー内は絶対パス推奨） | `SKILL.md`・`references/cli-commands.md`・`references/design-guide.md` |
| `{{VAULT_ID}}` | `VAULT_ID` | `SKILL.md`・`references/cli-commands.md` |
| `{{VAULT_NAME}}` | `VAULT_NAME` | `SKILL.md` |

置換後に残りがないことを確認する:

```bash
grep -rn "{{VAULT_" ~/.claude/skills/obsidian/ && echo "未置換あり" || echo "置換完了"
```

### Phase 5: ラッパーの設置

`~/.local/bin/obsidian` を**通常ファイルとして**作る（シンボリックリンクにしない。リンク先の本体を上書きして壊した事例があるため）。

```bash
mkdir -p ~/.local/bin
cat > ~/.local/bin/obsidian <<'WRAP'
#!/bin/sh
# Obsidian CLI wrapper（公式 obsidian-cli を既定vault付きで呼ぶ）
# - vault= を明示した場合／vault内で実行した場合はそのまま渡す
# - それ以外は既定vaultを自動指定
CLI="/Applications/Obsidian.app/Contents/MacOS/obsidian-cli"
VAULT_ID="__VAULT_ID__"
VAULT_PATH="__VAULT_PATH__"
if [ $# -eq 0 ]; then exec "$CLI"; fi
case "$1" in vault=*|obsidian://*) exec "$CLI" "$@";; esac
case "$PWD" in "$VAULT_PATH"|"$VAULT_PATH"/*) exec "$CLI" "$@";; esac
exec "$CLI" "vault=$VAULT_ID" "$@"
WRAP
# __VAULT_ID__ / __VAULT_PATH__ を Phase 2 の値に置換（Edit tool でもよい。sed なら次の1行）
sed -i '' "s/__VAULT_ID__/<VAULT_ID>/; s|__VAULT_PATH__|<VAULT_PATH>|" ~/.local/bin/obsidian
chmod +x ~/.local/bin/obsidian
grep -n "VAULT_" ~/.local/bin/obsidian     # 2行とも実際の値になっていればOK
```

PATHに `~/.local/bin` が無ければ、使っているシェルの設定ファイル（`~/.zshrc` など）の末尾に次を追記する（既に同じ行があれば足さない）:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

疎通確認（Obsidianが起動している状態で）:

```bash
~/.local/bin/obsidian version
~/.local/bin/obsidian vault info=name      # Phase 2 の VAULT_NAME が返ればOK
```

`Vault not found.` が返る場合は、Obsidianが起動していないか、`VAULT_ID` の置換ミス。`cat ~/.local/bin/obsidian` で値を確認する。

### Phase 6: リッチ表示部品の導入（CSSスニペット）

デザイン（カスタムcallout・見出し帯・テーブル装飾・タグ色）をvaultに入れる。

```bash
mkdir -p "$VAULT_PATH/.obsidian/snippets"
cp ~/.claude/skills/obsidian/assets/rich-vault.css "$VAULT_PATH/.obsidian/snippets/rich-vault.css"
obsidian snippet:enable name=rich-vault
obsidian snippets:enabled | grep -q rich-vault && echo "スニペット有効" || echo "有効化されていない"
```

`snippet:enable` が効かない場合は `$VAULT_PATH/.obsidian/appearance.json` の `enabledCssSnippets` 配列に `"rich-vault"` を追加する（ファイルが無ければ `{"enabledCssSnippets":["rich-vault"]}` で作る）。書き換え後は `obsidian reload` で反映。

### Phase 7: コアプラグインの確認

このスキルが使うコアプラグインが有効か確認し、無効なら有効にする:

```bash
obsidian plugins:enabled
# 無ければ:
obsidian plugin:enable id=daily-notes filter=core     # デイリーノート（daily / daily:append）
obsidian plugin:enable id=bases filter=core           # Bases（templates/skill-db.base を使う一覧ページ）
obsidian plugin:enable id=file-recovery filter=core   # ファイル履歴（history / history:restore で復元）
```

デイリーノートの保存先やファイル名を既定（vault直下 `YYYY-MM-DD.md`）から変えている場合は、`obsidian daily:path` で実際のパスを確認し、`SKILL.md` の「前提」表のデイリーノート行をその設定に書き換える。

### Phase 8: エージェントの登録（推奨・なくても動く）

エージェントのマッピングは `SKILL.md` 内で完結しており、CLAUDE.md等への追記は**不要**。
そのうえで、`agents/vault-page-reviewer.md` を `~/.claude/agents/` にコピーしておくと、名前付きエージェントとして登録され、自動起動がより確実になる。

```bash
mkdir -p ~/.claude/agents
cp ~/.claude/skills/obsidian/agents/vault-page-reviewer.md ~/.claude/agents/
```

- 既に同名ファイルがある場合は上書き前にユーザーに確認する
- コピーしない選択でも問題ない: `SKILL.md` の起動ルールに、未登録時は general-purpose エージェントに `agents/` の定義ファイルを読ませて実行するフォールバックが書いてある
- **`~/.claude/skills/obsidian/agents/` は削除しない**（スキル単独で完結させるための正本）

### Phase 9: 動作確認

vaultを書き換えない範囲で確認する:

```bash
obsidian version
obsidian vault info=name
obsidian daily:path                       # デイリーノートのパスが返る
obsidian search query="a" limit=1         # 検索が通る（ヒット0件でもエラーでなければOK）
obsidian snippets:enabled                 # rich-vault が含まれる
obsidian files folder="" total            # ファイル数が返る
```

ユーザーが希望した場合のみ、`obsidian daily:append content="- [ ] obsidian スキルのセットアップ完了"` で実際に1行書いて、アプリ上で見えることを確認する（デイリーノートに1行増える旨を先に伝える）。

### Phase 10: 補助ファイルのクリーンアップ

セットアップに使った補助ファイルを削除する：

```bash
rm -f ~/.claude/skills/obsidian/_SETUP.md
rm -f ~/.claude/skills/obsidian/_CONFIG.md
```

**残すもの（削除禁止）:** `agents/`（エージェント定義の正本）・`assets/rich-vault.css`（スニペットの原本。直すときはここを直してvaultへコピーする）・`templates/`・`references/`

### Phase 11: 完了報告

以下をユーザーに報告する：

- **スキル名**: `/obsidian` で呼び出し可能
- **スキルの概要**: Obsidian公式CLIでvaultを読み書き・検索・デイリーノート操作する。他スキルからのObsidian操作もこのCLIが窓口
- **既定vault**: `VAULT_PATH`（他のvaultは `obsidian vault=<名前> ...` で明示）
- **配置されたエージェント**: vault-page-reviewer（vaultに人が読むページを書いた直後にデザインガイド準拠と情報欠落をチェック）— マッピングはSKILL.md内で完結
- **導入したデザイン部品**: CSSスニペット `rich-vault`（カスタムcallout10種・見出し帯・テーブル装飾・タグ色）、テンプレート5種（`templates/`）、Bases雛形
- **注意事項**: Obsidianアプリが起動していないとCLIは動かない（起動していないときスキルは直接ファイル操作にフォールバックし、その旨を報告する。アプリを勝手に起動はしない）

報告のフォーマット:
> セットアップが完了しました！
>
> **使い方:**
> - `/obsidian` — 「今日のデイリーノートにタスク追加して」「Obsidianで◯◯を検索して」のように、vaultの読み書き・検索を依頼
> - 「Obsidianに◯◯のマニュアルページを作って」 — `templates/manual.md` の構成とリッチ表示ルールでページを作り、vault-page-reviewer が検証してから納品
> - 「デイリーに『- [ ] 見積もり送付』を追記して」 — `obsidian daily:append` で1行追記（この場合レビューは走らない）
>
> さっそく試してみてください！
