---
title: 開発環境と品質ゲート
---

# 開発環境と品質ゲート

セットアップコマンドの正本は[OrdoのREADME](https://github.com/udonrm/Ordo#セットアップ)です。ここには構成と判断を記録します。

## リクエストの経路

ブラウザはホストのViteにアクセスし、ReactのJavaScriptを受け取って実行します。Reactが同じオリジンの `/api/v1/health` を呼ぶと、ViteがComposeネットワーク内のLaravel APIへ転送します。Laravelは開発用PostgreSQLへ `SELECT 1` を実行し、DBが利用可能かJSONで返します。

`/up` はLaravelプロセスの生存確認、`/api/v1/health` はDBも含む利用可能性の確認です。DB障害時は503と固定のJSONを返し、接続詳細はレスポンスに出しません。

## 実行環境

| Composeサービス | プロセスの役割 | データ保存 |
| --- | --- | --- |
| api | FrankenPHP / Octane Worker / Laravel | ソースのbind mount、依存はvendor volume |
| web | Bun / Vite開発サーバー | ソースのbind mount、依存はnode_modules volume |
| db | 開発用PostgreSQL | 名前付きpostgres volume |
| db-test | テスト専用PostgreSQL | tmpfs（停止すると消える） |
| scenario | runnの一時実行 | シナリオを読み取り専用mount |

Composeのプロジェクトはリソースの管理単位であり、コンテナを内包する別のコンテナではありません。同じPostgreSQLイメージから、別の実行プロセスとデータ領域を持つ開発用・テスト用コンテナを作ります。

## 検証の分担

- PHPUnit: 本物のPostgreSQLへの疎通、接続不能時の503、存在しないAPIのJSON 404。既存のひな形テストも維持。
- Vitest + Testing Library: 読込中から成功、503から再試行、不正な応答形式、ネットワーク失敗の表示。
- runn: 起動したFrankenPHPへHTTPリクエストを送り、DB疎通の応答と404を確認。
- Mago: PHPの整形・lint・静的解析。BiomeとTypeScript: FEの整形・lint・型検査。
- CI: 新規checkoutから環境を作り、同じコマンドで上記検証と配信用ビルド、依存監査、OpenAPI出力を実行。

今のrunnシナリオは正常系と404だけです。業務バリデーション、DBレコードの変更・巻き戻し、外部検証APIとの連携、操作ログ検証は該当機能ができた時に追加します。DBテスト用コンテナ自体がテストを実行するわけではありません。

## 運用上の注意

- PHPファイルを変更したらWorkerを再読込する。環境変数やイメージを変更したらコンテナ再作成が必要。
- 開発DBのvolumeは通常のdownで消さない。DBのメジャーアップグレードはバックアップ・移行手順を別途決める。
- テストは必ず専用DBを指定するMakeターゲット経由で実行する。将来のデータ削除テストを開発DBに向けない。
- API・FE・DBの公開ポートはループバック限定。開発用の認証情報やAPP_DEBUG設定を本番で流用しない。
- 文書サイトは公開情報のみ。GitHub Pagesへ送るのはビルド済みdistであり、リポジトリ全体や.envではない。
