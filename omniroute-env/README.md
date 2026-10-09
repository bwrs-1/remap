# OmniRoute Local AI Gateway & Claude Code Environment

ローカルAIゲートウェイ「**OmniRoute**」の環境および、Claude Code / Antigravity CLI からのルーティング設定環境です。

## 概要
- **ゲートウェイURL**: `http://localhost:20128`
- **API Base URL**: `http://localhost:20128/v1`
- **Anthropic互換エンドポイント**: `http://localhost:20128/v1/messages`
- **デフォルトルーティングモデル**: `auto` (複数プロバイダーへの自動フォールバック対応)
- **代替・無料枠モデル候補**: `kimi-k3` 等

---

## ディレクトリ構成
```text
omniroute-env/
├── .agents/
│   └── rules/
│       └── omniroute-rules.md   # Antigravity CLI / Agent用ルール設定
├── .env                         # ルーティング用環境変数設定
├── .env.example                 # 環境変数テンプレート
├── package.json                 # ゲートウェイ管理用 npm スクリプト
├── AGENTS.md                    # エージェント・ワークスペース仕様定義
├── GEMINI.md                    # Antigravity / Gemini CLI 向けガイドライン
├── test-connection.sh           # エンドポイント接続検証スクリプト
├── start-claude.sh              # OmniRoute経由でClaude Codeを起動するスクリプト
└── README.md                    # 本ドキュメント
```

---

## 基本操作コマンド

`omniroute-env` ディレクトリ内で以下のコマンドを実行できます。

### 1. ゲートウェイの起動・停止・確認
```bash
# バックグラウンド（デーモン）で起動
npm run start:gateway

# 稼働ステータス確認
npm run status:gateway

# ヘルスチェック
npm run health:gateway

# ゲートウェイの停止
npm run stop:gateway

# ゲートウェイの再起動
npm run restart:gateway
```

### 2. 接続テスト
```bash
# 接続検証（Health、/v1/chat/completions、/v1/messages のテスト）
npm run test:connection
# または
./test-connection.sh
```

### 3. Claude Code の起動
```bash
# 付属のランチャースクリプトで起動
./start-claude.sh

# または npm スクリプト経由
npm run launch:claude

# または環境変数をインライン指定して直接起動
ANTHROPIC_BASE_URL=http://localhost:20128 ANTHROPIC_MODEL=auto claude
```

---

## ダッシュボードとプロバイダー設定
OmniRoute起動後、ブラウザで以下のURLを開くことでダッシュボードからプロバイダー（OpenAI, Anthropic, Gemini, Groq, OpenCode等）のAPIキー設定やルーティングルールの変更が行えます。
- **ダッシュボード**: [http://localhost:20128](http://localhost:20128)
