---
title: 'ADR 0003: 学習用の開発基盤と品質ゲート'
---

# ADR 0003: 学習用の開発基盤と品質ゲート

- Status: Accepted
- Date: 2026-09-06
- Related: [環境構築・技術選定](https://github.com/udonrm/Ordo/issues/1)

## Context

業務管理プラットフォームを題材に、ドメイン理解・上流工程・DDD・PHP・モダンFE・コンテナ・品質保証を、一機能ずつ縦に経験したい。完成品を急ぐより、判断理由を説明できることを重視する。ただし基盤だけで学習を消耗しないよう、現時点では「ReactからAPIを通してDBの疎通を確認し、テストとCIが通る」ことを範囲とする。

## Decision

| 領域 | 採用 | 理由・制約 |
| --- | --- | --- |
| BE | PHP 8.5 / Laravel 13 / Eloquent | 最新世代のPHPを学び、Laravel標準のルーティング・DI・ORMを使う。正確なPHPパッチはDockerイメージ、パッケージはcomposer.lockで管理 |
| HTTP実行 | FrankenPHP 1.12.7 / Octane 2.19.1、Workerモード | 長寿命プロセスを学ぶ。リクエストをまたぐ状態保持を避け、コード変更時はWorkerを再読込 |
| ローカル | Docker Desktop / Docker Compose | 実行環境と接続関係をコード化。PHP・Bun・DBをホストへ個別導入しない |
| DB | PostgreSQL 18.4 | 業務経験を活用し、開発・テストも同じDBエンジンを使う |
| FE | React 19.2.8 / TypeScript 7.0.2 / Vite 8.2.2 | LaravelとはJSON APIで分離し、コンポーネント・状態・型・ビルドの役割を学ぶ |
| JS基盤 | Bun 1.3.11 | パッケージ管理と実行を学習目的で採用。bun.lockを正とする |
| テスト | PHPUnit 12.5 / Vitest 5.0 / Testing Library / runn 1.10.0 | 既存のPHPUnit規約を維持。APIの契約と実DB、UIの表示状態、起動したHTTPサーバーの接続を階層ごとに検証 |
| API仕様 | Scramble 0.13.42 | Laravel実装からOpenAPIを生成。仕様言語と実装の二重保守を避ける |
| PHP品質 | Mago 1.47.6（fmt/lint/analyze） | 1つの基盤で整形・指摘・型解析を回す。解析のベースラインによる一括抑制は作らない |
| FE品質 | Biome 2.5.12 + TypeScript | 整形・lintと型検査の責任を分け、初学者が設定を追いやすくする |
| CI | GitHub Actions | ローカルと同じMake/Composeコマンドで起動・テスト・解析・ビルド・依存監査を実施 |
| 文書 | Astro 7.3.1 / Starlight 0.42.0 / GitHub Pages | Markdownを正本として検索付き静的サイトへレンダリング。無料Pages利用のため文書リポジトリ・サイトを公開する |

アプリはモノレポだが、既存のLaravelルート構造を維持し、独立したReactコードは `resources/frontend` に置く。ADR・PRD・ドメインモデルは引き続きOrdo-docsが正本。文書用の既存ディレクトリをAstroのglob loaderで直接読み込み、コピーした文書を二重管理しない。

### 初期のUIとDDDの範囲

現時点のUIは疎通確認に限り、Reactコンポーネントと素のCSSでロード中・成功・失敗・再試行を実装する。業務UIの採用ライブラリやデザイントークンをこの画面だけで既成事実にしない。既存のTailwind依存は維持するが、今回の画面は利用しない。

DDDはまず具体的な業務の用語集、ユースケース、不変条件、境界の候補から学ぶ。ヘルスチェックのためだけにEntity/Repository/UseCase層を増やさない。最初の業務機能で、Eloquentに任せる永続化と業務上の判断をどこまで分けるかを実例で記録する。

### 品質ルールの運用

Magoは既存Laravelひな形の書式に合わせ、strict-types、literal-named-argument、readable-literal、no-empty-commentのスタイルルールを無効にする。解析エラーの抑制ではない。パスワードの `hashed` キャストには誤検知への局所的な `@mago-expect` が1つあり、理由をその箇所に記載する。PHPStanへの移行や比較実験は別課題とし、現時点で並行導入しない。

Pintは既存依存・プロジェクト作業規約として残すが、CIの整形合否はMagoに統一する。Magoのnote/helpは改善提案、warning/errorは修正対象とし、少なくともerrorでCIを失敗させる。抑制を増やす前に原因とルールの妥当性を確認する。

## Alternatives considered

- Apache + PHP-FPM: 業務での経験につながるが、今回はFrankenPHP Workerのライフサイクルを学ぶ方を選択。FPMが劣るという判断ではない。
- Sail: Laravel標準に近く導入しやすいが、今回はFrankenPHP・独立FE・テスト専用DBの関係を自分で理解するためComposeを直接記述。
- Blade / Livewire / Inertia: Laravelとの統合は簡潔だが、独立したバックエンドAPIの開発経験が主目的のためSPAを採用。
- Vue: 学習負荷を検討したうえで、本人の希望でReactを選択。
- npm / pnpm: Bunより成熟した選択肢だが、Bun自体の学習価値を優先。互換性の問題が出たら別ADRで再検討。
- Turborepo / Nx: 現在のBEとFEの数ではMakeと各パッケージのスクリプトで足りるため、タスクグラフやリモートキャッシュは導入しない。
- TypeSpec: 契約先行のメリットはあるが、Laravel実装との同期コストを避けるためScramble。
- Pest: 希望の範囲内だが既存PHPUnit規約を維持し、今はテスト設計の学習に集中。
- Oxc（Oxlint/Oxfmt）: モダンな候補だが、現段階では設定をまとめられるBiomeを選択。
- 非公開ドキュメントサイト: 個人FreeプランのGitHub Pagesでは要件を満たせないため、機密を置かない公開文書に変更することを合意。

## Consequences

- 開発用DBのデータを残しつつ、テスト用DBは独立して破棄・再作成できる。
- API・FE・品質ツールそれぞれの役割を確認できるが、複数プロセスのログや接続先を理解する必要がある。
- Workerではstatic変数やsingletonへのリクエスト情報保存による状態漏れに注意し、将来は連続リクエスト・テナント切替もテストする。
- CI設定だけではmainへの直接pushを禁止できない。ブランチ保護・必須チェック化はアカウントプランと権限を確認して設定する。
- 本番用イメージ、秘密管理、アプリのデプロイ先、CDは未決。今回のdebug有効・開発パスワード・ソースマウント構成は本番転用しない。
- TanStack Router/Query、型付きAPIクライアント、Sanctum、Figma、業務UIライブラリの具体的な組込みは最初の機能で別途扱う。

## References

- [Laravel Octane](https://laravel.com/framework/docs/13.x/octane)
- [Mago](https://mago.carthage.software/)
- [Starlightの設定](https://starlight.astro.build/manual-setup/)
- [AstroのGitHub Pagesデプロイ](https://docs.astro.build/en/guides/deploy/github/)
