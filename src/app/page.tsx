'use client';

import { useState, useEffect } from 'react';
import { getZodiacFromBirthDate, ZodiacId } from '@/lib/zodiac';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

type ZodiacFortuneData = {
  zodiacId: string;
  animalNameKo: string;
  displayNameKo: string;
  emoji: string;
  overallScore: number;
  overallText: string;
  careerText: string | null;
  loveText: string | null;
  healthText: string | null;
  luckyColor: string | null;
  luckyNumber: number | null;
  luckyDirection: string | null;
};

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

function toLocalDateStr(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
}

function getDateRange(centerDateStr: string): string[] {
  // 정오 기준으로 생성해 DST 오류 방지
  const center = new Date(centerDateStr + 'T12:00:00');
  return Array.from({ length: 15 }, (_, i) => {
    const d = new Date(center);
    d.setDate(center.getDate() + i - 7);
    return toLocalDateStr(d);
  });
}

function formatChipLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' });
}

export default function Home() {
  const [today, setToday] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fortune, setFortune] = useState<ZodiacFortuneData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const todayStr = toLocalDateStr(new Date());
    setToday(todayStr);
    setSelectedDate(todayStr);

    fetch(`${BASE_PATH}/data/index.json`)
      .then(r => r.json())
      .then(data => setAvailableDates(new Set(data.availableDates ?? [])))
      .catch(() => setAvailableDates(new Set()));
  }, []);

  // 선택된 날짜 칩이 화면 중앙에 오도록 스크롤
  useEffect(() => {
    const activeChip = document.querySelector('.date-chip.active');
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedDate]);

  const fetchFortune = async (zodiacId: ZodiacId, dateStr: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_PATH}/data/fortunes/${dateStr}.json`);
      if (res.status === 404) throw new Error('해당 날짜의 운세가 아직 준비되지 않았습니다.');
      if (!res.ok) throw new Error('운세를 가져오는데 실패했습니다.');

      const data = await res.json();
      const zodiacData: ZodiacFortuneData | undefined = data.zodiacs?.[zodiacId];
      if (!zodiacData) throw new Error('해당 띠의 운세를 찾을 수 없습니다.');

      setFortune(zodiacData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setFortune(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBirthDateSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!birthDate || !selectedDate) return;
    const zodiacId = getZodiacFromBirthDate(birthDate);
    if (!zodiacId) {
      setError('올바른 생년월일을 입력해주세요.');
      return;
    }
    fetchFortune(zodiacId, selectedDate);
  };

  const handleZodiacClick = (zodiacId: ZodiacId) => {
    if (!selectedDate) return;
    fetchFortune(zodiacId, selectedDate);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setError(null);
    if (fortune) {
      // 이미 운세를 보고 있다면, 띠를 유지한 채로 새 날짜 데이터를 불러옵니다.
      fetchFortune(fortune.zodiacId as ZodiacId, dateStr);
    } else {
      setFortune(null);
    }
  };

  const resetView = () => {
    setFortune(null);
    setBirthDate('');
    setError(null);
  };

  const dateRange = today ? getDateRange(today) : [];

  return (
    <main className="container">
      <div className="header">
        <h1>오늘의 운세</h1>
        <p>당신의 띠가 전해주는 오늘의 특별한 메시지</p>
      </div>

      {/* 날짜 선택 칩 */}
      {dateRange.length > 0 && (
        <div className="date-picker">
          {dateRange.map(dateStr => {
            const isToday = dateStr === today;
            const isActive = dateStr === selectedDate;
            const isAvailable = availableDates.has(dateStr);
            return (
              <button
                key={dateStr}
                className={`date-chip${isToday ? ' today' : ''}${isActive ? ' active' : ''}`}
                onClick={() => handleDateSelect(dateStr)}
                disabled={!isAvailable}
                title={isAvailable ? '' : '운세 데이터가 없는 날짜입니다'}
              >
                {formatChipLabel(dateStr)}
              </button>
            );
          })}
        </div>
      )}

      {!fortune && (
        <div className="glass-card">
          <form onSubmit={handleBirthDateSubmit} className="input-group">
            <label htmlFor="birthdate">생년월일로 확인하기</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="date"
                id="birthdate"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                required
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ width: 'auto', padding: '0 1.5rem' }}
                disabled={loading || !availableDates.has(selectedDate)}
              >
                {loading ? '...' : '확인'}
              </button>
            </div>
          </form>

          {error && <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</p>}

          {!availableDates.has(selectedDate) && selectedDate && (
            <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '0.85rem', textAlign: 'center' }}>
              해당 날짜의 운세가 아직 준비되지 않았습니다.
            </p>
          )}

          <div style={{ margin: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ background: 'var(--bg-dark)', padding: '0 10px', fontSize: '0.9rem' }}>
              또는 띠 직접 선택하기
            </span>
          </div>

          <div className="zodiac-grid">
            {Object.entries(ZODIAC_INFO).map(([id, info]) => (
              <div
                key={id}
                className="zodiac-btn"
                onClick={() => availableDates.has(selectedDate) && handleZodiacClick(id as ZodiacId)}
                style={{ opacity: availableDates.has(selectedDate) ? 1 : 0.4, cursor: availableDates.has(selectedDate) ? 'pointer' : 'not-allowed' }}
              >
                <span className="zodiac-emoji">{info.emoji}</span>
                <span className="zodiac-name">{info.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>운세를 불러오는 중...</p>
        </div>
      )}

      {fortune && !loading && (
        <div className="glass-card fortune-result">
          <div className="fortune-header">
            <div className="zodiac-emoji" style={{ fontSize: '3rem' }}>
              {fortune.emoji}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>
                {fortune.displayNameKo} 운세
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>{selectedDate} 기준</p>
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
            <p>{fortune.careerText || '무난한 재물운을 보이는 하루입니다.'}</p>
          </div>

          <div className="fortune-section">
            <h3>❤️ 애정운</h3>
            <p>{fortune.loveText || '주변 사람들에게 미소로 답해보세요.'}</p>
          </div>

          <div className="fortune-section">
            <h3>🌿 건강운</h3>
            <p>{fortune.healthText || '무리하지 않는 하루를 보내세요.'}</p>
          </div>

          <div className="lucky-tags">
            <span className="lucky-tag">🎨 {fortune.luckyColor || '노란색'}</span>
            <span className="lucky-tag">🔢 {fortune.luckyNumber ?? 7}</span>
            <span className="lucky-tag">🧭 {fortune.luckyDirection || '동쪽'}</span>
          </div>

          <button onClick={resetView} className="btn-primary" style={{ marginTop: '2rem' }}>
            다른 띠 보기
          </button>
        </div>
      )}

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
