import React, { useEffect, useState } from "react";
import "./Top.css";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";

// SVG Icons (lucide-react style)
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);
const BookOpenIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 21l1.9-5.8 5.8-1.9-5.8-1.9L12 3z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);
const RepeatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="chevron-icon"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

function Top() {
  // ユーザー状態を保持
  const [user, setUser] = useState(null);
  // ログインやダッシュボードにリダイレクトする用のnavigate
  const navigate = useNavigate();
  // タイプライター効果のためのstate
  const [titleText, setTitleText] = useState(
    "あなたの＿＿＿対策を、もっと＿＿＿＿に。"
  );

  useEffect(() => {
    // Firebase認証状態を監視（ログイン・ログアウトを検知）
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe(); // クリーンアップ
  }, []);

  // Fallback for image loading errors
  const onImageError = (e) => {
    const placeholderUrl = `https://placehold.co/${e.target.width}x${e.target.height}/EEE/333?text=Image+Not+Found`;
    if (e.target.src !== placeholderUrl) {
      e.target.src = placeholderUrl;
    }
  };
  // タイプライター効果の実装
  const typewriterEffect = () => {
    const phases = [
      "あなたの＿＿＿対策を、もっと＿＿＿＿に。",
      "あなたのテ＿＿対策を、もっと＿＿＿＿に。",
      "あなたのテス＿対策を、もっと＿＿＿＿に。",
      "あなたのテスト対策を、もっと＿＿＿＿に。",
      "あなたのテスト対策を、もっとス＿＿＿に。",
      "あなたのテスト対策を、もっとスマ＿＿に。",
      "あなたのテスト対策を、もっとスマー＿に。",
      "あなたのテスト対策を、もっとスマートに。",
    ];

    phases.forEach((phase, index) => {
      setTimeout(() => {
        setTitleText(phase);
      }, (index + 1) * 300);
    });
  };

  // Template for animations on load
  const animate = () => {
    const elements = document.querySelectorAll(".fade-in-on-load");
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, index * 150);
    });
  };

  useEffect(() => {
    // This is the React equivalent of window.onload
    animate();
    // タイプライター効果を開始
    setTimeout(() => {
      typewriterEffect();
    }, 1000);
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll(".feature-item-tooltip");
    const handleOutside = (e) => {
      if (!e.target.closest(".feature-item-tooltip")) {
        items.forEach((item) => item.classList.remove("open"));
      }
    };
    items.forEach((item) => {
      item.addEventListener("click", () => {
        item.classList.toggle("open");
        items.forEach(
          (other) => other !== item && other.classList.remove("open")
        );
      });
    });
    document.addEventListener("click", handleOutside);
    return () => {
      document.removeEventListener("click", handleOutside);
    };
  }, []);

  return (
    <div className="top-page">
      {/* ==================== Header ==================== */}
      <header className="top-header">
        <div className="container">
          {" "}
          <div className="logo">
            <a href="/" className="logo-text">
              <img src="../AIDY.svg" class="titleLogo"></img>
            </a>
          </div>
          <nav className="top-nav">
            <a href="#features-overview">サービスについて</a>
            <a href="#key-features">機能</a>
            <button
              onClick={() => navigate("/login?redirect=/")}
              disabled={!!user} // ログイン中は無効化
              readOnly={!!user}
              className="login-link"
            >
              {user ? "ログイン中" : "ログインする"}
            </button>
            <button
              onClick={() => navigate("/login?redirect=/dashboard")}
              className="cta-button-small"
            >
              今すぐ始める
            </button>
          </nav>
          <div className="mobile-menu-icon">
            <MenuIcon />
          </div>
        </div>
      </header>

      <main>
        {/* ==================== ヒーローセクション ==================== */}{" "}
        <section id="hero" className="hero-section">
          <div className="container hero-content">
            <div className="hero-text">
              <h1 className="fade-in-on-load typewriter-title">{titleText}</h1>
              <p className="fade-in-on-load">
                AIで最適な演習問題を自動生成。効率的な学習で、自信をつけよう。
              </p>
              <div className="cta-area">
                <a href="/create" className="cta-button fade-in-on-load">
                  無料で始める
                </a>
                <p className="registration-prompt">
                  <a href="/signup">アカウントの登録はこちら</a>
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* ==================== サービス概要セクション ==================== */}
        <section id="features-overview" className="features-overview-section">
          <div className="container">
            <h2>こんなお悩みありませんか？</h2>{" "}
            <div className="features-grid">
              <div className="feature-item feature-item-tooltip">
                <SparklesIcon />
                <h3>自由記述問題の採点ができない</h3>
                <p>
                  従来の方法だと説明が完全に一致しないと正解にならなかった問題でも、AIDYならAIで自由記述の採点をしてくれます。
                </p>
                <div className="mobile-tooltip-trigger">
                  <ChevronDownIcon />
                  <span>AIDYを使った例を見る</span>
                </div>
                <div className="tooltip-bubble">
                  <div className="tooltip-content">
                    <h4>具体例</h4>
                    <div className="example-scenario">
                      <p>
                        <strong>問題:</strong>{" "}
                        「光合成について説明してください」
                      </p>
                      <p>
                        <strong>あなたの回答:</strong>{" "}
                        「植物が太陽の光を使って栄養を作る仕組み」
                      </p>
                      <p>
                        <strong>AIDYの判定:</strong> ✅
                        正解！キーワード「光」「栄養生成」を含んでおり、概念理解ができています。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="feature-item feature-item-tooltip">
                <RepeatIcon />
                <h3>自分に合った問題がない</h3>
                <p>
                  間違えた問題をもとに、AIが理解度に合わせて新しい類題を生成します。
                </p>
                <div className="mobile-tooltip-trigger">
                  <ChevronDownIcon />
                  <span>AIDYを使った例を見る</span>
                </div>
                <div className="tooltip-bubble">
                  <div className="tooltip-content">
                    <h4>具体例</h4>
                    <div className="example-scenario">
                      <p>
                        <strong>間違えた問題:</strong> 「2x + 3 = 7
                        のxを求めよ」
                      </p>
                      <p>
                        <strong>AIDYが生成する類題:</strong>
                      </p>
                      <ul>
                        <li>「3x + 2 = 8 のxを求めよ」</li>
                        <li>「x + 5 = 9 のxを求めよ」</li>
                        <li>「4x - 1 = 7 のxを求めよ」</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="feature-item feature-item-tooltip">
                <BookOpenIcon />
                <h3>解説を読んでも理解できない</h3>
                <p>
                  あなたの解答の意図を汲み取り、パーソナライズされた解説を生成します。
                </p>
                <div className="mobile-tooltip-trigger">
                  <ChevronDownIcon />
                  <span>AIDYを使った例を見る</span>
                </div>
                <div className="tooltip-bubble">
                  <div className="tooltip-content">
                    <h4>具体例</h4>
                    <div className="example-scenario">
                      <p>
                        <strong>あなたの間違い:</strong>{" "}
                        「りんごが5個、みかんが3個。合計は53個です」
                      </p>
                      <p>
                        <strong>AIDYの解説:</strong>{" "}
                        「数字を横に並べただけになっていますね。足し算は数を合わせること。5
                        + 3 = 8個が正解です。」
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ==================== Key Features Section ==================== */}
        <section id="key-features" className="key-features-section">
          <div className="container">
            <h2>AIにテスト作成を任せる</h2>
            <p className="section-subtitle">
              AI搭載のテスト作成ツールで時間と労力を節約しましょう。教材（テキストまたはファイル）をアップロードするだけで、AIDYはコンテンツに合わせてさまざまな質問を作成します。
            </p>
            <div className="key-features-content">
              <div className="key-features-list">
                <div className="key-feature-item">
                  <div className="key-feature-item-icon">
                    <BookOpenIcon />
                  </div>
                  <div className="key-feature-item-text">
                    <h3>テキストやファイルをアップロード</h3>
                    <p>
                      講義ノート、教科書の一部、またはPDFなどのファイルをアップロード。AIが内容を分析し、問題を作成します。
                    </p>
                  </div>
                </div>
                <div className="key-feature-item">
                  <div className="key-feature-item-icon">
                    <RepeatIcon />
                  </div>
                  <div className="key-feature-item-text">
                    <h3>苦手な問題を克服</h3>
                    <p>
                      間違えた問題の類題をAIが自動で生成。あなたの理解度に合わせた解説も表示し、苦手分野を効率的に克服できます。
                    </p>
                  </div>
                </div>
                <div className="key-feature-item">
                  <div className="key-feature-item-icon">
                    <SparklesIcon />
                  </div>
                  <div className="key-feature-item-text">
                    <h3>トピックを選ぶだけ</h3>
                    <p>
                      任意のトピックやキーワードを入力するだけで、AIが関連する問題を自動で生成します。手軽に実力試しができます。
                    </p>
                  </div>
                </div>
              </div>
              <div className="key-features-image">
                <img src="../mockup.png" class="mockupImage" alt="image" />
              </div>
            </div>
          </div>
        </section>
        {/* ==================== CTA Section ==================== */}
        <section id="cta-bottom" className="cta-section">
          <div className="container">
            <h2>今すぐあなたの学習を変革しよう。</h2>
            <p>
              AIの力を借りて、学習の効率を最大化しませんか？AIDYで新しい学習体験を始めましょう。
            </p>
            <a href="/create" className="cta-button-large">
              無料で問題を生成する
            </a>
          </div>{" "}
        </section>
      </main>
    </div>
  );
}

export default Top;
