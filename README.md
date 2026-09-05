# Ordo Docs

Ordoでは、文書を成果物ではなく開発プロセスの一部として扱います。重要な判断はチャットだけで完結させず、レビュー可能なMarkdownとしてリポジトリに残します。

## 情報の置き場所

| ディレクトリ | 役割 |
| --- | --- |
| `product/` | 顧客、課題、価値、要求、検証結果 |
| `domain/` | 用語、業務フロー、ドメインモデル |
| `architecture/` | システム構成、品質特性、技術的な制約 |
| `decisions/` | 重要な意思決定を残すADR |
| `learning/` | 学習テーマ、実験、振り返り |
| `templates/` | 文書を追加するときの型 |

## 文書のライフサイクル

1. `Draft`: 議論のたたき台
2. `Accepted`: 現時点で採用した方針
3. `Superseded`: 新しい文書に置き換えられた方針
4. `Archived`: 現在は使わないが、経緯として残す情報

仕様を変更するときは、`ordo-docs` の文書と `ordo` の実装を相互に参照できる形で更新します。リポジトリをまたぐ変更は、Issueやコミットへのリンクで対応関係を残します。文書と実装が食い違った場合は、どちらが正しいかを決めるのではなく、食い違い自体を修正対象とします。

## 最初に読む文書

- [プロダクトビジョン](product/vision.md)
- [学習ロードマップ](learning/roadmap.md)
- [最初のADR](decisions/0001-record-decisions-with-adrs.md)
- [技術選定](decisions/0003-development-platform.md)
- [開発環境](architecture/development.md)

## ドキュメントサイト

Astro Starlightで既存のMarkdownディレクトリを直接読み込みます。サイト用に文書をコピーする必要はありません。ページには `title` のYAML frontmatterを付けてください。`templates/` とこのREADMEはサイトのページにせず、`index.md` をサイトの入口にします。

```sh
bun install --frozen-lockfile
bun run dev
bun run build
```

Bun 1.3.11を使用します。mainへのpushでGitHub Actionsがビルドし、[公開サイト](https://udonrm.github.io/Ordo-docs/)にデプロイします。PRではビルドと依存監査だけを実行します。

リポジトリとサイトは一般公開です。顧客データ、秘密鍵、トークン、業務上の秘密を含めないでください。過去のコミットも公開対象です。選定理由はADR 0003を参照してください。
