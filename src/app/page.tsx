'use client';

import { useState, FormEvent } from 'react';
import { getZodiacFromBirthDate, ZodiacId, ZODIAC_ORDER } from '@/lib/zodiac';

type FortuneResult = {
  zodiac: { animalNameKo: string; displayNameKo: string; emoji: string };
  overallScore: number;
  overallText: string;
  moneyText: string | null;
  careerText: string | null;
  loveText: string | null;
  luckyColor: string | null;
  luckyNumber: number | null;
  luckyDirection: string | null;
};

// 띠 이모지와 표시 이름 매핑 (UI 용)
const ZODIAC_INFO: Record<ZodiacId, { name: string; emoji: string }> = {
  rat: { name: '쥐', emoji: '🐭' },
  ox: { name: '소', emoji: '🐮' },
  tiger: { name: '호랑이', emoji: '🐯' },
  rabbit: { name: '토끼', emoji: '🐰' },
  dragon: { name: '용', emoji: '🐲' },
  snake: { name: '뱀', emoji: '🐍' },
  horse: { name: '말', emoji: '🐴' },
  sheep: { name: '양', emoji: '🐑' },
  monkey: { name: '원숭이', emoji: '🐵' },
  rooster: { name: '닭', emoji: '🐔' },
  dog: { name: '개', emoji: '🐶' },
  pig: { name: '돼지', emoji: '🐷' },
};

export default function Home() {
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 오늘 날짜 가져오기 (YYYY-MM-DD)
  const getTodayStr = () => {
    const today = new Date();
    // 로컬 시간 기준 YYYY-MM-DD
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today.getTime() - offset)).toISOString().split('T')[0];
    return localISOTime;
  };

  const fetchFortune = async (zodiacId: ZodiacId) => {
    setLoading(true);
    setError(null);
    setFortune(null);

    const todayStr = getTodayStr();
    
    try {
      const res = await fetch(`/api/fortunes?zodiacId=${zodiacId}&date=${todayStr}`);
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || '운세를 가져오는데 실패했습니다.');
      }
      
      setFortune(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBirthDateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;
    
    const zodiacId = getZodiacFromBirthDate(birthDate);
    if (!zodiacId) {
      setError('올바른 생년월일을 입력해주세요. (예: 1990-05-12)');
      return;
    }
    
    fetchFortune(zodiacId);
  };

  const handleZodiacClick = (zodiacId: ZodiacId) => {
    fetchFortune(zodiacId);
  };

  const resetView = () => {
    setFortune(null);
    setBirthDate('');
    setError(null);
  };

  return (
    <main className="container">
      <div className="header">
        <h1>오늘의 운세</h1>
        <p>당신의 띠가 전해주는 오늘의 특별한 메시지</p>
      </div>

      {!fortune && (
        <div className="glass-card">
          <form onSubmit={handleBirthDateSubmit} className="input-group">
            <label htmlFor="birthdate">생년월일로 확인하기</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="date" 
                id="birthdate" 
                value={birthDate} 
                onChange={(e) => setBirthDate(e.target.value)} 
                required 
              />
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 1.5rem' }} disabled={loading}>
                {loading ? '...' : '확인'}
              </button>
            </div>
          </form>

          {error && <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</p>}

          <div style={{ margin: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ background: 'var(--bg-dark)', padding: '0 10px', fontSize: '0.9rem' }}>또는 띠 직접 선택하기</span>
          </div>

          <div className="zodiac-grid">
            {Object.entries(ZODIAC_INFO).map(([id, info]) => (
              <div 
                key={id} 
                className="zodiac-btn" 
                onClick={() => handleZodiacClick(id as ZodiacId)}
              >
                <span className="zodiac-emoji">{info.emoji}</span>
                <span className="zodiac-name">{info.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {fortune && (
        <div className="glass-card fortune-result">
          <div className="fortune-header">
            <div className="zodiac-emoji" style={{ fontSize: '3rem' }}>
              {fortune.zodiac.emoji}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>
                {fortune.zodiac.displayNameKo} 운세
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>{getTodayStr()} 기준</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block' }}>행운 지수</span>
              <span className="fortune-score">{fortune.overallScore}</span>
            </div>
          </div>

          <div className="fortune-section">
            <h3>✨ 오늘의 총평</h3>
            <p>{fortune.overallText}</p>
          </div>

          <div className="fortune-section">
            <h3>💼 직장/재물운</h3>
            <p>{fortune.careerText || fortune.moneyText || '무난한 재물운을 보이는 하루입니다.'}</p>
          </div>

          <div className="fortune-section">
            <h3>❤️ 애정운</h3>
            <p>{fortune.loveText || '주변 사람들에게 미소로 답해보세요.'}</p>
          </div>

          <div className="lucky-tags">
            <span className="lucky-tag">🎨 {fortune.luckyColor || '노란색'}</span>
            <span className="lucky-tag">🔢 {fortune.luckyNumber || '7'}</span>
            <span className="lucky-tag">🧭 {fortune.luckyDirection || '동쪽'}</span>
          </div>

          <button onClick={resetView} className="btn-primary" style={{ marginTop: '2rem' }}>
            다른 띠 보기
          </button>
        </div>
      )}

      {/* 법적 면책 조항 (PDF 8.2절) */}
      <footer style={{
        marginTop: '2rem',
        padding: '1rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        lineHeight: '1.5',
        borderTop: '1px solid var(--border-color)',
        maxWidth: '500px',
      }}>
        본 운세 정보는 전통 명리학에 기반한 통계적 해석일 뿐이며, 법적, 의학적, 재정적 결정의 근거로 사용될 수 없는 엔터테인먼트 목적의 콘텐츠입니다.
      </footer>
    </main>
  );
}
