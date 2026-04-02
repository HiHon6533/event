import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventApi } from '../services/api';
import EventCard from '../components/EventCard';
import { CATEGORY_LABELS } from '../utils/helpers';

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '0');

  useEffect(() => {
    setLoading(true);
    const params = { page, size: 12 };
    if (category) params.category = category;
    if (keyword) params.keyword = keyword;
    eventApi.getAllPublic(params)
      .then(res => { setEvents(res.data.content); setTotalPages(res.data.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, keyword, page, searchParams]);

  const handleCategory = (cat) => {
    setSearchParams(prev => {
      if (cat) prev.set('category', cat); else prev.delete('category');
      prev.set('page', '0');
      return prev;
    });
  };

  return (
    <div className="container section fade-in">
      <h1 className="section-title">🎪 Tất cả sự kiện</h1>
      <p className="section-subtitle">
        {keyword ? `Kết quả tìm kiếm cho "${keyword}"` : 'Khám phá và tìm sự kiện phù hợp với bạn'}
      </p>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
        <button className={`btn btn-sm ${!category ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleCategory('')}>Tất cả</button>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button key={key} className={`btn btn-sm ${category === key ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleCategory(key)}>{label}</button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? <div className="spinner" /> : (
        <>
          {events.length > 0 ? (
            <div className="grid grid-3">{events.map(e => <EventCard key={e.id} event={e} />)}</div>
          ) : (
            <div className="empty-state"><p>Không tìm thấy sự kiện nào</p></div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={i === page ? 'active' : ''}
                  onClick={() => setSearchParams(prev => { prev.set('page', i.toString()); return prev; })}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
